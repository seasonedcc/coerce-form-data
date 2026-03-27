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
const file: FieldDescriptor = { type: 'file' }

const allTypes: FieldDescriptor[] = [
  boolean,
  number,
  date,
  datetime,
  string,
  enumField,
  file,
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

  it('passes File instances through for file fields', () => {
    const f = new File(['hello'], 'hello.txt')
    expect(coerceValue(f, file)).toBe(f)
  })

  it('throws when coercing non-File truthy values as file', () => {
    expect(() => coerceValue('some-string', file)).toThrow(
      FormDataCoercionError
    )
  })

  it('throws when coercing empty required file', () => {
    expect(() => coerceValue(null, file)).toThrow(FormDataCoercionError)
    expect(() => coerceValue('', file)).toThrow(FormDataCoercionError)
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

describe('coerceValue with arrays', () => {
  it('coerces array of strings from a string array', () => {
    expect(
      coerceValue(['a', 'b', 'c'], { type: 'array', item: { type: 'string' } })
    ).toEqual(['a', 'b', 'c'])
  })

  it('coerces array of strings from a single string', () => {
    expect(
      coerceValue('a', { type: 'array', item: { type: 'string' } })
    ).toEqual(['a'])
  })

  it('coerces array of strings to empty array when value is empty', () => {
    expect(
      coerceValue(null, { type: 'array', item: { type: 'string' } })
    ).toEqual([])
    expect(
      coerceValue('', { type: 'array', item: { type: 'string' } })
    ).toEqual([])
  })

  it('coerces array to undefined when optional and empty', () => {
    expect(
      coerceValue(null, {
        type: 'array',
        item: { type: 'string' },
        optional: true,
      })
    ).toBeUndefined()
  })

  it('coerces array to null when nullable and empty', () => {
    expect(
      coerceValue(null, {
        type: 'array',
        item: { type: 'string' },
        nullable: true,
      })
    ).toBeNull()
  })

  it('coerces array of numbers from a string array', () => {
    expect(
      coerceValue(['1', '2', '3'], { type: 'array', item: { type: 'number' } })
    ).toEqual([1, 2, 3])
  })

  it('coerces array of numbers from a single string', () => {
    expect(
      coerceValue('42', { type: 'array', item: { type: 'number' } })
    ).toEqual([42])
  })

  it('coerces array of numbers to empty array when value is empty', () => {
    expect(
      coerceValue(null, { type: 'array', item: { type: 'number' } })
    ).toEqual([])
  })

  it('throws when number array element is invalid', () => {
    expect(() =>
      coerceValue(['1', 'not-a-number'], {
        type: 'array',
        item: { type: 'number' },
      })
    ).toThrow(FormDataCoercionError)
  })

  it('coerces array of dates from a string array', () => {
    expect(
      coerceValue(['2024-01-01', '2024-06-15'], {
        type: 'array',
        item: { type: 'date' },
      })
    ).toEqual([new Date(2024, 0, 1), new Date(2024, 5, 15)])
  })

  it('coerces array of dates to empty array when value is empty', () => {
    expect(
      coerceValue(null, { type: 'array', item: { type: 'date' } })
    ).toEqual([])
  })

  it('coerces array of datetimes from a string array', () => {
    expect(
      coerceValue(['2024-01-01T10:00', '2024-06-15T14:30'], {
        type: 'array',
        item: { type: 'datetime' },
      })
    ).toEqual([
      new Date(2024, 0, 1, 10, 0, 0),
      new Date(2024, 5, 15, 14, 30, 0),
    ])
  })

  it('coerces array of datetimes to empty array when value is empty', () => {
    expect(
      coerceValue(null, { type: 'array', item: { type: 'datetime' } })
    ).toEqual([])
  })

  it('coerces nested arrays (array of arrays)', () => {
    expect(
      coerceValue(
        [
          ['1', '2'],
          ['3', '4'],
        ],
        { type: 'array', item: { type: 'array', item: { type: 'number' } } }
      )
    ).toEqual([
      [1, 2],
      [3, 4],
    ])
  })

  it('coerces array of objects', () => {
    expect(
      coerceValue(
        [
          { street: 'Main St', zip: '12345' },
          { street: 'Oak Ave', zip: '67890' },
        ],
        {
          type: 'array',
          item: {
            type: 'object',
            fields: {
              street: { type: 'string' },
              zip: { type: 'number' },
            },
          },
        }
      )
    ).toEqual([
      { street: 'Main St', zip: 12345 },
      { street: 'Oak Ave', zip: 67890 },
    ])
  })

  it('includes index in error path when array element fails', () => {
    try {
      coerceValue(['1', 'bad'], { type: 'array', item: { type: 'number' } })
    } catch (error) {
      expect(error).toBeInstanceOf(FormDataCoercionError)
      expect((error as FormDataCoercionError).path).toEqual(['1'])
    }
  })
})

describe('coerceValue with objects', () => {
  it('coerces a simple object with scalar fields', () => {
    expect(
      coerceValue(
        { name: 'Jane', age: '30' },
        {
          type: 'object',
          fields: {
            name: { type: 'string' },
            age: { type: 'number' },
          },
        }
      )
    ).toEqual({ name: 'Jane', age: 30 })
  })

  it('coerces an object with all scalar types', () => {
    expect(
      coerceValue(
        {
          name: 'Jane',
          age: '30',
          active: 'true',
          joined: '2024-01-15',
          lastLogin: '2024-05-06T14:30',
          role: 'admin',
        },
        {
          type: 'object',
          fields: {
            name: { type: 'string' },
            age: { type: 'number' },
            active: { type: 'boolean' },
            joined: { type: 'date' },
            lastLogin: { type: 'datetime' },
            role: { type: 'enum' },
          },
        }
      )
    ).toEqual({
      name: 'Jane',
      age: 30,
      active: true,
      joined: new Date(2024, 0, 15),
      lastLogin: new Date(2024, 4, 6, 14, 30, 0),
      role: 'admin',
    })
  })

  it('handles optional fields in objects', () => {
    expect(
      coerceValue(
        {},
        {
          type: 'object',
          fields: {
            name: { type: 'string', optional: true },
            age: { type: 'number', optional: true },
          },
        }
      )
    ).toEqual({ name: undefined, age: undefined })
  })

  it('handles nullable fields in objects', () => {
    expect(
      coerceValue(
        {},
        {
          type: 'object',
          fields: {
            name: { type: 'string', nullable: true },
            age: { type: 'number', nullable: true },
          },
        }
      )
    ).toEqual({ name: null, age: null })
  })

  it('returns null for nullable object with missing value', () => {
    expect(
      coerceValue(null, {
        type: 'object',
        fields: { name: { type: 'string' } },
        nullable: true,
      })
    ).toBeNull()
  })

  it('returns undefined for optional object with missing value', () => {
    expect(
      coerceValue(null, {
        type: 'object',
        fields: { name: { type: 'string' } },
        optional: true,
      })
    ).toBeUndefined()
  })

  it('applies defaults for required object with missing value', () => {
    expect(
      coerceValue(null, {
        type: 'object',
        fields: {
          name: { type: 'string' },
          active: { type: 'boolean' },
        },
      })
    ).toEqual({ name: '', active: false })
  })

  it('throws for required object with missing value when inner field requires a value', () => {
    expect(() =>
      coerceValue(null, {
        type: 'object',
        fields: { age: { type: 'number' } },
      })
    ).toThrow(FormDataCoercionError)
  })

  it('coerces nested objects', () => {
    expect(
      coerceValue(
        { address: { street: 'Main St', zip: '12345' } },
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
    ).toEqual({ address: { street: 'Main St', zip: 12345 } })
  })

  it('coerces objects with array fields', () => {
    expect(
      coerceValue(
        { tags: ['a', 'b'], scores: ['1', '2'] },
        {
          type: 'object',
          fields: {
            tags: { type: 'array', item: { type: 'string' } },
            scores: { type: 'array', item: { type: 'number' } },
          },
        }
      )
    ).toEqual({ tags: ['a', 'b'], scores: [1, 2] })
  })

  it('coerces deeply nested structures (object -> array -> object)', () => {
    expect(
      coerceValue(
        { departments: [{ name: 'Eng', headcount: '50' }] },
        {
          type: 'object',
          fields: {
            departments: {
              type: 'array',
              item: {
                type: 'object',
                fields: {
                  name: { type: 'string' },
                  headcount: { type: 'number' },
                },
              },
            },
          },
        }
      )
    ).toEqual({ departments: [{ name: 'Eng', headcount: 50 }] })
  })

  it('includes field name in error path when object field fails', () => {
    try {
      coerceValue(
        { age: 'bad' },
        {
          type: 'object',
          fields: { age: { type: 'number' } },
        }
      )
    } catch (error) {
      expect(error).toBeInstanceOf(FormDataCoercionError)
      expect((error as FormDataCoercionError).path).toEqual(['age'])
    }
  })

  it('includes full path in error for deeply nested failures', () => {
    try {
      coerceValue(
        { departments: [{ name: 'Eng', headcount: 'bad' }] },
        {
          type: 'object',
          fields: {
            departments: {
              type: 'array',
              item: {
                type: 'object',
                fields: {
                  name: { type: 'string' },
                  headcount: { type: 'number' },
                },
              },
            },
          },
        }
      )
    } catch (error) {
      expect(error).toBeInstanceOf(FormDataCoercionError)
      expect((error as FormDataCoercionError).path).toEqual([
        'departments',
        '0',
        'headcount',
      ])
      expect((error as FormDataCoercionError).message).toBe(
        'Cannot coerce "bad" to number at departments[0].headcount'
      )
    }
  })
})
