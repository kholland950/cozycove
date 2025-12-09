import { createNoise2D, type NoiseFunction2D } from 'simplex-noise'

export class SimplexNoise {
	private simplex: NoiseFunction2D
	private scale: number
	constructor(scale: number = 0.01, seed?: string | number) {
		this.scale = scale
		// If seed provided, use a small seeded RNG; otherwise use Math.random
		const rng = seed != null ? SimplexNoise.createSeededRng(seed) : Math.random
		this.simplex = createNoise2D(rng)
	}
	// Small, deterministic seeding: hash the seed string into an initial state
	// and return a mulberry32-like generator function that produces [0,1).
	private static createSeededRng(seed: string | number): () => number {
		const s = String(seed)
		// simple string -> 32-bit hash (FNV-1a variant)
		let h = 2166136261 >>> 0
		for (let i = 0; i < s.length; i++) {
			h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0
		}
		// mulberry32 using hashed state
		let state = h
		return () => {
			state |= 0
			state = (state + 0x6d2b79f5) | 0
			let t = Math.imul(state ^ (state >>> 15), 1 | state)
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296
		}
	}
	getNoise(x: number, y: number): number {
		return this.simplex(x * this.scale, y * this.scale)
	}
}
