# coerce-form-data

Zero-dependency form data coercion.

Converts raw form values (strings) into properly typed JavaScript values (numbers, booleans, dates, etc.) and back again. Supports recursive structures: arrays, objects, and arbitrary nesting.

## Features

- Zero dependencies
- Recursive: arrays of objects, nested objects, arrays of arrays
- Full TypeScript support with inferred return types
- ESM and CommonJS builds
- Reversible: coerce form strings to typed values _and_ typed values back to form strings
- Throws `FormDataCoercionError` on invalid values — no silent `NaN` or `Invalid Date`

## Installation

```bash
npm install coerce-form-data
# or
pnpm add coerce-form-data
# or
yarn add coerce-form-data
```

## Quick Start

```ts
import { coerceValue } from 'coerce-form-data'

// Scalar coercion
coerceValue('42', { type: 'number' })          // 42
coerceValue('true', { type: 'boolean' })       // true
coerceValue('2024-05-06', { type: 'date' })    // Date(2024, 4, 6)

// Array coercion
coerceValue(['1', '2', '3'], { type: 'array', item: { type: 'number' } })
// [1, 2, 3]

// Object coercion
coerceValue(
  { name: 'Jane', age: '30', active: 'true' },
  {
    type: 'object',
    fields: {
      name: { type: 'string' },
      age: { type: 'number' },
      active: { type: 'boolean' },
    },
  },
)
// { name: 'Jane', age: 30, active: true }

// Deeply nested
coerceValue(
  { departments: [{ name: 'Eng', headcount: '50' }] },
  {
    type: 'object',
    fields: {
      departments: {
        type: 'array',
        item: {
          type: 'object',
          fields: {
            name: { type: 'string' },
            headcount: { type: 'number' },
          },
        },
      },
    },
  },
)
// { departments: [{ name: 'Eng', headcount: 50 }] }
```

Return types are **automatically inferred** from the field descriptors — no casts needed.

### With composable-functions

