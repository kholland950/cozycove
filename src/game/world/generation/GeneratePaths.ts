import { SimplexNoise } from "./utils/SimplexNoise";    

export class GeneratePaths {
    private noiseGenerator: SimplexNoise;
    private width: number
    private height: number
    //private roadCount: number = 1;

    constructor(width: number, height: number, roadCount: number = 1, scale: number = 0.05) {
        this.width = width;
        this.height = height;
      //  this.roadCount = roadCount;
        this.noiseGenerator = new SimplexNoise(scale * roadCount);
    }
    generateRoadMap(): number[][] {
        const roadMap: number[][] = [];
        for (let y = 0; y < this.height; y++) {
            const row: number[] = [];
            for (let x = 0; x < this.width; x++) {
                const noiseValue = this.noiseGenerator.getNoise(x, y);
                row.push(noiseValue);
            }
            roadMap.push(row);
        }
        return roadMap;
    }
}