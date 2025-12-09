import type { Game } from '../scenes/Game'
import spritesheetJSON from '../sprite-configs/wizard_spritesheet.json'

const directionMap: { [key: string]: string } = {
	west: 'left',
	'south-west': 'front-left',
	south: 'front',
	'south-east': 'front-right',
	east: 'right',
	'north-east': 'back-right',
	north: 'back',
	'north-west': 'back-left',
}

export class Player {
	player!: Phaser.GameObjects.Sprite
	keys!: { [key: string]: Phaser.Input.Keyboard.Key }
	facing: string = 'south'
	speed: { x: number; y: number } = { x: 0, y: 0 }

	constructor(public scene: Game) {
		this.scene = scene
	}

	preload() {
		this.scene.load.spritesheet(
			'player',
			`assets/${spritesheetJSON.spritesheet}`,
			{
				frameWidth: spritesheetJSON.frame_width,
				frameHeight: spritesheetJSON.frame_height,
			},
		)
	}

	create(x: number, y: number) {
		// Create player sprite at the center of the map
		this.player = this.scene.add.sprite(x, y, 'player')

		// Create animations from spritesheet JSON
		for (const anim of spritesheetJSON.animations) {
			for (
				let dirIdx = 0;
				dirIdx < spritesheetJSON.directions.length;
				dirIdx++
			) {
				const direction = spritesheetJSON.directions[dirIdx]
				const row = anim.start_row + dirIdx
				const startFrame = row * spritesheetJSON.total_columns
				const endFrame = startFrame + anim.num_frames - 1

				const animKey = `${anim.name.toLowerCase()}-${direction}`

				this.scene.anims.create({
					key: animKey,
					frames: this.scene.anims.generateFrameNumbers('player', {
						start: startFrame,
						end: endFrame,
					}),
					frameRate: 10,
					repeat: -1,
				})
			}
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

		const spriteDirection = directionMap[this.facing]

		if (this.speed.x !== 0 || this.speed.y !== 0) {
			this.player.anims.play(`run-${spriteDirection}`, true)
		} else {
			this.player.anims.play(`idle-${spriteDirection}`, true)
		}
	}
}
