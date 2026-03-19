import type { FieldType } from './types'

/**
 * Thrown when a form value cannot be coerced to the declared
 * {@link FieldType}.
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
 */
class FormDataCoercionError extends Error {
  constructor(
    public readonly value: unknown,
    public readonly fieldType: FieldType
  ) {
    super(`Cannot coerce ${JSON.stringify(value)} to ${fieldType}`)
    this.name = 'FormDataCoercionError'
  }
}

export { FormDataCoercionError }
