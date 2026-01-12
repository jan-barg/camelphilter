/**
 * Filter Engine - Pure TypeScript module for pixel manipulation.
 * All filters take ImageData and return modified ImageData.
 * Uses Uint8ClampedArray for pixel manipulation.
 */

export type FilterFunction = (imageData: ImageData) => ImageData;

export interface FilterDefinition {
	name: string;
	icon: string;
	apply: FilterFunction;
}

/** Helper for smooth color transitions */
function lerp(start: number, end: number, t: number): number {
	return start * (1 - t) + end * t;
}

/** Helper to clamp a value between min and max */
function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

/**
 * Identity filter - returns image unchanged.
 * Useful as a "None" option.
 */
export function identity(imageData: ImageData): ImageData {
	return imageData;
}

/**
 * Expressive Orange & Teal: Textured but Geometrically Sharp
 */
export function orangeTeal(imageData: ImageData): ImageData {
	const data = imageData.data;

	// Palette
	const deepTeal = [0, 32, 46];
	const electricTeal = [0, 245, 212];
	const burntOrange = [255, 84, 0];
	const neonOrange = [255, 189, 0];
	const solarWhite = [255, 255, 220];

	for (let i = 0; i < data.length; i += 4) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];

		// Calculate Base Luminance
		const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

		// Introduce Per-Channel "Grit"
		// Jitter the luminance value to create a "noisy smear" effect
		const grainIntensity = 0.08;
		const noise = (Math.random() - 0.5) * grainIntensity;

		// Push contrast aggressively
		let gritLum = Math.max(0, Math.min(1, lum + noise));
		gritLum = 1 / (1 + Math.exp(-14 * (gritLum - 0.5)));

		let finalR, finalG, finalB;

		// Color Mapping
		if (gritLum < 0.25) {
			const t = gritLum / 0.25;
			finalR = lerp(deepTeal[0], electricTeal[0], t);
			finalG = lerp(deepTeal[1], electricTeal[1], t);
			finalB = lerp(deepTeal[2], electricTeal[2], t);
		} else if (gritLum < 0.5) {
			const t = (gritLum - 0.25) / 0.25;
			finalR = lerp(electricTeal[0], burntOrange[0], t);
			finalG = lerp(electricTeal[1], burntOrange[1], t);
			finalB = lerp(electricTeal[2], burntOrange[2], t);
		} else if (gritLum < 0.75) {
			const t = (gritLum - 0.5) / 0.25;
			finalR = lerp(burntOrange[0], neonOrange[0], t);
			finalG = lerp(burntOrange[1], neonOrange[1], t);
			finalB = lerp(burntOrange[2], neonOrange[2], t);
		} else {
			const t = (gritLum - 0.75) / 0.25;
			finalR = lerp(neonOrange[0], solarWhite[0], t);
			finalG = lerp(neonOrange[1], solarWhite[1], t);
			finalB = lerp(neonOrange[2], solarWhite[2], t);
		}

		// Subtle Chromatic Jitter
		// Randomly spikes a channel to simulate "sensor noise"
		if (Math.random() > 0.95) {
			finalR *= 1.05;
			finalB *= 0.95;
		}

		data[i] = finalR;
		data[i + 1] = finalG;
		data[i + 2] = finalB;
	}

	return imageData;
}

/**
 * Artistic "Distressed Xerograph"
 * Fixed tonal range with highlight recovery and atmospheric ghosting.
 */
export function whiteNoise(imageData: ImageData): ImageData {
	const { data, width, height } = imageData;

	// The "Artistic" Tuning
	const gamma = 0.7; // Highlight recovery: Lower = more detail in whites
	const shadowLift = 15; // Keeps shadows from being pitch black
	const ghostIntensity = 0.2; // Horizontal smear strength

	for (let y = 0; y < height; y++) {
		let ghostTrail = 0;

		for (let x = 0; x < width; x++) {
			const i = (y * width + x) * 4;

			// Get Original Luminance
			const r = data[i],
				g = data[i + 1],
				b = data[i + 2];
			let lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

			// Tonal Compression (Gamma Correction)
			// Pulls detail out of "white" areas so face isn't a blob
			lum = Math.pow(lum, gamma);

			// Horizontal Ghosting (Smear)
			// Mix a bit of the "memory" back into the pixel
			const smearedLum = lum * (1 - ghostIntensity) + ghostTrail * ghostIntensity;
			ghostTrail = smearedLum; // Update trail for next pixel

			// Artistic Dither (Approximated Blue Noise)
			// Coordinate-based jitter for "woven" or "etched" grain feel
			const jitter = ((x ^ y) % 9) / 9.0;
			const grain = Math.random() * 0.4 + jitter * 0.2;

			// Four-Tone Ink System
			// Using 4 levels instead of 2 for expressive analog look
			let finalColor;
			const threshold = smearedLum + (grain - 0.3);

			if (threshold > 0.85) {
				finalColor = 248; // Cream White
			} else if (threshold > 0.5) {
				finalColor = 190; // Light Grey (Detail saver)
			} else if (threshold > 0.2) {
				finalColor = 70; // Charcoal
			} else {
				finalColor = 25 + shadowLift; // Deep Ink
			}

			data[i] = data[i + 1] = data[i + 2] = finalColor;
		}
	}
	return imageData;
}

