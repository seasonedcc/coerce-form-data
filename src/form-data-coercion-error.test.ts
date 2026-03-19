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
})
