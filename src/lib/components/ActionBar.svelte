<!--
  ActionBar Component
  Bottom action bar with Snapshot, Record, and Directory picker buttons.

  Props:
    - onSnapshot: Callback when snapshot button clicked
    - onStartRecording: Callback when record button clicked (not recording)
    - onStopRecording: Callback when stop button clicked (recording)
    - isRecording: Whether currently recording
    - savePath: Display path for save location
    - canCapture: Whether snapshot/record buttons are enabled
    - showDirectoryPicker: Whether to show directory picker (File System API supported)
    - onSelectDirectory: Callback when directory picker clicked

  Browser APIs: None (handled by parent)
-->
<script lang="ts">
    import { Camera, Video, Square, FolderOpen, Download } from 'lucide-svelte';

    interface Props {
        onSnapshot?: () => void;
        onStartRecording?: () => void;
        onStopRecording?: () => void;
        isRecording?: boolean;
        savePath?: string | null;
        canCapture?: boolean;
        showDirectoryPicker?: boolean;
        onSelectDirectory?: () => void;
    }

    let {
        onSnapshot,
        onStartRecording,
        onStopRecording,
        isRecording = false,
        savePath = null,
        canCapture = true,
        showDirectoryPicker = true,
        onSelectDirectory
    }: Props = $props();

    // Determine display text for save location
    let saveLocationText = $derived(
        savePath ?? (showDirectoryPicker ? 'Click to set directory' : 'Downloads folder')
    );

    // Buttons are disabled if we can't capture (no directory selected in File System API mode)
    let buttonsDisabled = $derived(!canCapture && !isRecording);
</script>

<div class="flex items-center justify-between gap-8">
    <!-- Left: Save path status / Directory picker -->
    {#if showDirectoryPicker}
        <button
            onclick={onSelectDirectory}
            class="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-dark-amethyst/5 transition-colors group"
        >
            <div class="p-2 bg-indigo-ink/5 rounded-lg group-hover:bg-indigo-ink/10 transition-colors">
                <FolderOpen size={18} class="text-indigo-ink" />
            </div>
            <div class="flex flex-col items-start">
                <span class="text-[10px] uppercase tracking-widest font-bold text-lavender-purple/60">Save Location</span>
                <span class="text-sm font-semibold text-dark-amethyst">
                    {saveLocationText}
                </span>
            </div>
        </button>
    {:else}
        <!-- Fallback mode: just show download indicator -->
        <div class="flex items-center gap-3 px-4 py-2">
            <div class="p-2 bg-indigo-ink/5 rounded-lg">
                <Download size={18} class="text-indigo-ink" />
            </div>
            <div class="flex flex-col items-start">
                <span class="text-[10px] uppercase tracking-widest font-bold text-lavender-purple/60">Save Location</span>
                <span class="text-sm font-semibold text-dark-amethyst">
                    {saveLocationText}
                </span>
            </div>
        </div>
    {/if}

    <!-- Right: Action buttons -->
    <div class="flex items-center gap-4">
        <!-- Snapshot Button -->
        <button
            onclick={onSnapshot}
            disabled={buttonsDisabled}
            class="btn-liquid btn-orange-liquid flex items-center gap-3 px-8 py-4 rounded-liquid font-bold shadow-lg
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            data-testid="snapshot-btn"
        >
            <Camera size={20} />
            <span>Snapshot</span>
        </button>

        <!-- Record/Stop Button -->
        <button
            onclick={isRecording ? onStopRecording : onStartRecording}
            disabled={buttonsDisabled}
            class="btn-liquid {isRecording ? 'btn-orange-liquid' : 'btn-purple-liquid'}
                   flex items-center gap-3 px-8 py-4 rounded-liquid font-bold shadow-lg min-w-[160px] justify-center
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            data-testid="record-btn"
        >
            {#if isRecording}
                <Square size={20} class="animate-pulse" />
                <span>Stop</span>
            {:else}
                <Video size={20} />
                <span>Record</span>
            {/if}
        </button>
    </div>
</div>
