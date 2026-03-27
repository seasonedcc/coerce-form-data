import { describe, expect, it } from 'vitest'
import { FormDataCoercionError } from './form-data-coercion-error'

describe('FormDataCoercionError', () => {
  it('is an instance of Error', () => {
    const error = new FormDataCoercionError('bad', 'number')
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(FormDataCoercionError)
  })

  it('exposes value and fieldType', () => {
    const error = new FormDataCoercionError('bad', 'number')
    expect(error.value).toBe('bad')
    expect(error.fieldType).toBe('number')
  })

  it('has a descriptive message', () => {
    const error = new FormDataCoercionError('bad', 'number')
    expect(error.message).toBe('Cannot coerce "bad" to number')
  })

  it('has the correct name', () => {
    const error = new FormDataCoercionError('bad', 'number')
    expect(error.name).toBe('FormDataCoercionError')
  })

  it('has an empty path by default', () => {
    const error = new FormDataCoercionError('bad', 'number')
    expect(error.path).toEqual([])
  })

  it('includes path when provided', () => {
    const error = new FormDataCoercionError('bad', 'number', ['age'])
    expect(error.path).toEqual(['age'])
    expect(error.message).toBe('Cannot coerce "bad" to number at age')
  })

  it('formats nested paths with dot notation', () => {
    const error = new FormDataCoercionError('bad', 'number', ['address', 'zip'])
    expect(error.message).toBe('Cannot coerce "bad" to number at address.zip')
  })

  it('formats array indices with bracket notation', () => {
    const error = new FormDataCoercionError('bad', 'number', ['items', '0'])
    expect(error.message).toBe('Cannot coerce "bad" to number at items[0]')
  })

  it('formats deeply nested paths with mixed notation', () => {
    const error = new FormDataCoercionError('bad', 'number', [
      'departments',
      '0',
      'headcount',
    ])
    expect(error.message).toBe(
      'Cannot coerce "bad" to number at departments[0].headcount'
    )
  })
})
