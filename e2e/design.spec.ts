import { test } from '@playwright/test'
import fs from 'node:fs'

/**
 * Captures du système de design : la palette et le bouton, en clair, en sombre et
 * en arabe. C'est la pièce que je regarde avant d'annoncer quoi que ce soit —
 * « ça compile » n'est pas « ça ressemble à la planche ».
 */
const SHOTS = 'e2e/screenshots'

test.use({ viewport: { width: 1500, height: 1000 } })
test.beforeAll(() => fs.mkdirSync(SHOTS, { recursive: true }))

test('système de design — palette et bouton', async ({ page }) => {
  test.setTimeout(180_000)

  const set = async (entries: Record<string, string>) => {
    await page.evaluate((o) => {
      for (const [k, v] of Object.entries(o)) localStorage.setItem(k, v)
    }, entries)
    await page.reload()
    await page.waitForTimeout(1400)
  }

  const shot = async (name: string, full = false) => {
    await page.waitForTimeout(600)
    await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: full })
  }

  // ── Palette. Le corps ne défile pas (le layout borne la hauteur) : `fullPage`
  //    ne sert à rien, il faut faire défiler le panneau et capturer en deux temps.
  // `scrollIntoViewIfNeeded` ne bouge pas si l'élément est PARTIELLEMENT visible :
  // le titre « Rôles » affleurait en bas et la capture ne changeait pas.
  const scrollTo = async (text: string, block: ScrollLogicalPosition) => {
    await page
      .getByText(text, { exact: true })
      .first()
      .evaluate((el, b) => {
        el.scrollIntoView({ block: b })
      }, block)
    await page.waitForTimeout(600)
  }

  await page.goto('/design/palette')
  await page.waitForTimeout(1800)
  await shot('palette-clair')
  await scrollTo('Rôles', 'start')
  await shot('palette-roles-clair')
  await scrollTo('Barre latérale', 'end')
  await shot('palette-roles-clair-2')

  await set({ 'ostravel-theme': 'dark' })
  await shot('palette-sombre')
  await scrollTo('Rôles', 'start')
  await shot('palette-roles-sombre')
  await scrollTo('Barre latérale', 'end')
  await shot('palette-roles-sombre-2')

  // ── Bouton
  await set({ 'ostravel-theme': 'light' })
  await page.goto('/design/button')
  await page.waitForTimeout(1400)
  await shot('bouton-clair')

  await set({ 'ostravel-theme': 'dark' })
  await shot('bouton-sombre')

  await set({ 'ostravel-theme': 'light', 'i18n-language': 'ar' })
  await shot('bouton-arabe')

  // ── Champ de saisie. Le focus est capturé POUR DE BON : on pose le curseur
  //    dans un champ plutôt que de simuler l'état en dur dans la vitrine.
  await set({ 'ostravel-theme': 'light', 'i18n-language': 'fr' })
  await page.goto('/design/input')
  await page.waitForTimeout(1400)
  await shot('champ-clair')

  await page.getByPlaceholder('Raison sociale').click()
  await page.waitForTimeout(400)
  await shot('champ-focus')

  await page.locator('input[aria-invalid]').first().click()
  await page.waitForTimeout(400)
  await shot('champ-focus-invalide')

  await set({ 'ostravel-theme': 'dark' })
  await shot('champ-sombre')

  await set({ 'ostravel-theme': 'light', 'i18n-language': 'ar' })
  await shot('champ-arabe')

  // ── Calendrier. L'arabe est le test qui compte : mois traduits, grille
  //    inversée, flèches retournées, coins de plage du bon côté.
  await set({ 'ostravel-theme': 'light', 'i18n-language': 'fr' })
  await page.goto('/design/calendar')
  await page.waitForTimeout(1600)
  await shot('calendrier-clair')

  await set({ 'ostravel-theme': 'dark' })
  await shot('calendrier-sombre')

  await set({ 'ostravel-theme': 'light', 'i18n-language': 'ar' })
  await shot('calendrier-arabe')

  // ── Densités, sur le bouton : c'est là que --ui-row se juge.
  await set({ 'i18n-language': 'fr' })
  await page.goto('/design/button')
  await page.waitForTimeout(1200)
  await page.evaluate(() => {
    document.documentElement.dataset.density = 'compact'
  })
  await shot('bouton-dense')
  await page.evaluate(() => {
    document.documentElement.dataset.density = 'cozy'
  })
  await shot('bouton-confort')
})

/**
 * Vague 1 — sélecteur, cases et radios, zone de texte, étiquette, mot de passe.
 *
 * Deux choses ne se capturent pas d'elles-mêmes et sont donc PROVOQUÉES ici :
 * la liste ouverte d'un sélecteur (elle vit dans un portail) et le basculement de
 * l'œil du mot de passe (c'est un comportement, pas un état).
 */
test('système de design — vague 1', async ({ page }) => {
  test.setTimeout(240_000)

  const set = async (entries: Record<string, string>) => {
    await page.evaluate((o) => {
      for (const [k, v] of Object.entries(o)) localStorage.setItem(k, v)
    }, entries)
    await page.reload()
    await page.waitForTimeout(1400)
  }
  const shot = async (name: string) => {
    await page.waitForTimeout(600)
    await page.screenshot({ path: `${SHOTS}/${name}.png` })
  }
  const visit = async (id: string) => {
    await page.goto(`/design/${id}`)
    await page.waitForTimeout(1400)
  }

  await page.goto('/design/select')
  await set({ 'ostravel-theme': 'light', 'i18n-language': 'fr' })

  // ── Sélecteur
  await shot('selecteur-clair')
  await page.locator('#select-repos').click()
  await shot('selecteur-ouvert')
  await page.keyboard.press('Escape')

  // La coche du côté « end » : c'est l'écart d'API qu'on a fait, il doit se voir.
  await page.locator('#select-ind-end').click()
  await shot('selecteur-coche-end')
  await page.keyboard.press('Escape')

  await set({ 'ostravel-theme': 'dark' })
  await shot('selecteur-sombre')

  await set({ 'ostravel-theme': 'light', 'i18n-language': 'ar' })
  await shot('selecteur-arabe')
  await page.locator('#select-repos').click()
  await shot('selecteur-ouvert-arabe')
  await page.keyboard.press('Escape')

  // ── Cases et radios
  await set({ 'i18n-language': 'fr' })
  await visit('choice')
  await shot('choix-clair')
  await set({ 'ostravel-theme': 'dark' })
  await shot('choix-sombre')
  await set({ 'ostravel-theme': 'light', 'i18n-language': 'ar' })
  await shot('choix-arabe')

  // ── Zone de texte
  await set({ 'i18n-language': 'fr' })
  await visit('textarea')
  await shot('zone-texte-clair')
  await set({ 'ostravel-theme': 'dark' })
  await shot('zone-texte-sombre')

  // ── Étiquette
  await set({ 'ostravel-theme': 'light' })
  await visit('label')
  await shot('etiquette-clair')

  // ── Mot de passe : l'œil se CLIQUE, on ne simule pas.
  await visit('password')
  await shot('mot-de-passe-clair')
  await page.locator('#p1').locator('..').getByRole('button').click()
  await shot('mot-de-passe-revele')
  await set({ 'i18n-language': 'ar' })
  await shot('mot-de-passe-arabe')
  await set({ 'i18n-language': 'fr' })
})
