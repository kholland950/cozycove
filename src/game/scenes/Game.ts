import { Scene } from 'phaser'
import { Player } from '../components/Player'
import { RegionManager } from '../world/region/RegionManager'

export class Game extends Scene {
	camera!: Phaser.Cameras.Scene2D.Camera
	background!: Phaser.GameObjects.Image
	player!: Phaser.GameObjects.Sprite
	keys!: { [key: string]: Phaser.Input.Keyboard.Key }

	seed?: number | string = Math.random() * 1000
	regionWidth: number = 512 * 2
	regionHeight: number = 512 * 2
	chunkSize: number = 16
	regionScale: number = 0.03
	regionDisplayScale: number = 8
	cameraZoom: number = 2

	regionManager: RegionManager

	playerComponent: Player = new Player(this)

	constructor() {
		super('Game')
		this.regionManager = new RegionManager(
			this.regionWidth,
			this.regionHeight,
			this.chunkSize,
			this.regionScale,
			this.seed,
		)
	}

	preload() {
		this.playerComponent.preload()
		this.regionManager.generateRegionAt(0, 0)
	}

	create() {
		this.camera = this.cameras.main
		this.camera.setBackgroundColor(0x000000)
		this.camera.setZoom(this.cameraZoom)
		// create region now (safe during scene lifecycle)

		const region = this.regionManager.getRegionAt(0, 0)

		if (region) {
			const regionTexture = this.regionManager.createRegionTexture(region, this)
			const img = this.add.image(
				(region.width * this.regionDisplayScale) / 2,
				(region.height * this.regionDisplayScale) / 2,
				regionTexture.key,
			)

			img.setScale(this.regionDisplayScale)
			img.setDepth(-1)
		}

		const spawnPoint = this.regionManager.getInitialSpawnPoint()
		// instantiate player with the correct scene reference
		this.playerComponent = new Player(this)
		this.playerComponent.create(
			spawnPoint.x * this.regionDisplayScale,
			spawnPoint.y * this.regionDisplayScale,
		)
		this.camera.useBounds = false
		// this.input.once('pointerdown', () => {
		//   this.scene.start('GameOver')
		// })
	}

	update() {
		this.playerComponent.update()
	}
}
