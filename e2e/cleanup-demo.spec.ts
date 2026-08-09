import { test } from '@playwright/test'
import { signIn, signOut } from './session'

/**
 * NETTOYAGE — retire de la fiche Sahara les interlocuteurs techniques attrapés par
 * erreur au semis (comptes anonymisés RGPD, comptes d'authentification). Un jeu de
 * démo doit ressembler à de vraies données, sinon il dessert la démo.
 *
 * On cible le bouton « Retirer l'interlocuteur » puis on lit le texte de SA ligne
 * (parent direct) — chercher le texte d'abord donnait des conteneurs trop larges.
 */
const BAD = /anonymis|adr auth|auth\s|#\d{5,}/i

test('nettoyer les interlocuteurs parasites', async ({ page }) => {
  test.setTimeout(120_000)
  await signIn(page)
  const s = page.getByPlaceholder(/rechercher un tiers/i)
  if ((await s.count()) > 0) {
    await s.fill('sahara')
    await page.waitForTimeout(1500)
  }
  await page.locator('table tbody tr').first().click()
  await page.waitForTimeout(2500)
  await page.getByRole('tab', { name: /contacts & équipe/i }).click()
  await page.waitForTimeout(1500)

  for (let pass = 0; pass < 8; pass += 1) {
    const btns = page.getByRole('button', { name: /retirer l'interlocuteur/i })
    const n = await btns.count()
    let removed = false
    for (let j = 0; j < n; j += 1) {
      const btn = btns.nth(j)
      const row = btn.locator('xpath=..')
      const txt = (await row.innerText().catch(() => '')).trim()
      if (BAD.test(txt)) {
        console.log('CLEAN retire → ' + txt.replace(/\s+/g, ' ').slice(0, 60))
        await btn.click()
        await page.waitForTimeout(1800)
        removed = true
        break
      }
    }
    if (!removed) break
  }
  const left = await page.evaluate(() => document.body.innerText)
  console.log('CLEAN parasites restants : ' + (BAD.test(left) ? 'OUI' : 'non'))
  await page.screenshot({ path: 'e2e/screenshots/cleanup-result.png' })

  await signOut(page)
})
