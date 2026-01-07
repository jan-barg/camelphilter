import { test, expect } from '@playwright/test';

test.describe('Camera Module', () => {
	test.beforeEach(async ({ page }) => {
		// Grant camera permissions automatically
		await page.context().grantPermissions(['camera']);
	});

	test('shows start camera button on load', async ({ page }) => {
		await page.goto('/');

		const startButton = page.getByTestId('start-camera-btn');
		await expect(startButton).toBeVisible();
		await expect(startButton).toHaveText('Initialize Vision');
	});

	test('page has correct title', async ({ page }) => {
		await page.goto('/');

		await expect(page).toHaveTitle('CamelPhilter | Professional Vision');
	});

	test('starts camera stream when button clicked', async ({ page }) => {
		await page.goto('/');

		// Click start camera button
		const startButton = page.getByTestId('start-camera-btn');
		await startButton.click();

		// Wait for filter canvas to appear (replaced video element)
		const canvas = page.getByTestId('filter-canvas');
		await expect(canvas).toBeVisible({ timeout: 5000 });

		// Verify stop button appears
		const stopButton = page.getByTestId('stop-camera-btn');
		await expect(stopButton).toBeVisible();
	});

	test('stops camera stream when stop button clicked', async ({ page }) => {
		await page.goto('/');

		// Start camera
		await page.getByTestId('start-camera-btn').click();

		// Wait for canvas to appear
		await expect(page.getByTestId('filter-canvas')).toBeVisible({ timeout: 5000 });

		// Stop camera
		await page.getByTestId('stop-camera-btn').click();

		// Start button should reappear
		await expect(page.getByTestId('start-camera-btn')).toBeVisible();

		// Canvas should be gone
		await expect(page.getByTestId('filter-canvas')).not.toBeVisible();
	});

	test('canvas renders filtered output', async ({ page }) => {
		await page.goto('/');

		// Start camera
		await page.getByTestId('start-camera-btn').click();

		// Wait for canvas
		const canvas = page.getByTestId('filter-canvas');
		await expect(canvas).toBeVisible({ timeout: 5000 });

		// Give the rendering loop time to draw
		await page.waitForTimeout(500);

		// Verify canvas has non-zero dimensions
		const dimensions = await canvas.evaluate((el: HTMLCanvasElement) => {
			return { width: el.width, height: el.height };
		});

		expect(dimensions.width).toBeGreaterThan(0);
		expect(dimensions.height).toBeGreaterThan(0);
	});

	test('filter dropdown changes filter', async ({ page }) => {
		await page.goto('/');

		// Start camera
		await page.getByTestId('start-camera-btn').click();

		// Wait for canvas
		await expect(page.getByTestId('filter-canvas')).toBeVisible({ timeout: 5000 });

		// Verify filter dropdown is visible
		const filterDropdown = page.getByTestId('filter-dropdown');
		await expect(filterDropdown).toBeVisible();

		// Click to open dropdown
		await filterDropdown.getByRole('button').first().click();

		// Select '8-Bit' option
		await page.getByRole('option', { name: '8-Bit' }).click();

		// Verify the dropdown trigger now shows '8-Bit'
		await expect(filterDropdown).toContainText('8-Bit');
	});
});
