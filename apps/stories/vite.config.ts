import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/design-system/',
  plugins: [react()],
  server: {
    port: 3001,
    strictPort: true,
  },
});
