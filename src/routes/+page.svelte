<!--
  Main Page - Camelphilter
  Displays camera feed with filter controls.
  Props: None
  Events: None
  Browser APIs: getUserMedia (requires HTTPS)
-->
<script lang="ts">
	import { onDestroy } from 'svelte';
	import { cameraStore, isCameraActive } from '$lib/stores/camera';
	import { requestCamera, stopCamera, isCameraSupported } from '$lib/services/camera';

	let videoElement: HTMLVideoElement | null = null;

	async function handleStartCamera() {
		await requestCamera();
	}

	function handleStopCamera() {
		stopCamera();
	}

	// Attach stream to video element when it changes
	$: if (videoElement && $cameraStore.stream) {
		videoElement.srcObject = $cameraStore.stream;
	}

	onDestroy(() => {
		stopCamera();
	});
</script>

<svelte:head>
	<title>Camelphilter</title>
</svelte:head>

<main class="min-h-screen bg-neutral-900 text-neutral-100 p-4">
	<h1 class="text-2xl font-bold mb-4">Camelphilter</h1>

	{#if !isCameraSupported()}
		<p class="text-red-400" data-testid="camera-not-supported">
			Camera is not supported in this browser.
		</p>
	{:else if $cameraStore.isLoading}
		<p data-testid="camera-loading">Requesting camera access...</p>
	{:else if $cameraStore.error}
		<div class="text-red-400" data-testid="camera-error">
			<p>{$cameraStore.error}</p>
			<button
				class="mt-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded"
				onclick={handleStartCamera}
			>
				Try Again
			</button>
		</div>
	{:else if $isCameraActive}
		<div class="space-y-4">
			<video
				bind:this={videoElement}
				autoplay
				playsinline
				muted
				class="w-full max-w-2xl bg-black rounded"
				data-testid="camera-video"
			></video>
			<button
				class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
				onclick={handleStopCamera}
				data-testid="stop-camera-btn"
			>
				Stop Camera
			</button>
		</div>
	{:else}
		<button
			class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
			onclick={handleStartCamera}
			data-testid="start-camera-btn"
		>
			Start Camera
		</button>
	{/if}
</main>
