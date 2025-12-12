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
		scale: number = 0.02,
		noiseInfluence: number = 20,
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
		console.log('Generating path from', start, 'to', end)
		const startX = Math.max(0, Math.min(this.width - 1, Math.round(start.x)))
		const startY = Math.max(0, Math.min(this.height - 1, Math.round(start.y)))
		const endX = Math.max(0, Math.min(this.width - 1, Math.round(end.x)))
		const endY = Math.max(0, Math.min(this.height - 1, Math.round(end.y)))

		// If start equals end, return single node
		if (startX === endX && startY === endY) {
			return [
				{
					x: startX,
					y: startY,
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
			x: startX,
			y: startY,
			g: 0,
			h: this.heuristic({ x: startX, y: startY }, { x: endX, y: endY }),
			f: 0,
			parent: null,
		}
		startNode.f = startNode.g + startNode.h
		openSet.push(startNode)
		nodeMap.set(`${startX},${startY}`, startNode)

		// Iteration limit to prevent infinite loops
		const maxIterations = this.width * this.height
		let iterations = 0

		while (openSet.length > 0 && iterations < maxIterations) {
			iterations++

			// Get node with lowest f score
			let currentIndex = 0
			for (let index = 1; index < openSet.length; index++) {
				if (openSet[index].f < openSet[currentIndex].f) {
					currentIndex = index
				}
			}
			const current = openSet[currentIndex]

			// Check if we reached the end
			if (current.x === endX && current.y === endY) {
				const rawPath = this.reconstructPath(current)
				return this.smoothPath(rawPath)
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
						h: this.heuristic(neighbor, { x: endX, y: endY }),
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
		const fallbackPath = this.createStraightPath(
			{ x: startX, y: startY },
			{ x: endX, y: endY },
		)
		return this.smoothPath(fallbackPath)
	}

	/**
	 * Smooths a path by averaging groups of N consecutive points.
	 * Creates a simplified, smoother path with fewer points.
	 * @param path Original path nodes
	 * @param groupSize Number of points to average together (default 3)
	 * @returns Smoothed path with averaged points
	 */
	private smoothPath(path: PathNode[], groupSize: number = 64): PathNode[] {
		if (path.length < groupSize) return path

		const smoothed: PathNode[] = []
		let parent: PathNode | null = null

		// Always keep the first point
		const firstNode: PathNode = {
			x: path[0].x,
			y: path[0].y,
			g: 0,
			h: 0,
			f: 0,
			parent: null,
		}
		smoothed.push(firstNode)
		parent = firstNode

		// Process points in groups of N, averaging them
		for (let index = 1; index < path.length - 1; index += groupSize) {
			let sumX = 0
			let sumY = 0
			let count = 0

			// Calculate average of up to groupSize points
			for (
				let offset = 0;
				offset < groupSize && index + offset < path.length - 1;
				offset++
			) {
				const point = path[index + offset]
				sumX += point.x
				sumY += point.y
				count++
			}

			// Calculate average position
			const avgX = Math.round(sumX / count)
			const avgY = Math.round(sumY / count)

			// Skip if it's the same as the last point
			if (parent && avgX === parent.x && avgY === parent.y) continue

			// Clamp to bounds
			if (avgX < 0 || avgX >= this.width || avgY < 0 || avgY >= this.height)
				continue

			const node: PathNode = {
				x: avgX,
				y: avgY,
				g: parent ? parent.g + 1 : 0,
				h: 0,
				f: 0,
				parent,
			}
			smoothed.push(node)
			parent = node
		}

		// Always keep the last point
		const lastPoint = path[path.length - 1]
		if (!parent || lastPoint.x !== parent.x || lastPoint.y !== parent.y) {
			const lastNode: PathNode = {
				x: lastPoint.x,
				y: lastPoint.y,
				g: parent ? parent.g + 1 : 0,
				h: 0,
				f: 0,
				parent,
			}
			smoothed.push(lastNode)
		}

		return smoothed.length >= 2 ? smoothed : path
	} /**
	 * Creates a straight-line path from start to end using Bresenham's line algorithm.
	 * Guaranteed to return a valid path.
	 */
	private createStraightPath(start: Point, end: Point): PathNode[] {
		const path: PathNode[] = []
		let parent: PathNode | null = null

		const deltaX = Math.abs(end.x - start.x)
		const deltaY = Math.abs(end.y - start.y)
		const stepX = start.x < end.x ? 1 : -1
		const stepY = start.y < end.y ? 1 : -1
		let error = deltaX - deltaY

		let currentX = start.x
		let currentY = start.y

		while (true) {
			const node: PathNode = {
				x: currentX,
				y: currentY,
				g: parent ? parent.g + this.getMoveCost(currentX, currentY) : 0,
				h: this.heuristic({ x: currentX, y: currentY }, end),
				f: 0,
				parent,
			}
			node.f = node.g + node.h
			path.push(node)
			parent = node

			if (currentX === end.x && currentY === end.y) break

			const error2 = 2 * error
			if (error2 > -deltaY) {
				error -= deltaY
				currentX += stepX
			}
			if (error2 < deltaX) {
				error += deltaX
				currentY += stepY
			}
		}

		return path
	}

	/**
	 * Gets the movement cost for a tile, influenced by noise
	 */
	private getMoveCost(x: number, y: number): number {
		const baseCost = 1
		const noiseValue = this.noiseGenerator.getPathNoise(x, y)
		// Normalize noise from [-1, 1] to positive cost
		// Lower noise = lower cost = preferred path
		const noiseCost = (noiseValue + 1) * 0.5 * this.noiseInfluence
		return baseCost + noiseCost
	}

	/**
	 * Heuristic function for A* (Euclidean distance with reduced weight for more exploration)
	 */
	private heuristic(pointA: Point, pointB: Point): number {
		const deltaX = pointA.x - pointB.x
		const deltaY = pointA.y - pointB.y
		// Use Euclidean and reduce weight to 0.8 for more winding paths
		return Math.sqrt(deltaX * deltaX + deltaY * deltaY) * 0.8
	}

	/**
	 * Gets valid neighboring tiles (8-directional for smoother paths)
	 */
	private getNeighbors(node: Point): Point[] {
		const neighbors: Point[] = []
		const directions = [
			{ x: 0, y: -1 }, // North
			{ x: 1, y: -1 }, // Northeast
			{ x: 1, y: 0 }, // East
			{ x: 1, y: 1 }, // Southeast
			{ x: 0, y: 1 }, // South
			{ x: -1, y: 1 }, // Southwest
			{ x: -1, y: 0 }, // West
			{ x: -1, y: -1 }, // Northwest
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
