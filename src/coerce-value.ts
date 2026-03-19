import { FormDataCoercionError } from './form-data-coercion-error'
import type {
  CoercedFieldValue,
  FieldDescriptor,
  FieldType,
  FormValue,
} from './types'

function makeCoercion<T>(
  fieldType: FieldType,
  coercion: (value: FormValue) => T,
  emptyValue: 'throw' | unknown
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

    if (emptyValue === 'throw') {
      throw new FormDataCoercionError(value, fieldType)
    }

    return emptyValue
  }
}

const coerceString = makeCoercion('string', String, '')

const coerceNumber = makeCoercion(
  'number',
  (value) => {
    const result = Number(value)
    if (Number.isNaN(result)) {
      throw new FormDataCoercionError(value, 'number')
    }
    return result
  },
  'throw'
)

const coerceBoolean = makeCoercion(
  'boolean',
  (value) => (value === 'false' ? false : Boolean(value)),
  false
)

const coerceDate = makeCoercion(
  'date',
  (value) => {
    if (typeof value !== 'string') {
      throw new FormDataCoercionError(value, 'date')
    }
    const [year, month, day] = value.split('-').map(Number)
    const result = new Date(year, month - 1, day)
    if (Number.isNaN(result.getTime())) {
      throw new FormDataCoercionError(value, 'date')
    }
    return result
  },
  'throw'
)

const coerceDatetime = makeCoercion(
  'datetime',
  (value) => {
    if (typeof value !== 'string') {
      throw new FormDataCoercionError(value, 'datetime')
    }
    const [datePart, timePart] = value.split('T')
    if (!datePart || !timePart) {
      throw new FormDataCoercionError(value, 'datetime')
    }
    const [year, month, day] = datePart.split('-').map(Number)
    const [hours, minutes, seconds] = timePart.split(':').map(Number)
    const result = new Date(year, month - 1, day, hours, minutes, seconds || 0)
    if (Number.isNaN(result.getTime())) {
      throw new FormDataCoercionError(value, 'datetime')
    }
    return result
  },
  'throw'
)

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
 * Throws {@link FormDataCoercionError} when the value cannot be coerced to
 * the declared type (e.g. a non-numeric string for a `number` field, or an
 * empty value for a required `number`/`date`/`datetime` field).
 *
 * @param value - The raw value from a form field or query string
 * @param field - Optional descriptor declaring the target type
 * @returns The coerced value
 * @throws {FormDataCoercionError} When the value is invalid for the declared type
 *
 * @example
 * ```ts
 * coerceValue('42', { type: 'number' }) // 42
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
 * coerceValue(['1', '2', '3'], { type: 'number-array' })
 * // [1, 2, 3]
 * ```
 */
function coerceValue(value: FormValue): FormValue
function coerceValue<const F extends FieldDescriptor>(
  value: FormValue,
  field: F
): CoercedFieldValue<F>
function coerceValue(value: FormValue, field?: FieldDescriptor) {
  if (!field) return value

  const { type, optional = false, nullable = false } = field

  if (type && type in arrayScalarCoercers) {
    return coerceArray(value, type, optional, nullable)
  }

  if (type === 'boolean') {
    if (value === 'null') {
      if (nullable) return null
      if (optional) return undefined
      throw new FormDataCoercionError(value, 'boolean')
    }
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