Use [composable-functions](https://github.com/seasonedcc/composable-functions)' `inputFromForm` to extract raw values from `FormData` (handling bracket notation, repeated keys, etc.), then pass the result to `coerceValue` for type coercion:

```ts
import { inputFromForm } from 'composable-functions'
import { coerceValue } from 'coerce-form-data'

const descriptor = {
  type: 'object',
  fields: {
    name: { type: 'string' },
    age: { type: 'number' },
  },
} as const

const raw = inputFromForm(formData)
const typed = coerceValue(raw, descriptor)
// { name: string, age: number }
```

## API

### `coerceValue(value, field?)`

Coerce a raw value into its typed representation. When no field descriptor is provided, the value is returned as-is.

```ts
// Scalars
coerceValue('42', { type: 'number' })               // 42
coerceValue('true', { type: 'boolean' })             // true
coerceValue('2024-05-06', { type: 'date' })          // Date(2024, 4, 6)
coerceValue('2024-05-06T14:30', { type: 'datetime' }) // Date(2024, 4, 6, 14, 30)
coerceValue('hello', { type: 'string' })             // 'hello'
coerceValue(file, { type: 'file' })                  // File (pass-through)

// Arrays
coerceValue(['1', '2'], { type: 'array', item: { type: 'number' } }) // [1, 2]

// Objects
coerceValue(
  { street: 'Main St', zip: '12345' },
  { type: 'object', fields: { street: { type: 'string' }, zip: { type: 'number' } } },
)
// { street: 'Main St', zip: 12345 }
```

Throws `FormDataCoercionError` for invalid values. For nested structures, the error includes a `path` indicating where the failure occurred.

### `coerceToForm(value, field)`

The reverse of `coerceValue`. Converts a typed JavaScript value into the string (or boolean) that an HTML form input expects. Works recursively for arrays and objects.

```ts
// Scalars
coerceToForm(42, { type: 'number' })                              // '42'
coerceToForm(true, { type: 'boolean' })                           // true
coerceToForm(new Date('2024-05-06T12:00:00Z'), { type: 'date' }) // '2024-05-06'
coerceToForm(new Date(2024, 4, 6, 14, 30), { type: 'datetime' }) // '2024-05-06T14:30:00'
coerceToForm(file, { type: 'file' })                              // undefined

// Arrays
coerceToForm([1, 2], { type: 'array', item: { type: 'number' } }) // ['1', '2']

// Objects
coerceToForm(
  { name: 'Jane', age: 30 },
  { type: 'object', fields: { name: { type: 'string' }, age: { type: 'number' } } },
)
// { name: 'Jane', age: '30' }
```

### `parseDate(value?)`

Formats a `Date` or ISO date-time string as a `YYYY-MM-DD` string suitable for `<input type="date">`. Uses local time for Date instances.

```ts
parseDate(new Date(2024, 4, 6))    // '2024-05-06'
parseDate('2024-05-06T12:00:00Z') // '2024-05-06'
parseDate(undefined)               // undefined
```

### `parseDatetime(value?)`

Formats a `Date` as a `YYYY-MM-DDTHH:mm:ss` string suitable for `<input type="datetime-local">`. Uses local time.

```ts
parseDatetime(new Date(2024, 4, 6, 14, 30, 45)) // '2024-05-06T14:30:45'
parseDatetime('2024-05-06T14:30')                // '2024-05-06T14:30'
parseDatetime(undefined)                          // undefined
```

### `FormDataCoercionError`

Thrown when a value cannot be coerced to the declared field type. Extends `Error` with `value`, `fieldType`, and `path` properties.

For nested structures, the `path` array indicates where the error occurred:

```ts
import { coerceValue, FormDataCoercionError } from 'coerce-form-data'

try {
  coerceValue(
    { departments: [{ name: 'Eng', headcount: 'bad' }] },
    {
      type: 'object',
      fields: {
        departments: {
          type: 'array',
          item: {
            type: 'object',
            fields: {
              name: { type: 'string' },
              headcount: { type: 'number' },
            },
          },
        },
      },
    },
  )
} catch (error) {
  if (error instanceof FormDataCoercionError) {
    error.value     // 'bad'
    error.fieldType // 'number'
    error.path      // ['departments', '0', 'headcount']
    error.message   // 'Cannot coerce "bad" to number at departments[0].headcount'
  }
}
```

## Field Descriptors

`FieldDescriptor` is a recursive discriminated union:

```ts
// Scalar fields
type ScalarFieldDescriptor = {
  type: 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'enum' | 'file' | null
  optional?: boolean
  nullable?: boolean
}

// Array fields — item describes each element
type ArrayFieldDescriptor = {
  type: 'array'
  item: FieldDescriptor
  optional?: boolean
  nullable?: boolean
}

// Object fields — fields describes the shape
type ObjectFieldDescriptor = {
  type: 'object'
  fields: Record<string, FieldDescriptor>
  optional?: boolean
  nullable?: boolean
}

type FieldDescriptor = ScalarFieldDescriptor | ArrayFieldDescriptor | ObjectFieldDescriptor
```

This mirrors [schema-info](https://github.com/seasonedcc/schema-info)'s `SchemaInfo` discriminated union, so a `SchemaInfo` value is structurally compatible as a `FieldDescriptor`.

### Coercion behavior by type

| Type | Input | Output |
| --- | --- | --- |
| `string` | `'hello'` | `'hello'` |
| `string` | falsy | `''` |
| `number` | `'42'` | `42` |
| `number` | falsy / invalid | throws `FormDataCoercionError` |
| `boolean` | `'on'`, `'true'`, truthy | `true` |
| `boolean` | `'false'` | `false` |
| `boolean` | `'null'` (required) | throws `FormDataCoercionError` |
| `boolean` | `'null'` (nullable) | `null` |
| `boolean` | `'null'` (optional) | `undefined` |
| `boolean` | falsy | `false` |
| `date` | `'2024-05-06'` | `Date(2024, 4, 6)` |
| `date` | falsy / invalid | throws `FormDataCoercionError` |
| `datetime` | `'2024-05-06T14:30'` | `Date(2024, 4, 6, 14, 30)` |
| `datetime` | falsy / invalid | throws `FormDataCoercionError` |
| `enum` | `'value'` | `'value'` |
| `enum` | falsy | `''` |
| `file` | `File` instance | `File` (pass-through) |
| `file` | falsy / non-File | throws `FormDataCoercionError` |
| `array` | `['1', '2']` with `item: { type: 'number' }` | `[1, 2]` |
| `array` | falsy | `[]` |
| `object` | `{ age: '30' }` with `fields: { age: { type: 'number' } }` | `{ age: 30 }` |
| `object` | falsy | recurse with `{}` (inner fields get defaults or throw) |

### Missing values

When a field value is missing (falsy), the `optional` and `nullable` flags control what is returned:

| Flags | Missing value returns |
| --- | --- |
| _(none)_ | Type-specific empty value (see table above), or throws for `number`/`date`/`datetime` |
| `optional: true` | `undefined` |
| `nullable: true` | `null` |
| both | `null` (nullable takes precedence) |

These flags work at every nesting level. An optional array returns `string[] | undefined`. An array of optional strings returns `(string | undefined)[]`.

## Type Inference

All functions infer return types from the field descriptors you pass:

```ts
coerceValue('42', { type: 'number' })
//=> number

coerceValue('42', { type: 'number', optional: true })
//=> number | undefined

coerceValue(['1'], { type: 'array', item: { type: 'number' } })
//=> number[]

coerceValue({}, {
  type: 'object',
  fields: {
    name: { type: 'string' },
    age: { type: 'number' },
  },
})
//=> { readonly name: string; readonly age: number }
```

The utility types `CoercedFieldValue` and `CoercedToFormValue` are also exported for use in your own code.

## Types

All types are exported:

```ts
import type {
  ScalarFieldType,      // 'string' | 'number' | 'boolean' | ...
  ScalarFieldDescriptor, // { type: ScalarFieldType | null, optional?, nullable? }
  ArrayFieldDescriptor,  // { type: 'array', item: FieldDescriptor, ... }
  ObjectFieldDescriptor, // { type: 'object', fields: Record<string, FieldDescriptor>, ... }
  FieldDescriptor,       // ScalarFieldDescriptor | ArrayFieldDescriptor | ObjectFieldDescriptor
  FormValue,             // Raw input value type
  CoercedFieldValue,     // Compute return type for coerceValue
  CoercedToFormValue,    // Compute return type for coerceToForm
} from 'coerce-form-data'
```

## License

[MIT](LICENSE.md)
