import {SimplexNoise } from './utils/SimplexNoise.js';
// import {GeneratePaths} from './GeneratePaths.js';
// import {GenerateBiome } from './GenerateBiome.js';

export class GenerateRegion {
    private noiseGenerator: SimplexNoise;
    //private pathGenerator: GeneratePaths;
    //private biomeGenerator: GenerateBiome;
    private width: number;
    private height: number;
    constructor(width: number, height: number, scale: number = 0.01) {
        this.width = width;
        this.height = height;
        this.noiseGenerator = new SimplexNoise(scale);
        //this.pathGenerator = new GeneratePaths(width, height, 2, scale);
        //this.biomeGenerator = new GenerateBiome(width, height, scale);
    }
    generateHeightMap(): number[][] {
        const heightMap: number[][] = [];
        for (let y = 0; y < this.height; y++) {
            const row: number[] = [];
            for (let x = 0; x < this.width; x++) {
                const noiseValue = this.noiseGenerator.getNoise(x, y);
                row.push(noiseValue);
            }
            heightMap.push(row);
        }
        return heightMap;
    }

}