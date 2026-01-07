/**
 * Type declarations for File System Access API
 * These APIs are not yet in the standard TypeScript lib.
 */

interface FileSystemHandlePermissionDescriptor {
	mode?: 'read' | 'readwrite';
}

interface FileSystemHandle {
	kind: 'file' | 'directory';
	name: string;
	isSameEntry(other: FileSystemHandle): Promise<boolean>;
	queryPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
	requestPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
}

interface FileSystemFileHandle extends FileSystemHandle {
	kind: 'file';
	getFile(): Promise<File>;
	createWritable(options?: FileSystemCreateWritableOptions): Promise<FileSystemWritableFileStream>;
}

interface FileSystemDirectoryHandle extends FileSystemHandle {
	kind: 'directory';
	getFileHandle(name: string, options?: FileSystemGetFileOptions): Promise<FileSystemFileHandle>;
	getDirectoryHandle(
		name: string,
		options?: FileSystemGetDirectoryOptions
	): Promise<FileSystemDirectoryHandle>;
	removeEntry(name: string, options?: FileSystemRemoveOptions): Promise<void>;
	resolve(possibleDescendant: FileSystemHandle): Promise<string[] | null>;
	keys(): AsyncIterableIterator<string>;
	values(): AsyncIterableIterator<FileSystemHandle>;
	entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
}

interface FileSystemGetFileOptions {
	create?: boolean;
}

interface FileSystemGetDirectoryOptions {
	create?: boolean;
}

interface FileSystemRemoveOptions {
	recursive?: boolean;
}

interface FileSystemCreateWritableOptions {
	keepExistingData?: boolean;
}

interface FileSystemWritableFileStream extends WritableStream {
	write(data: FileSystemWriteChunkType): Promise<void>;
	seek(position: number): Promise<void>;
	truncate(size: number): Promise<void>;
}

type FileSystemWriteChunkType =
	| BufferSource
	| Blob
	| string
	| { type: 'write'; position?: number; data: BufferSource | Blob | string }
	| { type: 'seek'; position: number }
	| { type: 'truncate'; size: number };

interface ShowDirectoryPickerOptions {
	id?: string;
	mode?: 'read' | 'readwrite';
	startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos' | FileSystemHandle;
}

interface Window {
	showDirectoryPicker(options?: ShowDirectoryPickerOptions): Promise<FileSystemDirectoryHandle>;
	showOpenFilePicker(options?: OpenFilePickerOptions): Promise<FileSystemFileHandle[]>;
	showSaveFilePicker(options?: SaveFilePickerOptions): Promise<FileSystemFileHandle>;
}

interface OpenFilePickerOptions {
	multiple?: boolean;
	excludeAcceptAllOption?: boolean;
	types?: FilePickerAcceptType[];
	startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos' | FileSystemHandle;
}

interface SaveFilePickerOptions {
	excludeAcceptAllOption?: boolean;
	suggestedName?: string;
	types?: FilePickerAcceptType[];
	startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos' | FileSystemHandle;
}

interface FilePickerAcceptType {
	description?: string;
	accept: Record<string, string[]>;
}
