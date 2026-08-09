import { test, type Page } from '@playwright/test'
import { autoSignOut, signIn } from './session'

autoSignOut()

/**
 * JEU DE DÉMO — étoffe « Groupe Sahara Voyages » via l'INTERFACE (donc en respectant
 * toutes les validations métier). On ne crée que ce qu'un utilisateur pourrait créer.
 *
 * Sélecteurs par LIBELLÉ (jamais par position) : c'est ce qui manquait à la V1 du
 * script — le champ « Montant » était rempli à la place de « Valide au », et la devise
 * (requise) restait vide, d'où un bouton « Enregistrer » désactivé.
 *
 * Blocs isolables : SEED_ONLY=plafonds|docs|contacts npx playwright test e2e/seed-demo…
 */
// Comptes démo limités à 3 sessions : rotation via SEED_USER si besoin.
const ONLY = process.env.SEED_ONLY ?? 'all'
const run = (block: string) => ONLY === 'all' || ONLY === block
const log = (m: string) => console.log('SEED ' + m)

async function openSahara(page: Page) {
  await signIn(page)
  const search = page.getByPlaceholder(/rechercher un tiers/i)
  if ((await search.count()) > 0) {
    await search.fill('sahara')
    await page.waitForTimeout(1500)
  }
  await page.locator('table tbody tr').first().click()
  await page.waitForTimeout(2500)
}

test('semer les données de démo', async ({ page }) => {
  test.setTimeout(120_000)
  await openSahara(page)
  const save = () => page.getByRole('button', { name: /^enregistrer$/i }).click()
  // Les champs sont cherchés DANS la boîte de dialogue : « Devise » existe aussi
  // dans le rail derrière (« Devise d'affichage »), d'où une ambiguïté sinon.
  const field = (re: RegExp | string) => page.getByRole('dialog').getByLabel(re)

  /* ── PLAFONDS : une 2ᵉ portée (Vol) — socle permanent + rallonge datée ── */
  if (run('plafonds')) {
    await page.getByRole('tab', { name: /^finance$/i }).click()
    await page.waitForTimeout(1200)
    const already = await page.evaluate(() => document.body.innerText)
    if (already.includes('Vol')) {
      log('portée Vol déjà présente')
    } else {
      for (const [amount, validTo] of [
        ['200000', ''], // socle permanent
        ['50000', '2026-12-31'], // rallonge qui expire
      ] as const) {
        await page.getByRole('button', { name: /ajouter un plafond/i }).click()
        await page.waitForTimeout(800)
        await field('Société').selectOption({ label: 'myGO Tunis-Arbi' })
        await field(/^Devise/).selectOption({ label: 'TND — Dinar tunisien' })
        await field(/Type de service/).selectOption({ label: 'Vol' })
        await field(/^Montant/).fill(amount)
        if (validTo) await field(/^Valide au/).fill(validTo)
        await save()
        await page.waitForTimeout(1800)
        log(`plafond Vol ${amount}${validTo ? ' (rallonge)' : ' (socle)'}`)
      }
    }
  }

  /* ── DOCUMENTS : couvre les statuts d'expiration ── */
  if (run('docs')) {
    await page.getByRole('tab', { name: /^documents$/i }).click()
    await page.waitForTimeout(1200)
    const docs = await page.evaluate(() => document.body.innerText)
    const wanted: [string, string, string][] = [
      ['CIN', '09 123 456', '2031-05-20'], // valide
      ['Contrat', 'CTR-2026-014', '2026-08-25'], // expire bientôt
    ]
    for (const [type, num, expiry] of wanted) {
      if (docs.includes(num)) continue
      await page.getByRole('button', { name: /ajouter un document/i }).click()
      await page.waitForTimeout(800)
      await field(/^Type/).selectOption({ label: type })
      await field(/^Numéro/).fill(num)
      await field(/expiration/i).fill(expiry)
      await save()
      await page.waitForTimeout(1800)
      log(`document ${type}`)
    }
  }

  /* ── INTERLOCUTEURS : plusieurs contacts chez le client ──
     Le panneau se valide avec « Ajouter » (pas « Enregistrer ») : c'est ce qui
     faisait échouer la V1 du script. Flux : chercher → choisir → fonction → Ajouter. */
  if (run('contacts')) {
    await page.getByRole('tab', { name: /contacts & équipe/i }).click()
    await page.waitForTimeout(1200)
    for (const term of ['a', 'e', 'o']) {
      const add = page.getByRole('button', { name: /ajouter un interlocuteur/i })
      if ((await add.count()) === 0) break
      await add.click()
      await page.waitForTimeout(900)
      const sheet = page.getByRole('dialog')
      await sheet.getByRole('textbox').first().fill(term)
      await page.waitForTimeout(1800)
      // Les résultats sont des boutons « nom + e-mail » dans la liste du panneau.
      const results = sheet.locator('ul button')
      if ((await results.count()) === 0) {
        await page.keyboard.press('Escape')
        await page.waitForTimeout(400)
        log(`interlocuteur « ${term} » : aucun résultat`)
        continue
      }
      await results.first().click()
      await page.waitForTimeout(600)
      const submit = sheet.getByRole('button', { name: /^ajouter$/i })
      if ((await submit.count()) === 0) {
        await page.keyboard.press('Escape')
        log(`interlocuteur « ${term} » : bouton absent`)
        continue
      }
      await submit.click()
      await page.waitForTimeout(2000)
      const stillOpen = await sheet.count()
      log(`interlocuteur « ${term} » ${stillOpen ? '— panneau encore ouvert (doublon ?)' : 'ajouté'}`)
      if (stillOpen) {
        await page.keyboard.press('Escape')
        await page.waitForTimeout(400)
      }
    }
  }

  await page.screenshot({ path: 'e2e/screenshots/seed-result.png', fullPage: true })
  log('terminé')

})
