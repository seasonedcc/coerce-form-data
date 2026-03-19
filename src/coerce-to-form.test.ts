import { describe, expect, it } from 'vitest'
import { coerceToForm } from './coerce-to-form'
import type { FieldDescriptor } from './types'

describe('coerceToForm', () => {
  it('handles boolean values', () => {
    const field: FieldDescriptor = { type: 'boolean' }
    expect(coerceToForm(true, field)).toBe(true)
    expect(coerceToForm('', field)).toBe(false)
  })

  it('formats dates as YYYY-MM-DD strings using local time', () => {
    const field: FieldDescriptor = { type: 'date' }
    const date = new Date(2024, 4, 6)
    expect(coerceToForm(date, field)).toBe('2024-05-06')
    expect(coerceToForm(undefined, field)).toBeUndefined()
  })

  it('formats datetimes as YYYY-MM-DDTHH:mm:ss strings', () => {
    const field: FieldDescriptor = { type: 'datetime' }
    const date = new Date(2024, 4, 6, 14, 30, 45)
    expect(coerceToForm(date, field)).toBe('2024-05-06T14:30:45')
    expect(coerceToForm(undefined, field)).toBeUndefined()
  })

  it('casts strings, numbers and enums to strings', () => {
    expect(coerceToForm('foo', { type: 'string' })).toBe('foo')
    expect(coerceToForm(undefined, { type: 'string' })).toBe('')
    expect(coerceToForm(5, { type: 'number' })).toBe('5')
    expect(coerceToForm('a', { type: 'enum' })).toBe('a')
  })

  it('formats string-array as string array', () => {
    expect(coerceToForm(['a', 'b'], { type: 'string-array' })).toEqual([
      'a',
      'b',
    ])
    expect(coerceToForm(undefined, { type: 'string-array' })).toEqual([])
  })

  it('formats number-array as string array', () => {
    expect(coerceToForm([1, 2], { type: 'number-array' })).toEqual(['1', '2'])
    expect(coerceToForm(undefined, { type: 'number-array' })).toEqual([])
  })

  it('formats date-array as YYYY-MM-DD string array', () => {
    const dates = [new Date(2024, 0, 1), new Date(2024, 5, 15)]
    expect(coerceToForm(dates, { type: 'date-array' })).toEqual([
      '2024-01-01',
      '2024-06-15',
    ])
    expect(coerceToForm(undefined, { type: 'date-array' })).toEqual([])
  })

  it('formats datetime-array as YYYY-MM-DDTHH:mm:ss string array', () => {
    const dates = [
      new Date(2024, 0, 1, 10, 0, 0),
      new Date(2024, 5, 15, 14, 30, 0),
    ]
    expect(coerceToForm(dates, { type: 'datetime-array' })).toEqual([
      '2024-01-01T10:00:00',
      '2024-06-15T14:30:00',
    ])
    expect(coerceToForm(undefined, { type: 'datetime-array' })).toEqual([])
  })

  it('returns the value or empty string for unknown type', () => {
    expect(coerceToForm('hello', { type: null })).toBe('hello')
    expect(coerceToForm(undefined, { type: null })).toBe('')
  })
})
