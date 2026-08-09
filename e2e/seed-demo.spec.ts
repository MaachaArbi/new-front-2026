import { test } from '@playwright/test'

/**
 * JEU DE DÉMO — étoffe la fiche « Groupe Sahara Voyages » via l'INTERFACE (donc en
 * respectant toutes les validations métier). Aucune donnée inventée côté back : on
 * crée ce que l'utilisateur pourrait créer lui-même.
 * Idempotent-ish : chaque bloc est sauté si l'élément semble déjà présent.
 * À relancer à la demande ; ce n'est pas un test de non-régression.
 */
const EMAIL = 'yasmine.gharbi@demo.ostravel.tn'
const PASSWORD = 'Demo-2026-OsTravel'

test('semer les données de démo', async ({ page }) => {
  test.setTimeout(180_000)
  await page.goto('/')
  await page.fill('#login-email', EMAIL)
  await page.fill('#login-password', PASSWORD)
  await page.getByRole('button', { name: /se connecter/i }).click()
  await page.waitForURL((u) => !u.pathname.match(/login|^\/$/), { timeout: 20000 })
  await page.goto('/parties')
  await page.waitForTimeout(1500)
  const search = page.getByPlaceholder(/rechercher un tiers/i)
  if ((await search.count()) > 0) {
    await search.fill('sahara')
    await page.waitForTimeout(1500)
  }
  await page.locator('table tbody tr').first().click()
  await page.waitForTimeout(2500)

  const save = () => page.getByRole('button', { name: /^enregistrer$/i }).click()
  const log = (m: string) => console.log('SEED ' + m)

  /* ── 1. PLAFONDS : une 2ᵉ portée (Vols) pour montrer le calcul par portée ── */
  await page.getByRole('tab', { name: /^finance$/i }).click()
  await page.waitForTimeout(1200)
  const body = await page.evaluate(() => document.body.innerText)
  if (!body.includes('Vols')) {
    for (const [service, amount] of [
      ['Vols', '200000'],
      ['Vols', '50000'],
    ] as const) {
      await page.getByRole('button', { name: /ajouter un plafond/i }).click()
      await page.waitForTimeout(700)
      const selects = page.locator('[role="dialog"] select, .fixed select')
      if ((await selects.count()) >= 2) {
        await selects.nth(1).selectOption({ label: service }).catch(() => {})
      }
      const amountInput = page.locator('[role="dialog"] input, .fixed input').last()
      await amountInput.fill(amount)
      await save()
      await page.waitForTimeout(1500)
      log(`plafond ${service} ${amount}`)
    }
  } else log('plafonds Vols déjà présents')

  /* ── 2. EXONÉRATION supplémentaire ── */
  const addExo = page.getByRole('button', { name: /ajouter une exonération/i })
  if ((await addExo.count()) > 0) {
    await addExo.click()
    await page.waitForTimeout(700)
    await save()
    await page.waitForTimeout(1500)
    log('exonération ajoutée')
  }

  /* ── 3. APPROBATION : un validateur de plus ── */
  const addApproval = page.getByRole('button', { name: /ajouter une approbation/i })
  if ((await addApproval.count()) > 0) {
    await addApproval.click()
    await page.waitForTimeout(900)
    const q = page.locator('[role="dialog"] input, .fixed input').first()
    await q.fill('a')
    await page.waitForTimeout(1500)
    const first = page.locator('[role="dialog"] button, .fixed button').filter({ hasText: /@/ }).first()
    if ((await first.count()) > 0) {
      await first.click()
      await page.waitForTimeout(500)
      await save()
      await page.waitForTimeout(1500)
      log('approbation ajoutée')
    } else {
      await page.keyboard.press('Escape')
      log('approbation : aucun validateur trouvé')
    }
  }

  /* ── 4. INTERLOCUTEURS : plusieurs contacts chez le client ── */
  await page.getByRole('tab', { name: /contacts & équipe/i }).click()
  await page.waitForTimeout(1200)
  const addContact = page.getByRole('button', { name: /ajouter un interlocuteur/i })
  for (const term of ['a', 'e', 'i']) {
    if ((await addContact.count()) === 0) break
    await addContact.click()
    await page.waitForTimeout(900)
    const q = page.locator('[role="dialog"] input, .fixed input').first()
    await q.fill(term)
    await page.waitForTimeout(1600)
    const candidate = page.locator('[role="dialog"] button, .fixed button').filter({ hasText: /@/ }).first()
    if ((await candidate.count()) > 0) {
      await candidate.click()
      await page.waitForTimeout(600)
      await save()
      await page.waitForTimeout(1600)
      log(`interlocuteur « ${term} »`)
    } else {
      await page.keyboard.press('Escape')
      await page.waitForTimeout(400)
    }
  }

  /* ── 5. DOCUMENTS : couvre les 3 statuts d'expiration ── */
  await page.getByRole('tab', { name: /^documents$/i }).click()
  await page.waitForTimeout(1000)
  const docs = await page.evaluate(() => document.body.innerText)
  const wanted: [string, string, string][] = [
    ['CIN', '09 123 456', '2031-05-20'],
    ['Contrat', 'CTR-2026-014', '2026-08-25'],
  ]
  for (const [type, num, expiry] of wanted) {
    if (docs.includes(num)) continue
    await page.getByRole('button', { name: /ajouter un document/i }).click()
    await page.waitForTimeout(800)
    const typeSelect = page.locator('[role="dialog"] select, .fixed select').first()
    await typeSelect.selectOption({ label: type }).catch(() => {})
    await page.getByLabel(/^numéro$/i).fill(num)
    await page.locator('input[type="date"]').last().fill(expiry)
    await save()
    await page.waitForTimeout(1500)
    log(`document ${type}`)
  }

  await page.screenshot({ path: 'e2e/screenshots/seed-result.png', fullPage: true })
  log('terminé')
})
