import { test } from '@playwright/test'
import { autoSignOut, signIn } from './session'
import fs from 'node:fs'

autoSignOut()

/**
 * Capture ciblée de la VRAIE fiche Tiers (report du design validé sur `/_ref`).
 * Clair + sombre — pour valider que les tokens tiennent dans les deux thèmes.
 */
const SHOTS = 'e2e/screenshots'

test.use({ viewport: { width: 1600, height: 1180 } })
test.beforeAll(() => fs.mkdirSync(SHOTS, { recursive: true }))

test('fiche Tiers — clair + sombre', async ({ page }) => {
  test.setTimeout(90_000)
  await signIn(page)

  await page.goto('/parties')
  await page.waitForTimeout(1500)
  const search = page.getByPlaceholder(/rechercher un tiers/i)
  if ((await search.count()) > 0) {
    await search.fill('sahara')
    await page.waitForTimeout(1500)
  }
  // Robuste : si la recherche ne donne rien pour ce bureau, on ouvre la 1re fiche dispo.
  if ((await page.locator('table tbody tr').count()) === 0 && (await search.count()) > 0) {
    await search.fill('')
    await page.waitForTimeout(1500)
  }
  await page.locator('table tbody tr').first().click()
  await page.waitForTimeout(2000)

  // CLAIR : thème forcé + reload pour un état stable.
  await page.evaluate(() => localStorage.setItem('ostravel-theme', 'light'))
  await page.reload()
  await page.waitForTimeout(2000)
  await page.screenshot({ path: `${SHOTS}/fiche-clair.png` })

  // Activité récente (bas de l'Overview) + test « Voir tout » → onglet Historique.
  await page.getByText(/activité récente/i).scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${SHOTS}/fiche-activite.png` })
  await page.getByRole('button', { name: /voir tout/i }).first().click()
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${SHOTS}/fiche-voirtout.png` })

  // Filtre Action = « modifié » → ne reste que les UPDATE (vérifie le filtrage client).
  const actionFilter = page.getByRole('combobox', {
    name: /filtrer par action/i,
  })
  await actionFilter.click()
  await page.getByRole('option', { name: 'modifié' }).click()
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${SHOTS}/fiche-hist-filtre.png` })
  await actionFilter.click()
  await page.getByRole('option', { name: /toutes les actions/i }).click()
  await page.waitForTimeout(300)

  // Déplie une entrée « Adresse » → vérifie l'humanisation du détail (libellés + Oui/Non).
  const addressEntry = page
    .locator('details')
    .filter({ hasText: 'Adresse · ajouté' })
    .first()
  if ((await addressEntry.count()) > 0) {
    await addressEntry.locator('summary').click()
    await page.waitForTimeout(400)
    await addressEntry.scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)
    await page.screenshot({ path: `${SHOTS}/fiche-hist-detail.png` })
  }

  // « Charger plus » : la liste doit GRANDIR (chargement par tranches, pas tout d'un coup).
  const rows = () => page.locator('details').count()
  const before = await rows()
  const loadMore = page.getByRole('button', { name: /charger plus/i })
  if ((await loadMore.count()) > 0) {
    await loadMore.scrollIntoViewIfNeeded()
    await loadMore.click()
    await page.waitForTimeout(1500)
    const after = await rows()
    console.log(`LOADMORE ${before} -> ${after}`)
    await page.screenshot({ path: `${SHOTS}/fiche-hist-loadmore.png` })
  } else {
    console.log(`LOADMORE absent (${before} entrées, pas de tranche pleine)`)
  }

  // Onglet Finance — plafond effectif groupé par portée (socle + rallonges).
  await page.getByRole('tab', { name: /^finance$/i }).click()
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `${SHOTS}/fiche-finance.png` })

  // Onglets Contacts & équipe + Documents (lot 6).
  await page.getByRole('tab', { name: /contacts & équipe/i }).click()
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${SHOTS}/fiche-team.png` })
  await page.getByRole('tab', { name: /^documents$/i }).click()
  await page.waitForTimeout(800)

  // Crée 2 pièces pour VÉRIFIER les statuts d'expiration calculés (expire bientôt /
  // expiré) et l'état « Sans scan ». Sans données, le rendu des lignes est invérifiable.
  const addDoc = async (expiry: string, num: string) => {
    await page.getByRole('button', { name: /ajouter un document/i }).click()
    await page.waitForTimeout(600)
    await page.getByLabel(/^numéro$/i).fill(num)
    await page.locator('input[type="date"]').last().fill(expiry)
    await page.getByRole('button', { name: /^enregistrer$/i }).click()
    await page.waitForTimeout(1200)
  }
  if ((await page.getByText(/aucun document/i).count()) > 0) {
    await addDoc('2026-09-30', 'A1234567') // dans ~50 j → « Expire bientôt »
    await addDoc('2025-06-30', 'RC 123456') // passé → « Expiré »
  }
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${SHOTS}/fiche-documents.png` })

  await page.getByRole('tab', { name: /vue d'ensemble/i }).click()
  await page.waitForTimeout(500)
  await page.evaluate(() => window.scrollTo(0, 0))

  await page.evaluate(() => localStorage.setItem('ostravel-theme', 'dark'))
  await page.reload()
  await page.waitForTimeout(2000)
  await page.screenshot({ path: `${SHOTS}/fiche-sombre.png` })

  // RTL — arabe (dir=rtl) : vérifie que les propriétés logiques (ps/pe/ms/me/start) flippent.
  await page.evaluate(() => {
    localStorage.setItem('i18n-language', 'ar')
    localStorage.setItem('ostravel-theme', 'light')
  })
  await page.reload()
  await page.waitForTimeout(2500)
  await page.screenshot({ path: `${SHOTS}/fiche-rtl.png` })

  // Mobile — largeur étroite : la grille passe en une colonne.
  await page.evaluate(() => localStorage.setItem('i18n-language', 'fr'))
  await page.setViewportSize({ width: 390, height: 900 })
  await page.reload()
  await page.waitForTimeout(2500)
  await page.screenshot({ path: `${SHOTS}/fiche-mobile.png`, fullPage: true })

  // Bas du rail — adresses + groupe « Technique » (identifiants exposés par l'API).
  // La section précédente laisse la fenêtre en largeur mobile : on la rétablit.
  await page.setViewportSize({ width: 1600, height: 1180 })
  await page.evaluate(() => localStorage.setItem('ostravel-theme', 'light'))
  await page.reload()
  await page.waitForTimeout(2000)
  await page.getByRole('tab', { name: /vue d'ensemble/i }).click()
  await page.waitForTimeout(600)
  // Deux <aside> dans la page : le menu de gauche et le rail de la fiche.
  await page.locator('aside.fiche-scroll').evaluate((el) => {
    el.scrollTop = el.scrollHeight
  })
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${SHOTS}/fiche-rail-bas.png` })

  // Repli du rail — son état vit maintenant dans la coquille partagée : on vérifie
  // qu'il répond toujours, et que la colonne de gauche prend la place.
  await page.setViewportSize({ width: 1600, height: 1180 })
  await page.evaluate(() => localStorage.setItem('ostravel-theme', 'light'))
  await page.reload()
  await page.waitForTimeout(2000)
  await page.getByRole('button', { name: /détails (société|personne)/i }).click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${SHOTS}/fiche-rail-replie.png` })

})
