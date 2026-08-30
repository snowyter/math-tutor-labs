import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative base so the build works from a GitHub Pages subpath
  // (/<repo>/) without hardcoding the repository name.
  base: './',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'prereqs/**/*.test.ts', 'labs/**/*.test.ts'],
  },
});
