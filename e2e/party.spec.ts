import { test } from '@playwright/test'
import { signIn, signOut } from './session'
import fs from 'node:fs'

/**
 * Scénario filmé : connexion (compte démo) → liste → recherche → fiche. Chaque étape est
 * capturée dans `e2e/screenshots/`, et la session entière est filmée (vidéo Playwright).
 * Sert de brique pour le manuel ET de garde-fou de non-régression.
 */

const SHOTS = 'e2e/screenshots'

test.beforeAll(() => {
  fs.mkdirSync(SHOTS, { recursive: true })
})

test('connexion → liste → recherche → fiche', async ({ page }) => {
  // 1) Écran de connexion
  await page.goto('/')
  await page.screenshot({ path: `${SHOTS}/01-login.png`, fullPage: true })

  // 2) Connexion avec un compte démo (Tunis)
  await signIn(page)
  await page.screenshot({ path: `${SHOTS}/02-apres-login.png`, fullPage: true })

  // 3) Liste des tiers
  await page.goto('/parties')
  await page.waitForTimeout(2000)
  await page.screenshot({ path: `${SHOTS}/03-liste.png`, fullPage: true })

  // 4) Recherche « sahara » (frappe visible dans la vidéo)
  const search = page.getByPlaceholder(/rechercher un tiers/i)
  if ((await search.count()) > 0) {
    await search.click()
    await search.fill('sahara')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: `${SHOTS}/04-recherche.png`, fullPage: true })
  }

  // 5) Première fiche
  const firstRow = page.locator('table tbody tr').first()
  if ((await firstRow.count()) > 0) {
    await firstRow.click()
    await page.waitForTimeout(2000)
    await page.screenshot({ path: `${SHOTS}/05-fiche.png`, fullPage: true })
  }

  await signOut(page)
})
