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
	private paths: PathNode[][] = []

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
			this.scale, // Lower scale for more variation
			20, // Higher influence for more winding
			this.seed,
		)
		this.initialize()
	}
	initialize() {
		this.generateEdgeNodes()
		this.generatePaths()
		//this.generateHeightMap()
		//this.generateBiome()
	}
	getPathNodes(): PathNode[][] {
		return this.paths
	}
	generateEdgeNodes() {
		let westEdgeNode: EdgeNode
		let eastEdgeNode: EdgeNode
		let northEdgeNode: EdgeNode
		let southEdgeNode: EdgeNode

		// West edge - left side, random y
		westEdgeNode = {
			x: 0,
			y: Math.floor(
				(this.noiseGenerator.getNoise(0, 0) + 1) * 0.5 * this.height,
			),
			facing: 'West',
		}
		this.edgeNodes.push(westEdgeNode)
		// East edge - right side, random y
		eastEdgeNode = {
			x: this.width - 1,
			y: Math.floor(
				(this.noiseGenerator.getNoise(this.width, 0) + 1) * 0.5 * this.height,
			),
			facing: 'East',
		}
		this.edgeNodes.push(eastEdgeNode)
		// North edge - top side, random x
		northEdgeNode = {
			x: Math.floor(
				(this.noiseGenerator.getNoise(0, this.height) + 1) * 0.5 * this.width,
			),
			y: 0,
			facing: 'North',
		}
		this.edgeNodes.push(northEdgeNode)
		// South edge - bottom side, random x
		southEdgeNode = {
			x: Math.floor(
				(this.noiseGenerator.getNoise(this.width, this.height) + 1) *
					0.5 *
					this.width,
			),
			y: this.height - 1,
			facing: 'South',
		}
		this.edgeNodes.push(southEdgeNode)

		console.log('Generated edge nodes:', this.edgeNodes)
	}

	generatePaths() {
		const totalNodes = this.edgeNodes.length
		if (totalNodes < 2) {
			console.warn('Not enough edge nodes to generate paths.')
			return
		}
		if (totalNodes === 2) {
			console.warn(
				'Only two edge nodes available; generating a single path between them.',
			)
			const startNode = this.edgeNodes[0]
			const endNode = this.edgeNodes[1]
			this.paths = [
				this.pathGenerator.generatePath(
					{ x: startNode.x, y: startNode.y },
					{ x: endNode.x, y: endNode.y },
				),
			]
			return
		}

		// Create pairs of opposite sides first (West-East, North-South)
		const opposites = [
			{ start: 0, end: 1 }, // West to East
			{ start: 2, end: 3 }, // North to South
		]

		// Generate paths between opposite edges
		for (const pair of opposites) {
			if (pair.start < totalNodes && pair.end < totalNodes) {
				this.paths.push(
					this.pathGenerator.generatePath(
						{
							x: this.edgeNodes[pair.start].x,
							y: this.edgeNodes[pair.start].y,
						},
						{ x: this.edgeNodes[pair.end].x, y: this.edgeNodes[pair.end].y },
					),
				)
			}
		}

		console.log('Generated path nodes:', this.paths)
	}
}
