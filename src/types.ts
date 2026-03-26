/**
 * Supported field types for coercion.
 *
 * @example
 * ```ts
 * const type: FieldType = 'string'
 * ```
 *
 * @example
 * ```ts
 * const type: FieldType = 'datetime'
 * ```
 */
type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'enum'
  | 'string-array'
  | 'number-array'
  | 'date-array'
  | 'datetime-array'
  | 'file'

/**
 * Schema-agnostic descriptor for a form field.
 *
 * Tells the coercion functions what type a field is and whether it accepts
 * `null` or `undefined` values. This is the only information needed to
 * convert between raw form strings and typed JavaScript values.
 *
 * @example
 * ```ts
 * const field: FieldDescriptor = { type: 'number', optional: true }
 * ```
 *
 * @example
 * ```ts
 * const field: FieldDescriptor = { type: 'datetime', nullable: true }
 * ```
 */
type FieldDescriptor = {
  type: FieldType | null
  optional?: boolean
  nullable?: boolean
}

/**
 * Any object that exposes `.get()` and `.getAll()` for reading entries
 * by key — the subset of the {@link FormData} API that coercion needs.
 *
 * Both the web standard `FormData` and `URLSearchParams` satisfy this
 * type structurally, as does any custom implementation with the same
 * methods.
 *
 * @example
 * ```ts
 * coerceFormData(new FormData(), fields)
 * ```
 *
 * @example
 * ```ts
 * coerceFormData(new URLSearchParams('?page=2'), fields)
 * ```
 */
type FormDataLike = {
  get(key: string): FormDataEntryValue | null
  getAll(key: string): FormDataEntryValue[]
}

/**
 * A raw value that can appear in form data.
 *
 * Covers the web standard {@link FormDataEntryValue} (string or File),
 * plain strings, string arrays (from parsed query strings), and missing
 * values.
 */
type FormValue =
  | FormDataEntryValue
  | FormDataEntryValue[]
  | string
  | string[]
  | null
  | undefined

/**
 * A plain record of raw form values keyed by field name.
 *
 * @example
 * ```ts
 * const data: FormRecord = { name: 'Jane', age: '30' }
 * ```
 *
 * @example
 * ```ts
 * const data: FormRecord = { scheduledAt: '2024-05-06T14:30' }
 * ```
 */
type FormRecord = Record<string, FormValue>

/**
 * A map of field names to their descriptors.
 *
 * @example
 * ```ts
 * const fields: FieldDescriptors = {
 *   name: { type: 'string' },
 *   age: { type: 'number', optional: true },
 * }
 * ```
 *
 * @example
 * ```ts
 * const fields: FieldDescriptors = {
 *   scheduledAt: { type: 'datetime' },
 * }
 * ```
 */
type FieldDescriptors = Record<string, FieldDescriptor>

/**
 * Maps each {@link FieldType} to the JavaScript type that
 * {@link coerceValue} produces.
 *
 * @example
 * ```ts
 * type N = FieldTypeMap['number'] // number
 * ```
 */
type FieldTypeMap = {
  string: string
  enum: string
  number: number
  boolean: boolean
  date: Date
  datetime: Date
  'string-array': string[]
  'number-array': number[]
  'date-array': Date[]
  'datetime-array': Date[]
  file: File
}

/**
 * Compute the return type of {@link coerceValue} for a given
 * {@link FieldDescriptor}.
 *
 * The base type comes from {@link FieldTypeMap}. Setting `nullable` adds
 * `| null` and setting `optional` adds `| undefined`.
 *
 * @example
 * ```ts
 * type A = CoercedFieldValue<{ type: 'number' }>                // number
 * ```
 *
 * @example
 * ```ts
 * type B = CoercedFieldValue<{ type: 'string'; optional: true }> // string | undefined
 * ```
 */
type CoercedFieldValue<F extends FieldDescriptor> =
  F['type'] extends keyof FieldTypeMap
    ?
        | FieldTypeMap[F['type']]
        | (F extends { nullable: true } ? null : never)
        | (F extends { optional: true } ? undefined : never)
    : unknown

/**
 * Compute the return type of {@link coerceFormData} for a given map of
 * {@link FieldDescriptors}.
 *
 * @example
 * ```ts
 * type R = CoercedFormData<{ name: { type: 'string' }; age: { type: 'number' } }>
 * // { name: string; age: number }
 * ```
 */
type CoercedFormData<F extends FieldDescriptors> = {
  [K in keyof F]: CoercedFieldValue<F[K]>
}

/**
 * Maps each {@link FieldType} to the value that {@link coerceToForm}
 * produces — the representation suitable for HTML form inputs.
 *
 * @example
 * ```ts
 * type N = FormFieldTypeMap['number'] // string
 * ```
 */
type FormFieldTypeMap = {
  string: string
  enum: string
  number: string
  boolean: boolean
  date: string | undefined
  datetime: string | undefined
  'string-array': string[]
  'number-array': string[]
  'date-array': string[]
  'datetime-array': string[]
  file: undefined
}

/**
 * Compute the return type of {@link coerceToForm} for a given
 * {@link FieldDescriptor}.
 *
 * @example
 * ```ts
 * type A = CoercedToFormValue<{ type: 'number' }> // string
 * ```
 *
 * @example
 * ```ts
 * type B = CoercedToFormValue<{ type: 'date' }> // string | undefined
 * ```
 */
type CoercedToFormValue<F extends FieldDescriptor> =
  F['type'] extends keyof FormFieldTypeMap
    ? FormFieldTypeMap[F['type']]
    : unknown

export type {
  FieldType,
  FieldDescriptor,
  FormDataLike,
  FormValue,
  FormRecord,
  FieldDescriptors,
  FieldTypeMap,
  CoercedFieldValue,
  CoercedFormData,
  FormFieldTypeMap,
  CoercedToFormValue,
}
