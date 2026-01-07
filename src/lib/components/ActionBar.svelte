<script lang="ts">
    import { Camera, Video, Square, FolderOpen } from 'lucide-svelte';

    interface Props {
        onSnapshot?: () => void;
        onStartRecording?: () => void;
        onStopRecording?: () => void;
        isRecording?: boolean;
        savePath?: string | null;
        onSelectDirectory?: () => void;
    }

    let {
        onSnapshot,
        onStartRecording,
        onStopRecording,
        isRecording = false,
        savePath = null,
        onSelectDirectory
    }: Props = $props();
</script>

<div class="flex items-center justify-between gap-8">
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
                {savePath ?? 'Click to set directory'}
            </span>
        </div>
    </button>

    <div class="flex items-center gap-4">
        <button
            onclick={onSnapshot}
            class="btn-liquid btn-orange-liquid flex items-center gap-3 px-8 py-4 rounded-liquid font-bold shadow-lg"
        >
            <Camera size={20} />
            <span>Snapshot</span>
        </button>

        <button
            onclick={isRecording ? onStopRecording : onStartRecording}
            class="btn-liquid {isRecording ? 'btn-orange-liquid' : 'btn-purple-liquid'} 
                   flex items-center gap-3 px-8 py-4 rounded-liquid font-bold shadow-lg min-w-[160px] justify-center"
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