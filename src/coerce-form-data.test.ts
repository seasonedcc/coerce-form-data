import { describe, expect, it } from 'vitest'
import { coerceFormData } from './coerce-form-data'
import { FormDataCoercionError } from './form-data-coercion-error'
import type { FieldDescriptors } from './types'

const fields: FieldDescriptors = {
  name: { type: 'string' },
  age: { type: 'number' },
  agree: { type: 'boolean' },
  birthday: { type: 'date' },
  scheduledAt: { type: 'datetime' },
  role: { type: 'enum' },
}

describe('coerceFormData', () => {
  it('coerces a FormData instance', () => {
    const fd = new FormData()
    fd.set('name', 'Jane')
    fd.set('age', '30')
    fd.set('agree', 'on')
    fd.set('birthday', '1994-06-15')
    fd.set('scheduledAt', '2024-05-06T14:30')
    fd.set('role', 'admin')

    const result = coerceFormData(fd, fields)

    expect(result.name).toBe('Jane')
    expect(result.age).toBe(30)
    expect(result.agree).toBe(true)
    expect(result.birthday).toEqual(new Date(1994, 5, 15))
    expect(result.scheduledAt).toEqual(new Date(2024, 4, 6, 14, 30, 0))
    expect(result.role).toBe('admin')
  })

  it('coerces a plain record', () => {
    const data = {
      name: 'Jane',
      age: '30',
      agree: 'on',
      birthday: '1994-06-15',
      scheduledAt: '2024-05-06T14:30',
      role: 'admin',
    }

    const result = coerceFormData(data, fields)

    expect(result.name).toBe('Jane')
    expect(result.age).toBe(30)
    expect(result.agree).toBe(true)
    expect(result.birthday).toEqual(new Date(1994, 5, 15))
    expect(result.scheduledAt).toEqual(new Date(2024, 4, 6, 14, 30, 0))
    expect(result.role).toBe('admin')
  })

  it('only includes keys present in the field descriptors', () => {
    const fd = new FormData()
    fd.set('name', 'Jane')
    fd.set('extra', 'ignored')

    const result = coerceFormData(fd, { name: { type: 'string' } })

    expect(result).toEqual({ name: 'Jane' })
    expect(result).not.toHaveProperty('extra')
  })

  it('handles missing values according to optional/nullable', () => {
    const fd = new FormData()

    const result = coerceFormData(fd, {
      required: { type: 'string' },
      opt: { type: 'string', optional: true },
      nul: { type: 'string', nullable: true },
    })

    expect(result.required).toBe('')
    expect(result.opt).toBeUndefined()
    expect(result.nul).toBeNull()
  })

  it('coerces multi-value FormData fields with array types', () => {
    const fd = new FormData()
    fd.append('roles', 'admin')
    fd.append('roles', 'editor')
    fd.append('scores', '10')
    fd.append('scores', '20')

    const result = coerceFormData(fd, {
      roles: { type: 'string-array' },
      scores: { type: 'number-array' },
    })

    expect(result.roles).toEqual(['admin', 'editor'])
    expect(result.scores).toEqual([10, 20])
  })

  it('coerces array types from plain records', () => {
    const result = coerceFormData(
      { tags: ['a', 'b'], ids: ['1', '2'] },
      { tags: { type: 'string-array' }, ids: { type: 'number-array' } }
    )

    expect(result.tags).toEqual(['a', 'b'])
    expect(result.ids).toEqual([1, 2])
  })

  it('returns empty array for missing array fields', () => {
    const fd = new FormData()

    const result = coerceFormData(fd, {
      tags: { type: 'string-array' },
    })

    expect(result.tags).toEqual([])
  })

  it('throws when a required field has an invalid value', () => {
    const fd = new FormData()
    fd.set('count', 'not-a-number')

    expect(() => coerceFormData(fd, { count: { type: 'number' } })).toThrow(
      FormDataCoercionError
    )
  })

  it('coerces a URLSearchParams instance', () => {
    const params = new URLSearchParams('?name=Jane&age=30&agree=on')

    const result = coerceFormData(params, {
      name: { type: 'string' },
      age: { type: 'number' },
      agree: { type: 'boolean' },
    })

    expect(result.name).toBe('Jane')
    expect(result.age).toBe(30)
    expect(result.agree).toBe(true)
  })

  it('coerces multi-value URLSearchParams with array types', () => {
    const params = new URLSearchParams('?tag=a&tag=b&tag=c')

    const result = coerceFormData(params, {
      tag: { type: 'string-array' },
    })

    expect(result.tag).toEqual(['a', 'b', 'c'])
  })

  it('includes the field name in the error', () => {
    const fd = new FormData()
    fd.set('age', 'not-a-number')

    try {
      coerceFormData(fd, { age: { type: 'number' } })
    } catch (error) {
      expect(error).toBeInstanceOf(FormDataCoercionError)
      expect((error as FormDataCoercionError).fieldName).toBe('age')
      expect((error as FormDataCoercionError).message).toContain('(field: age)')
    }
  })
})
