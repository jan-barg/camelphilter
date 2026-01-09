<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { cameraStore, isCameraActive } from '$lib/stores/camera';
    import { requestCamera, stopCamera, isCameraSupported } from '$lib/services/camera';
    import { currentFilterFn } from '$lib/stores/filter';
    import { isRecording, savePath, canCapture, isFileSystemSupported, isMirrored } from '$lib/stores/appState';
    import { requestDirectory, saveSnapshot, checkFileSystemSupport } from '$lib/services/filesystem';
    import { initRecorder, startRecording, stopRecording, destroyRecorder } from '$lib/services/recorder';

    import FilterCanvas from '$lib/components/FilterCanvas.svelte';
    import Navbar from '$lib/components/Navbar.svelte';
    import FilterDropdown from '$lib/components/FilterDropdown.svelte';
    import ActionBar from '$lib/components/ActionBar.svelte';

    // Canvas reference for recording/snapshots
    let canvasRef: HTMLCanvasElement | null = $state(null);
    let recorderInitialized = $state(false);

    // Initialize recorder when canvas becomes available
    $effect(() => {
        if (canvasRef && !recorderInitialized) {
            recorderInitialized = initRecorder(canvasRef);
        }
    });

    // Check file system support on mount
    onMount(() => {
        checkFileSystemSupport();
    });

    async function handleStartCamera() {
        await requestCamera({ width: 1280, height: 720 });
    }

    function handleStopCamera() {
        // Stop recording if active
        if ($isRecording) {
            stopRecording();
        }
        stopCamera();
        recorderInitialized = false;
    }

    async function handleSnapshot() {
        if (!canvasRef) {
            console.error('Canvas not available');
            return;
        }
        await saveSnapshot(canvasRef);
    }

    function handleStartRecording() {
        if (!canvasRef) {
            console.error('Canvas not available');
            return;
        }

        // Re-init recorder if needed (e.g., after stopping camera)
        if (!recorderInitialized) {
            recorderInitialized = initRecorder(canvasRef);
        }

        startRecording();
    }

    function handleStopRecording() {
        stopRecording();
    }

    async function handleSelectDirectory() {
        await requestDirectory();
    }

    onDestroy(() => {
        destroyRecorder();
        stopCamera();
    });
</script>

<svelte:head>
    <title>CamelPhilter | Professional Vision</title>
</svelte:head>

<div class="min-h-screen flex flex-col bg-off-white">
    <Navbar />

    <main class="flex-1 flex flex-col items-center justify-center p-8">
        {#if !isCameraSupported()}
            <div class="text-center bg-white/50 backdrop-blur p-12 rounded-liquid border border-red-200">
                <p class="text-2xl font-bold text-dark-amethyst">Hardware Incompatibility</p>
                <p class="text-lavender-purple mt-2">Camera APIs are not supported in this browser environment.</p>
            </div>

        {:else if $cameraStore.isLoading}
            <div class="flex flex-col items-center gap-4">
                <div class="w-12 h-12 border-4 border-pumpkin-spice border-t-transparent rounded-full animate-spin"></div>
                <p class="text-xl font-medium text-indigo-ink animate-pulse">Initializing Optical Stream...</p>
            </div>

        {:else if $cameraStore.error}
            <div class="text-center space-y-6 liquid-glass p-10 rounded-liquid max-w-md">
                <p class="text-lg font-semibold text-dark-amethyst">{$cameraStore.error}</p>
                <button
                    onclick={handleStartCamera}
                    class="btn-liquid btn-purple-liquid px-8 py-3 rounded-liquid font-bold"
                >
                    Grant Access & Retry
                </button>
            </div>

        {:else if $isCameraActive && $cameraStore.stream}
            <div class="w-full max-w-[1500px] flex flex-col items-center gap-8">

                <div class="grid grid-cols-[1fr_auto_1fr] items-stretch w-full gap-12">
                    <div class="hidden xl:block"></div>

                    <div class="flex flex-col gap-6 items-center">
                        <div class="w-[1000px] aspect-video rounded-liquid overflow-hidden liquid-glass border-indigo-ink/10 shadow-[0_30px_80px_rgba(36,0,70,0.2)] bg-dark-amethyst relative group">
                            <FilterCanvas
                                stream={$cameraStore.stream}
                                filter={$currentFilterFn}
                                mirrored={$isMirrored}
                                bind:canvasRef
                            />
                        </div>

                        <div class="w-[1000px] liquid-glass rounded-liquid px-8 py-5 shadow-xl border-white/60">
                            <ActionBar
                                isRecording={$isRecording}
                                savePath={$savePath}
                                canCapture={$canCapture}
                                showDirectoryPicker={$isFileSystemSupported}
                                onSnapshot={handleSnapshot}
                                onStartRecording={handleStartRecording}
                                onStopRecording={handleStopRecording}
                                onSelectDirectory={handleSelectDirectory}
                            />
                        </div>
                    </div>

                    <div class="flex flex-col justify-between w-72 py-4">
                        <div class="flex flex-col gap-4">
                            <span class="text-[10px] uppercase tracking-[0.25em] font-black text-indigo-ink/40 px-5">Configuration</span>
                            <FilterDropdown />
                            <button
                                onclick={() => isMirrored.update(v => !v)}
                                class="liquid-glass p-4 rounded-liquid flex items-center justify-between hover:bg-dark-amethyst/5 transition-colors"
                            >
                                <span class="text-sm font-semibold text-dark-amethyst">Mirror View</span>
                                <span class="text-xs font-bold px-2 py-1 rounded {$isMirrored ? 'bg-pumpkin-spice/20 text-pumpkin-spice' : 'bg-indigo-ink/10 text-indigo-ink/50'}">
                                    {$isMirrored ? 'ON' : 'OFF'}
                                </span>
                            </button>
                        </div>

                        <button
                            onclick={handleStopCamera}
                            class="btn-liquid btn-purple-liquid px-6 py-5 rounded-liquid font-black text-xs uppercase tracking-[0.2em] shadow-lg"
                            data-testid="stop-camera-btn"
                        >
                            Terminate Stream
                        </button>
                    </div>
                </div>
            </div>

        {:else}
            <div class="flex flex-col items-center gap-10 text-center">
                <div class="space-y-2">
                    <h1 class="text-8xl font-black text-dark-amethyst tracking-tighter uppercase italic">
                        Camel<span class="text-pumpkin-spice">Philter</span>
                    </h1>
                    <p class="text-xl font-medium text-lavender-purple/80 tracking-wide">High-Fidelity Real-Time Visual Processing</p>
                </div>

                <button
                    onclick={handleStartCamera}
                    class="btn-liquid btn-orange-liquid px-16 py-8 rounded-liquid text-3xl font-black shadow-[0_20px_50px_rgba(255,109,0,0.3)] tracking-tight"
                    data-testid="start-camera-btn"
                >
                    Initialize Vision
                </button>
            </div>
        {/if}
    </main>
</div>

<style>
    /* Ensure the grid respects the fixed center width even on smaller screens */
    @media (max-width: 1400px) {
        main {
            transform: scale(0.9);
        }
    }
    @media (max-width: 1200px) {
        main {
            transform: scale(0.8);
        }
    }
</style>
