import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	identity,
	orangeTeal,
	whiteNoise,
	eightBit,
	asciiGrayscale,
	getAsciiChar,
	ASCII_CHARS,
	filters
} from '$lib/engine/filters';

/**
 * Helper to create mock ImageData for testing.
 * Creates a proper ImageData-like object with Uint8ClampedArray.
 */
function createMockImageData(
	width: number,
	height: number,
	pixels: number[]
): ImageData {
	const data = new Uint8ClampedArray(pixels);
	return {
		data,
		width,
		height,
		colorSpace: 'srgb'
	} as ImageData;
}

/**
 * Create a 2x2 pixel test image (16 bytes: 4 pixels × 4 channels).
 */
function create2x2Image(
	p1: [number, number, number, number],
	p2: [number, number, number, number],
	p3: [number, number, number, number],
	p4: [number, number, number, number]
): ImageData {
	return createMockImageData(2, 2, [...p1, ...p2, ...p3, ...p4]);
}

describe('identity filter', () => {
	it('returns image data unchanged', () => {
		const input = create2x2Image(
			[255, 0, 0, 255],
			[0, 255, 0, 255],
			[0, 0, 255, 255],
			[128, 128, 128, 255]
		);

		const result = identity(input);

		expect(result).toBe(input);
		expect(result.data[0]).toBe(255);
		expect(result.data[4]).toBe(0);
		expect(result.data[8]).toBe(0);
		expect(result.data[12]).toBe(128);
	});

	it('preserves alpha channel', () => {
		const input = create2x2Image(
			[255, 0, 0, 128],
			[0, 255, 0, 64],
			[0, 0, 255, 200],
			[128, 128, 128, 0]
		);

		const result = identity(input);

		expect(result.data[3]).toBe(128);
		expect(result.data[7]).toBe(64);
		expect(result.data[11]).toBe(200);
		expect(result.data[15]).toBe(0);
	});
});

describe('orangeTeal filter', () => {
	it('processes pixels without errors', () => {
		const input = create2x2Image(
			[255, 255, 255, 255],
			[0, 0, 0, 255],
			[128, 128, 128, 255],
			[64, 64, 64, 255]
		);

		const result = orangeTeal(input);

		expect(result.data.length).toBe(16);
	});

	it('pushes dark pixels toward teal (more blue, less red)', () => {
		// Pure black pixel
		const input = createMockImageData(1, 1, [50, 50, 50, 255]);

		const result = orangeTeal(input);

		// Dark pixel: red should decrease, blue should increase
		expect(result.data[0]).toBeLessThan(50); // Red reduced
		expect(result.data[2]).toBeGreaterThan(50); // Blue increased
	});

	it('pushes bright pixels toward orange (more red, less blue)', () => {
		// Bright pixel
		const input = createMockImageData(1, 1, [200, 200, 200, 255]);

		const result = orangeTeal(input);

		// Bright pixel: red should increase, blue should decrease
		expect(result.data[0]).toBeGreaterThan(200); // Red increased
		expect(result.data[2]).toBeLessThan(200); // Blue reduced
	});

	it('preserves alpha channel', () => {
		const input = createMockImageData(1, 1, [100, 100, 100, 128]);

		const result = orangeTeal(input);

		expect(result.data[3]).toBe(128);
	});

	it('handles maximum brightness values', () => {
		const input = createMockImageData(1, 1, [255, 255, 255, 255]);

		const result = orangeTeal(input);

		// Should not exceed 255
		expect(result.data[0]).toBeLessThanOrEqual(255);
		expect(result.data[1]).toBeLessThanOrEqual(255);
		expect(result.data[2]).toBeLessThanOrEqual(255);
	});

	it('handles zero brightness values', () => {
		const input = createMockImageData(1, 1, [0, 0, 0, 255]);

		const result = orangeTeal(input);

		// Should not go below 0
		expect(result.data[0]).toBeGreaterThanOrEqual(0);
		expect(result.data[1]).toBeGreaterThanOrEqual(0);
		expect(result.data[2]).toBeGreaterThanOrEqual(0);
	});
});

