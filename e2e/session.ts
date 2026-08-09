import type { Page } from '@playwright/test'

/**
 * Connexion / déconnexion pour les tests.
 *
 * Pourquoi une déconnexion explicite : l'API n'autorise que **trois sessions
 * simultanées** par compte, et fermer le navigateur ne révoque pas le jeton de
 * rafraîchissement — la session reste ouverte côté serveur. Sans `signOut`, quelques
 * lancements suffisent à bloquer un compte de démo, et l'échec ressemble alors à une
 * panne d'API. Chaque test doit rendre la session qu'il a prise.
 */

const PASSWORD = 'Demo-2026-OsTravel'

/** Compte de démo utilisé ; surchargeable pour tourner entre les comptes. */
export const DEMO_USER = process.env.E2E_USER
  ? process.env.E2E_USER
  : `${process.env.SEED_USER ?? 'salma.ben.amor'}@demo.ostravel.tn`

export async function signIn(page: Page, email = DEMO_USER): Promise<void> {
  await page.goto('/login')
  await page.fill('#login-email', email)
  await page.fill('#login-password', PASSWORD)
  await page.getByRole('button', { name: /se connecter/i }).click()
  // L'application rend le tableau de bord sans changer d'URL : on attend le menu.
  await page.getByPlaceholder(/rechercher/i).waitFor({ timeout: 20000 })
  await page.waitForTimeout(1000)
}

export async function signOut(page: Page): Promise<void> {
  // `page.request` partage les cookies du navigateur : le cookie de rafraîchissement
  // part avec l'appel, le serveur révoque la session.
  const base = new URL(page.url()).origin
  await page
    .request!.post('http://localhost:8080/api/v1/auth/logout', {
      headers: { Origin: base },
    })
    .catch(() => undefined)
}
