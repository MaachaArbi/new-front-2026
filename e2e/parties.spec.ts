import { expect, test } from '@playwright/test'
import fs from 'node:fs'

/**
 * LISTE TIERS — le premier écran réel.
 *
 * Statique : fixtures en mémoire, aucune API. Ce qu'on vérifie ici n'est pas
 * l'aspect mais les décisions du 04/08 qui se cassent en silence : le compteur
 * qui doit dire « que vous pouvez voir », l'absence de colonne solde, et les
 * champs vides qui doivent s'afficher au lieu de disparaître.
 */
const SHOTS = 'e2e/screenshots'
test.use({ viewport: { width: 1500, height: 1000 } })
test.beforeAll(() => fs.mkdirSync(SHOTS, { recursive: true }))

test('liste Tiers — captures', async ({ page }) => {
  test.setTimeout(180_000)
  const set = async (entries: Record<string, string>) => {
    await page.evaluate((o) => {
      for (const [k, v] of Object.entries(o)) localStorage.setItem(k, v)
    }, entries)
    await page.reload()
    await page.waitForTimeout(1600)
  }
  await page.goto('/parties')
  await set({ 'ostravel-theme': 'light', 'i18n-language': 'fr' })
  await page.waitForTimeout(900)
  await page.screenshot({ path: `${SHOTS}/tiers-liste-clair.png` })

  await page.goto('/parties?role=customer&state=prospect,disputed')
  await page.waitForTimeout(1800)
  await page.screenshot({ path: `${SHOTS}/tiers-liste-filtree.png` })

  await set({ 'ostravel-theme': 'dark' })
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${SHOTS}/tiers-liste-sombre.png` })

  await set({ 'ostravel-theme': 'light', 'i18n-language': 'ar' })
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${SHOTS}/tiers-liste-arabe.png` })
  await set({ 'i18n-language': 'fr' })
})

test('liste Tiers — les décisions du 04/08 tiennent', async ({ page }) => {
  test.setTimeout(180_000)
  await page.goto('/parties')
  await page.waitForTimeout(1800)

  // 1. Le compteur NOMME le cloisonnement : la liste n'est jamais complète.
  await expect(page.getByText(/que vous pouvez voir/)).toBeVisible()

  // 2. AUCUNE colonne solde/encours : le solde vit par rôle × bureau × devise.
  const headers = (await page.locator('thead th').allInnerTexts()).join(' | ')
  expect(headers.toLowerCase()).not.toContain('solde')
  expect(headers.toLowerCase()).not.toContain('encours')

  // 3. Un tiers peut porter DEUX rôles — les deux doivent s'afficher.
  const carthage = page.locator('tr', { hasText: 'Carthage Travel Services' })
  await expect(carthage.getByText('Client')).toBeVisible()
  await expect(carthage.getByText('Fournisseur')).toBeVisible()

  // 4. Les états ne partitionnent pas : Bizerte est désactivé ET en litige.
  const bizerte = page.locator('tr', { hasText: 'Bizerte Marine Travel' })
  await expect(bizerte.getByText('Désactivé')).toBeVisible()
  await expect(bizerte.getByText('Litige')).toBeVisible()

  // 5. Un champ vide s'AFFICHE « — » : masqué, il serait indiscernable d'un
  //    champ inexistant. Nour Travel n'a ni téléphone, ni pays, ni bureau.
  await page.goto('/parties?q=nour')
  await page.waitForTimeout(1500)
  const nour = page.locator('tr', { hasText: 'Nour Travel' })
  expect(await nour.getByText('—', { exact: true }).count()).toBeGreaterThanOrEqual(3)
})
