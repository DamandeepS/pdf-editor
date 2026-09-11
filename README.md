# Inq PDF Editor

High-performance, in-place visual vector PDF and document editor built with React 19, TypeScript 7, Vite 8, and Turborepo. Designed with Google Product aesthetics (Google Labs Light & Gemini Dark), strict accessibility standards, and a 100% client-side privacy-first architecture.

---

## Overview

Most online PDF editors flatten your documents into blurry bitmap images or upload confidential files, tax forms, and invoices to remote servers.

**Inq PDF Editor** solves this with an isomorphic, in-browser vector engine. All rendering, glyph coordinate extraction, inline editing, whiteout redactions, and document recompilation happen directly inside your web browser using WebAssembly. Your files never leave your device.

---

## Key Features

### 1. In-Place Visual Text Editing
- **Glyph Coordinate Detection**: Extracts exact PDF text glyph bounding boxes using PDF.js text layer mapping.
- **Inline Editing**: Click any invoice text block (company names, invoice numbers, line items, monetary amounts) to edit directly on the page.
- **Dynamic Width Auto-Fitting**: Input fields dynamically adjust character width so text is never clipped.
- **Docked Contextual Toolbar**: Floating format pill docked directly above the selected element offering:
  - Font Family selection (Helvetica, Times-Roman, Courier)
  - Stepper and direct input for Font Size
  - Bold and Italic toggles
  - Google curated color picker pill with hex input and contrast-safe presets
  - Text alignment controls: Left, Center, and Right alignment

### 2. Multi-Axis Positioning and Nudge Pad
- **Sub-Pixel Nudge Controls**: Directional buttons (Left, Right, Up, Down) for precision placement.
- **Visual Drag Handle**: Reposition modified text blocks across both X and Y axes.
- **Reset Position**: Instant reset button that appears dynamically when an element has been translated.
- **Keyboard Navigation**: Press Alt + Arrow Keys (or Shift + Arrow Keys) to nudge fields by 1pt or 5pt increments.

### 3. Vector Whiteout & Redaction
- **Drag-to-Draw**: Switch to the Whiteout tool and drag any rectangular area to place an instant vector whiteout block.
- **Adaptive Tone Matching**: Defaults to crisp white with instant color adjustments via the toolbar.
- **Lossless Redaction**: Masks unwanted sections during vector export without rasterizing or degrading underlying content.

### 4. Business Stamps & Signature Overlay
- **Pre-Configured Authentic Badges**:
  - PAID (with dynamic date timestamp)
  - APPROVED (Verified & Audited)
  - VOID (Cancelled)
  - CONFIDENTIAL (Internal Use Only)
- **Interactive Drag & Repositioning**: Click and drag any stamp around the canvas.
- **Opacity Control**: Adjust stamp opacity from 20% to 100% directly from the toolbar.
- **Custom Stamp Upload**: Upload any PNG, JPEG, or SVG signature, company logo, or seal.

### 5. Advanced Color Eyedropper
- **Dual-Mode Color Picking**:
  - Native EyeDropper API for sampling pixels anywhere on your screen.
  - Canvas context pixel sampling fallback for cross-browser reliability.

### 6. Dual-Mode Vector Export Pipeline
- **Lossless Vector Quality**: Manipulates native PDF vector streams using `pdf-lib` and `fontkit`, ensuring razor-sharp typography and selectable text.
- **Isomorphic Architecture**: Runs client-side in the browser or via the optional Node.js/tRPC backend server.

---

## Monorepo Architecture

The repository is organized as a Turborepo monorepo with standard npm workspaces under the `@inq` scope:

```
inq-pdf-editor/
├── apps/
│   ├── web/             # React 19 + Vite 8 in-place visual PDF editor (port 3000)
│   ├── stories/         # React 19 + Vite 8 Living Design System & Stories workbench (port 3001)
│   └── server/          # Node.js + Express + tRPC IPC bridge with sample providers (port 4000)
├── packages/
│   ├── tokens/          # Design tokens generated via Style Dictionary v4 (@inq/tokens)
│   ├── icons/           # SVG React 19 icons in Google Material style (@inq/icons)
│   ├── ui/              # Standalone, tree-shakeable UI component library (@inq/ui)
│   ├── pdf-engine/      # Isomorphic vector PDF pipeline via pdf-lib & fontkit (@inq/pdf-engine)
│   ├── types/           # Shared TypeScript domain models (@inq/types)
│   ├── eslint-config/   # Shared ESLint configuration (@inq/eslint-config)
│   └── vitest-config/   # Shared Vitest test configurations (@inq/vitest-config)
├── generators/          # Plop.js code generation templates
└── knowledge-graph/     # Visual architecture diagrams and Open Knowledge Format (OKF) models
```

