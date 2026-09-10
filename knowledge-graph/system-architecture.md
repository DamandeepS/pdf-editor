---
id: system-architecture
type: architecture
title: System Architecture & Monorepo Topology
description: Comprehensive workspace dependency graph, package boundaries, and dataflow across the Inq PDF Editor monorepo.
tags:
  - architecture
  - monorepo
  - turborepo
  - npm-workspaces
  - typescript
created: 2026-09-10T15:45:00Z
updated: 2026-09-10T15:45:00Z
status: active
related:
  - ./ui-component-graph.md
  - ./pdf-engine-graph.md
  - ./index.md
---

# System Architecture & Monorepo Topology

This document details the architectural layout, workspace boundaries, and dependency relationships for the `@inq` monorepo. For visual component relationships, see the [UI Component Graph](./ui-component-graph.md). For backend vector PDF generation details, see the [PDF Engine Graph](./pdf-engine-graph.md).

```mermaid
graph TD
    subgraph Configs ["Shared Configurations"]
        EC["@inq/eslint-config"]
        VC["@inq/vitest-config"]
    end

    subgraph Foundation ["Design & Type Foundation"]
        TOKENS["@inq/tokens<br/>Style Dictionary v4"]
        TYPES["@inq/types<br/>Shared Domain Interfaces"]
        ICONS["@inq/icons<br/>Google-style SVG Components"]
    end

    subgraph ComponentLayer ["Design System Library"]
        UI["@inq/ui<br/>Standalone Tree-Shakeable UI<br/>(Button, Modal, Pill, Slider, etc.)"]
        TOKENS -->|CSS Variables & Theme Tokens| UI
        ICONS -->|SVG Icons| UI
    end

    subgraph EngineLayer ["Core Processing"]
        PE["@inq/pdf-engine<br/>pdf-lib + fontkit vector pipeline"]
        TYPES -->|PdfTextSpan, Delta, BBox| PE
    end

    subgraph AppLayer ["Applications"]
        WEB["apps/web (React 18 + Vite)<br/>- PDF.js Canvas Viewport<br/>- Interactive Overlay<br/>- Floating Contextual Bar"]
        SERVER["apps/server (Node.js + Express)<br/>- Built-in Sample Bills<br/>- Vector Export API"]
    end

    UI --> WEB
    ICONS --> WEB
    TYPES --> WEB
    TYPES --> SERVER
    PE --> SERVER
    TOKENS --> WEB
```

---

## Workspace Relationships & Roles

| Package / App | Category | Purpose | Consumes | Consumed By |
| :--- | :--- | :--- | :--- | :--- |
| `@inq/tokens` | Package | Brand & semantic design tokens (CSS vars + TS objects) | None | [UI Component Library](./ui-component-graph.md), `apps/web` |
| `@inq/icons` | Package | Scalable SVG React icons | None | [UI Component Library](./ui-component-graph.md), `apps/web` |
| `@inq/ui` | Package | Standalone, accessible, tree-shakeable UI component library | `@inq/tokens`, `@inq/icons` | `apps/web`, 3rd party apps |
| `@inq/types` | Package | TypeScript domain models, bounding boxes, modification deltas | None | [PDF Processing Engine](./pdf-engine-graph.md), `apps/web`, `apps/server` |
| `@inq/pdf-engine`| Package | Native vector PDF modification engine (`pdf-lib` + `fontkit`) | `@inq/types` | `apps/server` |
| `apps/web` | Application | Interactive React in-place visual PDF editor | `@inq/ui`, `@inq/icons`, `@inq/types`, `@inq/tokens` | End User Browser |
| `apps/server` | Application | Express API backend serving samples and compiling PDFs | `@inq/pdf-engine`, `@inq/types` | `apps/web` (HTTP) |

Return to [Bundle Index](./index.md).
