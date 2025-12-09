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

	// Noise maps for procedural generation
	public biomeNoise: NoiseMap | null = null
	public roadNoise: NoiseMap | null = null
	public elevationNoise: NoiseMap | null = null
	public moistureNoise: NoiseMap | null = null

	// Static structures placed in this region
	public structures: StaticStructure[] = []

	// Additional metadata
	public seed: number
	public generated: boolean = false

	constructor(
		worldX: number,
		worldY: number,
		width: number = 512,
		height: number = 512,
		seed?: number,
	) {
		this.worldX = worldX
		this.worldY = worldY
		this.width = width
		this.height = height
		this.seed = seed ?? Math.random()
	}

	addStructure(structure: StaticStructure): void {
		this.structures.push(structure)
	}

	removeStructure(id: string): boolean {
		const index = this.structures.findIndex((s) => s.id === id)
		if (index !== -1) {
			this.structures.splice(index, 1)
			return true
		}
		return false
	}

	getStructure(id: string): StaticStructure | undefined {
		return this.structures.find((s) => s.id === id)
	}

	setNoiseMap(
		type: 'biome' | 'road' | 'elevation' | 'moisture',
		noiseMap: NoiseMap,
	): void {
		switch (type) {
			case 'biome':
				this.biomeNoise = noiseMap
				break
			case 'road':
				this.roadNoise = noiseMap
				break
			case 'elevation':
				this.elevationNoise = noiseMap
				break
			case 'moisture':
				this.moistureNoise = noiseMap
				break
		}
	}

	getNoiseValue(
		type: 'biome' | 'road' | 'elevation' | 'moisture',
		x: number,
		y: number,
	): number | null {
		let noiseMap: NoiseMap | null = null

		switch (type) {
			case 'biome':
				noiseMap = this.biomeNoise
				break
			case 'road':
				noiseMap = this.roadNoise
				break
			case 'elevation':
				noiseMap = this.elevationNoise
				break
			case 'moisture':
				noiseMap = this.moistureNoise
				break
		}

		if (
			!noiseMap ||
			x < 0 ||
			y < 0 ||
			x >= noiseMap.width ||
			y >= noiseMap.height
		) {
			return null
		}

		return noiseMap.values[y][x]
	}

	clear(): void {
		this.biomeNoise = null
		this.roadNoise = null
		this.elevationNoise = null
		this.moistureNoise = null
		this.structures = []
		this.generated = false
	}
}
