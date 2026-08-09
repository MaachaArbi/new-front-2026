import { test } from '@playwright/test'
import { autoSignOut, signIn } from './session'

autoSignOut()

test.use({ viewport: { width: 1600, height: 1100 } })

/** Modale CRUD — « Ajouter un plafond », le motif validé sur /_ui. */
test('modale — ajouter un plafond', async ({ page }) => {
  test.setTimeout(120_000)
  await signIn(page)
  await page.goto('/parties')
  await page.getByPlaceholder(/rechercher un tiers/i).fill('Sahara')
  await page.waitForTimeout(1500)
  await page.getByText('Groupe Sahara Voyages').first().click()
  await page.waitForTimeout(1500)

  const open = async () => {
    await page.getByRole('tab', { name: /^finance$/i }).click()
    await page.waitForTimeout(1000)
    await page.getByRole('button', { name: /ajouter un plafond/i }).first().click()
    await page.waitForTimeout(800)
  }

  await open()
  await page.screenshot({ path: 'e2e/screenshots/modale-clair.png' })

  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)

  // Coordonnées — crayon du rail.
  await page.getByRole('button', { name: /éditer les coordonnées/i }).click()
  await page.waitForTimeout(700)
  await page.screenshot({ path: 'e2e/screenshots/modale-coordonnees.png' })
  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)

  // Chargé de compte — recherche de personne, validation au pied.
  await page.getByRole('tab', { name: /^finance$/i }).click()
  await page.waitForTimeout(800)
  await page
    .getByRole('button', { name: /ajouter un chargé de compte/i })
    .first()
    .click()
  await page.waitForTimeout(700)
  await page.screenshot({ path: 'e2e/screenshots/modale-charge.png' })
  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)

  await page.evaluate(() => localStorage.setItem('ostravel-theme', 'dark'))
  await page.reload()
  await page.waitForTimeout(2000)
  await open()
  await page.screenshot({ path: 'e2e/screenshots/modale-sombre.png' })
})
