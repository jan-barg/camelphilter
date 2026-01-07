/**
 * File System Service
 * Handles directory selection and file saving using File System Access API.
 * Falls back to blob download when API is not supported.
 *
 * Browser APIs: File System Access API (showDirectoryPicker)
 */

import { get } from 'svelte/store';
import { directoryHandle, savePath, isFileSystemSupported } from '$lib/stores/appState';

/**
 * Check if File System Access API is supported.
 */
export function checkFileSystemSupport(): boolean {
	const supported = typeof window !== 'undefined' && 'showDirectoryPicker' in window;
	isFileSystemSupported.set(supported);
	return supported;
}

/**
 * Request directory access from the user.
 * Opens a native directory picker dialog.
 *
 * @returns The directory handle or null if cancelled/failed
 */
export async function requestDirectory(): Promise<FileSystemDirectoryHandle | null> {
	if (!checkFileSystemSupport()) {
		console.warn('File System Access API not supported, using fallback download mode');
		savePath.set('Downloads (fallback)');
		return null;
	}

	try {
		const handle = await window.showDirectoryPicker({
			mode: 'readwrite',
			startIn: 'videos'
		});

		directoryHandle.set(handle);
		savePath.set(handle.name);

		return handle;
	} catch (error) {
		if (error instanceof Error && error.name === 'AbortError') {
			// User cancelled the picker
			console.log('Directory picker cancelled');
			return null;
		}

		console.error('Failed to get directory access:', error);
		return null;
	}
}

/**
 * Generate a timestamped filename.
 *
 * @param prefix - File prefix (e.g., 'snapshot', 'recording')
 * @param extension - File extension (e.g., 'png', 'webm')
 * @returns Formatted filename
 */
export function generateFilename(prefix: string, extension: string): string {
	const now = new Date();
	const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
	return `${prefix}_${timestamp}.${extension}`;
}

/**
 * Save a blob to the selected directory using File System Access API.
 *
 * @param blob - The blob to save
 * @param filename - The filename to use
 * @returns True if saved successfully
 */
export async function saveToDirectory(blob: Blob, filename: string): Promise<boolean> {
	const handle = get(directoryHandle);

	if (!handle) {
		// Fallback: trigger browser download
		return downloadBlob(blob, filename);
	}

	try {
		const fileHandle = await handle.getFileHandle(filename, { create: true });
		const writable = await fileHandle.createWritable();
		await writable.write(blob);
		await writable.close();

		console.log(`Saved: ${filename}`);
		return true;
	} catch (error) {
		console.error('Failed to save file:', error);

		// Fallback to download on permission error
		if (error instanceof Error && error.name === 'NotAllowedError') {
			console.log('Permission lost, falling back to download');
			directoryHandle.set(null);
			savePath.set(null);
			return downloadBlob(blob, filename);
		}

		return false;
	}
}

/**
 * Fallback: Download blob via browser download.
 *
 * @param blob - The blob to download
 * @param filename - The filename to use
 * @returns True (always succeeds from our perspective)
 */
export function downloadBlob(blob: Blob, filename: string): boolean {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);

	console.log(`Downloaded: ${filename}`);
	return true;
}

/**
 * Save a canvas frame as PNG.
 *
 * @param canvas - The canvas element to capture
 * @returns True if saved successfully
 */
export async function saveSnapshot(canvas: HTMLCanvasElement): Promise<boolean> {
	return new Promise((resolve) => {
		canvas.toBlob(
			async (blob) => {
				if (!blob) {
					console.error('Failed to create snapshot blob');
					resolve(false);
					return;
				}

				const filename = generateFilename('snapshot', 'png');
				const success = await saveToDirectory(blob, filename);
				resolve(success);
			},
			'image/png',
			1.0
		);
	});
}
