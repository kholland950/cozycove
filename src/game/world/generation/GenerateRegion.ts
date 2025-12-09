import { SimplexNoise } from './utils/SimplexNoise'
import { GeneratePaths } from './GeneratePaths'
// import type { Point } from '../../types/global.js'
import type { EdgeNode } from '../types/common'
import type { PathNode } from '../types/common'
export class GenerateRegion {
	private noiseGenerator: SimplexNoise
	private pathGenerator: GeneratePaths
	private width: number
	private height: number
	private scale: number
	private seed?: number | string
	private edgeNodes: EdgeNode[] = []
	private pathNodes: PathNode[] = []

	constructor(
		width: number,
		height: number,
		scale: number = 0.01,
		seed?: number | string,
	) {
		this.width = width
		this.height = height
		this.scale = scale
		this.seed = seed
		this.noiseGenerator = new SimplexNoise(scale, seed)
		this.pathGenerator = new GeneratePaths(
			this.width,
			this.height,
			this.scale,
			0.5,
			this.seed,
		)
		this.initialize()
		// Create seeded path generator
	}
	initialize() {
		this.generateEdgeNodes()
		this.generatePaths()
		this.generateHeightMap()
		//this.generateBiome()
	}
	getPathNodes(): PathNode[] {
		return this.pathNodes
	}
	generateEdgeNodes() {
		let edgeNode: EdgeNode

		// West edge - left side, random y
		edgeNode = {
			x: 0,
			y: Math.floor(
				(this.noiseGenerator.getNoise(0, 0) + 1) * 0.5 * this.height,
			),
			facing: 'West',
		}
		this.edgeNodes.push(edgeNode)
		// East edge - right side, random y
		edgeNode = {
			x: this.width - 1,
			y: Math.floor(
				(this.noiseGenerator.getNoise(this.width, 0) + 1) * 0.5 * this.height,
			),
			facing: 'East',
		}
		this.edgeNodes.push(edgeNode)
		// North edge - top side, random x
		edgeNode = {
			x: Math.floor(
				(this.noiseGenerator.getNoise(0, this.height) + 1) * 0.5 * this.width,
			),
			y: 0,
			facing: 'North',
		}
		this.edgeNodes.push(edgeNode)
		// South edge - bottom side, random x
		edgeNode = {
			x: Math.floor(
				(this.noiseGenerator.getNoise(this.width, this.height) + 1) *
					0.5 *
					this.width,
			),
			y: this.height - 1,
			facing: 'South',
		}
		this.edgeNodes.push(edgeNode)

		console.log('Generated edge nodes:', this.edgeNodes)
	}

	generatePaths() {
		const startNode = this.edgeNodes[0]
		const endNode = this.edgeNodes[2]

		this.pathNodes = this.pathGenerator.generatePath(
			{ x: startNode.x, y: startNode.y },
			{ x: endNode.x, y: endNode.y },
		)

		console.log('Generated path nodes:', this.pathNodes)
	}

	generateHeightMap(): number[][] {
		const heightMap: number[][] = []
		for (let y = 0; y < this.height; y++) {
			const row: number[] = []
			for (let x = 0; x < this.width; x++) {
				const noiseValue = this.noiseGenerator.getNoise(x, y)
				row.push(noiseValue)
			}
			heightMap.push(row)
		}

		return heightMap
	}
}
