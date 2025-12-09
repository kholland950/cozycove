import { PathNode } from '../types/common'

export interface StaticStructure {
	id: string
	tilemapPath: string // Path to the Tiled tilemap JSON file
	x: number // Position in the region (in tiles)
	y: number
	width: number // Dimensions of the tilemap (in tiles)
	height: number
}

export interface NoiseMap {
	width: number
	height: number
	values: number[][]
}

export class RegionData {
	// World coordinates (in region units)
	public readonly worldX: number
	public readonly worldY: number

	// Region dimensions (in tiles)
	public readonly width: number
	public readonly height: number
	public readonly chunkSize: number

	// Static structures placed in this region
	public structures: StaticStructure[] = []
	public paths: PathNode[] = []

	// Additional metadata
	public seed: number
	public generated: boolean = false

	constructor(
		worldX: number,
		worldY: number,
		width: number = 512,
		height: number = 512,
		chunkSize: number = 128,
		seed?: number,
	) {
		this.worldX = worldX
		this.worldY = worldY
		this.width = width
		this.height = height
		this.chunkSize = chunkSize
		this.seed = seed ?? Math.random()
	}
	clear(): void {
		this.structures = []
		this.generated = false
	}
}
