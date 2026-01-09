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
 * Modern High-Fidelity Orange & Teal (Thermal/Gradient Map Style)
 */
export function orangeTeal(imageData: ImageData): ImageData {
	const data = imageData.data;
	const len = data.length;

	// Define our Palette (RGB)
	const deepTeal = [0, 32, 46]; // Darkest shadows
	const electricTeal = [0, 245, 212]; // Mid-tones (cool)
	const burntOrange = [255, 84, 0]; // Mid-tones (warm)
	const neonOrange = [255, 189, 0]; // Highlights
	const solarWhite = [255, 255, 220]; // Peak brightness

	for (let i = 0; i < len; i += 4) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];

		// Calculate Luminance
		let lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

		// Apply Contrast Curve (pushes values toward extremes for sharp look)
		lum = 1 / (1 + Math.exp(-12 * (lum - 0.5)));

		let finalR, finalG, finalB;

		// Map Luminance to the 4-stage Gradient Ramp
		if (lum < 0.25) {
			// Deep Teal to Electric Teal
			const t = lum / 0.25;
			finalR = lerp(deepTeal[0], electricTeal[0], t);
			finalG = lerp(deepTeal[1], electricTeal[1], t);
			finalB = lerp(deepTeal[2], electricTeal[2], t);
		} else if (lum < 0.5) {
			// Electric Teal to Burnt Orange (The "Clash" point)
			const t = (lum - 0.25) / 0.25;
			finalR = lerp(electricTeal[0], burntOrange[0], t);
			finalG = lerp(electricTeal[1], burntOrange[1], t);
			finalB = lerp(electricTeal[2], burntOrange[2], t);
		} else if (lum < 0.75) {
			// Burnt Orange to Neon Orange
			const t = (lum - 0.5) / 0.25;
			finalR = lerp(burntOrange[0], neonOrange[0], t);
			finalG = lerp(burntOrange[1], neonOrange[1], t);
			finalB = lerp(burntOrange[2], neonOrange[2], t);
		} else {
			// Neon Orange to Solar White
			const t = (lum - 0.75) / 0.25;
			finalR = lerp(neonOrange[0], solarWhite[0], t);
			finalG = lerp(neonOrange[1], solarWhite[1], t);
			finalB = lerp(neonOrange[2], solarWhite[2], t);
		}

		data[i] = finalR;
		data[i + 1] = finalG;
		data[i + 2] = finalB;
	}

	return imageData;
}

/**
 * Modern "Analog Pulse" / Photocopy Ripple
 * Uses stochastic dithering to create grainy, vibrating rings.
 */
export function whiteNoise(imageData: ImageData): ImageData {
	const data = imageData.data;
	const { width, height } = imageData;

	const centerX = width / 2;
	const centerY = height / 2;
	const maxDist = Math.sqrt(centerX ** 2 + centerY ** 2);

	// Tweak these to adjust the look
	const frequency = 0.25; // Lower = wider, less pronounced rings
	const grainSharpness = 1.8; // Lower = brighter overall
	const radialFade = 1.8; // Higher = rings fade faster toward edges

	for (let i = 0; i < data.length; i += 4) {
		const x = (i / 4) % width;
		const y = Math.floor(i / 4 / width);

		// Coordinates and Radial Falloff
		const dx = x - centerX;
		const dy = y - centerY;
		const dist = Math.sqrt(dx * dx + dy * dy);
		const normDist = dist / maxDist;

		// This creates the "more visible toward edges" effect (inverted)
		const ringIntensity = Math.pow(clamp(normDist, 0, 1), radialFade);

		// Get original luminance
		const r = data[i],
			g = data[i + 1],
			b = data[i + 2];
		const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

		// The "Probability Wave"
		// Instead of drawing a line, we create a value that swings
		// the chance of a pixel being white or black.
		const sineWave = Math.sin(dist * frequency);

		// Blend the sine wave with the image light.
		// Multiply by 'ringIntensity' so the wave disappears at the edges.
		const probability = lerp(lum, (sineWave * 0.5 + 0.5) * lum, ringIntensity);

		// Stochastic Dither (The "Grit" Secret)
		// Compare a random number against our probability.
		// Use Math.pow to "crunch" the contrast like a photocopy.
		const randomThreshold = Math.random();
		const isWhite = Math.pow(probability, grainSharpness) > randomThreshold;

		// Output: Deep Black and Off-White
		const finalColor = isWhite ? 240 : 10;

		data[i] = data[i + 1] = data[i + 2] = finalColor;
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

/**
 * ASCII character gradient for brightness mapping.
 * From dark to light: "@#S%?*+;:,.  "
 */
export const ASCII_CHARS = '@#S%?*+;:,. ';

/**
 * Get ASCII character for a given brightness level (0-255).
 */
export function getAsciiChar(brightness: number): string {
	const index = Math.floor((brightness / 255) * (ASCII_CHARS.length - 1));
	return ASCII_CHARS[index];
}

/**
 * ASCII grayscale filter.
 * Converts to grayscale using luminosity formula.
 * Note: Actual ASCII character rendering happens in the canvas component.
 * This filter prepares the image by converting to grayscale.
 */
export function asciiGrayscale(imageData: ImageData): ImageData {
	const data: Uint8ClampedArray = imageData.data;
	const len = data.length;

	for (let i = 0; i < len; i += 4) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];

		// Luminosity formula: Y = 0.299R + 0.587G + 0.114B
		const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

		data[i] = gray;
		data[i + 1] = gray;
		data[i + 2] = gray;
		// Alpha unchanged
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
	{ name: 'ASCII', icon: 'type', apply: asciiGrayscale }
];
