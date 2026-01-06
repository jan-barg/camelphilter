/**
 * Camera Service
 * Handles getUserMedia requests and camera device management.
 * Provides clean interface for requesting camera access.
 */

import { cameraStore } from '$lib/stores/camera';

export interface CameraOptions {
	width?: number;
	height?: number;
	facingMode?: 'user' | 'environment';
	deviceId?: string;
}

const DEFAULT_OPTIONS: CameraOptions = {
	width: 1280,
	height: 720,
	facingMode: 'user'
};

/**
 * Request camera access and update the camera store.
 * Returns the MediaStream on success, null on failure.
 */
export async function requestCamera(
	options: CameraOptions = {}
): Promise<MediaStream | null> {
	const { width, height, facingMode, deviceId } = { ...DEFAULT_OPTIONS, ...options };

	cameraStore.setLoading();

	const constraints: MediaStreamConstraints = {
		video: {
			width: { ideal: width },
			height: { ideal: height },
			...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode })
		},
		audio: false
	};

	try {
		const stream = await navigator.mediaDevices.getUserMedia(constraints);
		cameraStore.setStream(stream);
		return stream;
	} catch (error) {
		const errorMessage = getErrorMessage(error);
		const status = getPermissionStatus(error);
		cameraStore.setError(errorMessage, status);
		return null;
	}
}

/**
 * Stop the camera stream and cleanup.
 */
export function stopCamera(): void {
	cameraStore.stopStream();
}

/**
 * Get list of available video input devices.
 * Note: Requires camera permission to get device labels.
 */
export async function getVideoDevices(): Promise<MediaDeviceInfo[]> {
	try {
		const devices = await navigator.mediaDevices.enumerateDevices();
		return devices.filter((device) => device.kind === 'videoinput');
	} catch {
		return [];
	}
}

/**
 * Check if camera API is available in the browser.
 */
export function isCameraSupported(): boolean {
	return !!(
		typeof navigator !== 'undefined' &&
		navigator.mediaDevices &&
		navigator.mediaDevices.getUserMedia
	);
}

/**
 * Extract user-friendly error message from getUserMedia errors.
 */
function getErrorMessage(error: unknown): string {
	if (error instanceof DOMException) {
		switch (error.name) {
			case 'NotAllowedError':
				return 'Camera access was denied. Please allow camera access in your browser settings.';
			case 'NotFoundError':
				return 'No camera found. Please connect a camera and try again.';
			case 'NotReadableError':
				return 'Camera is already in use by another application.';
			case 'OverconstrainedError':
				return 'Camera does not support the requested settings.';
			case 'SecurityError':
				return 'Camera access is not allowed in this context. Make sure you are using HTTPS.';
			default:
				return `Camera error: ${error.message}`;
		}
	}

	if (error instanceof Error) {
		return error.message;
	}

	return 'An unknown error occurred while accessing the camera.';
}

/**
 * Determine permission status from error type.
 */
function getPermissionStatus(error: unknown): 'denied' | 'error' {
	if (error instanceof DOMException && error.name === 'NotAllowedError') {
		return 'denied';
	}
	return 'error';
}
