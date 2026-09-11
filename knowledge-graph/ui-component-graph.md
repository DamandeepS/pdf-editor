---
id: ui-component-graph
type: component-library
title: UI Component Library Graph (@inq/ui)
description: Structural hierarchy, token consumption mappings, and four-file colocation contract for @inq/ui.
tags:
  - ui
  - design-system
  - react
  - accessibility
  - tree-shaking
created: 2026-09-10T15:45:00Z
updated: 2026-09-10T15:45:00Z
status: active
related:
  - ./system-architecture.md
  - ./index.md
---

# UI Component Graph (`@inq/ui`)

This document visualizes component structures, design token integration, and testing patterns for `@inq/ui`. For system-wide package relationships, see the [System Architecture](./system-architecture.md).

```mermaid
graph TD
    subgraph DesignTokens ["@inq/tokens Tokens"]
        T_COLOR["Brand & Semantic Colors<br/>(--color-primary, --color-danger, ...)"]
        T_SURFACE["Light & Dark Surfaces<br/>(--surface-card, --surface-elevated, ...)"]
        T_TYPO["Typography Scales<br/>(--font-sans, --font-size-md, ...)"]
        T_SPACING["Spacing & Radii<br/>(--spacing-4, --radius-full, --radius-card)"]
        T_ELEVATION["Elevation & Blur<br/>(--toolbar-shadow, --backdrop-blur-md)"]
    end

    subgraph Components ["@inq/ui Components"]
        BTN["Button<br/>(Variants: primary, secondary, outline, danger)"]
        IBTN["IconButton<br/>(Active state, tooltip, sizes)"]
        PILL["ToolPill<br/>(Tool selection, shortcut badge)"]
        CARD["FloatingCard<br/>(Frosted glass container, backdrop blur)"]
        SLIDER["Slider<br/>(Range track, fill, thumb)"]
        COLOR["ColorPickerPill<br/>(Swatch trigger, popover palette)"]
        MODAL["Modal<br/>(Dialog overlay, title, Esc handler)"]
        BADGE["BrandBadge<br/>(4-color playful dot cluster)"]
    end

    T_COLOR --> BTN
    T_SPACING --> BTN
    T_COLOR --> IBTN
    T_SPACING --> IBTN
    T_SURFACE --> PILL
    T_COLOR --> PILL
    T_ELEVATION --> CARD
    T_SURFACE --> CARD
    T_COLOR --> SLIDER
    T_COLOR --> COLOR
    T_ELEVATION --> COLOR
    T_SURFACE --> MODAL
    T_ELEVATION --> MODAL
    T_COLOR --> BADGE
```

---

## Component Colocation Contract

Each component adheres strictly to this 4-file contract:

```
packages/ui/src/components/<component-name>/
├── <ComponentName>.tsx        # React Component with semantic HTML and a11y roles
├── <ComponentName>.css        # Component styles consuming @inq/tokens CSS variables
├── <ComponentName>.test.tsx   # Vitest unit & accessibility tests (jsdom)
└── index.ts                   # Named subpath barrel export
```

## Scaffolding New Components

Components are generated via Plop.js:
```bash
npx plop component -- --name <ComponentName>
```
See [`AGENTS.md`](../AGENTS.md) for generation details.

Return to [Bundle Index](./index.md).
