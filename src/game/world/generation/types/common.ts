export interface EdgeNode {
	x: number
	y: number
	facing: 'East' | 'West' | 'North' | 'South' | 'Corner'
}

export interface PathNode {
	x: number
	y: number
	g: number // Cost from start
	h: number // Heuristic to end
	f: number // Total cost (g + h)
	parent: PathNode | null
}
