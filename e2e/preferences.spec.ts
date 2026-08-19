import { test } from '@playwright/test'
import { autoSignOut, signIn } from './session'

autoSignOut()
test.use({ viewport: { width: 1600, height: 1100 } })

/** Les quatre axes de préférence, sur la fiche Tiers. */
test('préférences d’affichage', async ({ page }) => {
  test.setTimeout(120_000)
  await signIn(page)
  await page.goto('/parties')
  await page.getByPlaceholder(/rechercher un tiers/i).fill('Sahara')
  await page.waitForTimeout(1500)
  await page.getByText('Groupe Sahara Voyages').first().click()
  await page.waitForTimeout(1500)

  const set = async (prefs: Record<string, string>, shot: string) => {
    await page.evaluate((p) => {
      localStorage.setItem('ostravel-display', JSON.stringify(p))
    }, prefs)
    await page.reload()
    await page.waitForTimeout(2200)
    await page.screenshot({ path: `e2e/screenshots/pref-${shot}.png` })
  }

  // Défaut : menu sombre sur interface claire.
  await set({ accent: 'teal', sidebar: 'dark', font: 'inter' }, 'defaut')
  // Barre latérale claire — l'ancien aspect, toujours atteignable.
  await set({ accent: 'teal', sidebar: 'light', font: 'inter' }, 'menu-clair')
  // Accent ambre : les liens et l'onglet actif changent, l'encre et les états non.
  await set({ accent: 'amber', sidebar: 'dark', font: 'inter' }, 'accent-ambre')
  // Police Barlow.
  await set({ accent: 'teal', sidebar: 'dark', font: 'barlow' }, 'police-barlow')

  // Thème sombre + menu sombre.
  await page.evaluate(() => localStorage.setItem('ostravel-theme', 'dark'))
  await set({ accent: 'teal', sidebar: 'dark', font: 'inter' }, 'sombre')
  await page.evaluate(() => localStorage.setItem('ostravel-theme', 'light'))
})
