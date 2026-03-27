type ScalarFieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'enum'
  | 'file'

type ScalarFieldDescriptor = {
  type: ScalarFieldType | null
  optional?: boolean
  nullable?: boolean
}

type ArrayFieldDescriptor = {
  type: 'array'
  item: FieldDescriptor
  optional?: boolean
  nullable?: boolean
}

type ObjectFieldDescriptor = {
  type: 'object'
  fields: Record<string, FieldDescriptor>
  optional?: boolean
  nullable?: boolean
}

type FieldDescriptor =
  | ScalarFieldDescriptor
  | ArrayFieldDescriptor
  | ObjectFieldDescriptor

type FormValue =
  | FormDataEntryValue
  | FormDataEntryValue[]
  | string
  | string[]
  | Record<string, unknown>
  | unknown[]
  | null
  | undefined

type FieldTypeMap = {
  string: string
  enum: string
  number: number
  boolean: boolean
  date: Date
  datetime: Date
  file: File
}

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

type FormFieldTypeMap = {
  string: string
  enum: string
  number: string
  boolean: boolean
  date: string | undefined
  datetime: string | undefined
  file: undefined
}

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
