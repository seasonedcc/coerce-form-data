import type { FieldDescriptor, FieldType, FormValue } from './types'

function makeCoercion<T>(
  coercion: (value: FormValue) => T,
  emptyValue: unknown
) {
  return ({
    value,
    optional,
    nullable,
  }: {
    value: FormValue
    optional: boolean
    nullable: boolean
  }) => {
    if (value) return coercion(value)
    if (nullable) return null
    if (optional) return undefined

    return emptyValue
  }
}

const coerceString = makeCoercion(String, '')
const coerceNumber = makeCoercion(Number, null)

const coerceBoolean = makeCoercion(
  (value) =>
    value === 'false' ? false : value === 'null' ? null : Boolean(value),
  false
)

const coerceDate = makeCoercion((value) => {
  if (typeof value !== 'string') return null

  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}, null)

const coerceDatetime = makeCoercion((value) => {
  if (typeof value !== 'string') return null

  const [datePart, timePart] = value.split('T')
  if (!datePart || !timePart) return null

  const [year, month, day] = datePart.split('-').map(Number)
  const [hours, minutes, seconds] = timePart.split(':').map(Number)
  return new Date(year, month - 1, day, hours, minutes, seconds || 0)
}, null)

const arrayScalarCoercers: Partial<
  Record<FieldType, ReturnType<typeof makeCoercion>>
> = {
  'string-array': coerceString,
  'number-array': coerceNumber,
  'date-array': coerceDate,
  'datetime-array': coerceDatetime,
}

function coerceArray(
  value: FormValue,
  type: FieldType,
  optional: boolean,
  nullable: boolean
) {
  const scalarCoercer = arrayScalarCoercers[type]
  if (!scalarCoercer) return value

  const items = Array.isArray(value) ? value : value ? [value] : []

  if (items.length === 0) {
    if (nullable) return null
    if (optional) return undefined
    return []
  }

  return items.map((item) =>
    scalarCoercer({ value: item, optional: false, nullable: false })
  )
}

/**
 * Coerce a raw form value into its typed JavaScript representation.
 *
 * When no {@link FieldDescriptor} is provided the value is returned as-is.
 * Pass a descriptor to convert the value according to its declared type —
 * for example turning a `"123"` string into the number `123`.
 *
 * @param value - The raw value from a form field or query string
 * @param field - Optional descriptor declaring the target type
 * @returns The coerced value
 *
 * @example
 * ```ts
 * coerceValue('42', { type: 'number' }) // 42
 * ```
 *
 * @example
 * ```ts
 * coerceValue('true', { type: 'boolean' }) // true
 * ```
 *
 * @example
 * ```ts
 * coerceValue('2024-05-06', { type: 'date' })
 * // Date(2024, 4, 6)
 * ```
 *
 * @example
 * ```ts
 * coerceValue('2024-05-06T14:30', { type: 'datetime' })
 * // Date(2024, 4, 6, 14, 30)
 * ```
 *
 * @example
 * ```ts
 * coerceValue(['1', '2', '3'], { type: 'number-array' })
 * // [1, 2, 3]
 * ```
 */
function coerceValue(value: FormValue, field?: FieldDescriptor) {
  if (!field) return value

  const { type, optional = false, nullable = false } = field

  if (type && type in arrayScalarCoercers) {
    return coerceArray(value, type, optional, nullable)
  }

  if (type === 'boolean') {
    return coerceBoolean({ value, optional, nullable })
  }

  if (type === 'number') {
    return coerceNumber({ value, optional, nullable })
  }

  if (type === 'date') {
    return coerceDate({ value, optional, nullable })
  }

  if (type === 'datetime') {
    return coerceDatetime({ value, optional, nullable })
  }

  if (type === 'string' || type === 'enum') {
    return coerceString({ value, optional, nullable })
  }

  return value
}

export { coerceValue }
