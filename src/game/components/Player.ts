import type { Game } from '../scenes/Game'

const directions = [
	'west',
	'south-west',
	'south',
	'south-east',
	'east',
	'north-east',
	'north',
	'north-west',
]

export class Player {
	player!: Phaser.GameObjects.Sprite
	keys!: { [key: string]: Phaser.Input.Keyboard.Key }
	facing: string = 'south'
	speed: { x: number; y: number } = { x: 0, y: 0 }

	constructor(public scene: Game) {
		this.scene = scene
	}

	preload() {
		this.scene.load.spritesheet('player', 'assets/deer_spritesheet.png', {
			frameWidth: 64,
			frameHeight: 64,
		})
	}

	create(x: number, y: number) {
		// Create player sprite at the center of the map
		this.player = this.scene.add.sprite(x, y, 'player')

		const row = (rowNumber: number) => (rowNumber - 1) * 61

		const runAnimLength = 6
		for (let i = 0; i < directions.length; i++) {
			const direction = directions[i]
			this.scene.anims.create({
				key: `run-${direction}`,
				frames: this.scene.anims.generateFrameNumbers('player', {
					start: row(i + 1),
					end: row(i + 1) + runAnimLength - 1,
				}),
				frameRate: 16,
				repeat: -1,
			})
		}

		const idleAnimLength = 22
		for (let i = 0; i < directions.length; i++) {
			const direction = directions[i]
			this.scene.anims.create({
				key: `idle-${direction}`,
				frames: this.scene.anims.generateFrameNumbers('player', {
					start: row(i + 1 + directions.length * 3),
					end: row(i + 1 + directions.length * 3) + idleAnimLength - 1,
				}),
				frameRate: 16,
				repeat: -1,
			})
		}

		// Make camera follow the player
		this.scene.camera.startFollow(this.player, true, 0.1, 0.1)

		// Set up keyboard controls
		this.keys = this.scene.input.keyboard?.addKeys(
			'w,a,s,d',
		) as Phaser.Types.Input.Keyboard.CursorKeys
	}

	update() {
		if (!this.player || !this.keys) {
			return
		}

		const speed = 3

		if (this.keys.a.isDown && this.keys.s.isDown) {
			this.speed = { x: -speed * Math.SQRT1_2, y: speed * Math.SQRT1_2 }
			this.facing = 'south-west'
		} else if (this.keys.a.isDown && this.keys.w.isDown) {
			this.speed = { x: -speed * Math.SQRT1_2, y: -speed * Math.SQRT1_2 }
			this.facing = 'north-west'
		} else if (this.keys.d.isDown && this.keys.s.isDown) {
			this.speed = { x: speed * Math.SQRT1_2, y: speed * Math.SQRT1_2 }
			this.facing = 'south-east'
		} else if (this.keys.d.isDown && this.keys.w.isDown) {
			this.speed = { x: speed * Math.SQRT1_2, y: -speed * Math.SQRT1_2 }
			this.facing = 'north-east'
		} else if (this.keys.a.isDown) {
			this.speed = { x: -speed, y: 0 }
			this.facing = 'west'
		} else if (this.keys.d.isDown) {
			this.speed = { x: speed, y: 0 }
			this.facing = 'east'
		} else if (this.keys.s.isDown) {
			this.speed = { x: 0, y: speed }
			this.facing = 'south'
		} else if (this.keys.w.isDown) {
			this.speed = { x: 0, y: -speed }
			this.facing = 'north'
		} else {
			this.speed = { x: 0, y: 0 }
		}

		this.player.x += this.speed.x
		this.player.y += this.speed.y

		if (this.speed.x !== 0 || this.speed.y !== 0) {
			this.player.anims.play(`run-${this.facing}`, true)
		} else {
			this.player.anims.play(`idle-${this.facing}`, true)
		}
	}
}
