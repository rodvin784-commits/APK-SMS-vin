import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchMe, fetchTugas, fetchNilai } from '../api'

// Mock supabase agar tidak membuat koneksi asli.
vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signOut: vi.fn(),
    },
  },
}))

import { supabase } from '../supabase'

const mockGetSession = vi.mocked(supabase.auth.getSession)
const mockSignOut = vi.mocked(supabase.auth.signOut)

// Helper: stub getSession agar mengembalikan token valid.
function stubAuth(token = 'test-token') {
  mockGetSession.mockResolvedValue({
    data: { session: { access_token: token } as never },
    error: null,
  })
}

// Helper: stub fetch global agar mengembalikan Response tertentu.
function stubFetch(body: unknown, init: { status?: number; ok?: boolean } = {}) {
  const { status = 200, ok = true } = init
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      status,
      ok,
      json: () => Promise.resolve(body),
    }),
  )
}

beforeEach(() => {
  vi.restoreAllMocks()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// ---------------------------------------------------------------------------
// Alur 401 – sesi berakhir
// ---------------------------------------------------------------------------

describe('401 handling', () => {
  it('throws error with status 401 when session is missing', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    try {
      await fetchMe()
      expect.fail('seharusnya throw')
    } catch (err) {
      const e = err as Error & { status?: number }
      expect(e.status).toBe(401)
      expect(e.message).toMatch(/Sesi berakhir/)
    }
  })

  it('throws 401 and signs out when server returns 401', async () => {
    stubAuth()
    stubFetch({ error: 'Unauthorized' }, { status: 401, ok: false })

    try {
      await fetchMe()
      expect.fail('seharusnya throw')
    } catch (err) {
      const e = err as Error & { status?: number }
      expect(e.status).toBe(401)
      expect(e.message).toMatch(/Sesi berakhir/)
    }

    expect(mockSignOut).toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Error handling – jaringan & server
// ---------------------------------------------------------------------------

describe('error handling', () => {
  it('throws connection error when fetch fails (network down)', async () => {
    stubAuth()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    try {
      await fetchTugas()
      expect.fail('seharusnya throw')
    } catch (err) {
      const e = err as Error
      expect(e.message).toMatch(/koneksi/i)
    }
  })

  it('extracts error message from JSON error body', async () => {
    stubAuth()
    stubFetch({ error: 'Data tidak ditemukan' }, { status: 404, ok: false })

    try {
      await fetchNilai()
      expect.fail('seharusnya throw')
    } catch (err) {
      const e = err as Error & { status?: number }
      expect(e.status).toBe(404)
      expect(e.message).toBe('Data tidak ditemukan')
    }
  })

  it('falls back to generic message when error body has no "error" field', async () => {
    stubAuth()
    stubFetch({ message: 'oops' }, { status: 500, ok: false })

    try {
      await fetchNilai()
      expect.fail('seharusnya throw')
    } catch (err) {
      const e = err as Error & { status?: number }
      expect(e.status).toBe(500)
      expect(e.message).toMatch(/kesalahan server/i)
    }
  })
})

// ---------------------------------------------------------------------------
// Sukses
// ---------------------------------------------------------------------------

describe('successful requests', () => {
  it('fetchMe returns profile data', async () => {
    stubAuth()
    stubFetch({ id: '1', nama: 'Budi', email: 'budi@test.com' })

    const me = await fetchMe()
    expect(me).toEqual({ id: '1', nama: 'Budi', email: 'budi@test.com' })
  })

  it('fetchTugas returns tugas array from wrapped response', async () => {
    stubAuth()
    stubFetch({ tugas: [{ id: 't1', judul: 'Tugas 1' }] })

    const tugas = await fetchTugas()
    expect(tugas).toEqual([{ id: 't1', judul: 'Tugas 1' }])
  })

  it('sends Authorization header with Bearer token', async () => {
    stubAuth('my-token-123')
    stubFetch({ id: '1', nama: 'Budi', email: 'budi@test.com' })

    await fetchMe()

    const fetchMock = vi.mocked(fetch)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [, init] = fetchMock.mock.calls[0]
    expect((init?.headers as Record<string, string>)?.Authorization).toBe('Bearer my-token-123')
  })
})
