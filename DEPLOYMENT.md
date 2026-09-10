# Vercel Deployment Guide - Inq PDF Editor

This guide outlines the production deployment workflow for **Inq PDF Editor** on **Vercel**.

---

## Architectural Context

Inq PDF Editor is architected as an isomorphic monorepo powered by Turborepo. When deployed to static edge hosting like Vercel:
- The web application (`@inq/web`) runs entirely inside the client's browser.
- PDF rendering, text glyph extraction, editing, redactions, and vector compilation execute client-side via WebAssembly and `pdf-lib`.
- Built-in sample documents (`Cloud Tech SaaS Invoice`, `City Electric Utility Bill`, `Artisan Cafe Receipt`) load via client-side fallbacks with zero requirement for an active Node.js server.
- The web app is completely self-contained, fast, and free to host indefinitely on Vercel's Hobby Tier.

---

## Pre-Flight Verification

The monorepo configuration has been verified locally:
```bash
# Verify typechecking across all workspaces
npm run typecheck

# Verify all unit and accessibility test suites
npm test

# Test the exact Vercel build command
npx turbo run build --filter=@inq/web
```

The output artifact is generated in `apps/web/dist` in under 1 second.

---

## Method 1: Continuous Deployment via Vercel Dashboard (Recommended)

Because the project is tracked under GitHub (`git@github.com:DamandeepS/pdf-editor.git`), Vercel can automatically build and deploy every commit pushed to `main`.

### Step 1: Import the Repository
1. Navigate to [vercel.com/new](https://vercel.com/new).
2. Select your Git provider (GitHub) and import `DamandeepS/pdf-editor`.

### Step 2: Configure Project Settings
Vercel reads the root `vercel.json` automatically:
- **Framework Preset**: Vite
- **Root Directory**: `./` (leave default)
- **Build Command**: `npx turbo run build --filter=@inq/web` (pre-configured)
- **Output Directory**: `apps/web/dist` (pre-configured)
- **Install Command**: `npm install` (default)

### Step 3: Configure Environment Variables (Optional)
If you want to enable Google Analytics 4 tracking:
- Name: `VITE_GA_MEASUREMENT_ID`
- Value: `G-XXXXXXXXXX`

### Step 4: Deploy
Click **Deploy**. In under 60 seconds, Vercel will build the workspace packages and assign your live production URL (e.g., `https://pdf-editor-xxx.vercel.app`).

---

## Method 2: Deployment via Vercel CLI

If you prefer deploying directly from your terminal:

```bash
# 1. Log in to your Vercel account
npx vercel login

# 2. Link and deploy a preview build
npx vercel

# 3. Deploy directly to production
npx vercel --prod
```

When prompted:
- **Set up and deploy?**: `Y`
- **Which scope?**: Choose your personal or team account
- **Link to existing project?**: `N`
- **What's your project's name?**: `pdf-editor`
- **In which directory is your code located?**: `./`

---

## Configuration Reference (`vercel.json`)

The repository includes a root `vercel.json` file:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npx turbo run build --filter=@inq/web",
  "outputDirectory": "apps/web/dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures:
1. Turborepo compiles the internal packages (`@inq/tokens`, `@inq/types`, `@inq/icons`, `@inq/ui`, `@inq/pdf-engine`) before building `@inq/web`.
2. Single-Page Application (SPA) client routing routes all paths to `/index.html`.
