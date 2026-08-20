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

  // ── Densités, sur le bouton : c'est là que --ui-row se juge.
  await set({ 'i18n-language': 'fr' })
  await page.evaluate(() => {
    document.documentElement.dataset.density = 'compact'
  })
  await shot('bouton-dense')
  await page.evaluate(() => {
    document.documentElement.dataset.density = 'cozy'
  })
  await shot('bouton-confort')
})
