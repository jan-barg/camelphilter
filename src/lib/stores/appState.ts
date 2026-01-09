import { writable, derived } from 'svelte/store';

/**
 * App State Store
 * Manages global UI state for recording and file system.
 */

// Recording state
export const isRecording = writable(false);

// Mirror/flip state for selfie mode (horizontal flip)
export const isMirrored = writable(true); // Default to mirrored (natural selfie view)

// File System Access API handle (null if not supported or not selected)
export const directoryHandle = writable<FileSystemDirectoryHandle | null>(null);

// Human-readable save path for display
export const savePath = writable<string | null>(null);

// Whether File System Access API is supported
// Default to true on client (will be checked on mount), false only during SSR
export const isFileSystemSupported = writable(typeof window !== 'undefined');

// Derived: whether a directory has been selected (or fallback mode)
export const directorySelected = derived(
	[directoryHandle, isFileSystemSupported],
	([$handle, $supported]) => {
		// In fallback mode (not supported), always "selected" (will use downloads)
		if (!$supported) return true;
		// Otherwise, need an actual handle
		return $handle !== null;
	}
);

// Derived: whether recording/snapshot actions are enabled
export const canCapture = derived(directorySelected, ($selected) => $selected);
