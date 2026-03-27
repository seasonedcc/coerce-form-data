import { FormDataCoercionError } from './form-data-coercion-error'
import type {
  ArrayFieldDescriptor,
  CoercedFieldValue,
  FieldDescriptor,
  FormValue,
  ObjectFieldDescriptor,
  ScalarFieldType,
} from './types'

function makeCoercion<T>(
  fieldType: ScalarFieldType,
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

function coerceValue(value: FormValue): FormValue
function coerceValue<const F extends FieldDescriptor>(
  value: FormValue,
  field: F
): CoercedFieldValue<F>
function coerceValue(value: FormValue, field?: FieldDescriptor) {
  if (!field) return value

  const { type, optional = false, nullable = false } = field

  if (type === 'array') {
    const { item } = field as ArrayFieldDescriptor
    const items = Array.isArray(value) ? value : value ? [value] : []

    if (items.length === 0) {
      if (nullable) return null
      if (optional) return undefined
      return []
    }

    return items.map((element, index) => {
      try {
        return coerceValue(element as FormValue, item)
      } catch (error) {
        if (error instanceof FormDataCoercionError) {
          throw new FormDataCoercionError(error.value, error.fieldType, [
            String(index),
            ...error.path,
          ])
        }
        throw error
      }
    })
  }

  if (type === 'object') {
    const { fields } = field as ObjectFieldDescriptor
    const isRecord = value && typeof value === 'object' && !Array.isArray(value)

    if (!isRecord) {
      if (nullable) return null
      if (optional) return undefined
    }

    const record = (isRecord ? value : {}) as Record<string, unknown>
    const result: Record<string, unknown> = {}

    for (const key of Object.keys(fields)) {
      try {
        result[key] = coerceValue(record[key] as FormValue, fields[key])
      } catch (error) {
        if (error instanceof FormDataCoercionError) {
          throw new FormDataCoercionError(error.value, error.fieldType, [
            key,
            ...error.path,
          ])
        }
        throw error
      }
    }

    return result
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

  if (type === 'file') {
    if (value instanceof File) return value
    if (!value) {
      if (nullable) return null
      if (optional) return undefined
    }
    throw new FormDataCoercionError(value, 'file')
  }

  return value
}

export { coerceValue }