---

## Technology Stack

| Technology | Target Version | Purpose |
| :--- | :--- | :--- |
| **React** | `^19.3.0` | Frontend UI component model |
| **TypeScript** | `^7.0.2` | Strict static typing across all workspaces |
| **Turborepo** | `^2.10.12` | Monorepo task orchestration and build caching |
| **Vite** | `^8.2.2` | Next-generation frontend build tool |
| **PDF.js** | `^6.3.289` | High-DPI canvas PDF rendering and text glyph extraction |
| **pdf-lib & fontkit**| `^1.17.1` | Native vector PDF byte manipulation and font embedding |
| **tRPC & Express** | `^10.45.2` | End-to-end type-safe client-server IPC bridge |
| **Style Dictionary** | `^4.3.3` | Cross-platform design token compilation |
| **Vitest** | `^3.0.5` | Unit and accessibility testing suite |

---

## Getting Started

### Prerequisites
- **Node.js**: `>= 20.0.0`
- **npm**: `>= 10.0.0`

### Installation

```bash
# Clone the repository
git clone git@github.com:DamandeepS/pdf-editor.git
cd pdf-editor

# Install dependencies across all workspaces
npm install
```

### Development

Start all applications and packages concurrently in development mode:

```bash
npm run dev
```

Once running:
- **PDF Editor Web App**: `http://localhost:3000`
- **Design System & Stories Workbench**: `http://localhost:3001`
- **tRPC API Server**: `http://localhost:4000`

---

## Essential Commands

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts Turborepo dev servers across all workspaces |
| `npm run build` | Compiles all packages and applications for production |
| `npm test` | Executes all Vitest unit and accessibility test suites |
| `npm run typecheck` | Strict TypeScript typecheck across all 10 workspaces |
| `npm run tokens:build` | Re-compiles Style Dictionary v4 design tokens |
| `npm run gen:component -- --name <Name>` | Scaffolds a new UI component with tests and stories |

---

## Privacy, Security & GDPR Compliance

- **Zero Server Uploads**: 100% of document rendering, text modification, and PDF generation occur in browser memory. Documents are never transmitted to or stored on any server.
- **Google Consent Mode v2**: Google Analytics 4 tracking defaults to `denied`. Users must explicitly opt in via the Cookie Consent Banner.
- **Revocable Consent (GDPR Art. 7(3))**: Users can view and toggle their telemetry status at any time via the in-app Privacy Policy dialog.
- For complete details, consult [PRIVACY.md](./PRIVACY.md).

---

## Production Deployment

The project is pre-configured for turnkey deployment on **Vercel** with zero backend infrastructure required:

1. Import `DamandeepS/pdf-editor` into [vercel.com/new](https://vercel.com/new).
2. The root `vercel.json` automatically builds both the PDF editor and the living design system:
   - **Root URL (`/`)**: Inq PDF Editor Web Application
   - **Subpath (`/design-system`)**: Inq Design System & Component Workbench (with `/stories` alias)
3. Optional: Add `VITE_GA_MEASUREMENT_ID` in Vercel Environment Variables.
4. Click **Deploy**.

For detailed instructions, standalone subdomain setups, and CLI workflows, consult [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## Design System Conventions (`@inq/tokens`)

The design system follows the Google Labs (Light Mode) and Gemini (Dark Mode) aesthetic:

- **Brand Palette**:
  - Primary: `--color-brand-primary` (`#4285f4`)
  - Coral: `--color-brand-coral` (`#ea4335`)
  - Amber: `--color-brand-amber` (`#fbbc05`)
  - Emerald: `--color-brand-emerald` (`#34a853`)
- **Semantic Tokens**: `--color-primary`, `--color-danger`, `--color-warning`, `--color-success`, `--color-info`
- **Surfaces**: `--surface-canvas`, `--surface-card`, `--surface-elevated`, `--surface-hover`, `--surface-active`
- **Typography**: Google Sans, Inter, and Roboto Mono via Google Fonts.

---

## Open Knowledge Format (OKF)

This repository includes a visual and structural knowledge graph under the [`knowledge-graph/`](./knowledge-graph/) directory adhering to the Open Knowledge Format:
- [System Architecture](./knowledge-graph/system-architecture.md)
- [UI Component Graph](./knowledge-graph/ui-component-graph.md)
- [PDF Engine Pipeline](./knowledge-graph/pdf-engine-graph.md)
- [IPC Architecture](./knowledge-graph/ipc-architecture.md)

---

## License

This project is open-source software licensed under the [MIT License](./LICENSE).
