import { SimplexNoise } from './utils/SimplexNoise.js'
import { GeneratePaths } from './GeneratePaths.js'
// import type { Point } from '../../types/global.js'
import type { EdgeNode } from './types/common.js'
import type { PathNode } from './types/common.js'
export class GenerateRegion {
	private noiseGenerator: SimplexNoise
	private pathGenerator: GeneratePaths
	private width: number
	private height: number
	private edgeNodes: EdgeNode[] = []
	private pathNodes: PathNode[] = []

	constructor(width: number, height: number, scale: number = 0.01) {
		this.width = width
		this.height = height
		this.noiseGenerator = new SimplexNoise(scale)
		this.pathGenerator = new GeneratePaths(width, height, 2, scale)
	}
	initialize(seed: number) {
		this.generateEdgeNodes(seed)
		this.generatePaths()
		this.generateHeightMap()
		//this.generateBiome()
	}
	getPathNodes(): PathNode[] {
		return this.pathNodes
	}
	generateEdgeNodes(seed: number) {
		let edgeNode: EdgeNode

		edgeNode = {
			x: 0,
			y: this.noiseGenerator.getNoise(0, this.height),
			facing: 'West',
		}
		this.edgeNodes.push(edgeNode)
		edgeNode = {
			x: this.width - 1,
			y:
				this.noiseGenerator.getNoise(this.width - 1, this.height) * this.height,
			facing: 'East',
		}
		this.edgeNodes.push(edgeNode)
		edgeNode = {
			x: this.noiseGenerator.getNoise(this.width, 0) * this.width,
			y: 0,
			facing: 'North',
		}
		this.edgeNodes.push(edgeNode)
		edgeNode = {
			x: this.noiseGenerator.getNoise(this.width, this.height - 1) * this.width,
			y: this.height - 1,
			facing: 'South',
		}
		this.edgeNodes.push(edgeNode)
	}

	generatePaths() {
		const startNode = this.edgeNodes[0]
		const endNode = this.edgeNodes[2]

		this.pathNodes = this.pathGenerator.generatePath(
			{ x: startNode.x, y: startNode.y },
			{ x: endNode.x, y: endNode.y },
		)
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
