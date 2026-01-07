<!--
  FilterCanvas Component
  Renders video stream with applied filter using requestAnimationFrame.

  Props:
    - stream: MediaStream - The camera stream to render
    - filter: FilterFunction - The filter function to apply to each frame
    - canvasRef: HTMLCanvasElement | null - Bindable canvas reference for recording/snapshots

  Events: None

  Browser APIs: Canvas 2D, requestAnimationFrame

  Performance Notes:
    - Reuses single ImageData buffer to avoid GC spikes
    - Waits for video.readyState before starting loop
    - Cancels animation frame on destroy
-->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { FilterFunction } from '$lib/engine/filters';
	import { identity } from '$lib/engine/filters';

	// Props
	let {
		stream,
		filter = identity,
		canvasRef = $bindable(null)
	}: {
		stream: MediaStream;
		filter?: FilterFunction;
		canvasRef?: HTMLCanvasElement | null;
	} = $props();

	// Canvas and video references
	let canvasElement: HTMLCanvasElement | null = $state(null);
	let videoElement: HTMLVideoElement | null = null;

	// Sync internal canvas element to bindable prop
	$effect(() => {
		canvasRef = canvasElement;
	});

	// Offscreen canvas for processing (avoids flicker)
	let offscreenCanvas: HTMLCanvasElement | null = null;
	let offscreenCtx: CanvasRenderingContext2D | null = null;
	let visibleCtx: CanvasRenderingContext2D | null = null;

	// Animation frame handle for cleanup
	let animationFrameId: number | null = null;

	// Track if component is mounted
	let isMounted = false;

	// Canvas dimensions (will match video stream)
	let canvasWidth = 640;
	let canvasHeight = 480;

	/**
	 * Initialize canvas contexts and start rendering loop.
	 */
	function initializeCanvas(): void {
		if (!canvasElement || !videoElement) return;

		// Get video dimensions from the stream
		const videoTrack = stream.getVideoTracks()[0];
		if (videoTrack) {
			const settings = videoTrack.getSettings();
			canvasWidth = settings.width || 640;
			canvasHeight = settings.height || 480;
		}

		// Set canvas dimensions
		canvasElement.width = canvasWidth;
		canvasElement.height = canvasHeight;

		// Create offscreen canvas for processing
		offscreenCanvas = document.createElement('canvas');
		offscreenCanvas.width = canvasWidth;
		offscreenCanvas.height = canvasHeight;
		offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
		visibleCtx = canvasElement.getContext('2d');

		if (!offscreenCtx || !visibleCtx) {
			console.error('Failed to get canvas context');
			return;
		}

		// Attach stream to video element
		videoElement.srcObject = stream;
		videoElement.play().catch((err) => {
			console.error('Failed to play video:', err);
		});
	}

	/**
	 * Main rendering loop using requestAnimationFrame.
	 * Draws video frame, applies filter, renders to visible canvas.
	 */
	function renderLoop(): void {
		if (!isMounted || !videoElement || !offscreenCtx || !visibleCtx || !offscreenCanvas) {
			return;
		}

		// Only render if video has enough data (prevents black screen)
		if (videoElement.readyState >= videoElement.HAVE_CURRENT_DATA) {
			// Draw video frame to offscreen canvas
			offscreenCtx.drawImage(videoElement, 0, 0, canvasWidth, canvasHeight);

			// Get pixel data (reuses internal buffer when possible)
			const imageData = offscreenCtx.getImageData(0, 0, canvasWidth, canvasHeight);

			// Apply filter (modifies imageData in place)
			filter(imageData);

			// Put processed data back to offscreen canvas
			offscreenCtx.putImageData(imageData, 0, 0);

			// Copy to visible canvas
			visibleCtx.drawImage(offscreenCanvas, 0, 0);
		}

		// Schedule next frame
		animationFrameId = requestAnimationFrame(renderLoop);
	}

	/**
	 * Start the rendering loop once video is ready.
	 */
	function startRenderingWhenReady(): void {
		if (!videoElement) return;

		const checkReady = () => {
			if (!isMounted) return;

			if (videoElement && videoElement.readyState >= videoElement.HAVE_ENOUGH_DATA) {
				// Video is ready, start the loop
				renderLoop();
			} else {
				// Wait and check again
				requestAnimationFrame(checkReady);
			}
		};

		checkReady();
	}

	onMount(() => {
		isMounted = true;
		initializeCanvas();
		startRenderingWhenReady();
	});

	onDestroy(() => {
		isMounted = false;

		// Cancel animation frame
		if (animationFrameId !== null) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}

		// Clean up video element
		if (videoElement) {
			videoElement.srcObject = null;
		}

		// Clean up contexts
		offscreenCtx = null;
		visibleCtx = null;
		offscreenCanvas = null;
	});

	// Re-initialize if stream changes
	$effect(() => {
		if (stream && isMounted) {
			// Cancel existing loop
			if (animationFrameId !== null) {
				cancelAnimationFrame(animationFrameId);
				animationFrameId = null;
			}

			initializeCanvas();
			startRenderingWhenReady();
		}
	});
</script>

<!-- Hidden video element to receive the stream -->
<video
	bind:this={videoElement}
	autoplay
	playsinline
	muted
	class="hidden"
	aria-hidden="true"
></video>

<!-- Visible canvas for rendered output -->
<canvas
    bind:this={canvasElement}
    class="w-full h-full object-cover"
    data-testid="filter-canvas"
></canvas>

<style>
    /* object-cover ensures the video fills the 16:9 frame 
       completely, even if your webcam is a different aspect 
       ratio (like 4:3), by subtly cropping the edges.
    */
    canvas {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
</style>
