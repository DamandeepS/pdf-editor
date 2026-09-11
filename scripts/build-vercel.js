import { execSync } from 'node:child_process';
import fs from 'node:fs';

console.log('[build:vercel] Building @inq/web and @inq/stories via Turborepo...');
execSync('npx turbo run build --filter=@inq/web --filter=@inq/stories', { stdio: 'inherit' });

console.log('[build:vercel] Mounting Design System into apps/web/dist/design-system and /stories...');
fs.cpSync('apps/stories/dist', 'apps/web/dist/design-system', { recursive: true });
fs.cpSync('apps/stories/dist', 'apps/web/dist/stories', { recursive: true });

console.log('[build:vercel] Production deployment bundle ready in apps/web/dist');