describe('whiteNoise filter', () => {
	beforeEach(() => {
		vi.spyOn(Math, 'random').mockReturnValue(0.5);
	});

	it('creates grayscale output (R=G=B)', () => {
		const input = createMockImageData(1, 1, [255, 255, 255, 255]);

		const result = whiteNoise(input);

		expect(result.data[0]).toBe(result.data[1]);
		expect(result.data[1]).toBe(result.data[2]);
	});

	it('scales noise by luminance', () => {
		// Bright pixel should have higher noise potential
		const bright = createMockImageData(1, 1, [255, 255, 255, 255]);
		// Dark pixel should have lower noise potential
		const dark = createMockImageData(1, 1, [0, 0, 0, 255]);

		const brightResult = whiteNoise(bright);
		const darkResult = whiteNoise(dark);

		// With random = 0.5, bright should be ~128, dark should be 0
		expect(brightResult.data[0]).toBeGreaterThan(darkResult.data[0]);
	});

	it('preserves alpha channel', () => {
		const input = createMockImageData(1, 1, [128, 128, 128, 200]);

		const result = whiteNoise(input);

		expect(result.data[3]).toBe(200);
	});

	it('handles zero-alpha pixels', () => {
		const input = createMockImageData(1, 1, [128, 128, 128, 0]);

		const result = whiteNoise(input);

		expect(result.data[3]).toBe(0);
	});

	it('produces zero noise for black pixels', () => {
		const input = createMockImageData(1, 1, [0, 0, 0, 255]);

		const result = whiteNoise(input);

		expect(result.data[0]).toBe(0);
		expect(result.data[1]).toBe(0);
		expect(result.data[2]).toBe(0);
	});
});

describe('eightBit filter', () => {
	it('averages colors in blocks', () => {
		// 2x2 image - all pixels should become the average
		const input = create2x2Image(
			[100, 100, 100, 255],
			[200, 200, 200, 255],
			[100, 100, 100, 255],
			[200, 200, 200, 255]
		);

		const result = eightBit(input);

		// Average should be 150 for all channels
		const expectedAvg = 150;
		expect(result.data[0]).toBe(expectedAvg);
		expect(result.data[4]).toBe(expectedAvg);
		expect(result.data[8]).toBe(expectedAvg);
		expect(result.data[12]).toBe(expectedAvg);
	});

	it('handles different colors correctly', () => {
		const input = create2x2Image(
			[255, 0, 0, 255], // Red
			[0, 255, 0, 255], // Green
			[0, 0, 255, 255], // Blue
			[255, 255, 0, 255] // Yellow
		);

		const result = eightBit(input);

		// Average: R=(255+0+0+255)/4=127.5≈128, G=(0+255+0+255)/4=127.5≈128, B=(0+0+255+0)/4=63.75≈64
		expect(result.data[0]).toBe(128); // R
		expect(result.data[1]).toBe(128); // G
		expect(result.data[2]).toBe(64); // B
	});

	it('preserves alpha channel', () => {
		const input = create2x2Image(
			[100, 100, 100, 100],
			[100, 100, 100, 150],
			[100, 100, 100, 200],
			[100, 100, 100, 250]
		);

		const result = eightBit(input);

		// Alpha should be unchanged
		expect(result.data[3]).toBe(100);
		expect(result.data[7]).toBe(150);
		expect(result.data[11]).toBe(200);
		expect(result.data[15]).toBe(250);
	});

	it('handles single pixel image', () => {
		const input = createMockImageData(1, 1, [128, 64, 32, 255]);

		const result = eightBit(input);

		expect(result.data[0]).toBe(128);
		expect(result.data[1]).toBe(64);
		expect(result.data[2]).toBe(32);
	});

	it('handles 8x8 block correctly', () => {
		// Create 8x8 image with alternating values
		const pixels: number[] = [];
		for (let i = 0; i < 64; i++) {
			const val = i % 2 === 0 ? 0 : 200;
			pixels.push(val, val, val, 255);
		}
		const input = createMockImageData(8, 8, pixels);

		const result = eightBit(input);

		// All pixels should be averaged to 100
		expect(result.data[0]).toBe(100);
		expect(result.data[252]).toBe(100); // Last pixel R
	});
});

