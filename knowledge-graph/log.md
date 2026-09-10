---
id: inq-billeditor-knowledge-log
type: changelog
title: Knowledge Graph Bundle Evolution Log
description: Chronological audit trail of knowledge bundle creation, updates, and node extensions.
created: 2026-09-10T15:45:00Z
updated: 2026-09-10T15:45:00Z
status: active
---

# Knowledge Graph Change Log

All structural modifications, new concepts, and architectural shifts in the Inq BillEditor knowledge bundle are recorded here.

## [2026-09-10] React 19, TypeScript 7, Turbo 2, Vite 8 Stack Upgrade & Web Editor Implementation
- Upgraded the entire monorepo to React 19.3.0 (`react@19.3.0`, `react-dom@19.3.0`, `@types/react@19.3.0`).
- Upgraded compiler infrastructure across all 9 workspaces to TypeScript 7.0.2 (`typescript@7.0.2`) and resolved TS5011 `rootDir` requirements.
- Upgraded monorepo orchestrator to Turborepo 2.10.12 (`turbo@2.10.12`) with sub-second cached builds.
- Upgraded web development server and production bundler to Vite 8.2.2 (`vite@8.2.2`).
- Implemented `apps/web` visual in-place PDF editor with:
  - PDF.js 6.x rendering with HiDPR scaling and concurrent render task cancellation for React 19 StrictMode.
  - Interactive canvas overlay with glyph coordinate extraction and in-place inline text editing.
  - Drag-and-draw vector whiteout redaction boxes.
  - Business stamp generation and placement ("PAID", "APPROVED", "VOID", "CONFIDENTIAL", and custom signature/image upload).
  - Floating contextual formatting toolbar docked to selections.
  - Google Labs Light Mode and Gemini Dark Mode theming with `@inq/tokens`.
  - Multi-sample bill loader (SaaS Invoice, Electric Utility Bill, Cafe Receipt).
  - End-to-end vector PDF export via tRPC IPC with isomorphic client-side `@inq/pdf-engine` fallback.
