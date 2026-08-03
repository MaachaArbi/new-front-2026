import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('@/shared/auth/session', () => ({
  restoreSession: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}))
vi.mock('@/shared/auth/me', () => ({ fetchMe: vi.fn() }))

import { restoreSession, login as sessionLogin } from '@/shared/auth/session'
import { fetchMe, type Me } from '@/shared/auth/me'
import { AuthProvider, useAuth } from './auth-provider'

const me: Me = {
  publicId: 'p-1',
  displayName: 'Sofiane',
  email: 's@example.com',
  permissions: [],
  organizations: [],
}

function Probe() {
  const { status, me: identity, login } = useAuth()
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="name">{identity?.displayName ?? '-'}</span>
      <button onClick={() => void login('e@x', 'p')}>login</button>
    </div>
  )
}

function renderProvider() {
  return render(
    <AuthProvider>
      <Probe />
    </AuthProvider>
  )
}

beforeEach(() => {
  vi.mocked(restoreSession).mockReset()
  vi.mocked(sessionLogin).mockReset()
  vi.mocked(fetchMe).mockReset()
})

describe('AuthProvider', () => {
  it('reprise de session : cookie valide → authentifié + /me', async () => {
    vi.mocked(restoreSession).mockResolvedValue(true)
    vi.mocked(fetchMe).mockResolvedValue(me)

    renderProvider()

    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated')
    )
    expect(screen.getByTestId('name')).toHaveTextContent('Sofiane')
  })

  it('reprise de session : pas de cookie → non authentifié', async () => {
    vi.mocked(restoreSession).mockResolvedValue(false)

    renderProvider()

    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated')
    )
    expect(fetchMe).not.toHaveBeenCalled()
  })

  it('login : connexion puis /me → authentifié', async () => {
    vi.mocked(restoreSession).mockResolvedValue(false)
    vi.mocked(sessionLogin).mockResolvedValue(undefined)
    vi.mocked(fetchMe).mockResolvedValue({ ...me, displayName: 'Ali' })

    renderProvider()
    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated')
    )

    fireEvent.click(screen.getByText('login'))

    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated')
    )
    expect(screen.getByTestId('name')).toHaveTextContent('Ali')
    expect(sessionLogin).toHaveBeenCalledWith('e@x', 'p')
  })
})