// Modern "Solarized" Palette for quantization
const PALETTE = [
	[36, 0, 70], // Deep Amethyst
	[60, 9, 108], // Dark Purple
	[90, 24, 154], // Purple
	[123, 44, 191], // Lavender
	[255, 109, 0], // Neon Orange
	[255, 158, 0], // Bright Gold
	[240, 240, 240] // Off-White
];

/**
 * 8-bit pixelation filter with LCD grid effect.
 * Quantizes colors to a custom palette and adds pixel gaps.
 */
export function eightBit(imageData: ImageData): ImageData {
	const { data, width, height } = imageData;
	const blockSize = 10; // Slightly larger for a bolder look
	const gap = 1; // The "LCD" pixel gap

	for (let y = 0; y < height; y += blockSize) {
		for (let x = 0; x < width; x += blockSize) {
			// Sample the color at the center of the block (Sharper than averaging)
			const centerX = Math.min(x + blockSize / 2, width - 1);
			const centerY = Math.min(y + blockSize / 2, height - 1);
			const centerIdx = (Math.floor(centerY) * width + Math.floor(centerX)) * 4;

			const r = data[centerIdx];
			const g = data[centerIdx + 1];
			const b = data[centerIdx + 2];

			// Quantize to our custom Palette
			// Find the nearest color in our custom list
			let closestColor = PALETTE[0];
			let minDistance = Infinity;

			for (const color of PALETTE) {
				const distance = Math.sqrt(
					Math.pow(r - color[0], 2) + Math.pow(g - color[1], 2) + Math.pow(b - color[2], 2)
				);
				if (distance < minDistance) {
					minDistance = distance;
					closestColor = color;
				}
			}

			// Fill the block with the quantized color
			for (let blockY = 0; blockY < blockSize; blockY++) {
				for (let blockX = 0; blockX < blockSize; blockX++) {
					const py = y + blockY;
					const px = x + blockX;

					if (py < height && px < width) {
						const idx = (py * width + px) * 4;

						// Create the LCD Grid Effect
						// If we are at the edge of a block, we darken it
						if (blockX < gap || blockY < gap) {
							data[idx] = closestColor[0] * 0.15;
							data[idx + 1] = closestColor[1] * 0.15;
							data[idx + 2] = closestColor[2] * 0.15;
						} else {
							data[idx] = closestColor[0];
							data[idx + 1] = closestColor[1];
							data[idx + 2] = closestColor[2];
						}
					}
				}
			}
		}
	}

	return imageData;
}

// Character Atlas (8x8 Bitmasks)
// 1 = Ink (Amethyst), 0 = Paper (White)
const CHARS = [
	// Empty
	[
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
	],
	// Dot
	[
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0,
		0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
	],
	// Plus
	[
		0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1,
		1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0
	],
	// Box
	[
		1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1,
		1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1
	],
	// Dense
	[
		1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1,
		1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
	]
];

/**
 * ASCII filter using 8x8 bitmap characters.
 * Maps brightness to character density for a clean typographic look.
 */
export function ascii(imageData: ImageData): ImageData {
	const { data, width, height } = imageData;
	const blockSize = 8;

	// Brand Colors
	const ink = [36, 0, 70]; // Deep Amethyst
	const paper = [250, 250, 250]; // Clean White

	for (let y = 0; y < height; y += blockSize) {
		for (let x = 0; x < width; x += blockSize) {
			// Get average brightness for the block
			let totalLum = 0;
			let count = 0;
			for (let by = 0; by < blockSize && y + by < height; by++) {
				for (let bx = 0; bx < blockSize && x + bx < width; bx++) {
					const i = ((y + by) * width + (x + bx)) * 4;
					totalLum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
					count++;
				}
			}

			// Normalize and Boost Contrast
			let lum = totalLum / count / 255;
			lum = clamp((lum - 0.2) * 1.5, 0, 1); // Crushes shadows, brightens mids

			// Select Character Mask based on brightness
			// Inverted logic: Darker image areas get denser characters
			const charIndex = Math.floor((1 - lum) * (CHARS.length - 1));
			const mask = CHARS[charIndex];

			// "Draw" the character into the ImageData
			for (let by = 0; by < blockSize; by++) {
				for (let bx = 0; bx < blockSize; bx++) {
					const py = y + by;
					const px = x + bx;
					if (py < height && px < width) {
						const i = (py * width + px) * 4;
						const isInk = mask[by * blockSize + bx] === 1;

						const color = isInk ? ink : paper;
						data[i] = color[0];
						data[i + 1] = color[1];
						data[i + 2] = color[2];
					}
				}
			}
		}
	}
	return imageData;
}

/**
 * Available filters with metadata for UI.
 */
export const filters: FilterDefinition[] = [
	{ name: 'None', icon: 'circle-off', apply: identity },
	{ name: 'Orange & Teal', icon: 'sun', apply: orangeTeal },
	{ name: 'White Noise', icon: 'tv', apply: whiteNoise },
	{ name: '8-Bit', icon: 'grid-3x3', apply: eightBit },
	{ name: 'ASCII', icon: 'type', apply: ascii }
];
