import { Scene } from 'phaser'
import { Player } from '../components/Player'

export class Game extends Scene {
  camera!: Phaser.Cameras.Scene2D.Camera
  background!: Phaser.GameObjects.Image
  player!: Phaser.GameObjects.Sprite
  keys!: { [key: string]: Phaser.Input.Keyboard.Key }

  playerComponent: Player = new Player(this)

  constructor() {
    super('Game')
  }

  preload() {
    this.load.image('Autumn_Forest_Objects', 'assets/Autumn_Forest_Objects.png')
    this.load.image('Autumn_Forest_Tiles', 'assets/Autumn_Forest_Tiles.png')
    this.load.image('Buildings', 'assets/Buildings.png')
    this.load.tilemapTiledJSON('tilemap', 'assets/test-tilemap.json')

    this.playerComponent.preload()
  }

  create() {
    this.camera = this.cameras.main
    this.camera.setBackgroundColor(0x000000)

    const map = this.make.tilemap({
      key: 'tilemap',
    })
    const tileset = map.addTilesetImage(
      'Autumn_Forest_Tiles',
      'Autumn_Forest_Tiles',
    )
    const objectsTileset = map.addTilesetImage(
      'Autumn_Forest_Objects',
      'Autumn_Forest_Objects',
    )
    const buildingsTileset = map.addTilesetImage('Atlas_Buildings', 'Buildings')

    if (!tileset || !objectsTileset || !buildingsTileset) {
      throw new Error('Failed to load tilesets')
    }

    map.createLayer('Ground', tileset, 0, 0)
    map.createLayer('Props', objectsTileset, 0, 0)
    map.createLayer('Buildings', buildingsTileset, 0, 0)

    const mapWidth = map.widthInPixels
    const mapHeight = map.heightInPixels
    this.camera.setBounds(0, 0, mapWidth, mapHeight)

    this.playerComponent.create(mapWidth / 2, mapHeight / 2)

    // this.input.once('pointerdown', () => {
    //   this.scene.start('GameOver')
    // })
  }

  update() {
    this.playerComponent.update()
  }
}
