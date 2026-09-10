# AGENTS.md - Developer & AI Agent Guide

Welcome to the **Inq BillEditor** repository. This document provides critical architectural context, package relationships, component conventions, and automated generation workflows for AI agents and human contributors.

---

## 🏛️ Monorepo Architecture

Managed via **Turborepo** and standard **npm workspaces** under the custom `@inq` scope:

```
├── packages/
│   ├── tokens/          # Design token system (@inq/tokens) powered by Style Dictionary v4
│   ├── icons/           # SVG React icons (@inq/icons) in Google Material style
│   ├── ui/              # Standalone, tree-shakeable UI library (@inq/ui) with colocated tests & styles
│   ├── types/           # Shared TypeScript domain models (@inq/types)
│   ├── pdf-engine/      # Vector PDF modification pipeline (@inq/pdf-engine) via pdf-lib & fontkit
│   ├── eslint-config/   # Shared ESLint configuration (@inq/eslint-config)
│   └── vitest-config/   # Shared Vitest test configurations (@inq/vitest-config)
├── apps/
│   ├── web/             # React 18 + Vite visual in-place PDF editor
│   └── server/          # Node.js + Express API server with sample bill provider
├── generators/          # Plop.js code generation templates
└── knowledge-graph/     # Visual architecture diagrams and domain models
```

---

## 🧩 UI Component Generation (Plop.js)

Whenever you need to create a new UI component in `@inq/ui`, **always use the Plop generator**:

### Interactive Mode:
```bash
npm run gen:component
# or: npm run generate
```

### Non-Interactive / AI Agent Mode:
```bash
npx plop component -- --name <ComponentName>
# Example: npx plop component -- --name Dropdown
```

### What Plop Automatically Generates:
1. `packages/ui/src/components/<kebab-name>/<PascalName>.tsx` (React component with semantic HTML)
2. `packages/ui/src/components/<kebab-name>/<PascalName>.css` (Colocated styling using `@inq/tokens` CSS variables)
3. `packages/ui/src/components/<kebab-name>/<PascalName>.test.tsx` (Colocated unit & accessibility tests)
4. `packages/ui/src/components/<kebab-name>/index.ts` (Subpath export)
5. Automatically registers export in `packages/ui/src/index.ts`
6. Automatically registers `@import` in `packages/ui/src/styles.css`
7. Automatically updates `packages/ui/package.json` with standalone tree-shakeable subpath export (`@inq/ui/<kebab-name>`)

---

## 🎨 Design Token Conventions (`@inq/tokens`)

- **Design System**: Google Labs (Light Mode) & Gemini (Dark Mode) aesthetic.
- **Brand Palette**:
  - Primary: `--color-brand-primary` (`#4285f4`)
  - Coral: `--color-brand-coral` (`#ea4335`)
  - Amber: `--color-brand-amber` (`#fbbc05`)
  - Emerald: `--color-brand-emerald` (`#34a853`)
- **Semantic Roles**:
  - `--color-primary`, `--color-danger`, `--color-warning`, `--color-success`, `--color-info`
- **Surfaces**:
  - `--surface-canvas`, `--surface-card`, `--surface-elevated`, `--surface-hover`, `--surface-active`
- **Text & Borders**:
  - `--text-primary`, `--text-secondary`, `--text-muted`, `--border-subtle`, `--border-default`, `--border-focus`
- **Building Tokens**:
  ```bash
  npm run tokens:build
  ```

---

## 🧪 Testing & Accessibility (a11y) Standards

Every component in `@inq/ui` must satisfy accessibility criteria:
- **ARIA Semantics**: Use appropriate roles (`role="dialog"`, `role="slider"`, `role="button"`).
- **Keyboard Navigation**: Dialogs and popovers must listen for `Escape` to close; buttons must respond to `Enter` and `Space`.
- **Focus Indicators**: Always maintain `:focus-visible` styling (`--border-focus`).
- **Running Tests**:
  ```bash
  npm test
  # or in specific workspace:
  npm test --workspace=@inq/ui
  ```

---

## ⚡ Essential Commands

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts Turborepo dev environment for apps and packages |
| `npm run build` | Compiles all packages and applications |
| `npm test` | Executes all Vitest unit and accessibility tests across packages |
| `npm run typecheck` | Strict TypeScript typecheck across all workspaces |
| `npm run tokens:build` | Re-compiles Style Dictionary v4 design tokens |
| `npm run gen:component -- --name <Name>` | Scaffolds a new UI component with tests & styles |
