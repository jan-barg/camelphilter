import { writable } from 'svelte/store';

// Tracks if the video is currently being encoded/saved
export const isRecording = writable(false);

// Tracks if the user has picked a folder for their captures
export const directorySelected = writable(false);

// Tracks the current human-readable save path
export const savePath = writable<string | null>(null);

// The active filter ID (e.g., 'none', '8bit', 'ascii')
export const activeFilter = writable('none');