import { describe, expect, it } from 'vitest'
import { formatJam, formatTanggal, formatTanggalJam, statusLabel } from '../format'

describe('formatTanggal', () => {
  it('formats a valid ISO date to Indonesian locale', () => {
    const result = formatTanggal('2025-08-17T00:00:00Z')
    // Should contain day, short month, and year
    expect(result).toMatch(/17/)
    expect(result).toMatch(/2025/)
    // Indonesian short month for August
    expect(result).toMatch(/Agu/)
  })

  it('returns the raw string for invalid dates', () => {
    expect(formatTanggal('bukan-tanggal')).toBe('bukan-tanggal')
  })
})

describe('formatTanggalJam', () => {
  it('formats a valid ISO datetime with date and time', () => {
    const result = formatTanggalJam('2025-08-17T07:30:00Z')
    // Should contain day and short month
    expect(result).toMatch(/17/)
    expect(result).toMatch(/Agu/)
    // Should contain time digits
    expect(result).toMatch(/\d{1,2}[.:]\d{2}/)
  })

  it('returns the raw string for invalid dates', () => {
    expect(formatTanggalJam('invalid')).toBe('invalid')
  })
})

describe('formatJam', () => {
  it('truncates Postgres TIME to HH:MM', () => {
    expect(formatJam('07:00:00')).toBe('07:00')
  })

  it('truncates another time value', () => {
    expect(formatJam('14:30:45')).toBe('14:30')
  })

  it('passes through HH:MM as-is', () => {
    expect(formatJam('09:15')).toBe('09:15')
  })
})

describe('statusLabel', () => {
  it('returns "Terkumpul" for "dikumpulkan"', () => {
    expect(statusLabel('dikumpulkan')).toBe('Terkumpul')
  })

  it('returns "Terlambat" for "terlambat"', () => {
    expect(statusLabel('terlambat')).toBe('Terlambat')
  })

  it('returns "Dinilai" for "dinilai"', () => {
    expect(statusLabel('dinilai')).toBe('Dinilai')
  })

  it('returns "Belum dikumpulkan" for null', () => {
    expect(statusLabel(null)).toBe('Belum dikumpulkan')
  })

  it('returns "Belum dikumpulkan" for unknown status', () => {
    expect(statusLabel('entah')).toBe('Belum dikumpulkan')
  })
})
