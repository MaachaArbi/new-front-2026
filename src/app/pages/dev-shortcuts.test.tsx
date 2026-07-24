import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '@/app/providers/i18n-provider'
import { ShortcutProvider } from '@/shared/keyboard'
import { DevShortcutsPage } from './dev-shortcuts'

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/_dev/shortcuts']}>
      <I18nProvider>
        <ShortcutProvider>
          <DevShortcutsPage />
        </ShortcutProvider>
      </I18nProvider>
    </MemoryRouter>
  )
}

describe('DevShortcutsPage', () => {
  beforeEach(() => localStorage.clear())

  it('liste les raccourcis extraits du registre (séquences enregistrées en direct)', async () => {
    renderPage()
    // Les séquences de démo (g→p, g→b) sont enregistrées via le socle réel puis
    // extraites du registre (rAF) — libellés fr par défaut.
    expect(await screen.findByText('Aller aux Tiers')).toBeInTheDocument()
    expect(screen.getByText('Aller aux Réservations')).toBeInTheDocument()
  })

  it("la zone d'essai affiche event.code ET event.key (position vs caractère)", () => {
    renderPage()
    const tester = screen.getByRole('button', {
      name: /cadre/i,
    })
    // Touche physique R en disposition arabe : code stable, caractère différent.
    fireEvent.keyDown(tester, { code: 'KeyR', key: 'ق' })
    expect(screen.getByText('KeyR')).toBeInTheDocument()
    expect(screen.getByText('ق')).toBeInTheDocument()
  })
})
