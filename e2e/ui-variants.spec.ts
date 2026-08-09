import { test } from '@playwright/test'
import { autoSignOut, signIn } from './session'
import fs from 'node:fs'

autoSignOut()

/** Capture des 2 directions visuelles proposées sur `/_ui` (page jetable). */
const SHOTS = 'e2e/screenshots'

test.use({ viewport: { width: 1500, height: 1400 } })
test.beforeAll(() => fs.mkdirSync(SHOTS, { recursive: true }))

test('variantes UI', async ({ page }) => {
  test.setTimeout(90_000)
  await signIn(page)
  await page.screenshot({ path: `${SHOTS}/ui-variante-A.png`, fullPage: true })

  await page.getByRole('button', { name: /variante B/i }).click()
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${SHOTS}/ui-variante-B.png`, fullPage: true })

})
