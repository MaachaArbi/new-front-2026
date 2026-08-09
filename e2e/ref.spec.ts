import { test } from '@playwright/test'
import { autoSignOut, signIn } from './session'
import fs from 'node:fs'

autoSignOut()

const SHOTS = 'e2e/screenshots'

test.use({ viewport: { width: 1600, height: 680 } })
test.beforeAll(() => fs.mkdirSync(SHOTS, { recursive: true }))

test('page jetable /_ref', async ({ page }) => {
  await signIn(page)
  await page.goto('/_ref')
  await page.waitForTimeout(2500)
  const diag = await page.evaluate(() => {
    const el = document.querySelector('.ref-scroll') as HTMLElement | null
    const styles = Array.from(document.querySelectorAll('style'))
    return {
      found: !!el,
      overflowY: el ? getComputedStyle(el).overflowY : null,
      scrollbarWidthPx: el ? el.offsetWidth - el.clientWidth : null,
      hasScrollbarCss: styles.some((s) =>
        (s.textContent || '').includes('webkit-scrollbar')
      ),
      styleCount: styles.length,
    }
  })
  console.log('DIAG ' + JSON.stringify(diag))
  await page.screenshot({ path: `${SHOTS}/ref-mockup.png`, fullPage: true })
  // Scroll l'Overview : Activité récente + Interlocuteurs + Chargés.
  await page.mouse.move(700, 400)
  await page.mouse.wheel(0, 520)
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${SHOTS}/ref-overview-b.png` })
  await page.mouse.wheel(0, 520)
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${SHOTS}/ref-overview-c.png` })
  await page.mouse.wheel(0, -1100)
  await page.waitForTimeout(300)
  // Onglet Finance : tableau Plafonds de crédit.
  await page.getByRole('button', { name: /finance/i }).first().click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${SHOTS}/ref-finance.png` })
  // Scroll le centre pour voir la V2.
  await page.mouse.move(700, 400)
  await page.mouse.wheel(0, 520)
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${SHOTS}/ref-finance-v2.png` })
  await page.mouse.wheel(0, 600)
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${SHOTS}/ref-finance-v2b.png` })
  // Onglet Historique.
  await page.getByRole('button', { name: /historique/i }).first().click()
  await page.mouse.move(700, 400)
  await page.mouse.wheel(0, -2000)
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${SHOTS}/ref-historique.png` })
  // Onglet Contacts & équipe.
  await page.getByRole('button', { name: /contacts & équipe/i }).first().click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${SHOTS}/ref-contacts.png` })
  // Notes.
  await page.getByRole('button', { name: /^notes$/i }).first().click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${SHOTS}/ref-notes.png` })
  // Tâches.
  await page.getByRole('button', { name: /tâches/i }).first().click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${SHOTS}/ref-taches.png` })
  // Documents.
  await page.getByRole('button', { name: /documents/i }).first().click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${SHOTS}/ref-documents.png` })

})
