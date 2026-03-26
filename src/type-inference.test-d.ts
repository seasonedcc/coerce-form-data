import { describe, expectTypeOf, it } from 'vitest'
import { coerceFormData, coerceToForm, coerceValue } from './index'
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

  it('returns string[] for string-array fields', () => {
    expectTypeOf(coerceValue(['a'], { type: 'string-array' })).toEqualTypeOf<
      string[]
    >()
  })

  it('returns number[] for number-array fields', () => {
    expectTypeOf(coerceValue(['1'], { type: 'number-array' })).toEqualTypeOf<
      number[]
    >()
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

describe('coerceFormData type inference', () => {
  it('infers typed object from inline descriptors', () => {
    const fd = new FormData()
    const result = coerceFormData(fd, {
      name: { type: 'string' },
      age: { type: 'number' },
      active: { type: 'boolean' },
    })

    expectTypeOf(result.name).toEqualTypeOf<string>()
    expectTypeOf(result.age).toEqualTypeOf<number>()
    expectTypeOf(result.active).toEqualTypeOf<boolean>()
  })

  it('infers optional and nullable modifiers', () => {
    const fd = new FormData()
    const result = coerceFormData(fd, {
      name: { type: 'string', optional: true },
      age: { type: 'number', nullable: true },
    })

    expectTypeOf(result.name).toEqualTypeOf<string | undefined>()
    expectTypeOf(result.age).toEqualTypeOf<number | null>()
  })

  it('infers array types', () => {
    const fd = new FormData()
    const result = coerceFormData(fd, {
      tags: { type: 'string-array' },
      scores: { type: 'number-array' },
    })

    expectTypeOf(result.tags).toEqualTypeOf<string[]>()
    expectTypeOf(result.scores).toEqualTypeOf<number[]>()
  })

  it('infers File for file fields', () => {
    const fd = new FormData()
    const result = coerceFormData(fd, {
      avatar: { type: 'file' },
    })

    expectTypeOf(result.avatar).toEqualTypeOf<File>()
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

  it('returns string[] for array fields', () => {
    expectTypeOf(coerceToForm(['a'], { type: 'string-array' })).toEqualTypeOf<
      string[]
    >()
  })

  it('returns undefined for file fields', () => {
    expectTypeOf(
      coerceToForm(new File([], 'f'), { type: 'file' })
    ).toEqualTypeOf<undefined>()
  })
})
