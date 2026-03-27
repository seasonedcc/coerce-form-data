import { parseDate } from './parse-date'
import { parseDatetime } from './parse-datetime'
import type {
  ArrayFieldDescriptor,
  CoercedToFormValue,
  FieldDescriptor,
  ObjectFieldDescriptor,
} from './types'

/**
 * Coerce a typed value into a representation suitable for HTML form inputs.
 *
 * This is the reverse of {@link coerceValue}: it takes an already-typed
 * JavaScript value and converts it into the string (or boolean) that an
 * HTML input element expects. Works recursively for arrays and objects.
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
 * coerceToForm([1, 2], { type: 'array', item: { type: 'number' } })
 * // ['1', '2']
 * ```
 *
 * @example
 * ```ts
 * coerceToForm(
 *   { name: 'Jane', age: 30 },
 *   { type: 'object', fields: { name: { type: 'string' }, age: { type: 'number' } } },
 * )
 * // { name: 'Jane', age: '30' }
 * ```
 */
function coerceToForm<const F extends FieldDescriptor>(
  value: unknown,
  field: F
): CoercedToFormValue<F> {
  type Result = CoercedToFormValue<F>
  const { type } = field

  if (type === 'file') {
    return undefined as Result
  }

  if (type === 'boolean') {
    return (Boolean(value) ?? false) as Result
  }

  if (type === 'date') {
    return parseDate(value as Date | undefined) as Result
  }

  if (type === 'datetime') {
    return parseDatetime(value as Date | undefined) as Result
  }

  if (type === 'enum' || type === 'string' || type === 'number') {
    return String(value ?? '') as Result
  }

  if (type === 'array') {
    const { item } = field as ArrayFieldDescriptor
    return (
      Array.isArray(value)
        ? value.map((element) => coerceToForm(element, item))
        : []
    ) as Result
  }

  if (type === 'object') {
    const { fields } = field as ObjectFieldDescriptor
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {} as Result
    }
    const record = value as Record<string, unknown>
    const result: Record<string, unknown> = {}
    for (const key of Object.keys(fields)) {
      result[key] = coerceToForm(record[key], fields[key])
    }
    return result as Result
  }

  return (value ?? '') as Result
}

export { coerceToForm }
