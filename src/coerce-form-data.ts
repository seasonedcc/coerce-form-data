import { coerceValue } from './coerce-value'
import type {
  FieldDescriptors,
  FieldType,
  FormRecord,
  FormValue,
} from './types'

const arrayTypes: Set<FieldType> = new Set([
  'string-array',
  'number-array',
  'date-array',
  'datetime-array',
])

/**
 * Coerce every field in a {@link FormData} or plain record according to a
 * map of {@link FieldDescriptors}.
 *
 * Only the keys present in `fields` are included in the result.
 *
 * @param data - A web standard {@link FormData} or a plain key/value record
 * @param fields - Map of field names to their type descriptors
 * @returns A new object with every value coerced to its declared type
 *
 * @example
 * ```ts
 * const fd = new FormData()
 * fd.set('name', 'Jane')
 * fd.set('age', '30')
 * fd.set('scheduledAt', '2024-05-06T14:30')
 *
 * coerceFormData(fd, {
 *   name: { type: 'string' },
 *   age: { type: 'number' },
 *   scheduledAt: { type: 'datetime' },
 * })
 * // { name: 'Jane', age: 30, scheduledAt: Date(2024, 4, 6, 14, 30) }
 * ```
 *
 * @example
 * ```ts
 * coerceFormData(
 *   { agree: 'on', count: '5' },
 *   { agree: { type: 'boolean' }, count: { type: 'number' } },
 * )
 * // { agree: true, count: 5 }
 * ```
 */
function coerceFormData(
  data: FormData | FormRecord,
  fields: FieldDescriptors
): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const key in fields) {
    const fieldType = fields[key].type
    const isArray = fieldType !== null && arrayTypes.has(fieldType)
    const raw: FormValue =
      data instanceof FormData
        ? isArray
          ? data.getAll(key)
          : data.get(key)
        : data[key]
    result[key] = coerceValue(raw ?? null, fields[key])
  }

  return result
}

export { coerceFormData }
