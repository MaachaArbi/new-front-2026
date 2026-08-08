import { defineConfig, devices } from '@playwright/test'

/**
 * Kit de tests navigateur + captures. **Double usage** (cf. mémoire) : s'auto-tester ET
 * générer des captures réelles pour le manuel. Les specs vivent dans `e2e/` (hors `src/`,
 * donc ignorées par vitest et le build). Serveur de dev réutilisé s'il tourne déjà.
 */
export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/.output',
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5180',
    locale: 'fr-FR',
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure',
    // Filmé + ralenti : la vidéo se regarde comme si on était devant l'écran.
    video: 'on',
    launchOptions: { slowMo: 500 },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5180',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
