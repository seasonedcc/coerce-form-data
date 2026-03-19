import { describe, expect, it } from 'vitest'
import { parseDatetime } from './parse-datetime'

describe('parseDatetime', () => {
  it('returns undefined when value is falsy', () => {
    expect(parseDatetime()).toBeUndefined()
  })

  it('formats Date instances as YYYY-MM-DDTHH:mm:ss strings using local time', () => {
    const date = new Date(2024, 0, 2, 10, 20, 30)
    expect(parseDatetime(date)).toBe('2024-01-02T10:20:30')
  })

  it('zero-pads single-digit components', () => {
    const date = new Date(2024, 2, 5, 3, 7, 9)
    expect(parseDatetime(date)).toBe('2024-03-05T03:07:09')
  })

  it('returns string values as-is', () => {
    expect(parseDatetime('2024-05-06T14:30')).toBe('2024-05-06T14:30')
    expect(parseDatetime('2024-05-06T14:30:45')).toBe('2024-05-06T14:30:45')
  })
})
