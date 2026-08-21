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

  // ── PRINCIPE E : le manquant se voit.
  await page.getByRole('tab', { name: /Documents/ }).click()
  await page.waitForTimeout(500)
  await expect(page.getByText('Sans scan')).toBeVisible()

  await page.getByRole('tab', { name: 'Finance' }).click()
  await page.waitForTimeout(500)
  await expect(page.getByText('Sans justificatif')).toBeVisible()
  await expect(page.getByText('Validateur parti')).toBeVisible()

  // Socle et rallonge se distinguent — l'un s'ajoute à l'autre et expire.
  await expect(page.getByText('Socle').first()).toBeVisible()
  await expect(page.getByText('Rallonge').first()).toBeVisible()
  // Sans société = « Toutes les sociétés », jamais un vide.
  await expect(page.getByText('Toutes les sociétés')).toBeVisible()

  // ── RÈGLE N° 1 : aucun texte ne promet un effet.
  const body = (await page.locator('body').innerText()).toLowerCase()
  for (const forbidden of [
    'réservations bloquées',
    'en attente de validation',
    'sera bloqué',
    'sera refusé',
  ]) {
    expect(body, `« ${forbidden} » promet un effet — règle n° 1 du 06/08`).not.toContain(forbidden)
  }
})
