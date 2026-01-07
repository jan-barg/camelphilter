# Camelphilter - Project Memory

## Current Progress

### ✅ Completed
- **Project Initialization** (2026-01-06)
  - SvelteKit project created with TypeScript (Svelte 5)
  - Tailwind CSS v4 configured with `@tailwindcss/vite` plugin
  - Vitest configured for unit testing
  - Playwright configured with fake media stream flags for camera testing
  - All dependencies installed (lucide-svelte, postcss, autoprefixer, etc.)

- **Core Module B: Filter Engine** (2026-01-06)
  - `src/lib/engine/filters.ts` - 5 pure filter functions
  - Filters: identity, orangeTeal, whiteNoise, eightBit, asciiGrayscale
  - Helper: `getAsciiChar()` for ASCII brightness mapping
  - 37 unit tests passing (`src/tests/unit/filters.test.ts`)

- **Core Module A: Media Stream Controller** (2026-01-06)
  - `src/lib/stores/camera.ts` - Svelte store for MediaStream state
  - `src/lib/services/camera.ts` - Camera service with getUserMedia
  - Permission status tracking (prompt, granted, denied, error)
  - User-friendly error messages for camera errors

- **Core Module C: Rendering Loop** (2026-01-06)
  - `src/lib/components/FilterCanvas.svelte` - Canvas rendering with filters
  - `src/lib/stores/filter.ts` - Filter selection store
  - requestAnimationFrame loop with offscreen canvas pattern
  - Video readyState check to prevent black screen bug
  - Resolution matching from stream settings
  - isMounted guard and proper cleanup on destroy
  - 6 e2e tests passing (`src/tests/e2e/camera.test.ts`)

- **Core Module D: UI Components** (2026-01-07)
  - `src/app.css` - Tailwind v4 theme with Solar Amethyst colors
    - Custom colors: off-white, oranges (pumpkin-spice to amber-glow), purples (dark-amethyst to lavender-purple)
    - Liquid glass button animations with hover scale and fill effects
    - Glass panel styling with backdrop blur (`.liquid-glass`, `.glass-panel`)
  - `src/lib/components/Navbar.svelte` - Brand header with dark-amethyst text
  - `src/lib/components/FilterDropdown.svelte` - Custom dropdown with Lucide icons
    - Svelte 5 snippets for dynamic icon rendering
    - Slide transition with droplet expand animation
  - `src/lib/components/ActionBar.svelte` - Bottom action bar
    - Snapshot button (orange with purple hover fill)
    - Record button (purple with orange hover fill, toggles to Stop)
    - Directory picker button with fallback display
    - Buttons disabled when no directory selected (in File System API mode)
  - `src/routes/+page.svelte` - Main layout (refined by Gemini)
    - 1000px fixed-width video stage with 16:9 aspect
    - Right sidebar with filter dropdown and stop button
    - Bottom action bar in glass panel
    - Responsive scaling for smaller screens

- **Core Module E: Recorder Service** (2026-01-07)
  - `src/lib/services/recorder.ts` - Video recording with MediaRecorder API
    - `initRecorder(canvas)` - Initialize with canvas.captureStream()
    - `startRecording()` / `stopRecording()` - Control recording
    - Auto-selects best codec (VP9 > VP8 > WebM > MP4)
    - 5 Mbps bitrate, 1-second chunks for error recovery
    - `destroyRecorder()` - Cleanup on unmount
  - `src/lib/services/filesystem.ts` - File system with fallback
    - `requestDirectory()` - Opens native directory picker
    - `saveToDirectory(blob, filename)` - Saves via File System Access API
    - `downloadBlob(blob, filename)` - Fallback browser download
    - `saveSnapshot(canvas)` - Captures canvas as PNG
    - `generateFilename(prefix, ext)` - Timestamped filenames
  - `src/lib/stores/appState.ts` - Updated with new stores
    - `directoryHandle` - FileSystemDirectoryHandle reference
    - `isFileSystemSupported` - API support detection
    - `canCapture` - Derived: whether recording/snapshot is enabled
  - `src/lib/types/filesystem.d.ts` - TypeScript declarations for File System Access API
  - `src/lib/components/FilterCanvas.svelte` - Added `canvasRef` bindable prop for recording

- **Scripts Available**
  - `npm run dev` - Development server
  - `npm run dev:https` - HTTPS dev server (required for getUserMedia)
  - `npm run build` - Production build
  - `npm run test:unit` - Vitest unit tests
  - `npm run test:e2e` - Playwright e2e tests
  - `npm run check` - TypeScript checking
  - `npm run lint` - Prettier + ESLint
  - `npm run format` - Auto-format code

## Next Steps
1. Add ability to select and modify save directory for snapshots and recordings
2. Make the recording save and download in MP4 or MOV instead of webm.
3. Add mirror/flip camera toggle (horizontal flip for selfie mode)
4. Improve filter aesthetics (deferred from previous session)
5. Polish UI (visual tweaks after user review)

## Notes
- HTTPS is mandatory for `getUserMedia` to work in browsers
- Use `$lib` alias for all internal imports
- All filters must be pure functions taking/returning ImageData
- Reuse buffers in requestAnimationFrame loop to avoid GC spikes
- Vitest excludes `src/tests/e2e/` (Playwright tests)
- Playwright uses `--use-fake-device-for-media-stream` flag
