import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { ShortcutProvider } from '@/shared/keyboard'
import { NavigationShortcuts } from './navigation-shortcuts'

function LocationProbe() {
  const location = useLocation()
  return <span data-testid="loc">{location.pathname}</span>
}

function renderApp(initial: string) {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <ShortcutProvider>
        <NavigationShortcuts />
        <LocationProbe />
        <Routes>
          <Route path="/parties" element={<div>Parties</div>} />
          <Route path="/bookings" element={<div>Bookings</div>} />
        </Routes>
      </ShortcutProvider>
    </MemoryRouter>
  )
}

describe('NavigationShortcuts — navigation globale g→touche', () => {
  it('g puis b navigue vers /bookings depuis /parties (le bug signalé)', () => {
    renderApp('/parties')
    expect(screen.getByTestId('loc')).toHaveTextContent('/parties')

    fireEvent.keyDown(document.body, { code: 'KeyG', key: 'g' })
    fireEvent.keyDown(document.body, { code: 'KeyB', key: 'b' })

    expect(screen.getByTestId('loc')).toHaveTextContent('/bookings')
  })

  it('g puis p navigue vers /parties depuis /bookings', () => {
    renderApp('/bookings')
    fireEvent.keyDown(document.body, { code: 'KeyG', key: 'g' })
    fireEvent.keyDown(document.body, { code: 'KeyP', key: 'p' })
    expect(screen.getByTestId('loc')).toHaveTextContent('/parties')
  })

  it('la position prime : g puis touche produisant « b » en arabe navigue aussi', () => {
    renderApp('/parties')
    // Disposition arabe : la touche physique B produit un autre caractère.
    fireEvent.keyDown(document.body, { code: 'KeyG', key: 'ي' })
    fireEvent.keyDown(document.body, { code: 'KeyB', key: 'لا' })
    expect(screen.getByTestId('loc')).toHaveTextContent('/bookings')
  })
})
