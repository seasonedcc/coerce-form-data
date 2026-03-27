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

  it('returns undefined for file fields', () => {
    const field: FieldDescriptor = { type: 'file' }
    expect(coerceToForm(new File([], 'f'), field)).toBeUndefined()
    expect(coerceToForm(undefined, field)).toBeUndefined()
  })

  it('returns the value or empty string for unknown type', () => {
    expect(coerceToForm('hello', { type: null })).toBe('hello')
    expect(coerceToForm(undefined, { type: null })).toBe('')
  })
})

describe('coerceToForm with arrays', () => {
  it('formats string array', () => {
    expect(
      coerceToForm(['a', 'b'], { type: 'array', item: { type: 'string' } })
    ).toEqual(['a', 'b'])
    expect(
      coerceToForm(undefined, { type: 'array', item: { type: 'string' } })
    ).toEqual([])
  })

  it('formats number array as string array', () => {
    expect(
      coerceToForm([1, 2], { type: 'array', item: { type: 'number' } })
    ).toEqual(['1', '2'])
    expect(
      coerceToForm(undefined, { type: 'array', item: { type: 'number' } })
    ).toEqual([])
  })

  it('formats date array as YYYY-MM-DD string array', () => {
    const dates = [new Date(2024, 0, 1), new Date(2024, 5, 15)]
    expect(
      coerceToForm(dates, { type: 'array', item: { type: 'date' } })
    ).toEqual(['2024-01-01', '2024-06-15'])
    expect(
      coerceToForm(undefined, { type: 'array', item: { type: 'date' } })
    ).toEqual([])
  })

  it('formats datetime array as YYYY-MM-DDTHH:mm:ss string array', () => {
    const dates = [
      new Date(2024, 0, 1, 10, 0, 0),
      new Date(2024, 5, 15, 14, 30, 0),
    ]
    expect(
      coerceToForm(dates, { type: 'array', item: { type: 'datetime' } })
    ).toEqual(['2024-01-01T10:00:00', '2024-06-15T14:30:00'])
    expect(
      coerceToForm(undefined, { type: 'array', item: { type: 'datetime' } })
    ).toEqual([])
  })

  it('formats nested arrays (array of arrays)', () => {
    expect(
      coerceToForm(
        [
          [1, 2],
          [3, 4],
        ],
        { type: 'array', item: { type: 'array', item: { type: 'number' } } }
      )
    ).toEqual([
      ['1', '2'],
      ['3', '4'],
    ])
  })

  it('formats array of objects', () => {
    expect(
      coerceToForm(
        [
          { name: 'Eng', count: 50 },
          { name: 'Sales', count: 30 },
        ],
        {
          type: 'array',
          item: {
            type: 'object',
            fields: {
              name: { type: 'string' },
              count: { type: 'number' },
            },
          },
        }
      )
    ).toEqual([
      { name: 'Eng', count: '50' },
      { name: 'Sales', count: '30' },
    ])
  })
})

describe('coerceToForm with objects', () => {
  it('converts a simple object', () => {
    expect(
      coerceToForm(
        { name: 'Jane', age: 30 },
        {
          type: 'object',
          fields: {
            name: { type: 'string' },
            age: { type: 'number' },
          },
        }
      )
    ).toEqual({ name: 'Jane', age: '30' })
  })

  it('converts a nested object', () => {
    expect(
      coerceToForm(
        { address: { street: 'Main St', zip: 12345 } },
        {
          type: 'object',
          fields: {
            address: {
              type: 'object',
              fields: {
                street: { type: 'string' },
                zip: { type: 'number' },
              },
            },
          },
        }
      )
    ).toEqual({ address: { street: 'Main St', zip: '12345' } })
  })

  it('converts an object with array fields', () => {
    expect(
      coerceToForm(
        { tags: ['a', 'b'], scores: [1, 2] },
        {
          type: 'object',
          fields: {
            tags: { type: 'array', item: { type: 'string' } },
            scores: { type: 'array', item: { type: 'number' } },
          },
        }
      )
    ).toEqual({ tags: ['a', 'b'], scores: ['1', '2'] })
  })

  it('returns empty object for falsy value', () => {
    expect(
      coerceToForm(undefined, {
        type: 'object',
        fields: { name: { type: 'string' } },
      })
    ).toEqual({})
  })
})
