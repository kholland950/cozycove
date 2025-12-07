import { SimplexNoise } from "./utils/SimplexNoise";    

export class GenerateBiome { 
    private noiseGenerator: SimplexNoise;
    private width: number
    private height: number
    constructor(width: number, height: number, scale: number = 0.02) {
        this.width = width;
        this.height = height;
        this.noiseGenerator = new SimplexNoise(scale);

    }
    generateBiomeMap(): number[][] {
        const biomeMap: number[][] = [];
        for (let y = 0; y < this.height; y++) {
            const row: number[] = [];
            for (let x = 0; x < this.width; x++) {
                const noiseValue = this.noiseGenerator.getNoise(x, y);
                row.push(noiseValue);
            }
            biomeMap.push(row);
        }
        return biomeMap;
    }
}
