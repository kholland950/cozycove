import { GenerateRegion } from '../generation/GenerateRegion'
import { RegionData } from './RegionData'
import { Point } from '../../types/global'

export class RegionManager {
	private regions: RegionData[] = []
	private width: number
	private height: number
	private chunkSize: number
	private scale: number
	private seed?: number | string

	constructor(
		width: number,
		height: number,
		chunkSize: number,
		scale: number,
		seed?: number | string,
	) {
		this.width = width
		this.height = height
		this.chunkSize = chunkSize
		this.scale = scale
		this.seed = seed
	}

	generateRegionAt(worldX: number, worldY: number): RegionData {
		const region = new RegionData(
			worldX,
			worldY,
			this.width,
			this.height,
			this.chunkSize,
			this.seed,
		)
		const generator = new GenerateRegion(
			region.width,
			region.height,
			this.scale,
			this.seed,
		)
		region.paths = generator.getPathNodes()
		console.log('Region paths count:', region.paths.length)
		this.regions.push(region)
		return region
	}
	getCurrentRegion(): RegionData | null {
		if (this.regions.length === 0) return null
		return this.regions[0]
	}
	getInitialSpawnPoint(): Point {
		const region = this.getCurrentRegion()
		if (!region) return { x: 0, y: 0 }

		const allPathNodes = region.paths.flat()
		if (allPathNodes.length === 0) return { x: 0, y: 0 }
		const randomIndex = Math.floor(Math.random() * allPathNodes.length)
		const spawnPos = {
			x: allPathNodes[randomIndex].x,
			y: allPathNodes[randomIndex].y,
		}
		return spawnPos
	}

	getRegionAt(worldX: number, worldY: number): RegionData | null {
		for (const region of this.regions) {
			if (region.worldX === worldX && region.worldY === worldY) {
				return region
			}
		}
		return null
	}

	createRegionTexture(
		region: RegionData,
		scene: Phaser.Scene,
	): Phaser.Textures.Texture {
		const textureKey = `region_${region.worldX}_${region.worldY}`
		const width = region.width
		const height = region.height

		// Remove any existing texture with the same key
		if (scene.textures.exists(textureKey)) {
			scene.textures.remove(textureKey)
		}

		// Create a canvas-based texture we can draw into
		const canvasTexture = scene.textures.createCanvas(textureKey, width, height)
		if (!canvasTexture) {
			throw new Error(
				`Failed to create canvas texture for region ${region.worldX},${region.worldY}`,
			)
		}

		// Get the 2D canvas context and draw a simple representation:
		const ctx = canvasTexture.getContext()
		// Background (example color — change as needed)
		ctx.fillStyle = '#5d811bff'
		ctx.fillRect(0, 0, width, height)

		// If the region has a heightMap, draw a simple grayscale visualization
		// const heightMap = (region as any).heightMap
		// if (Array.isArray(heightMap) && heightMap.length > 0) {
		// 	for (let y = 0; y < Math.min(heightMap.length, height); y++) {
		// 		const row = heightMap[y]
		// 		for (let x = 0; x < Math.min(row.length, width); x++) {
		// 			const v = Math.max(-1, Math.min(1, row[x] ?? 0))
		// 			const c = Math.round(((v + 1) / 2) * 255)
		// 			ctx.fillStyle = `rgb(${c},${c},${c})`
		// 			ctx.fillRect(x, y, 1, 1)
		// 		}
		// 	}
		// }

		// Draw path nodes as visible lines
		const paths = region.paths

		if (Array.isArray(paths) && paths.length > 0) {
			console.log('Drawing', paths.length, 'paths')
			ctx.strokeStyle = '#a3cf3bff'
			ctx.lineWidth = 16
			ctx.lineCap = 'round'
			ctx.lineJoin = 'round'

			// Draw each path
			for (const pathNodes of paths) {
				if (!Array.isArray(pathNodes) || pathNodes.length === 0) continue

				ctx.beginPath()
				for (let i = 0; i < pathNodes.length; i++) {
					const node = pathNodes[i]
					const x = Math.round(node.x)
					const y = Math.round(node.y)

					if (x >= 0 && x < width && y >= 0 && y < height) {
						if (i === 0) {
							ctx.moveTo(x, y)
						} else {
							ctx.lineTo(x, y)
						}
					}
				}
				ctx.stroke()
			}
		} else {
			console.warn('No path nodes to draw')
		}

		// Push the canvas contents into the texture system
		canvasTexture.refresh()

		return canvasTexture
	}
}
