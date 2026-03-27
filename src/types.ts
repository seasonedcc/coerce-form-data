/**
 * Supported scalar field types for coercion.
 *
 * @example
 * ```ts
 * const type: ScalarFieldType = 'string'
 * ```
 */
type ScalarFieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'enum'
  | 'file'

/**
 * Descriptor for a scalar form field.
 *
 * @example
 * ```ts
 * const field: ScalarFieldDescriptor = { type: 'number', optional: true }
 * ```
 */
type ScalarFieldDescriptor = {
  type: ScalarFieldType | null
  optional?: boolean
  nullable?: boolean
}

/**
 * Descriptor for an array field. The `item` property describes each element
 * recursively, so arrays of objects, arrays of arrays, etc. are supported.
 *
 * @example
 * ```ts
 * const field: ArrayFieldDescriptor = {
 *   type: 'array',
 *   item: { type: 'number' },
 * }
 * ```
 *
 * @example
 * ```ts
 * const field: ArrayFieldDescriptor = {
 *   type: 'array',
 *   item: { type: 'object', fields: { name: { type: 'string' } } },
 * }
 * ```
 */
type ArrayFieldDescriptor = {
  type: 'array'
  item: FieldDescriptor
  optional?: boolean
  nullable?: boolean
}

/**
 * Descriptor for an object field. The `fields` property maps each key to
 * its own {@link FieldDescriptor}, enabling arbitrary nesting.
 *
 * @example
 * ```ts
 * const field: ObjectFieldDescriptor = {
 *   type: 'object',
 *   fields: {
 *     name: { type: 'string' },
 *     age: { type: 'number', optional: true },
 *   },
 * }
 * ```
 */
type ObjectFieldDescriptor = {
  type: 'object'
  fields: Record<string, FieldDescriptor>
  optional?: boolean
  nullable?: boolean
}

/**
 * A recursive discriminated union describing the shape of a form field.
 *
 * Structurally compatible with schema-info's `SchemaInfo` type — the
 * property names (`item`, `fields`) and discriminant (`type`) are
 * intentionally identical.
 *
 * @example
 * ```ts
 * const field: FieldDescriptor = { type: 'number', optional: true }
 * ```
 *
 * @example
 * ```ts
 * const field: FieldDescriptor = {
 *   type: 'array',
 *   item: { type: 'object', fields: { name: { type: 'string' } } },
 * }
 * ```
 */
type FieldDescriptor =
  | ScalarFieldDescriptor
  | ArrayFieldDescriptor
  | ObjectFieldDescriptor

/**
 * A raw value that can be passed to {@link coerceValue}.
 *
 * Covers strings, string arrays, File instances, nested objects/arrays,
 * and missing values.
 */
type FormValue =
  | FormDataEntryValue
  | FormDataEntryValue[]
  | string
  | string[]
  | Record<string, unknown>
  | unknown[]
  | null
  | undefined

/**
 * Maps each {@link ScalarFieldType} to the JavaScript type that
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
  file: File
}

/**
 * Compute the return type of {@link coerceValue} for a given
 * {@link FieldDescriptor}. Recurses for arrays and objects.
 *
 * Setting `nullable` adds `| null` and setting `optional` adds
 * `| undefined` at each level.
 *
 * @example
 * ```ts
 * type A = CoercedFieldValue<{ type: 'number' }>                // number
 * type B = CoercedFieldValue<{ type: 'number'; optional: true }> // number | undefined
 * type C = CoercedFieldValue<{ type: 'array'; item: { type: 'string' } }> // string[]
 * ```
 */
type CoercedFieldValue<F extends FieldDescriptor> =
  | (F extends ArrayFieldDescriptor
      ? CoercedFieldValue<F['item']>[]
      : F extends ObjectFieldDescriptor
        ? { [K in keyof F['fields']]: CoercedFieldValue<F['fields'][K]> }
        : F['type'] extends keyof FieldTypeMap
          ? FieldTypeMap[F['type']]
          : unknown)
  | (F extends { nullable: true } ? null : never)
  | (F extends { optional: true } ? undefined : never)

/**
 * Maps each {@link ScalarFieldType} to the value that {@link coerceToForm}
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
  file: undefined
}

/**
 * Compute the return type of {@link coerceToForm} for a given
 * {@link FieldDescriptor}. Recurses for arrays and objects.
 *
 * @example
 * ```ts
 * type A = CoercedToFormValue<{ type: 'number' }> // string
 * type B = CoercedToFormValue<{ type: 'array'; item: { type: 'number' } }> // string[]
 * ```
 */
type CoercedToFormValue<F extends FieldDescriptor> =
  F extends ArrayFieldDescriptor
    ? CoercedToFormValue<F['item']>[]
    : F extends ObjectFieldDescriptor
      ? { [K in keyof F['fields']]: CoercedToFormValue<F['fields'][K]> }
      : F['type'] extends keyof FormFieldTypeMap
        ? FormFieldTypeMap[F['type']]
        : unknown

export type {
  ScalarFieldType,
  ScalarFieldDescriptor,
  ArrayFieldDescriptor,
  ObjectFieldDescriptor,
  FieldDescriptor,
  FormValue,
  FieldTypeMap,
  CoercedFieldValue,
  FormFieldTypeMap,
  CoercedToFormValue,
}
