import { test } from '@playwright/test'

/**
 * Les deux axes de préférence qui restent : barre latérale et police.
 *
 * L'axe ACCENT a été retiré le 20/08 — la palette « Bleu de Prusse » est un système
 * accordé, un accent commutable l'aurait cassé. Ce test ne le vérifie donc plus.
 *
 * Le thème vit à part, chez `next-themes` (clé `ostravel-theme`).
 */
test.use({ viewport: { width: 1500, height: 1000 } })

test('préférences d’affichage', async ({ page }) => {
  test.setTimeout(120_000)

  const set = async (prefs: Record<string, string>, shot: string) => {
    await page.evaluate((p) => {
      localStorage.setItem('ostravel-display', JSON.stringify(p))
    }, prefs)
    await page.reload()
    await page.waitForTimeout(1600)
    await page.screenshot({ path: `e2e/screenshots/pref-${shot}.png` })
  }

  await page.goto('/design/palette')
  await page.waitForTimeout(1600)

  // Défaut : menu sombre sur interface claire.
  await set({ sidebar: 'dark', font: 'inter' }, 'defaut')
  // Barre latérale claire — toujours atteignable.
  await set({ sidebar: 'light', font: 'inter' }, 'menu-clair')
  // Police Barlow.
  await set({ sidebar: 'dark', font: 'barlow' }, 'police-barlow')

  // Thème sombre + menu sombre.
  await page.evaluate(() => localStorage.setItem('ostravel-theme', 'dark'))
  await set({ sidebar: 'dark', font: 'inter' }, 'sombre')
  await page.evaluate(() => localStorage.setItem('ostravel-theme', 'light'))
})
