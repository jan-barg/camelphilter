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

/**
 * Identity filter - returns image unchanged.
 * Useful as a "None" option.
 */
export function identity(imageData: ImageData): ImageData {
	return imageData;
}

/**
 * Orange and Teal color grading filter.
 * Pushes shadows toward teal and highlights toward orange.
 */
export function orangeTeal(imageData: ImageData): ImageData {
	const data: Uint8ClampedArray = imageData.data;
	const len = data.length;

	for (let i = 0; i < len; i += 4) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];

		// Calculate luminance using standard formula
		const lum = 0.299 * r + 0.587 * g + 0.114 * b;

		if (lum < 128) {
			// Shadows: push toward teal (reduce red, boost green/blue)
			const shadowStrength = (128 - lum) / 128;
			data[i] = Math.max(0, r - shadowStrength * 40);
			data[i + 1] = Math.min(255, g + shadowStrength * 15);
			data[i + 2] = Math.min(255, b + shadowStrength * 30);
		} else {
			// Highlights: push toward orange (boost red/yellow, reduce blue)
			const highlightStrength = (lum - 128) / 127;
			data[i] = Math.min(255, r + highlightStrength * 40);
			data[i + 1] = Math.min(255, g + highlightStrength * 20);
			data[i + 2] = Math.max(0, b - highlightStrength * 40);
		}
	}

	return imageData;
}

/**
 * White noise filter.
 * Shows white noise on black background in the shape of the input feed.
 * Brightness of original pixel determines noise intensity.
 */
export function whiteNoise(imageData: ImageData): ImageData {
	const data: Uint8ClampedArray = imageData.data;
	const len = data.length;

	for (let i = 0; i < len; i += 4) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];

		// Calculate luminance to determine shape intensity
		const lum = 0.299 * r + 0.587 * g + 0.114 * b;
		const normalizedLum = lum / 255;

		// Generate noise scaled by luminance
		const noise = Math.floor(Math.random() * 256 * normalizedLum);

		data[i] = noise;
		data[i + 1] = noise;
		data[i + 2] = noise;
		// Alpha unchanged
	}

	return imageData;
}

/**
 * 8-bit pixelation filter.
 * Groups pixels into 8x8 blocks and averages colors within each block.
 */
export function eightBit(imageData: ImageData): ImageData {
	const data: Uint8ClampedArray = imageData.data;
	const width = imageData.width;
	const height = imageData.height;
	const blockSize = 8;

	for (let blockY = 0; blockY < height; blockY += blockSize) {
		for (let blockX = 0; blockX < width; blockX += blockSize) {
			let totalR = 0;
			let totalG = 0;
			let totalB = 0;
			let count = 0;

			// Calculate average color for the block
			const maxY = Math.min(blockY + blockSize, height);
			const maxX = Math.min(blockX + blockSize, width);

			for (let y = blockY; y < maxY; y++) {
				for (let x = blockX; x < maxX; x++) {
					const idx = (y * width + x) * 4;
					totalR += data[idx];
					totalG += data[idx + 1];
					totalB += data[idx + 2];
					count++;
				}
			}

			const avgR = Math.round(totalR / count);
			const avgG = Math.round(totalG / count);
			const avgB = Math.round(totalB / count);

			// Apply average color to all pixels in block
			for (let y = blockY; y < maxY; y++) {
				for (let x = blockX; x < maxX; x++) {
					const idx = (y * width + x) * 4;
					data[idx] = avgR;
					data[idx + 1] = avgG;
					data[idx + 2] = avgB;
					// Alpha unchanged
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
