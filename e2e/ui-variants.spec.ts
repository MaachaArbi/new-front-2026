import { test } from '@playwright/test'
import fs from 'node:fs'

/** Capture des 2 directions visuelles proposées sur `/_ui` (page jetable). */
const SHOTS = 'e2e/screenshots'
const EMAIL = 'karim.belhadj@demo.ostravel.tn'
const PASSWORD = 'Demo-2026-OsTravel'

test.use({ viewport: { width: 1500, height: 1400 } })
test.beforeAll(() => fs.mkdirSync(SHOTS, { recursive: true }))

test('variantes UI', async ({ page }) => {
  test.setTimeout(90_000)
  await page.goto('/')
  await page.fill('#login-email', EMAIL)
  await page.fill('#login-password', PASSWORD)
  await page.getByRole('button', { name: /se connecter/i }).click()
  await page.waitForURL((u) => !u.pathname.match(/login|^\/$/), { timeout: 20000 })
  await page.goto('/_ui')
  await page.waitForTimeout(3000) // laisse charger les polices distantes

  await page.getByRole('button', { name: /variante A/i }).click()
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${SHOTS}/ui-variante-A.png`, fullPage: true })

  await page.getByRole('button', { name: /variante B/i }).click()
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${SHOTS}/ui-variante-B.png`, fullPage: true })
})
