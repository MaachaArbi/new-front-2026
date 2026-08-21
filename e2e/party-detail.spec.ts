import { expect, test } from '@playwright/test'
import fs from 'node:fs'

/**
 * FICHE TIERS — le gabarit de référence de toutes les fiches du produit.
 *
 * Deux règles d'Arbi se vérifient ici, et elles ne se voient pas sur une capture :
 *  · RÈGLE N° 1 (06/08) : aucun réglage ne DÉCLENCHE quoi que ce soit. On ne doit
 *    trouver nulle part une phrase qui promette un effet.
 *  · PRINCIPE E : ce qui MANQUE doit se voir — pièce sans scan, exonération sans
 *    justificatif, validateur parti.
 */
const SHOTS = 'e2e/screenshots'
test.use({
  viewport: { width: 1500, height: 1000 },
  launchOptions: { slowMo: 50 },
})
test.beforeAll(() => fs.mkdirSync(SHOTS, { recursive: true }))

test('fiche Tiers — captures', async ({ page }) => {
  test.setTimeout(300_000)
  const set = async (entries: Record<string, string>) => {
    await page.evaluate((o) => {
      for (const [k, v] of Object.entries(o)) localStorage.setItem(k, v)
    }, entries)
    await page.reload()
    await page.waitForTimeout(1400)
  }
  await page.goto('/parties/p-001')
  await set({ 'ostravel-theme': 'light', 'i18n-language': 'fr' })
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${SHOTS}/fiche-vue-ensemble.png` })

  await page.getByRole('tab', { name: 'Finance' }).click()
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${SHOTS}/fiche-finance.png` })

  await page.getByRole('tab', { name: /Documents/ }).click()
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${SHOTS}/fiche-documents.png` })

  await set({ 'ostravel-theme': 'dark' })
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${SHOTS}/fiche-sombre.png` })

  await set({ 'ostravel-theme': 'light', 'i18n-language': 'ar' })
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${SHOTS}/fiche-arabe.png` })
  await set({ 'i18n-language': 'fr' })
})

test('fiche Tiers — les deux règles d’Arbi tiennent', async ({ page }) => {
  test.setTimeout(300_000)
  await page.goto('/parties/p-001')
  await page.waitForTimeout(1800)

  // ── PRINCIPE E : ce qui MANQUE remonte de lui-même, dès l'ouverture.
  //    Le point n'est pas qu'il soit trouvable — c'est qu'il soit AGRÉGÉ.
  const todo = page.locator('text=À traiter').first()
  await expect(todo).toBeVisible()
  await expect(page.getByText('Adresse électronique non vérifiée')).toBeVisible()
  await expect(page.getByText(/sans attestation/i)).toBeVisible()
  await expect(page.getByText(/ne fait plus partie de l’équipe/)).toBeVisible()
  await expect(page.getByText(/sans scan/i)).toBeVisible()

  // ── LA CAPACITÉ : un chiffre PAR LIVRE, jamais un total.
  //    Un livre = (tiers, rôle, bureau, devise). Additionner 26 500 TND et
  //    1 800 EUR n'aurait aucun sens comptable.
  const capacities = page.getByText('Capacité restante')
  await expect(capacities).toHaveCount(2)
  await expect(page.getByText('myGO Tunis', { exact: false }).first()).toBeVisible()

  // ── RÈGLE N° 1 (06/08) : aucun texte ne promet un effet.
  //    Les comportements vivent dans Réservations, pas ici.
  const body = (await page.locator('body').innerText()).toLowerCase()
  for (const forbidden of [
    'réservations bloquées',
    'en attente de validation',
    'sera bloqué',
    'sera refusé',
    'ne pourra pas',
  ]) {
    expect(
      body,
      `« ${forbidden} » promet un effet — règle n° 1 du 06/08`
    ).not.toContain(forbidden)
  }
})
