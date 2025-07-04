/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,               // Permet d'utiliser test(), expect() sans import
    environment: 'jsdom',        // Simule un navigateur
    setupFiles: './src/setupTests.ts',
  },
});