describe('asciiGrayscale filter', () => {
	it('converts to grayscale using luminosity formula', () => {
		// Pure red pixel: Y = 0.299 * 255 + 0.587 * 0 + 0.114 * 0 ≈ 76
		const input = createMockImageData(1, 1, [255, 0, 0, 255]);

		const result = asciiGrayscale(input);

		const expectedGray = Math.round(0.299 * 255);
		expect(result.data[0]).toBe(expectedGray);
		expect(result.data[1]).toBe(expectedGray);
		expect(result.data[2]).toBe(expectedGray);
	});

	it('handles pure green pixel', () => {
		// Pure green: Y = 0.299 * 0 + 0.587 * 255 + 0.114 * 0 ≈ 150
		const input = createMockImageData(1, 1, [0, 255, 0, 255]);

		const result = asciiGrayscale(input);

		const expectedGray = Math.round(0.587 * 255);
		expect(result.data[0]).toBe(expectedGray);
		expect(result.data[1]).toBe(expectedGray);
		expect(result.data[2]).toBe(expectedGray);
	});

	it('handles pure blue pixel', () => {
		// Pure blue: Y = 0.299 * 0 + 0.587 * 0 + 0.114 * 255 ≈ 29
		const input = createMockImageData(1, 1, [0, 0, 255, 255]);

		const result = asciiGrayscale(input);

		const expectedGray = Math.round(0.114 * 255);
		expect(result.data[0]).toBe(expectedGray);
		expect(result.data[1]).toBe(expectedGray);
		expect(result.data[2]).toBe(expectedGray);
	});

	it('handles white pixel (max brightness)', () => {
		const input = createMockImageData(1, 1, [255, 255, 255, 255]);

		const result = asciiGrayscale(input);

		expect(result.data[0]).toBe(255);
		expect(result.data[1]).toBe(255);
		expect(result.data[2]).toBe(255);
	});

	it('handles black pixel (zero brightness)', () => {
		const input = createMockImageData(1, 1, [0, 0, 0, 255]);

		const result = asciiGrayscale(input);

		expect(result.data[0]).toBe(0);
		expect(result.data[1]).toBe(0);
		expect(result.data[2]).toBe(0);
	});

	it('preserves alpha channel', () => {
		const input = createMockImageData(1, 1, [128, 128, 128, 100]);

		const result = asciiGrayscale(input);

		expect(result.data[3]).toBe(100);
	});

	it('handles zero-alpha pixels', () => {
		const input = createMockImageData(1, 1, [128, 64, 32, 0]);

		const result = asciiGrayscale(input);

		expect(result.data[3]).toBe(0);
	});
});

describe('getAsciiChar', () => {
	it('returns darkest char for brightness 0', () => {
		expect(getAsciiChar(0)).toBe('@');
	});

	it('returns lightest char for brightness 255', () => {
		expect(getAsciiChar(255)).toBe(' ');
	});

	it('returns middle char for medium brightness', () => {
		const midBrightness = 127;
		const result = getAsciiChar(midBrightness);
		const expectedIndex = Math.floor((127 / 255) * (ASCII_CHARS.length - 1));
		expect(result).toBe(ASCII_CHARS[expectedIndex]);
	});

	it('handles edge case brightness 1', () => {
		const result = getAsciiChar(1);
		expect(ASCII_CHARS).toContain(result);
	});

	it('handles edge case brightness 254', () => {
		const result = getAsciiChar(254);
		expect(ASCII_CHARS).toContain(result);
	});
});

describe('ASCII_CHARS constant', () => {
	it('has expected gradient from dark to light', () => {
		expect(ASCII_CHARS).toBe('@#S%?*+;:,. ');
	});

	it('starts with @ (darkest)', () => {
		expect(ASCII_CHARS[0]).toBe('@');
	});

	it('ends with space (lightest)', () => {
		expect(ASCII_CHARS[ASCII_CHARS.length - 1]).toBe(' ');
	});
});

describe('filters array', () => {
	it('contains all 5 filters', () => {
		expect(filters).toHaveLength(5);
	});

	it('has correct filter names', () => {
		const names = filters.map((f) => f.name);
		expect(names).toContain('None');
		expect(names).toContain('Orange & Teal');
		expect(names).toContain('White Noise');
		expect(names).toContain('8-Bit');
		expect(names).toContain('ASCII');
	});

	it('all filters have valid apply functions', () => {
		for (const filter of filters) {
			expect(typeof filter.apply).toBe('function');
		}
	});

	it('all filters have icon strings', () => {
		for (const filter of filters) {
			expect(typeof filter.icon).toBe('string');
			expect(filter.icon.length).toBeGreaterThan(0);
		}
	});
});
