<!--
  SANDBOX - Temporary full-screen test page
  For manually verifying frame rate and pixel quality.
  Run with: npm run dev:https
-->
<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { cameraStore, isCameraActive } from '$lib/stores/camera';
	import { requestCamera, stopCamera, isCameraSupported } from '$lib/services/camera';
	import { currentFilter, currentFilterFn } from '$lib/stores/filter';
	import { filters } from '$lib/engine/filters';
	import FilterCanvas from '$lib/components/FilterCanvas.svelte';

	// FPS counter
	let fps = 0;
	let frameCount = 0;
	let lastTime = performance.now();
	let fpsInterval: ReturnType<typeof setInterval> | null = null;

	function updateFps() {
		const now = performance.now();
		const delta = now - lastTime;
		if (delta >= 1000) {
			fps = Math.round((frameCount * 1000) / delta);
			frameCount = 0;
			lastTime = now;
		}
	}

	// Count frames via requestAnimationFrame
	function countFrame() {
		frameCount++;
		updateFps();
		if ($isCameraActive) {
			requestAnimationFrame(countFrame);
		}
	}

	async function handleStartCamera() {
		await requestCamera({ width: 1280, height: 720 });
		requestAnimationFrame(countFrame);
	}

	function handleStopCamera() {
		stopCamera();
		fps = 0;
		frameCount = 0;
	}

	function handleFilterChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		const selectedFilter = filters.find((f) => f.name === select.value);
		if (selectedFilter) {
			currentFilter.set(selectedFilter);
		}
	}

	onDestroy(() => {
		stopCamera();
		if (fpsInterval) clearInterval(fpsInterval);
	});
</script>

<svelte:head>
	<title>Camelphilter - Sandbox</title>
</svelte:head>

<div class="fixed inset-0 bg-black flex flex-col">
	{#if !isCameraSupported()}
		<div class="flex-1 flex items-center justify-center">
			<p class="text-red-400 text-xl">Camera is not supported in this browser.</p>
		</div>
	{:else if $cameraStore.isLoading}
		<div class="flex-1 flex items-center justify-center">
			<p class="text-white text-xl">Requesting camera access...</p>
		</div>
	{:else if $cameraStore.error}
		<div class="flex-1 flex items-center justify-center flex-col gap-4">
			<p class="text-red-400 text-xl">{$cameraStore.error}</p>
			<button
				class="px-6 py-3 bg-neutral-700 hover:bg-neutral-600 rounded text-white"
				onclick={handleStartCamera}
			>
				Try Again
			</button>
		</div>
	{:else if $isCameraActive && $cameraStore.stream}
		<!-- Full-screen canvas -->
		<div class="flex-1 flex items-center justify-center overflow-hidden">
			<FilterCanvas stream={$cameraStore.stream} filter={$currentFilterFn} />
		</div>

		<!-- Floating controls overlay -->
		<div class="absolute top-4 right-4 bg-black/70 p-4 rounded-lg space-y-4 text-white">
			<!-- FPS counter -->
			<div class="text-lg font-mono">
				FPS: <span class={fps >= 30 ? 'text-green-400' : 'text-red-400'}>{fps}</span>
			</div>

			<!-- Filter selector -->
			<div>
				<label for="filter-select" class="block text-sm mb-1">Filter:</label>
				<select
					id="filter-select"
					class="w-full bg-neutral-800 border border-neutral-600 rounded px-3 py-2"
					onchange={handleFilterChange}
					value={$currentFilter.name}
					data-testid="filter-select"
				>
					{#each filters as filter}
						<option value={filter.name}>{filter.name}</option>
					{/each}
				</select>
			</div>

			<!-- Current filter info -->
			<div class="text-sm text-neutral-400">
				Active: {$currentFilter.name}
			</div>

			<!-- Stop button -->
			<button
				class="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
				onclick={handleStopCamera}
				data-testid="stop-camera-btn"
			>
				Stop Camera
			</button>
		</div>
	{:else}
		<!-- Start screen -->
		<div class="flex-1 flex items-center justify-center flex-col gap-6">
			<h1 class="text-4xl font-bold text-white">Camelphilter Sandbox</h1>
			<p class="text-neutral-400">Test filters at full resolution (1280x720)</p>
			<button
				class="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-xl"
				onclick={handleStartCamera}
				data-testid="start-camera-btn"
			>
				Start Camera
			</button>
			<p class="text-neutral-500 text-sm">Run with HTTPS: npm run dev:https</p>
		</div>
	{/if}
</div>
