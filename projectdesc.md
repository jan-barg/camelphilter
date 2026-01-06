### Camelphilter
A web-based app that allows you to take the live feed of the camera and apply creative filters to it.

# Project Vision and Context

Elevator pitch: A modern real-time video processing tool
Target environment: Modern desktop browsers
Primary User flow: Open app -> Grant camera permission -> See live feed -> Select filter from dropdown -> View transformed feed instantly.

# Tech stack

Framework: SvelteKit (for routing and UI).
Language: TypeScript (Strict mode).
Styling: Tailwind CSS.
Processing: HTML5 Canvas API (2D context for pixel manipulation).
Icons: Lucide-Svelte.

# Core Modules

A. Media Stream Controller

Handles getUserMedia requests.

Manages camera permissions and device selection.

Provides a clean stream to the processing engine.

B. The Filter Engine (Logic)

A standalone TypeScript class/module that takes an ImageData object and returns a modified ImageData object.

Requirement: Must be highly optimized (no heavy loops outside of the pixel manipulation).

First filters:
- Orange and teal gradient
- White noise over black background in the shape of the input feed
- 8bit
- ASCII image

Optimization Note: Use Uint8ClampedArray for pixel manipulation. Ensure filters are pure functions to make them easily testable in Vitest.

Filter Specifics:

8-bit: Downsample by grouping pixels into 8×8 blocks and averaging the color values within each block.

ASCII: Convert each pixel to grayscale using the luminosity formula (0.299R + 0.587G + 0.114B), then map brightness levels to ASCII characters. Use a gradient like "@#S%?*+;:,.  " (from dark to light) for a cleaner, more aesthetic look.

C. The Rendering Loop

Uses requestAnimationFrame to draw the video frame to a hidden canvas, apply the filter, and paint it to the visible UI canvas.

D. Filter dropdown
A dropdown menu that lists all available filters and their icons, allows for selection and immediately switches the video to the selected fitler

E. Recorder
A button and directory selector that asks for the directory in which to save a file, then upon pressing record, starts recording the filtered video, and upon clicking the button again, saves it to the specified directory. 
Also, a snapshot button to save the frame
Button must be greyed out and unclickable if no directory is selected. 

Implementation: Use the MediaRecorder API to capture the stream from the visible Canvas.

Storage: Use the File System Access API (window.showDirectoryPicker) for directory selection.

Constraint: If the browser doesn't support the File System Access API, fallback to a standard "Download" blob approach.

# UI & Component Architecture
Layout: High-z-index overlay for controls to the right of a centered video feed.

Controls:
A custom Select component for filter picking.

A "Snapshot" button to save a frame as a PNG.
A 'Record button' to start / stop recording.
A directory selector for file saving.

(Future) A file drop zone for video uploads.

# Definition of Done (Testing Strategy)

Unit Tests (Vitest): Every filter function must have a test case checking specific RGBA output values for a given input.

Integration Tests (Playwright): A test that mocks a media stream and checks if the <canvas> element is actually rendering frames.

1. Type Safety & Code Quality

Zero 'any' Types: No any types are permitted. All interfaces for ImageData, CanvasRenderingContext2D, and MediaStream must be explicitly handled.

Strict Null Checks: All DOM references (e.g., canvas, video) must be guarded by null-checks or explicit error boundaries before use.

Linting: Code must pass npm run lint without warnings.

2. Unit Testing (Vitest) - "The Logic Gate"

Pure Logic Isolation: All filter math in src/lib/engine/ must be decoupled from the DOM.

Pixel-Perfect Verification: Every filter must have a test case that passes a small Uint8ClampedArray (e.g., 2x2 pixels) through the function and asserts that the RGBA output matches the expected mathematical transformation.

Edge Case Handling: Tests must include empty streams, zero-alpha pixels, and maximum brightness values.

3. Integration Testing (Playwright) - "The Browser Gate"

Media Mocking: Use Playwright’s --use-fake-device-for-media-stream flag to simulate a camera feed during CI.

Visual Verification: The test suite must verify that the <canvas> element is not blank and that the MediaRecorder state changes from inactive to recording upon user interaction.

Persistence: Verify that the "Record" button remains disabled until a directory/save-path is initialized.

4. Performance Standards

Frame Budget: The rendering loop must consistently hit >30 FPS on a standard browser environment.

Memory Management: The agent must verify that requestAnimationFrame is properly cancelled when the Svelte component unmounts to prevent memory leaks.

No Garbage Collection Spikes: Avoid allocating new large arrays inside the requestAnimationFrame loop; reuse buffers where possible.

5. Documentation & "Memory" Sync

MEMORY.md Update: At the end of every feature implementation, the agent must update the "Current Progress" and "Next Steps" in the project memory file.

Component Documentation: Every Svelte component must have a brief comment block explaining its Props, Events, and any browser-specific API dependencies (like File System Access API).

6. Recorder & File System API

Graceful Fallback: If window.showDirectoryPicker is undefined, the UI must reactively switch to a standard "Download Blob" mode and update the button label/logic accordingly.

State Integrity: The recording state must be globally managed via a Svelte store to prevent multiple concurrent recording sessions.

# Suggested Directory structure
src/
├── lib/
│   ├── components/       # Svelte components (Dropdown, Camera, Overlay)
│   ├── engine/           # Filter logic and Canvas loop (Pure TS)
│   ├── services/         # MediaStream and Recorder logic
│   └── stores/           # Svelte stores for current filter/recording state
├── tests/                # Vitest and Playwright suites
├── routes/               # Main Page (Layout and Index)
└── static/               # Static assets (favicon, etc.)