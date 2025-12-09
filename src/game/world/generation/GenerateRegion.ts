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
			this.scale,
			0.5,
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
		let usedIndices: Set<number> = new Set()
		let t = 1

		while (usedIndices.size < totalNodes) {
			let startIndex: number | undefined
			while (startIndex === undefined || usedIndices.has(startIndex)) {
				startIndex = Math.abs(
					Math.floor(this.noiseGenerator.getNoise(t, t) * totalNodes),
				)
				t += 100
			}
			if (startIndex < 0) startIndex = 0
			if (startIndex > totalNodes - 1) startIndex = totalNodes - 1

			usedIndices.add(startIndex)
			let endIndex: number | undefined
			while (endIndex === undefined || usedIndices.has(endIndex)) {
				endIndex = Math.abs(
					Math.floor(this.noiseGenerator.getNoise(t, t) * totalNodes),
				)
				t += 100
			}
			if (endIndex < 0) endIndex = 0
			if (endIndex > totalNodes - 1) endIndex = totalNodes - 1

			usedIndices.add(endIndex)
			this.paths.push(
				this.pathGenerator.generatePath(
					{ x: this.edgeNodes[startIndex].x, y: this.edgeNodes[startIndex].y },
					{ x: this.edgeNodes[endIndex].x, y: this.edgeNodes[endIndex].y },
				),
			)
		}
		console.log('Generated path nodes:', this.paths)
	}
}
