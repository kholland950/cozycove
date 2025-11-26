import { Scene } from 'phaser'

export class Game extends Scene {
  camera!: Phaser.Cameras.Scene2D.Camera
  background!: Phaser.GameObjects.Image

  constructor() {
    super('Game')
  }

  preload() {
    this.load.image('Autumn_Forest_Objects', 'assets/Autumn_Forest_Objects.png')
    this.load.image('Autumn_Forest_Tiles', 'assets/Autumn_Forest_Tiles.png')
    this.load.tilemapTiledJSON('tilemap', 'assets/test-tilemap.json')
  }

  create() {
    this.camera = this.cameras.main
    this.camera.setBackgroundColor(0x000000)

    const map = this.make.tilemap({ key: 'tilemap' })
    const tileset = map.addTilesetImage(
      'Autumn_Forest_Tiles',
      'Autumn_Forest_Tiles',
    )
    const objectsTileset = map.addTilesetImage(
      'Autumn_Forest_Objects',
      'Autumn_Forest_Objects',
    )

    if (!tileset || !objectsTileset) {
      throw new Error('Failed to load tilesets')
    }

    // TODO: Idk why these aren't aligned, this 250 thing is hack
    map.createLayer('Ground', tileset, 250, 250)
    map.createLayer('Props', objectsTileset, 0, 0)

    // this.input.once('pointerdown', () => {
    //   this.scene.start('GameOver')
    // })
  }
}
