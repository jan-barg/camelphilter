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
  - 5 e2e tests passing (`src/tests/e2e/camera.test.ts`)

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
1. Build Core Module C: Rendering Loop (canvas processing with filters)
2. Build UI components (FilterDropdown, Controls overlay)
3. Implement Recorder service with File System Access API fallback
4. Create filter store for current filter selection

## Technical Debt
- None yet

## Notes
- HTTPS is mandatory for `getUserMedia` to work in browsers
- Use `$lib` alias for all internal imports
- All filters must be pure functions taking/returning ImageData
- Reuse buffers in requestAnimationFrame loop to avoid GC spikes
- Vitest excludes `src/tests/e2e/` (Playwright tests)
- Playwright uses `--use-fake-device-for-media-stream` flag
