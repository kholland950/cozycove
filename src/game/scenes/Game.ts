import { Scene } from 'phaser'
import { Player } from '../components/Player'
import { RegionManager } from '../world/region/RegionManager'

export class Game extends Scene {
	camera!: Phaser.Cameras.Scene2D.Camera
	background!: Phaser.GameObjects.Image
	player!: Phaser.GameObjects.Sprite
	keys!: { [key: string]: Phaser.Input.Keyboard.Key }

	regionManager: RegionManager = new RegionManager()

	playerComponent: Player = new Player(this)

	constructor() {
		super('Game')
		this.regionManager.generateRegionAt(0, 0)
	}

	preload() {
		this.playerComponent.preload()
	}

	create() {
		this.camera = this.cameras.main
		this.camera.setBackgroundColor(0x000000)
		this.camera.setZoom(0.5)
		// create region now (safe during scene lifecycle)
		this.regionManager.generateRegionAt(0, 0, 12345)

		// instantiate player with the correct scene reference
		this.playerComponent = new Player(this)
		this.playerComponent.create(500, 500)

		const region = this.regionManager.getRegionAt(0, 0)
		if (region) {
			const regionTexture = this.regionManager.createRegionTexture(region, this)
			const img = this.add.image(0, 0, regionTexture.key).setOrigin(0, 0)

			img.setScale(16)
			img.setDepth(-1)
		}
		this.camera.useBounds = false
		// this.input.once('pointerdown', () => {
		//   this.scene.start('GameOver')
		// })
	}

	update() {
		this.playerComponent.update()
	}
}
