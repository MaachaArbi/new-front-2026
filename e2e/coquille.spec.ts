import { test } from '@playwright/test'

test.use({ viewport: { width: 1600, height: 1000 } })

/** La coquille seule — clair, sombre, repliée, arabe, densités. */
test('coquille', async ({ page }) => {
  test.setTimeout(120_000)
  const shot = async (name: string) => {
    await page.waitForTimeout(700)
    await page.screenshot({ path: `e2e/screenshots/coquille-${name}.png` })
  }
  const set = async (obj: Record<string, string>) => {
    await page.evaluate((o) => {
      for (const [k, v] of Object.entries(o)) localStorage.setItem(k, v)
    }, obj)
    await page.reload()
    await page.waitForTimeout(1200)
  }

  await page.goto('/parties')
  await page.waitForTimeout(1500)
  await shot('clair')

  await set({ 'ostravel-theme': 'dark' })
  await shot('sombre')

  await set({ 'ostravel-theme': 'light' })
  await page.getByRole('button', { name: /menu/i }).first().click()
  await shot('repliee')

  await set({ 'i18n-language': 'ar' })
  await shot('arabe')

  await set({ 'i18n-language': 'fr' })
  await page.evaluate(() => {
    document.documentElement.dataset.density = 'compact'
    document.documentElement.dataset.scale = 'small'
  })
  await shot('dense')
  await page.evaluate(() => {
    document.documentElement.dataset.density = 'cozy'
    document.documentElement.dataset.scale = 'large'
  })
  await shot('confort')
})
