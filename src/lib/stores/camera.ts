/**
 * Camera Store
 * Manages MediaStream state and camera permission status.
 * Provides reactive state for camera access throughout the app.
 */

import { writable, derived, type Readable } from 'svelte/store';

export type CameraPermissionStatus = 'prompt' | 'granted' | 'denied' | 'error';

interface CameraState {
	stream: MediaStream | null;
	permissionStatus: CameraPermissionStatus;
	error: string | null;
	isLoading: boolean;
}

const initialState: CameraState = {
	stream: null,
	permissionStatus: 'prompt',
	error: null,
	isLoading: false
};

function createCameraStore() {
	const { subscribe, set, update } = writable<CameraState>(initialState);

	return {
		subscribe,

		/**
		 * Set loading state when requesting camera access.
		 */
		setLoading: () => {
			update((state) => ({
				...state,
				isLoading: true,
				error: null
			}));
		},

		/**
		 * Set stream after successful camera access.
		 */
		setStream: (stream: MediaStream) => {
			update((state) => ({
				...state,
				stream,
				permissionStatus: 'granted',
				isLoading: false,
				error: null
			}));
		},

		/**
		 * Set error state when camera access fails.
		 */
		setError: (error: string, status: CameraPermissionStatus = 'error') => {
			update((state) => ({
				...state,
				stream: null,
				permissionStatus: status,
				isLoading: false,
				error
			}));
		},

		/**
		 * Stop the current stream and reset to initial state.
		 */
		stopStream: () => {
			update((state) => {
				if (state.stream) {
					state.stream.getTracks().forEach((track) => track.stop());
				}
				return {
					...initialState,
					permissionStatus: state.permissionStatus === 'granted' ? 'granted' : 'prompt'
				};
			});
		},

		/**
		 * Reset store to initial state.
		 */
		reset: () => {
			update((state) => {
				if (state.stream) {
					state.stream.getTracks().forEach((track) => track.stop());
				}
				return initialState;
			});
		}
	};
}

export const cameraStore = createCameraStore();

/**
 * Derived store: whether camera is currently active.
 */
export const isCameraActive: Readable<boolean> = derived(
	cameraStore,
	($camera) => $camera.stream !== null && $camera.permissionStatus === 'granted'
);

/**
 * Derived store: whether camera access was denied.
 */
export const isCameraDenied: Readable<boolean> = derived(
	cameraStore,
	($camera) => $camera.permissionStatus === 'denied'
);
