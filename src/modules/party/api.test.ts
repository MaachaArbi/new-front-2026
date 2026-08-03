import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/shared/auth/session', () => ({ authedRequest: vi.fn() }))
import { authedRequest } from '@/shared/auth/session'
import { listPartyAccounts, getPartyAccount, getPartyAddresses } from './api'

const mock = vi.mocked(authedRequest)
beforeEach(() => mock.mockReset())

describe('party api', () => {
  it('liste : endpoint + query passée telle quelle', async () => {
    mock.mockResolvedValueOnce({
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 1 },
    })
    await listPartyAccounts({
      page: 1,
      limit: 20,
      nature: 'person',
      search: '',
    })
    expect(mock).toHaveBeenCalledWith('GET', '/party-accounts', {
      query: { page: 1, limit: 20, nature: 'person', search: '' },
    })
  })

  it('détail : endpoint avec publicId', async () => {
    mock.mockResolvedValueOnce({
      publicId: 'p-1',
      nature: 'person',
      displayName: 'X',
      email: null,
    })
    await getPartyAccount('p-1')
    expect(mock).toHaveBeenCalledWith('GET', '/party-accounts/p-1')
  })

  it('adresses : renvoie le tableau sous data', async () => {
    mock.mockResolvedValueOnce({
      data: [
        {
          publicId: 'a-1',
          addressType: 'billing',
          line1: '12 rue',
          line2: null,
          city: 'Tunis',
          postalCode: '1001',
          countryAlpha2: 'TN',
          isPrimary: true,
        },
      ],
    })
    const result = await getPartyAddresses('p-1')
    expect(mock).toHaveBeenCalledWith('GET', '/party-accounts/p-1/addresses')
    expect(result).toHaveLength(1)
    expect(result[0]?.countryAlpha2).toBe('TN')
  })
})
