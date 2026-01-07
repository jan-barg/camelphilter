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
    - Glass panel styling with backdrop blur
  - `src/lib/components/Navbar.svelte` - Brand header with dark-amethyst text
  - `src/lib/components/FilterDropdown.svelte` - Custom dropdown with Lucide icons
    - Svelte 5 snippets for dynamic icon rendering
    - Slide transition with droplet expand animation
  - `src/lib/components/ActionBar.svelte` - Bottom action bar
    - Snapshot button (orange with purple hover fill)
    - Record button (purple with orange hover fill, toggles to Stop)
    - Save path display placeholder
  - `src/routes/+page.svelte` - Main layout with style guide architecture
    - Center-weighted video feed (max-width 1200px, 16:9 aspect, rounded-liquid)
    - Right sidebar with filter dropdown and stop button
    - Bottom action bar in glass panel

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
1. Implement Core Module E: Recorder service with File System Access API fallback
2. Add snapshot functionality (hook up to ActionBar button)
3. Improve filter aesthetics (deferred from previous session)
4. Polish UI (visual tweaks after user review)

## Technical Debt
- None yet

## Notes
- HTTPS is mandatory for `getUserMedia` to work in browsers
- Use `$lib` alias for all internal imports
- All filters must be pure functions taking/returning ImageData
- Reuse buffers in requestAnimationFrame loop to avoid GC spikes
- Vitest excludes `src/tests/e2e/` (Playwright tests)
- Playwright uses `--use-fake-device-for-media-stream` flag
