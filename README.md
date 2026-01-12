# CamelPhilter

A simple webcam filter application built with SvelteKit 5 and web APIs.

---

## Features

- **Real-Time** - Apply filters to your webcam feed with zero perceptible latency
- **Filters** - Including real-time ASCII encoding and color wiggling
- **Recording** - Capture filtered video directly to WebM
- **Snapshots** - Save any frame as a PNG image
- **Mirroring** - Selfie-style horizontal flip (enabled by default)
- **File Saving** - Choose your save directory via File System Access API (Chrome) or auto-download (Safari/Firefox)

---

## Filters

| Filter | Description |
|--------|-------------|
| **None** | Pass-through (original feed) |
| **Orange & Teal** |Luminance-based gradient map. With film grain and chromatic jitter  |
| **White Noise** | Distressed xerograph effect with gamma correction, horizontal ghosting, and four-tone ink rendering. |
| **8-Bit** | Pixel art quantization to a custom amethyst/orange palette with LCD grid simulation. |
| **ASCII** | Bitmap character rendering using 8x8 density masks.  |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A webcam
- HTTPS environment (required for camera access)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/camelphilter.git
cd camelphilter

# Install dependencies
npm install

# Start development server with HTTPS
npm run dev:https
```

Open `https://localhost:5173` and grant camera permissions when prompted.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (HTTP) |
| `npm run dev:https` | Development server with HTTPS (required for camera) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test:unit` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright e2e tests |
| `npm run check` | TypeScript type checking |
| `npm run lint` | Prettier + ESLint |
| `npm run format` | Auto-format code |

---

## UX Design

The UI features a **liquid glass morphism** aesthetic with:

- Frosted glass panels (`backdrop-filter: blur`)
- Animated "liquid fill" buttons on hover
- Custom color palette: deep amethyst, pumpkin spice orange, lavender purple
- Smooth transitions and micro-interactions

---

## Future Plans & Improvements in-progress:
- Port the filter engine to processing on the graphics card
- Add music upload and filter reactivity to track frequencies
- Add song stem drop + visualizer
- Make it a one-stop-shop for quick music promo TikTok recording

---
## License

MIT
