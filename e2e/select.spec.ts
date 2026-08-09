import { test, expect } from '@playwright/test'
import { autoSignOut, signIn } from './session'

autoSignOut()


/** Vérifie le Select partagé : déclencheur + menu ouvert, en clair et en sombre. */
test('select partagé — menu ouvert clair + sombre', async ({ page }) => {
  test.setTimeout(90_000)
  await signIn(page)

  await page.goto('/parties')
  await page.getByPlaceholder(/rechercher un tiers/i).fill('Sahara')
  await page.waitForTimeout(1500)
  await page.getByText('Groupe Sahara Voyages').first().click()
  await page.waitForTimeout(1500)

  // Onglet Historique : trois filtres côte à côte dans une barre d'outils.
  await page.getByRole('tab', { name: /historique/i }).click()
  await page.waitForTimeout(1200)
  await page.getByRole('combobox').first().click()
  await page.waitForTimeout(400)
  await expect(page.getByRole('listbox')).toBeVisible()
  await page.screenshot({ path: 'e2e/screenshots/select-clair.png' })
  await page.keyboard.press('Escape')

  // Même chose en sombre.
  await page.evaluate(() => localStorage.setItem('ostravel-theme', 'dark'))
  await page.reload()
  await page.waitForTimeout(1800)
  await page.getByRole('tab', { name: /historique/i }).click()
  await page.waitForTimeout(1200)
  await page.getByRole('combobox').first().click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: 'e2e/screenshots/select-sombre.png' })
  await page.keyboard.press('Escape')

  // Cas le plus fréquent : un select DANS un formulaire (panneau latéral).
  await page.evaluate(() => localStorage.setItem('ostravel-theme', 'light'))
  await page.reload()
  await page.waitForTimeout(1800)
  await page.getByRole('tab', { name: /finance/i }).click()
  await page.waitForTimeout(1200)
  await page.getByRole('button', { name: /ajouter un plafond/i }).first().click()
  await page.waitForTimeout(900)
  await page.getByRole('combobox').first().click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: 'e2e/screenshots/select-formulaire.png' })

})
