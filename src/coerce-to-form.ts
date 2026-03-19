import { parseDate } from './parse-date'
import { parseDatetime } from './parse-datetime'
import type { FieldDescriptor } from './types'

/**
 * Coerce a typed value into a representation suitable for HTML form inputs.
 *
 * This is the reverse of {@link coerceValue}: it takes an already-typed
 * JavaScript value and converts it into the string (or boolean) that an
 * HTML input element expects. Date fields are formatted via {@link parseDate}
 * and datetime fields via {@link parseDatetime}.
 *
 * @param value - The typed value to format
 * @param field - Descriptor declaring the field type
 * @returns A value ready to be used as a form input's default
 *
 * @example
 * ```ts
 * coerceToForm(42, { type: 'number' }) // '42'
 * ```
 *
 * @example
 * ```ts
 * coerceToForm(new Date('2024-05-06T12:00:00Z'), { type: 'date' })
 * // '2024-05-06'
 * ```
 *
 * @example
 * ```ts
 * coerceToForm(new Date(2024, 4, 6, 14, 30), { type: 'datetime' })
 * // '2024-05-06T14:30:00'
 * ```
 */
function coerceToForm(value: unknown, field: FieldDescriptor) {
  const { type } = field

  if (type === 'boolean') {
    return Boolean(value) ?? false
  }

  if (type === 'date') {
    return parseDate(value as Date | undefined)
  }

  if (type === 'datetime') {
    return parseDatetime(value as Date | undefined)
  }

  if (type === 'enum' || type === 'string' || type === 'number') {
    return String(value ?? '')
  }

  if (type === 'string-array' || type === 'number-array') {
    return Array.isArray(value) ? value.map(String) : []
  }

  if (type === 'date-array') {
    return Array.isArray(value)
      ? value.map((v: Date) => parseDate(v) as string)
      : []
  }

  if (type === 'datetime-array') {
    return Array.isArray(value)
      ? value.map((v: Date) => parseDatetime(v) as string)
      : []
  }

  return value ?? ''
}

export { coerceToForm }
