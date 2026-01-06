# Camelphilter - Project Memory

## Current Progress

### ✅ Completed
- **Project Initialization** (2026-01-06)
  - SvelteKit project created with TypeScript (Svelte 5)
  - Tailwind CSS v4 configured with `@tailwindcss/vite` plugin
  - Vitest configured for unit testing
  - Playwright configured with fake media stream flags for camera testing
  - All dependencies installed (lucide-svelte, postcss, autoprefixer, etc.)

- **Directory Structure Created**
  - `src/lib/components/` - UI components (empty)
  - `src/lib/engine/` - Filter logic (empty)
  - `src/lib/services/` - Media/Recorder services (empty)
  - `src/lib/stores/` - Svelte stores (empty)
  - `tests/` - Playwright e2e tests (empty)

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
1. Implement Media Stream Controller (`src/lib/services/media.ts`)
2. Implement Filter Engine with first filters (`src/lib/engine/`)
3. Create Svelte stores for state management (`src/lib/stores/`)
4. Build UI components (Camera, FilterDropdown, Controls)
5. Implement Recorder service with File System Access API fallback

## Technical Debt
- None yet

## Notes
- HTTPS is mandatory for `getUserMedia` to work in browsers
- Use `$lib` alias for all internal imports
- All filters must be pure functions taking/returning ImageData
- Reuse buffers in requestAnimationFrame loop to avoid GC spikes
