# Vercel Deployment Guide - Inq PDF Editor & Design Library

This guide outlines the production deployment workflow for **Inq PDF Editor** and the **Inq Stories Design System Workbench** on **Vercel**.

---

## Architectural Context

Inq PDF Editor is architected as an isomorphic monorepo powered by Turborepo. When deployed to static edge hosting like Vercel:
- **PDF Editor Web App (`@inq/web`)**: Runs at the root path (`/`). Document rendering, text glyph extraction, editing, redactions, and vector compilation execute client-side via WebAssembly and `pdf-lib`.
- **Design System Workbench (`@inq/stories`)**: Runs at the `/stories` subpath on the same deployment. It showcases all 9 UI components, interactive props controls, accessibility audit panels, Google Material icons gallery, and Style Dictionary design tokens.
- **Built-in Sample Documents**: Load via client-side fallbacks with zero requirement for an active Node.js server.
- **Cost**: Completely self-contained and free to host indefinitely on Vercel's Hobby Tier.

---

## Pre-Flight Verification

The monorepo configuration has been verified locally:
```bash
# Verify typechecking across all workspaces
npm run typecheck

# Verify all unit and accessibility test suites
npm test

# Test the unified Vercel production build command
npx turbo run build --filter=@inq/web --filter=@inq/stories && node -e "const fs = require('node:fs'); fs.cpSync('apps/stories/dist', 'apps/web/dist/stories', { recursive: true });"
```

The output artifacts are assembled into `apps/web/dist` (main editor) and `apps/web/dist/stories` (design library) in under 1 second.

---

## Deployment: Continuous Deployment via Vercel Dashboard

Because the project is tracked under GitHub (`git@github.com:DamandeepS/pdf-editor.git`), Vercel automatically builds and deploys every commit pushed to `main`.

### Step 1: Import the Repository
1. Navigate to [vercel.com/new](https://vercel.com/new).
2. Select your Git provider (GitHub) and import `DamandeepS/pdf-editor`.

### Step 2: Configure Project Settings
Vercel reads the root `vercel.json` automatically:
- **Framework Preset**: Vite
- **Root Directory**: `./` (leave default)
- **Build Command**: `npx turbo run build --filter=@inq/web --filter=@inq/stories && node -e "const fs = require('node:fs'); fs.cpSync('apps/stories/dist', 'apps/web/dist/stories', { recursive: true });"` (pre-configured)
- **Output Directory**: `apps/web/dist` (pre-configured)
- **Install Command**: `npm install` (default)

### Step 3: Configure Environment Variables (Optional)
If you want to enable Google Analytics 4 tracking:
- Name: `VITE_GA_MEASUREMENT_ID`
- Value: `G-XXXXXXXXXX`

### Step 4: Deploy
Click **Deploy**. In under 60 seconds, Vercel will compile the workspace packages and assign your live production URL:
- **Live PDF Editor**: `https://<your-project>.vercel.app/`
- **Live Design System Workbench**: `https://<your-project>.vercel.app/stories`

---

## Optional: Deploying the Design System as a Standalone Subdomain

If you prefer hosting the design library on its own dedicated project (e.g., `https://inq-design-system.vercel.app`):

1. Go to [vercel.com/new](https://vercel.com/new) and import `DamandeepS/pdf-editor` again as a second project.
2. Configure project settings:
   - **Project Name**: `inq-design-system`
   - **Root Directory**: `./`
   - **Build Command**: `npx turbo run build --filter=@inq/stories`
   - **Output Directory**: `apps/stories/dist`
3. Click **Deploy**.

---

## Configuration Reference (`vercel.json`)

The repository includes a root `vercel.json` file:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npx turbo run build --filter=@inq/web --filter=@inq/stories && node -e \"const fs = require('node:fs'); fs.cpSync('apps/stories/dist', 'apps/web/dist/stories', { recursive: true });\"",
  "outputDirectory": "apps/web/dist",
  "framework": "vite",
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/stories",
      "destination": "/stories/index.html"
    },
    {
      "source": "/stories/(.*)",
      "destination": "/stories/$1"
    },
    {
      "source": "/((?!stories).*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures:
1. Turborepo compiles the internal design tokens (`@inq/tokens`), UI components (`@inq/ui`), icons (`@inq/icons`), and vector engine (`@inq/pdf-engine`).
2. Both `@inq/web` and `@inq/stories` are built in parallel.
3. The stories workbench bundle is mounted into `/stories` with portable relative asset resolution.
4. Client-side SPA routing handles all main editor paths without 404 conflicts.
