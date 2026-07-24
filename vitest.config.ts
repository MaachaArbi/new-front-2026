import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// Configuration Vitest séparée de vite.config.ts pour éviter tout couplage
// entre le build applicatif et l'outillage de test (S4). Reprend le seul alias
// « @ » nécessaire aux imports du noyau Money.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // globals: true enregistre l'auto-cleanup de @testing-library/react entre
    // les tests (via le afterEach global). Sans lui, les rendus s'accumulent et
    // getByLabelText renvoie un élément périmé du test précédent.
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
