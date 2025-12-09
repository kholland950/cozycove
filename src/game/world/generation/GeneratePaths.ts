import { SimplexNoise } from './utils/SimplexNoise'
import type { Point } from '../../types/global'
import type { PathNode } from '../types/common'

export class GeneratePaths {
	private noiseGenerator: SimplexNoise
	private width: number
	private height: number
	private noiseInfluence: number

	constructor(
		width: number,
		height: number,
		scale: number = 0.05,
		noiseInfluence: number = 5,
		seed?: number | string,
	) {
		this.width = width
		this.height = height
		this.noiseInfluence = noiseInfluence
		this.noiseGenerator = new SimplexNoise(scale, seed)
	}

	/**
	 * Generates a winding path from start to end using A* with noise influence.
	 * ALWAYS returns a valid path - guaranteed to reach the destination.
	 * @param start Starting point
	 * @param end Ending point
	 * @returns Array of PathNodes representing the path (never empty)
	 */
	generatePath(start: Point, end: Point): PathNode[] {
		// Clamp and round coordinates to valid bounds
		const sx = Math.max(0, Math.min(this.width - 1, Math.round(start.x)))
		const sy = Math.max(0, Math.min(this.height - 1, Math.round(start.y)))
		const ex = Math.max(0, Math.min(this.width - 1, Math.round(end.x)))
		const ey = Math.max(0, Math.min(this.height - 1, Math.round(end.y)))

		// If start equals end, return single node
		if (sx === ex && sy === ey) {
			return [
				{
					x: sx,
					y: sy,
					g: 0,
					h: 0,
					f: 0,
					parent: null,
				},
			]
		}

		const openSet: PathNode[] = []
		const closedSet = new Set<string>()
		const nodeMap = new Map<string, PathNode>()

		const startNode: PathNode = {
			x: sx,
			y: sy,
			g: 0,
			h: this.heuristic({ x: sx, y: sy }, { x: ex, y: ey }),
			f: 0,
			parent: null,
		}
		startNode.f = startNode.g + startNode.h
		openSet.push(startNode)
		nodeMap.set(`${sx},${sy}`, startNode)

		// Iteration limit to prevent infinite loops
		const maxIterations = this.width * this.height
		let iterations = 0

		while (openSet.length > 0 && iterations < maxIterations) {
			iterations++

			// Get node with lowest f score
			let currentIndex = 0
			for (let i = 1; i < openSet.length; i++) {
				if (openSet[i].f < openSet[currentIndex].f) {
					currentIndex = i
				}
			}
			const current = openSet[currentIndex]

			// Check if we reached the end
			if (current.x === ex && current.y === ey) {
				return this.reconstructPath(current)
			}

			// Move current from open to closed
			openSet.splice(currentIndex, 1)
			closedSet.add(`${current.x},${current.y}`)

			// Check all neighbors
			const neighbors = this.getNeighbors(current)
			for (const neighbor of neighbors) {
				const key = `${neighbor.x},${neighbor.y}`
				if (closedSet.has(key)) continue

				// Calculate costs with noise influence
				const moveCost = this.getMoveCost(neighbor.x, neighbor.y)
				const tentativeG = current.g + moveCost

				// Check if neighbor is already in open set
				const existingNode = nodeMap.get(key)

				if (!existingNode) {
					// Add new node
					const newNode: PathNode = {
						x: neighbor.x,
						y: neighbor.y,
						g: tentativeG,
						h: this.heuristic(neighbor, { x: ex, y: ey }),
						f: 0,
						parent: current,
					}
					newNode.f = newNode.g + newNode.h
					openSet.push(newNode)
					nodeMap.set(key, newNode)
				} else if (tentativeG < existingNode.g) {
					// Update existing node with better path
					existingNode.g = tentativeG
					existingNode.f = existingNode.g + existingNode.h
					existingNode.parent = current
				}
			}
		}

		// Fallback: A* didn't complete (shouldn't happen on open grid)
		// Return straight line path as guaranteed fallback
		return this.createStraightPath({ x: sx, y: sy }, { x: ex, y: ey })
	}

	/**
	 * Creates a straight-line path from start to end using Bresenham's line algorithm.
	 * Guaranteed to return a valid path.
	 */
	private createStraightPath(start: Point, end: Point): PathNode[] {
		const path: PathNode[] = []
		let parent: PathNode | null = null

		const dx = Math.abs(end.x - start.x)
		const dy = Math.abs(end.y - start.y)
		const sx = start.x < end.x ? 1 : -1
		const sy = start.y < end.y ? 1 : -1
		let err = dx - dy

		let x = start.x
		let y = start.y

		while (true) {
			const node: PathNode = {
				x,
				y,
				g: parent ? parent.g + this.getMoveCost(x, y) : 0,
				h: this.heuristic({ x, y }, end),
				f: 0,
				parent,
			}
			node.f = node.g + node.h
			path.push(node)
			parent = node

			if (x === end.x && y === end.y) break

			const e2 = 2 * err
			if (e2 > -dy) {
				err -= dy
				x += sx
			}
			if (e2 < dx) {
				err += dx
				y += sy
			}
		}

		return path
	}

	/**
	 * Gets the movement cost for a tile, influenced by noise
	 */
	private getMoveCost(x: number, y: number): number {
		const baseCost = 1
		const noiseValue = this.noiseGenerator.getNoise(x, y)
		// Normalize noise from [-1, 1] to positive cost
		// Lower noise = lower cost = preferred path
		const noiseCost = (noiseValue + 1) * 0.5 * this.noiseInfluence
		return baseCost + noiseCost
	}

	/**
	 * Heuristic function for A* (Manhattan distance)
	 */
	private heuristic(a: Point, b: Point): number {
		return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
	}

	/**
	 * Gets valid neighboring tiles (4-directional)
	 */
	private getNeighbors(node: Point): Point[] {
		const neighbors: Point[] = []
		const directions = [
			{ x: 0, y: -1 }, // North
			{ x: 1, y: 0 }, // East
			{ x: 0, y: 1 }, // South
			{ x: -1, y: 0 }, // West
		]

		for (const dir of directions) {
			const x = node.x + dir.x
			const y = node.y + dir.y

			if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
				neighbors.push({ x, y })
			}
		}

		return neighbors
	}

	/**
	 * Reconstructs the path from the end node back to start
	 */
	private reconstructPath(endNode: PathNode): PathNode[] {
		const path: PathNode[] = []
		let current: PathNode | null = endNode

		while (current !== null) {
			path.unshift({
				x: current.x,
				y: current.y,
				g: current.g,
				h: current.h,
				f: current.f,
				parent: current.parent,
			})
			current = current.parent
		}

		return path
	}

	/**
	 * Generates multiple paths between random points
	 */
	// generateMultiplePaths(pathCount: number): Point[][] {
	// 	const paths: Point[][] = []

	// 	for (let i = 0; i < pathCount; i++) {
	// 		// Generate random start and end points
	// 		const start: Point = {
	// 			x: Math.floor(Math.random() * this.width),
	// 			y: Math.floor(Math.random() * this.height),
	// 		}
	// 		const end: Point = {
	// 			x: Math.floor(Math.random() * this.width),
	// 			y: Math.floor(Math.random() * this.height),
	// 		}

	// 		const path = this.generatePath(start, end)
	// 		// Path is always non-empty now
	// 		paths.push(path.map((n) => ({ x: n.x, y: n.y })))
	// 	}

	// 	return paths
	// }
}
