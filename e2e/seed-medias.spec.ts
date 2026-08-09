import { test } from '@playwright/test'
import { autoSignOut, signIn } from './session'

autoSignOut()

/**
 * MÉDIAS DE DÉMO — pose le logo de l'agence et dépose les scans fournis par Arbi.
 * Fichiers source : /home/ubuntu/vendor-metronic/sample docs
 * (Le CORS du seau R2 doit être posé — vérifié le 09/08/2026.)
 */
const DIR = '/home/ubuntu/vendor-metronic/sample docs'
const LOGO = `${DIR}/Logo-vibrant-du-voyage-au-Sahara-small.png`
const RC = `${DIR}/RC.webp`
const CONTRAT = `${DIR}/RezLive NDA - International.pdf`


test('semer les médias', async ({ page }) => {
  test.setTimeout(180_000)
  const log = (m: string) => console.log('MEDIA ' + m)

  await signIn(page)
  const search = page.getByPlaceholder(/rechercher un tiers/i)
  if ((await search.count()) > 0) {
    await search.fill('sahara')
    await page.waitForTimeout(1500)
  }
  await page.locator('table tbody tr').first().click()
  await page.waitForTimeout(2500)

  /* ── LOGO de l'agence : bouton logo → « Changer » → fichier → éditeur → Appliquer ── */
  await page.getByRole('button', { name: /logo|éditer le logo/i }).first().click()
  await page.waitForTimeout(600)
  const change = page.getByRole('menuitem').first()
  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    change.click(),
  ])
  await chooser.setFiles(LOGO)
  await page.waitForTimeout(2500) // chargement + éditeur
  const apply = page.getByRole('button', { name: /^appliquer$/i })
  if ((await apply.count()) > 0) {
    await apply.click()
    await page.waitForTimeout(6000) // 3 temps : présigné → PUT R2 → confirmation
    log('logo déposé')
  } else log('éditeur d’image non ouvert')

  /* ── SCANS sur les documents existants ── */
  await page.getByRole('tab', { name: /^documents$/i }).click()
  await page.waitForTimeout(1500)

  // On dépose un scan sur chaque document qui n'en a pas (RC.webp puis le PDF).
  const files = [RC, CONTRAT]
  for (const file of files) {
    const deposit = page.getByRole('button', { name: /déposer un scan/i }).first()
    if ((await deposit.count()) === 0) {
      log('plus de document sans scan')
      break
    }
    const [c] = await Promise.all([
      page.waitForEvent('filechooser'),
      deposit.click(),
    ])
    await c.setFiles(file)
    await page.waitForTimeout(6000)
    log(`scan déposé : ${file.split('/').pop()}`)
  }

  await page.screenshot({ path: 'e2e/screenshots/medias-result.png', fullPage: true })
  log('terminé')

})
