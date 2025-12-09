import { GenerateRegion } from '../generation/GenerateRegion'
import { RegionData } from './RegionData.js'

export class RegionManager {
	private regions: RegionData[] = []
	generateRegionAt(worldX: number, worldY: number, seed?: number): RegionData {
		const region = new RegionData(worldX, worldY, 512, 512, seed)
		const generator = new GenerateRegion(region.width, region.height)
		generator.initialize(region.seed)
		this.regions.push(region)
		return region
	}
}
