import { coerceValue } from './coerce-value'
import { FormDataCoercionError } from './form-data-coercion-error'
import type {
  CoercedFormData,
  FieldDescriptors,
  FieldType,
  FormDataLike,
  FormRecord,
  FormValue,
} from './types'

function isFormDataLike(data: FormDataLike | FormRecord): data is FormDataLike {
  return 'get' in data && typeof data.get === 'function'
}

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
 * The returned object is fully typed when field descriptors are passed
 * inline — each key maps to the JavaScript type declared by its
 * {@link FieldDescriptor}.
 *
 * @param data - A {@link FormDataLike} source (`FormData`, `URLSearchParams`,
 *   or any object with `.get()` and `.getAll()`) or a plain key/value record
 * @param fields - Map of field names to their type descriptors
 * @returns A new object with every value coerced to its declared type
 * @throws {FormDataCoercionError} When any value is invalid for its declared type
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
function coerceFormData<const F extends FieldDescriptors>(
  data: FormDataLike | FormRecord,
  fields: F
): CoercedFormData<F> {
  const result = {} as CoercedFormData<F>

  for (const key in fields) {
    const fieldType = fields[key].type
    const isArray = fieldType !== null && arrayTypes.has(fieldType)
    const raw: FormValue = isFormDataLike(data)
      ? isArray
        ? data.getAll(key)
        : data.get(key)
      : data[key]
    try {
      ;(result as Record<string, unknown>)[key] = coerceValue(
        raw ?? null,
        fields[key]
      )
    } catch (error) {
      if (error instanceof FormDataCoercionError) {
        throw new FormDataCoercionError(error.value, error.fieldType, key)
      }
      throw error
    }
  }

  return result
}

export { coerceFormData }
