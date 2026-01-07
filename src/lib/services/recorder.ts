/**
 * Recorder Service
 * Handles video recording from a canvas element using MediaRecorder API.
 *
 * Browser APIs: MediaRecorder, Canvas.captureStream()
 *
 * Usage:
 *   1. Call initRecorder(canvas) to set up recording
 *   2. Call startRecording() to begin capture
 *   3. Call stopRecording() to end and save
 */

import { get } from 'svelte/store';
import { isRecording } from '$lib/stores/appState';
import { saveToDirectory, generateFilename } from '$lib/services/filesystem';

// Module state
let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let canvasStream: MediaStream | null = null;

/**
 * Get the best supported video MIME type.
 */
function getSupportedMimeType(): string {
	const types = [
		'video/webm;codecs=vp9',
		'video/webm;codecs=vp8',
		'video/webm',
		'video/mp4'
	];

	for (const type of types) {
		if (MediaRecorder.isTypeSupported(type)) {
			return type;
		}
	}

	// Fallback - let browser decide
	return '';
}

/**
 * Get file extension from MIME type.
 */
function getExtensionFromMime(mimeType: string): string {
	if (mimeType.includes('webm')) return 'webm';
	if (mimeType.includes('mp4')) return 'mp4';
	return 'webm';
}

/**
 * Initialize the recorder with a canvas element.
 *
 * @param canvas - The canvas element to record from
 * @param frameRate - Target frame rate (default 30)
 * @returns True if initialization succeeded
 */
export function initRecorder(canvas: HTMLCanvasElement, frameRate: number = 30): boolean {
	try {
		// Capture stream from canvas
		canvasStream = canvas.captureStream(frameRate);

		const mimeType = getSupportedMimeType();
		const options: MediaRecorderOptions = {
			videoBitsPerSecond: 5000000 // 5 Mbps
		};

		if (mimeType) {
			options.mimeType = mimeType;
		}

		mediaRecorder = new MediaRecorder(canvasStream, options);

		// Handle data available
		mediaRecorder.ondataavailable = (event: BlobEvent) => {
			if (event.data.size > 0) {
				recordedChunks.push(event.data);
			}
		};

		// Handle recording stop
		mediaRecorder.onstop = async () => {
			const mimeType = mediaRecorder?.mimeType || 'video/webm';
			const blob = new Blob(recordedChunks, { type: mimeType });
			recordedChunks = [];

			const extension = getExtensionFromMime(mimeType);
			const filename = generateFilename('recording', extension);

			await saveToDirectory(blob, filename);
			isRecording.set(false);
		};

		// Handle errors
		mediaRecorder.onerror = (event) => {
			console.error('MediaRecorder error:', event);
			isRecording.set(false);
		};

		return true;
	} catch (error) {
		console.error('Failed to initialize recorder:', error);
		return false;
	}
}

/**
 * Start recording.
 * Captures data in 1-second chunks for better error recovery.
 *
 * @returns True if recording started
 */
export function startRecording(): boolean {
	if (!mediaRecorder) {
		console.error('Recorder not initialized. Call initRecorder first.');
		return false;
	}

	if (mediaRecorder.state === 'recording') {
		console.warn('Already recording');
		return false;
	}

	try {
		recordedChunks = [];
		mediaRecorder.start(1000); // Capture in 1-second chunks
		isRecording.set(true);
		console.log('Recording started');
		return true;
	} catch (error) {
		console.error('Failed to start recording:', error);
		return false;
	}
}

/**
 * Stop recording and save the file.
 *
 * @returns True if stop was initiated (save happens async)
 */
export function stopRecording(): boolean {
	if (!mediaRecorder) {
		console.error('Recorder not initialized');
		return false;
	}

	if (mediaRecorder.state !== 'recording') {
		console.warn('Not currently recording');
		return false;
	}

	try {
		mediaRecorder.stop();
		console.log('Recording stopped');
		return true;
	} catch (error) {
		console.error('Failed to stop recording:', error);
		isRecording.set(false);
		return false;
	}
}

/**
 * Check if recorder is currently recording.
 */
export function isCurrentlyRecording(): boolean {
	return get(isRecording);
}

/**
 * Clean up recorder resources.
 * Call this when the component unmounts.
 */
export function destroyRecorder(): void {
	if (mediaRecorder && mediaRecorder.state === 'recording') {
		mediaRecorder.stop();
	}

	if (canvasStream) {
		canvasStream.getTracks().forEach((track) => track.stop());
		canvasStream = null;
	}

	mediaRecorder = null;
	recordedChunks = [];
	isRecording.set(false);
}

/**
 * Get recorder state for debugging.
 */
export function getRecorderState(): string {
	return mediaRecorder?.state ?? 'uninitialized';
}
