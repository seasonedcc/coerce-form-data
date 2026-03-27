import { describe, expectTypeOf, it } from 'vitest'
import { coerceToForm, coerceValue } from './index'
import type { FormValue } from './types'

describe('coerceValue type inference', () => {
  it('returns FormValue when no field is provided', () => {
    expectTypeOf(coerceValue('hello')).toEqualTypeOf<FormValue>()
  })

  it('returns string for string fields', () => {
    expectTypeOf(
      coerceValue('hello', { type: 'string' })
    ).toEqualTypeOf<string>()
  })

  it('returns number for number fields', () => {
    expectTypeOf(coerceValue('42', { type: 'number' })).toEqualTypeOf<number>()
  })

  it('returns boolean for boolean fields', () => {
    expectTypeOf(
      coerceValue('true', { type: 'boolean' })
    ).toEqualTypeOf<boolean>()
  })

  it('returns Date for date fields', () => {
    expectTypeOf(
      coerceValue('2024-01-01', { type: 'date' })
    ).toEqualTypeOf<Date>()
  })

  it('returns Date for datetime fields', () => {
    expectTypeOf(
      coerceValue('2024-01-01T10:00', { type: 'datetime' })
    ).toEqualTypeOf<Date>()
  })

  it('adds undefined for optional fields', () => {
    expectTypeOf(
      coerceValue('42', { type: 'number', optional: true })
    ).toEqualTypeOf<number | undefined>()
  })

  it('adds null for nullable fields', () => {
    expectTypeOf(
      coerceValue('hello', { type: 'string', nullable: true })
    ).toEqualTypeOf<string | null>()
  })

  it('adds both for optional + nullable fields', () => {
    expectTypeOf(
      coerceValue('42', { type: 'number', optional: true, nullable: true })
    ).toEqualTypeOf<number | null | undefined>()
  })

  it('returns File for file fields', () => {
    expectTypeOf(
      coerceValue(new File([], 'f'), { type: 'file' })
    ).toEqualTypeOf<File>()
  })

  it('adds undefined for optional file fields', () => {
    expectTypeOf(
      coerceValue(new File([], 'f'), { type: 'file', optional: true })
    ).toEqualTypeOf<File | undefined>()
  })

  it('adds null for nullable file fields', () => {
    expectTypeOf(
      coerceValue(new File([], 'f'), { type: 'file', nullable: true })
    ).toEqualTypeOf<File | null>()
  })
})

describe('coerceValue array type inference', () => {
  it('returns number[] for array of numbers', () => {
    expectTypeOf(
      coerceValue(['1'], { type: 'array', item: { type: 'number' } })
    ).toEqualTypeOf<number[]>()
  })

  it('returns string[] for array of strings', () => {
    expectTypeOf(
      coerceValue(['a'], { type: 'array', item: { type: 'string' } })
    ).toEqualTypeOf<string[]>()
  })

  it('returns Date[] for array of dates', () => {
    expectTypeOf(
      coerceValue([], { type: 'array', item: { type: 'date' } })
    ).toEqualTypeOf<Date[]>()
  })

  it('adds undefined for optional arrays', () => {
    expectTypeOf(
      coerceValue([], {
        type: 'array',
        item: { type: 'number' },
        optional: true,
      })
    ).toEqualTypeOf<number[] | undefined>()
  })

  it('adds null for nullable arrays', () => {
    expectTypeOf(
      coerceValue([], {
        type: 'array',
        item: { type: 'number' },
        nullable: true,
      })
    ).toEqualTypeOf<number[] | null>()
  })

  it('returns (number | undefined)[] for array of optional numbers', () => {
    expectTypeOf(
      coerceValue([], {
        type: 'array',
        item: { type: 'number', optional: true },
      })
    ).toEqualTypeOf<(number | undefined)[]>()
  })

  it('returns number[][] for nested arrays', () => {
    expectTypeOf(
      coerceValue([], {
        type: 'array',
        item: { type: 'array', item: { type: 'number' } },
      })
    ).toEqualTypeOf<number[][]>()
  })
})

describe('coerceValue object type inference', () => {
  it('returns typed object for object descriptor', () => {
    expectTypeOf(
      coerceValue(
        {},
        {
          type: 'object',
          fields: {
            name: { type: 'string' },
            age: { type: 'number' },
          },
        }
      )
    ).toEqualTypeOf<{ readonly name: string; readonly age: number }>()
  })

  it('adds undefined for optional objects', () => {
    expectTypeOf(
      coerceValue(null, {
        type: 'object',
        fields: { name: { type: 'string' } },
        optional: true,
      })
    ).toEqualTypeOf<{ readonly name: string } | undefined>()
  })

  it('adds null for nullable objects', () => {
    expectTypeOf(
      coerceValue(null, {
        type: 'object',
        fields: { name: { type: 'string' } },
        nullable: true,
      })
    ).toEqualTypeOf<{ readonly name: string } | null>()
  })

  it('handles optional fields inside objects', () => {
    expectTypeOf(
      coerceValue(
        {},
        {
          type: 'object',
          fields: {
            name: { type: 'string', optional: true },
          },
        }
      )
    ).toEqualTypeOf<{ readonly name: string | undefined }>()
  })

  it('returns typed object for object with array field', () => {
    expectTypeOf(
      coerceValue(
        {},
        {
          type: 'object',
          fields: {
            tags: { type: 'array', item: { type: 'string' } },
          },
        }
      )
    ).toEqualTypeOf<{ readonly tags: string[] }>()
  })

  it('returns typed array of objects', () => {
    expectTypeOf(
      coerceValue([], {
        type: 'array',
        item: {
          type: 'object',
          fields: { name: { type: 'string' } },
        },
      })
    ).toEqualTypeOf<{ readonly name: string }[]>()
  })
})

describe('coerceToForm type inference', () => {
  it('returns string for number fields', () => {
    expectTypeOf(coerceToForm(42, { type: 'number' })).toEqualTypeOf<string>()
  })

  it('returns boolean for boolean fields', () => {
    expectTypeOf(
      coerceToForm(true, { type: 'boolean' })
    ).toEqualTypeOf<boolean>()
  })

  it('returns string | undefined for date fields', () => {
    expectTypeOf(coerceToForm(new Date(), { type: 'date' })).toEqualTypeOf<
      string | undefined
    >()
  })

  it('returns undefined for file fields', () => {
    expectTypeOf(
      coerceToForm(new File([], 'f'), { type: 'file' })
    ).toEqualTypeOf<undefined>()
  })

  it('returns string[] for array of number fields', () => {
    expectTypeOf(
      coerceToForm([1], { type: 'array', item: { type: 'number' } })
    ).toEqualTypeOf<string[]>()
  })

  it('returns boolean[] for array of boolean fields', () => {
    expectTypeOf(
      coerceToForm([true], { type: 'array', item: { type: 'boolean' } })
    ).toEqualTypeOf<boolean[]>()
  })

  it('returns typed object for object descriptor', () => {
    expectTypeOf(
      coerceToForm(
        {},
        {
          type: 'object',
          fields: {
            name: { type: 'string' },
            count: { type: 'number' },
          },
        }
      )
    ).toEqualTypeOf<{ readonly name: string; readonly count: string }>()
  })

  it('returns (string | undefined)[] for array of date fields', () => {
    expectTypeOf(
      coerceToForm([], { type: 'array', item: { type: 'date' } })
    ).toEqualTypeOf<(string | undefined)[]>()
  })
})
