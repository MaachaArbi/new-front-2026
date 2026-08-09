import { test, expect } from '@playwright/test'
import { autoSignOut, signIn } from './session'

autoSignOut()

test.use({ viewport: { width: 1440, height: 1100 } })

/** Champ de date partagé — calendrier ouvert en clair, en sombre et en arabe. */
test('champ de date — calendrier', async ({ page }) => {
  test.setTimeout(120_000)
  await signIn(page)
  await page.goto('/parties')
  await page.getByPlaceholder(/rechercher un tiers/i).fill('Sahara')
  await page.waitForTimeout(1500)
  await page.getByText('Groupe Sahara Voyages').first().click()
  await page.waitForTimeout(1500)

  const openSheet = async () => {
    await page.getByRole('tab', { name: /^documents$/i }).click()
    await page.waitForTimeout(900)
    await page.getByRole('button', { name: /ajouter un document/i }).click()
    await page.waitForTimeout(800)
  }

  // CLAIR — on ouvre « Valide du », puis on choisit un jour pour vérifier les bornes.
  await openSheet()
  await page.getByRole('button', { name: /date d.émission/i }).click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'e2e/screenshots/date-clair.png' })

  // Une date choisie doit borner l'autre champ : l'expiration ne peut précéder l'émission.
  await page.getByRole('button', { name: '15', exact: true }).click()
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: /date d.expiration/i }).click()
  await page.waitForTimeout(500)
  // Le 3 du MOIS COURANT précède le 15 choisi → inerte. (Le 3 du mois suivant, lui,
  // reste cliquable : d'où le .first().)
  await expect(
    page.getByRole('button', { name: '3', exact: true }).first()
  ).toBeDisabled()
  await page.screenshot({ path: 'e2e/screenshots/date-bornes.png' })
  await page.keyboard.press('Escape')

  // SOMBRE
  await page.evaluate(() => localStorage.setItem('ostravel-theme', 'dark'))
  await page.reload()
  await page.waitForTimeout(2000)
  await openSheet()
  await page.getByRole('button', { name: /date d.émission/i }).click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'e2e/screenshots/date-sombre.png' })

  // ARABE (RTL) — le cas que le champ natif ne traitait pas : mois et jours en arabe,
  // grille inversée. Sélecteurs par `data-slot`, indépendants de la langue.
  await page.evaluate(() => {
    localStorage.setItem('i18n-language', 'ar')
    localStorage.setItem('ostravel-theme', 'light')
  })
  await page.reload()
  await page.waitForTimeout(2500)
  await page.getByRole('tab').nth(6).click()
  await page.waitForTimeout(1000)
  await page.getByRole('button', { name: 'إضافة مستند' }).click()
  await page.waitForTimeout(900)
  await page.locator('[data-slot="date-field"]').first().click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'e2e/screenshots/date-arabe.png' })

  await page.evaluate(() => localStorage.setItem('i18n-language', 'fr'))
})
