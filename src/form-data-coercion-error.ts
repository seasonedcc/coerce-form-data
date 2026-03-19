import type { FieldType } from './types'

/**
 * Thrown when a form value cannot be coerced to the declared
 * {@link FieldType}.
 *
 * When thrown from {@link coerceFormData}, the {@link fieldName} property
 * identifies which field caused the error.
 *
 * @example
 * ```ts
 * try {
 *   coerceValue('not-a-number', { type: 'number' })
 * } catch (error) {
 *   if (error instanceof FormDataCoercionError) {
 *     console.log(error.value)     // 'not-a-number'
 *     console.log(error.fieldType) // 'number'
 *   }
 * }
 * ```
 *
 * @example
 * ```ts
 * try {
 *   coerceFormData(fd, { age: { type: 'number' } })
 * } catch (error) {
 *   if (error instanceof FormDataCoercionError) {
 *     console.log(error.fieldName) // 'age'
 *   }
 * }
 * ```
 */
class FormDataCoercionError extends Error {
  public readonly fieldName?: string

  constructor(
    public readonly value: unknown,
    public readonly fieldType: FieldType,
    fieldName?: string
  ) {
    const field = fieldName ? ` (field: ${fieldName})` : ''
    super(`Cannot coerce ${JSON.stringify(value)} to ${fieldType}${field}`)
    this.name = 'FormDataCoercionError'
    this.fieldName = fieldName
  }
}

export { FormDataCoercionError }
