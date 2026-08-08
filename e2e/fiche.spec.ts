import { test } from '@playwright/test'
import fs from 'node:fs'

/**
 * Capture ciblée de la VRAIE fiche Tiers (report du design validé sur `/_ref`).
 * Clair + sombre — pour valider que les tokens tiennent dans les deux thèmes.
 */
const SHOTS = 'e2e/screenshots'
const EMAIL = 'karim.belhadj@demo.ostravel.tn'
const PASSWORD = 'Demo-2026-OsTravel'

test.use({ viewport: { width: 1600, height: 1180 } })
test.beforeAll(() => fs.mkdirSync(SHOTS, { recursive: true }))

test('fiche Tiers — clair + sombre', async ({ page }) => {
  test.setTimeout(90_000)
  await page.goto('/')
  await page.fill('#login-email', EMAIL)
  await page.fill('#login-password', PASSWORD)
  await page.getByRole('button', { name: /se connecter/i }).click()
  await page.waitForURL((u) => !u.pathname.match(/login|^\/$/), { timeout: 20000 })
  await page.waitForTimeout(1500)

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
  await page
    .getByLabel(/filtrer par action/i)
    .selectOption({ label: 'modifié' })
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${SHOTS}/fiche-hist-filtre.png` })
  await page.getByLabel(/filtrer par action/i).selectOption('')
  await page.waitForTimeout(300)

  // Déplie une entrée « Adresse » → vérifie l'humanisation du détail (libellés + Oui/Non).
  const addressEntry = page
    .locator('details')
    .filter({ hasText: 'Adresse · ajouté' })
    .first()
  await addressEntry.locator('summary').click()
  await page.waitForTimeout(400)
  await addressEntry.scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${SHOTS}/fiche-hist-detail.png` })

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
})
