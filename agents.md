Agents.md - Operational Playbook
#Dev environment tips
Use npm create svelte@latest . to initialize in the current folder. Choose "Skeleton project", "TypeScript syntax", and "Add Vitest/Playwright".

Run npm run dev -- --https for local development. HTTPS is mandatory for getUserMedia to work in the browser.

Use the $lib alias for all internal imports (e.g., import { engine } from '$lib/engine').

Check package.json scripts before running; use npm install -D lucide-svelte tailwindcss postcss autoprefixer for UI dependencies.

Use Uint8ClampedArray for all pixel manipulation logic to ensure compatibility with ImageData.

# Testing instructions
Run npm run test:unit to execute the Vitest suite for filter math logic.

Run npm run test:e2e for Playwright browser testing.

Mandatory: Every filter in src/lib/engine/ must have a corresponding .test.ts file.

Use Playwright's fake media flag to test camera functionality: npx playwright test --config=playwright.config.ts --project=chromium --browser-arg="--use-fake-device-for-media-stream".

Unit tests for filters should use mocked ImageData objects to avoid DOM dependencies:

TypeScript
// Example: grayscale logic must satisfy luminosity formula:
// $Y = 0.299R + 0.587G + 0.114B$
Fix all TypeScript errors (npm run check) and linting issues before declaring a module finished.

# Processing & Performance rules
No allocations in the loop: Never use new or create large arrays inside the requestAnimationFrame loop. Reuse existing buffers.

Pure Functions: Filter logic must be pure functions that take ImageData and return ImageData.

Cleanup: Always implement an onDestroy or equivalent cleanup to stop the MediaStream and cancel the animation frame.

# Rendering Loop (FilterCanvas Component)
The FilterCanvas component (`src/lib/components/FilterCanvas.svelte`) handles the video-to-canvas rendering pipeline:

1. **Video readyState check**: Always verify `video.readyState >= video.HAVE_CURRENT_DATA` before drawing. This prevents the "black screen" bug that occurs when the loop starts before video is playing.

2. **Resolution matching**: Canvas dimensions must match video stream resolution. Get dimensions from `stream.getVideoTracks()[0].getSettings()` to avoid out-of-bounds errors in filter math.

3. **Offscreen canvas pattern**: Use an offscreen canvas for processing to avoid flicker:
   - Draw video frame to offscreen canvas
   - Get ImageData and apply filter
   - Put modified ImageData back
   - Copy offscreen canvas to visible canvas

4. **isMounted guard**: Track component mount state and check before each frame to prevent rendering after component destruction.

5. **$effect for stream changes**: Use Svelte 5 `$effect` to reinitialize the rendering loop when the stream prop changes.

# PR & Commit instructions
Title format: [<module_name>] <Short Title> (Modules: engine, ui, camera, recorder).

Always run npm run check and npm run test:unit before committing.

Ensure MEMORY.md is updated with the latest progress and any new technical debt found.

If a browser API (like File System Access) is not supported, implement the fallback logic before merging.