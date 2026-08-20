import { expect, test } from '@playwright/test'
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

/**
 * Vague 2 — infobulle, dialogue, feuille latérale, carte, séparateur.
 *
 * Tout ce lot vit dans des PORTAILS : rien n'apparaît sur une capture statique.
 * Chaque état ouvert est donc provoqué — survol pour l'infobulle, clic pour le
 * dialogue et la feuille. C'est plus lent, mais c'est la seule façon de voir ce
 * qu'on livre.
 */
test('système de design — vague 2', async ({ page }) => {
  test.setTimeout(300_000)

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

  await page.goto('/design/tooltip')
  await set({ 'ostravel-theme': 'light', 'i18n-language': 'fr' })

  // ── Infobulle : survol réel, pas un état figé.
  await page.locator('#tt-dark').hover()
  await shot('infobulle-sombre-sur-clair')
  await page.locator('#tt-light').hover()
  await shot('infobulle-claire')
  await set({ 'ostravel-theme': 'dark' })
  await page.locator('#tt-dark').hover()
  await shot('infobulle-theme-sombre')

  // ── Dialogue
  await set({ 'ostravel-theme': 'light' })
  await visit('dialog')
  await shot('dialogue-ferme')
  await page.locator('#dlg-form').click()
  await shot('dialogue-formulaire')
  await page.keyboard.press('Escape')
  await page.waitForTimeout(500)
  await page.locator('#dlg-danger').click()
  await shot('dialogue-confirmation')
  await page.keyboard.press('Escape')
  await page.waitForTimeout(500)

  // ── Feuille latérale : le côté « end » doit basculer avec la langue.
  await page.locator('#sheet-end').click()
  await shot('feuille-end-fr')
  await page.keyboard.press('Escape')
  await page.waitForTimeout(500)
  await page.locator('#sheet-start').click()
  await shot('feuille-start-fr')
  await page.keyboard.press('Escape')

  await set({ 'ostravel-theme': 'dark' })
  await page.locator('#dlg-form').click()
  await shot('dialogue-sombre')
  await page.keyboard.press('Escape')

  await set({ 'ostravel-theme': 'light', 'i18n-language': 'ar' })
  await page.locator('#sheet-end').click()
  await shot('feuille-end-arabe')
  await page.keyboard.press('Escape')
  await page.waitForTimeout(500)
  await page.locator('#dlg-form').click()
  await shot('dialogue-arabe')
  await page.keyboard.press('Escape')

  // ── Carte et séparateur
  await set({ 'i18n-language': 'fr' })
  await visit('card')
  await shot('carte-clair')
  await set({ 'ostravel-theme': 'dark' })
  await shot('carte-sombre')
  await set({ 'ostravel-theme': 'light', 'i18n-language': 'ar' })
  await shot('carte-arabe')
  await set({ 'i18n-language': 'fr' })
})

/**
 * Le tableau. Trois captures qui comptent :
 *   · la liste complète en français, pour juger la densité et l'alignement ;
 *   · l'arabe, où la colonne de montants et « 1 – 6 sur 12 » doivent tenir ;
 *   · le menu d'un en-tête ouvert, pour voir tri / épinglage / colonnes.
 */
test('système de design — tableau', async ({ page }) => {
  test.setTimeout(240_000)

  const set = async (entries: Record<string, string>) => {
    await page.evaluate((o) => {
      for (const [k, v] of Object.entries(o)) localStorage.setItem(k, v)
    }, entries)
    await page.reload()
    await page.waitForTimeout(1600)
  }
  const shot = async (name: string) => {
    await page.waitForTimeout(600)
    await page.screenshot({ path: `${SHOTS}/${name}.png` })
  }

  await page.goto('/design/table')
  await set({ 'ostravel-theme': 'light', 'i18n-language': 'fr' })
  await shot('tableau-clair')

  // Sélection de deux lignes : le filet de bord et le fond actif doivent se voir.
  await page.getByLabel('Sélectionner la ligne').nth(0).click()
  await page.getByLabel('Sélectionner la ligne').nth(2).click()
  await shot('tableau-selection')

  // Menu d'en-tête : tri, épinglage, colonnes.
  await page.getByRole('button', { name: /Raison sociale/i }).first().click()
  await shot('tableau-menu-colonne')
  await page.keyboard.press('Escape')

  await set({ 'ostravel-theme': 'dark' })
  await shot('tableau-sombre')

  await set({ 'ostravel-theme': 'light', 'i18n-language': 'ar' })
  await shot('tableau-arabe')

  // Densités : c'est ici que --ui-row se juge vraiment.
  await set({ 'i18n-language': 'fr' })
  await page.evaluate(() => {
    document.documentElement.dataset.density = 'compact'
  })
  await shot('tableau-dense')
  await page.evaluate(() => {
    document.documentElement.dataset.density = 'cozy'
  })
  await shot('tableau-confort')
})

/**
 * COMPORTEMENTS du tableau — pas des captures, des vérifications.
 *
 * Ces trois-là ne se voient sur aucune image et se cassent silencieusement :
 * une garde de clic qu'on oublie, une sélection qui ne mène nulle part, un
 * montant inconnu affiché « 0 ». Ils méritent un test, pas une relecture.
 */
test('tableau — garde du clic, sélection, valeur inconnue', async ({ page }) => {
  test.setTimeout(180_000)
  await page.goto('/design/table')
  await page.waitForTimeout(2000)

  const opened = page.locator('text=/^Ouvert : /').first()
  const isOpened = () => opened.isVisible().catch(() => false)

  // 1. Cocher une case ne doit PAS ouvrir la fiche.
  await page.getByRole('checkbox', { name: 'Sélectionner la ligne' }).first().click()
  await page.waitForTimeout(400)
  expect(await isOpened(), 'cocher ne doit pas ouvrir la fiche').toBe(false)

  // 2. La sélection fait apparaître la barre d'actions groupées.
  // `role=status` : la barre s'ANNONCE, c'est ce qui la rend perceptible au
  // lecteur d'écran — et ça donne un sélecteur stable.
  const bulkBar = page.locator('[data-slot=data-grid-bulk-actions]')
  await expect(bulkBar).toBeVisible()
  await bulkBar.getByRole('button', { name: 'Tout désélectionner' }).click()
  await page.waitForTimeout(400)
  await expect(bulkBar).toHaveCount(0)

  // 3. Ouvrir le menu d'actions ne doit PAS ouvrir la fiche.
  await page.getByRole('button', { name: /Actions pour/ }).first().click()
  await page.waitForTimeout(400)
  expect(await isOpened(), "le menu d'actions ne doit pas ouvrir la fiche").toBe(false)
  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)

  // 4. Cliquer ailleurs dans la ligne DOIT ouvrir la fiche.
  await page.getByRole('cell', { name: 'Tunis', exact: true }).first().click()
  await page.waitForTimeout(500)
  expect(await isOpened(), 'un clic sur la ligne doit ouvrir la fiche').toBe(true)

  // 5. Un encours inconnu s'affiche « — », jamais « 0 ».
  await page.getByRole('button', { name: '2', exact: true }).first().click()
  await page.waitForTimeout(700)
  await expect(page.getByRole('cell', { name: '—', exact: true }).first()).toBeVisible()
})
