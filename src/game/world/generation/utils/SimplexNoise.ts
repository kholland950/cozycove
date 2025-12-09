import { createNoise2D, type NoiseFunction2D } from 'simplex-noise'

export class SimplexNoise {
  private simplex: NoiseFunction2D
  private scale: number
  constructor(scale: number = 0.01) {
    this.simplex = createNoise2D()
    this.scale = scale
  }

  getNoise(x: number, y: number): number {
    return this.simplex(x * this.scale, y * this.scale)
  }
}
