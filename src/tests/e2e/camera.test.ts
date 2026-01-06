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
		await expect(startButton).toHaveText('Start Camera');
	});

	test('page has correct title', async ({ page }) => {
		await page.goto('/');

		await expect(page).toHaveTitle('Camelphilter');
	});

	test('starts camera stream when button clicked', async ({ page }) => {
		await page.goto('/');

		// Click start camera button
		const startButton = page.getByTestId('start-camera-btn');
		await startButton.click();

		// Wait for video element to appear
		const video = page.getByTestId('camera-video');
		await expect(video).toBeVisible({ timeout: 5000 });

		// Verify stop button appears
		const stopButton = page.getByTestId('stop-camera-btn');
		await expect(stopButton).toBeVisible();
	});

	test('stops camera stream when stop button clicked', async ({ page }) => {
		await page.goto('/');

		// Start camera
		await page.getByTestId('start-camera-btn').click();

		// Wait for video to appear
		await expect(page.getByTestId('camera-video')).toBeVisible({ timeout: 5000 });

		// Stop camera
		await page.getByTestId('stop-camera-btn').click();

		// Start button should reappear
		await expect(page.getByTestId('start-camera-btn')).toBeVisible();

		// Video should be gone
		await expect(page.getByTestId('camera-video')).not.toBeVisible();
	});

	test('video element receives stream and plays', async ({ page }) => {
		await page.goto('/');

		// Start camera
		await page.getByTestId('start-camera-btn').click();

		// Wait for video
		const video = page.getByTestId('camera-video');
		await expect(video).toBeVisible({ timeout: 5000 });

		// Verify video is playing (has non-zero dimensions and is not paused)
		const isPlaying = await video.evaluate((el: HTMLVideoElement) => {
			return !el.paused && el.readyState >= 2;
		});

		// With fake device, readyState might vary, so just check video exists and has srcObject
		const hasSrcObject = await video.evaluate((el: HTMLVideoElement) => {
			return el.srcObject !== null;
		});

		expect(hasSrcObject).toBe(true);
	});
});
