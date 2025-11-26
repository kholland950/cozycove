import type { Game } from '../scenes/Game'

export class Player {
  player!: Phaser.GameObjects.Sprite
  keys!: { [key: string]: Phaser.Input.Keyboard.Key }

  constructor(public scene: Game) {
    this.scene = scene
  }

  preload() {
    this.scene.load.spritesheet('player', 'assets/Character_Walk.png', {
      frameWidth: 40,
      frameHeight: 48,
    })
  }

  create(x: number, y: number) {
    // Create player sprite at the center of the map
    this.player = this.scene.add.sprite(x, y, 'player')

    // Create walking animations
    this.scene.anims.create({
      key: 'walk-left',
      frames: this.scene.anims.generateFrameNumbers('player', {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    })

    this.scene.anims.create({
      key: 'walk-right',
      frames: this.scene.anims.generateFrameNumbers('player', {
        start: 4,
        end: 7,
      }),
      frameRate: 10,
      repeat: -1,
    })

    this.scene.anims.create({
      key: 'walk-up',
      frames: this.scene.anims.generateFrameNumbers('player', {
        start: 8,
        end: 11,
      }),
      frameRate: 10,
      repeat: -1,
    })

    this.scene.anims.create({
      key: 'walk-down',
      frames: this.scene.anims.generateFrameNumbers('player', {
        start: 12,
        end: 15,
      }),
      frameRate: 10,
      repeat: -1,
    })

    // Make camera follow the player
    this.scene.camera.startFollow(this.player, true, 0.1, 0.1)

    // Set up keyboard controls
    this.keys = this.scene.input.keyboard!.addKeys(
      'w,a,s,d',
    ) as Phaser.Types.Input.Keyboard.CursorKeys
  }

  update() {
    if (!this.player || !this.keys) {
      return
    }

    const speed = 3

    // Horizontal movement
    if (this.keys.a.isDown) {
      this.player.x -= speed
      this.player.anims.play('walk-left', true)
    } else if (this.keys.d.isDown) {
      this.player.x += speed
      this.player.anims.play('walk-right', true)
    }
    // Vertical movement
    else if (this.keys.w.isDown) {
      this.player.y -= speed
      this.player.anims.play('walk-up', true)
    } else if (this.keys.s.isDown) {
      this.player.y += speed
      this.player.anims.play('walk-down', true)
    } else {
      // Stop animation when not moving
      this.player.anims.stop()
    }
  }
}
