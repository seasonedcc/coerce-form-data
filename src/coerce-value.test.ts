import { describe, expect, it } from 'vitest'
import { coerceValue } from './coerce-value'
import { FormDataCoercionError } from './form-data-coercion-error'
import type { FieldDescriptor } from './types'

const boolean: FieldDescriptor = { type: 'boolean' }
const number: FieldDescriptor = { type: 'number' }
const date: FieldDescriptor = { type: 'date' }
const datetime: FieldDescriptor = { type: 'datetime' }
const string: FieldDescriptor = { type: 'string' }
const enumField: FieldDescriptor = { type: 'enum' }

const allTypes: FieldDescriptor[] = [
  boolean,
  number,
  date,
  datetime,
  string,
  enumField,
]

describe('coerceValue', () => {
  it('behaves like identity when field is undefined', () => {
    expect(coerceValue(null)).toEqual(null)
    expect(coerceValue('some text')).toEqual('some text')
    expect(coerceValue(new File([], 'empty-file.txt'))).toBeInstanceOf(File)
  })

  it.each(allTypes)(
    'returns null when value is missing and field %j is nullable',
    (field) => {
      expect(coerceValue(null, { ...field, nullable: true })).toEqual(null)
    }
  )

  it.each(allTypes)(
    'returns null when value is missing and field %j is nullable and optional',
    (field) => {
      expect(
        coerceValue(null, { ...field, nullable: true, optional: true })
      ).toEqual(null)
    }
  )

  it.each(allTypes)(
    'returns undefined when value is missing and field %j is optional',
    (field) => {
      expect(coerceValue(null, { ...field, optional: true })).toEqual(undefined)
    }
  )

  it('throws when trying to coerce invalid values into numbers', () => {
    expect(() => coerceValue('not a number', number)).toThrow(
      FormDataCoercionError
    )
    expect(() => coerceValue(new File([], 'empty-file.txt'), number)).toThrow(
      FormDataCoercionError
    )
  })

  it('returns number when trying to coerce strings that can be read as numbers into numbers', () => {
    expect(coerceValue('0', number)).toEqual(0)
    expect(coerceValue('999999.999', number)).toEqual(999999.999)
  })

  it('throws when coercing numbers with empty value', () => {
    expect(() => coerceValue('', number)).toThrow(FormDataCoercionError)
    expect(() => coerceValue(null, number)).toThrow(FormDataCoercionError)
  })

  it('coerces booleans to true when value is not empty', () => {
    expect(coerceValue('not a boolean', boolean)).toEqual(true)
    expect(coerceValue('true', boolean)).toEqual(true)
    expect(coerceValue('on', boolean)).toEqual(true)
    expect(coerceValue(new File([], 'f'), boolean)).toEqual(true)
  })

  it("coerces booleans to false when value is 'false'", () => {
    expect(coerceValue('false', boolean)).toEqual(false)
  })

  it("throws when coercing 'null' to a required boolean", () => {
    expect(() => coerceValue('null', boolean)).toThrow(FormDataCoercionError)
  })

  it("coerces nullable booleans to null when value is 'null'", () => {
    expect(coerceValue('null', { ...boolean, nullable: true })).toEqual(null)
  })

  it("coerces optional booleans to undefined when value is 'null'", () => {
    expect(coerceValue('null', { ...boolean, optional: true })).toEqual(
      undefined
    )
  })

  it('coerces booleans to false when value is empty', () => {
    expect(coerceValue('', boolean)).toEqual(false)
    expect(coerceValue(null, boolean)).toEqual(false)
  })

  it('coerces nullable booleans to true when value is not empty', () => {
    const field = { ...boolean, nullable: true }
    expect(coerceValue('not a boolean', field)).toEqual(true)
    expect(coerceValue('true', field)).toEqual(true)
    expect(coerceValue('on', field)).toEqual(true)
    expect(coerceValue(new File([], 'f'), field)).toEqual(true)
  })

  it("coerces nullable booleans to false when value is 'false'", () => {
    expect(coerceValue('false', { ...boolean, nullable: true })).toEqual(false)
  })

  it('coerces nullable booleans to null when value is empty', () => {
    const field = { ...boolean, nullable: true }
    expect(coerceValue('', field)).toEqual(null)
    expect(coerceValue(null, field)).toEqual(null)
  })

  it('throws when coercing dates with empty value or file', () => {
    expect(() => coerceValue('', date)).toThrow(FormDataCoercionError)
    expect(() => coerceValue(null, date)).toThrow(FormDataCoercionError)
    expect(() =>
      coerceValue(new File([], 'definitely-not-a-date.txt'), date)
    ).toThrow(FormDataCoercionError)
  })

  it('throws when date value cannot be read as date', () => {
    expect(() => coerceValue('not a date', date)).toThrow(FormDataCoercionError)
  })

  it('coerces dates to a valid Date when value can be read as date', () => {
    expect(coerceValue('2001-12-31', date)).toEqual(new Date(2001, 11, 31))
  })

  it('throws when coercing datetimes with empty value or file', () => {
    expect(() => coerceValue('', datetime)).toThrow(FormDataCoercionError)
    expect(() => coerceValue(null, datetime)).toThrow(FormDataCoercionError)
    expect(() =>
      coerceValue(new File([], 'not-a-datetime.txt'), datetime)
    ).toThrow(FormDataCoercionError)
  })

  it('throws when datetime value has no T separator', () => {
    expect(() => coerceValue('2024-05-06', datetime)).toThrow(
      FormDataCoercionError
    )
  })

  it('throws when datetime value is malformed', () => {
    expect(() => coerceValue('not-a-dateTimestamp', datetime)).toThrow(
      FormDataCoercionError
    )
  })

  it('coerces datetime-local strings without seconds to a valid Date', () => {
    expect(coerceValue('2024-05-06T14:30', datetime)).toEqual(
      new Date(2024, 4, 6, 14, 30, 0)
    )
  })

  it('coerces datetime-local strings with seconds to a valid Date', () => {
    expect(coerceValue('2024-05-06T14:30:45', datetime)).toEqual(
      new Date(2024, 4, 6, 14, 30, 45)
    )
  })

  it('coerces strings to empty when value is empty', () => {
    expect(coerceValue('', string)).toEqual('')
    expect(coerceValue(null, string)).toEqual('')
  })

  it('coerces strings to [object File] when value is a file', () => {
    expect(coerceValue(new File([], 'some-empty-file.txt'), string)).toMatch(
      /\[object (File|Blob)\]/
    )
  })

  it('coerces enums to empty when value is empty', () => {
    expect(coerceValue('', enumField)).toEqual('')
    expect(coerceValue(null, enumField)).toEqual('')
  })

  it('coerces enums to [object File] when value is a file', () => {
    expect(coerceValue(new File([], 'some-empty-file.txt'), enumField)).toMatch(
      /\[object (File|Blob)\]/
    )
  })

  it('returns enum value when provided', () => {
    expect(coerceValue('one', enumField)).toBe('one')
  })

  it('returns value as-is for unknown type', () => {
    expect(coerceValue('hello', { type: null })).toBe('hello')
  })

  it('coerces string-array from a string array', () => {
    expect(coerceValue(['a', 'b', 'c'], { type: 'string-array' })).toEqual([
      'a',
      'b',
      'c',
    ])
  })

  it('coerces string-array from a single string', () => {
    expect(coerceValue('a', { type: 'string-array' })).toEqual(['a'])
  })

  it('coerces string-array to empty array when value is empty', () => {
    expect(coerceValue(null, { type: 'string-array' })).toEqual([])
    expect(coerceValue('', { type: 'string-array' })).toEqual([])
  })

  it('coerces string-array to undefined when optional and empty', () => {
    expect(
      coerceValue(null, { type: 'string-array', optional: true })
    ).toBeUndefined()
  })

  it('coerces string-array to null when nullable and empty', () => {
    expect(
      coerceValue(null, { type: 'string-array', nullable: true })
    ).toBeNull()
  })

  it('coerces number-array from a string array', () => {
    expect(coerceValue(['1', '2', '3'], { type: 'number-array' })).toEqual([
      1, 2, 3,
    ])
  })

  it('coerces number-array from a single string', () => {
    expect(coerceValue('42', { type: 'number-array' })).toEqual([42])
  })

  it('coerces number-array to empty array when value is empty', () => {
    expect(coerceValue(null, { type: 'number-array' })).toEqual([])
  })

  it('throws when number-array element is invalid', () => {
    expect(() =>
      coerceValue(['1', 'not-a-number'], { type: 'number-array' })
    ).toThrow(FormDataCoercionError)
  })

  it('coerces date-array from a string array', () => {
    expect(
      coerceValue(['2024-01-01', '2024-06-15'], { type: 'date-array' })
    ).toEqual([new Date(2024, 0, 1), new Date(2024, 5, 15)])
  })

  it('coerces date-array to empty array when value is empty', () => {
    expect(coerceValue(null, { type: 'date-array' })).toEqual([])
  })

  it('coerces datetime-array from a string array', () => {
    expect(
      coerceValue(['2024-01-01T10:00', '2024-06-15T14:30'], {
        type: 'datetime-array',
      })
    ).toEqual([
      new Date(2024, 0, 1, 10, 0, 0),
      new Date(2024, 5, 15, 14, 30, 0),
    ])
  })

  it('coerces datetime-array to empty array when value is empty', () => {
    expect(coerceValue(null, { type: 'datetime-array' })).toEqual([])
  })

  it('includes value and fieldType in the error', () => {
    try {
      coerceValue('bad', number)
    } catch (error) {
      expect(error).toBeInstanceOf(FormDataCoercionError)
      expect((error as FormDataCoercionError).value).toBe('bad')
      expect((error as FormDataCoercionError).fieldType).toBe('number')
    }
  })
})
