import { test } from '@playwright/test'
import { signIn, signOut } from './session'

test.use({ viewport: { width: 1440, height: 1100 } })

/** Panneau « Ajouter un tiers » — vérifie les radios Client / Fournisseur. */
test('création tiers — radios', async ({ page }) => {
  test.setTimeout(90_000)
  await signIn(page)
  await page.goto('/parties')
  await page.waitForTimeout(1500)

  await page.getByRole('button', { name: /ajouter un tiers/i }).click()
  await page.waitForTimeout(1000)
  // « Bureaux nommés » révèle le choix Client / Fournisseur (les radios).
  await page.getByRole('radio', { name: /bureaux nommés/i }).click()
  await page.waitForTimeout(600)
  await page.getByText(/rôle vis-à-vis des bureaux/i).scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  await page.screenshot({ path: 'e2e/screenshots/creation-clair.png' })

  await page.evaluate(() => localStorage.setItem('ostravel-theme', 'dark'))
  await page.reload()
  await page.waitForTimeout(2000)
  await page.getByRole('button', { name: /ajouter un tiers/i }).click()
  await page.waitForTimeout(1000)
  await page.getByRole('radio', { name: /bureaux nommés/i }).click()
  await page.waitForTimeout(600)
  await page.getByText(/rôle vis-à-vis des bureaux/i).scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  await page.screenshot({ path: 'e2e/screenshots/creation-sombre.png' })

  await signOut(page)
})
