import { describe, expect, it } from 'vitest'
import { parseDate } from './parse-date'

describe('parseDate', () => {
  it('returns undefined when value is falsy', () => {
    expect(parseDate()).toBeUndefined()
  })

  it('formats Date instances as YYYY-MM-DD strings using local time', () => {
    const date = new Date(2024, 0, 2, 10, 20, 30)
    expect(parseDate(date)).toBe('2024-01-02')
  })

  it('zero-pads single-digit months and days', () => {
    const date = new Date(2024, 2, 5)
    expect(parseDate(date)).toBe('2024-03-05')
  })

  it('extracts the date portion from ISO strings', () => {
    expect(parseDate('2024-05-06T07:08:09Z')).toBe('2024-05-06')
  })

  it('keeps YYYY-MM-DD strings as is', () => {
    expect(parseDate('2024-05-06')).toBe('2024-05-06')
  })
})
