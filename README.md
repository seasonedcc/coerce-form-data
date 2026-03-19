# coerce-form-data

Zero-dependency form data coercion using web standard APIs.

Converts raw form values (strings from `FormData`, `URLSearchParams`, or plain objects) into properly typed JavaScript values (numbers, booleans, dates, etc.) and back again.

## Features

- Zero dependencies
- Works with `FormData`, `URLSearchParams`, and plain objects
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
import { coerceFormData } from 'coerce-form-data'

const formData = new FormData()
formData.set('name', 'Jane')
formData.set('age', '30')
formData.set('agree', 'on')
formData.set('birthday', '1994-06-15')
formData.set('scheduledAt', '2024-05-06T14:30')

const result = coerceFormData(formData, {
  name: { type: 'string' },
  age: { type: 'number' },
  agree: { type: 'boolean' },
  birthday: { type: 'date' },
  scheduledAt: { type: 'datetime' },
})

result.name        // string
result.age         // number
result.agree       // boolean
result.birthday    // Date
result.scheduledAt // Date
```

Return types are **automatically inferred** from the field descriptors — no casts needed.

It also works with `URLSearchParams` and plain objects:

```ts
const params = new URLSearchParams('?page=2&active=true')
coerceFormData(params, {
  page: { type: 'number' },
  active: { type: 'boolean' },
})
// { page: 2, active: true }
```

```ts
coerceFormData(
  { agree: 'on', count: '5' },
  { agree: { type: 'boolean' }, count: { type: 'number' } },
)
// { agree: true, count: 5 }
```

## API

### `coerceFormData(data, fields)`

Coerce every field in a `FormDataLike` source or plain record according to a map of field descriptors. Only keys present in `fields` are included in the result.

Accepts any object with `.get()` and `.getAll()` methods (`FormData`, `URLSearchParams`, or custom implementations) as well as plain key/value records.

```ts
coerceFormData(
  data: FormDataLike | FormRecord,
  fields: FieldDescriptors,
): CoercedFormData<typeof fields>
```

Throws `FormDataCoercionError` if any value is invalid for its declared type. The error includes a `fieldName` property identifying which field failed.

### `coerceValue(value, field?)`

Coerce a single raw form value into its typed representation. When no field descriptor is provided, the value is returned as-is.

```ts
coerceValue('42', { type: 'number' })               // 42
coerceValue('true', { type: 'boolean' })            // true
coerceValue('2024-05-06', { type: 'date' })         // Date(2024, 4, 6)
coerceValue('2024-05-06T14:30', { type: 'datetime' }) // Date(2024, 4, 6, 14, 30)
coerceValue('hello', { type: 'string' })            // 'hello'
coerceValue(['1', '2', '3'], { type: 'number-array' }) // [1, 2, 3]
```

Throws `FormDataCoercionError` for invalid values (e.g. `'abc'` for a `number` field).

### `coerceToForm(value, field)`

The reverse of `coerceValue`. Converts a typed JavaScript value into the string (or boolean) that an HTML form input expects.

```ts
coerceToForm(42, { type: 'number' })                              // '42'
coerceToForm(true, { type: 'boolean' })                           // true
coerceToForm(new Date('2024-05-06T12:00:00Z'), { type: 'date' }) // '2024-05-06'
coerceToForm(new Date(2024, 4, 6, 14, 30), { type: 'datetime' }) // '2024-05-06T14:30:00'
coerceToForm([1, 2], { type: 'number-array' })                    // ['1', '2']
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

Thrown when a value cannot be coerced to the declared field type. Extends `Error` with `value`, `fieldType`, and `fieldName` properties.

When thrown from `coerceFormData`, the `fieldName` property identifies which field caused the error.

```ts
import { coerceFormData, FormDataCoercionError } from 'coerce-form-data'

try {
  const fd = new FormData()
  fd.set('age', 'not-a-number')
  coerceFormData(fd, { age: { type: 'number' } })
} catch (error) {
  if (error instanceof FormDataCoercionError) {
    error.value     // 'not-a-number'
    error.fieldType // 'number'
    error.fieldName // 'age'
    error.message   // 'Cannot coerce "not-a-number" to number (field: age)'
  }
}
```

## Field Descriptors

Each field is described by a `FieldDescriptor`:

```ts
type FieldDescriptor = {
  type: FieldType | null
  optional?: boolean
  nullable?: boolean
}
```

Where `FieldType` is one of:

**Scalar types:** `'string'` | `'number'` | `'boolean'` | `'date'` | `'datetime'` | `'enum'`

**Array types:** `'string-array'` | `'number-array'` | `'date-array'` | `'datetime-array'`

Array types use `.getAll()` to collect multiple values (e.g. from `<select multiple>` or checkbox groups) and coerce each element individually.

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
| `string-array` | `['a', 'b']` | `['a', 'b']` |
| `string-array` | falsy | `[]` |
| `number-array` | `['1', '2']` | `[1, 2]` |
| `number-array` | falsy | `[]` |
| `date-array` | `['2024-01-01']` | `[Date(2024, 0, 1)]` |
| `date-array` | falsy | `[]` |
| `datetime-array` | `['2024-01-01T10:00']` | `[Date(2024, 0, 1, 10, 0)]` |
| `datetime-array` | falsy | `[]` |

### Missing values

When a field value is missing (falsy), the `optional` and `nullable` flags control what is returned:

| Flags | Missing value returns |
| --- | --- |
| _(none)_ | Type-specific empty value (see table above), or throws for `number`/`date`/`datetime` |
| `optional: true` | `undefined` |
| `nullable: true` | `null` |
| both | `null` (nullable takes precedence) |

## Type Inference

All functions infer return types from the field descriptors you pass:

```ts
const result = coerceFormData(formData, {
  name: { type: 'string' },                 // → string
  age: { type: 'number', optional: true },   // → number | undefined
  bio: { type: 'string', nullable: true },   // → string | null
  birthday: { type: 'date' },               // → Date
  tags: { type: 'string-array' },           // → string[]
})
```

The utility types `CoercedFieldValue`, `CoercedFormData`, and `CoercedToFormValue` are also exported for use in your own code.

## Types

All types are exported for use in your own code:

```ts
import type {
  FieldType,          // 'string' | 'number' | ... | 'string-array' | ...
  FieldDescriptor,    // { type, optional?, nullable? }
  FieldDescriptors,   // Record<string, FieldDescriptor>
  FormDataLike,       // { get(key): ...; getAll(key): ... }
  FormValue,          // FormDataEntryValue | string | string[] | null | undefined
  FormRecord,         // Record<string, FormValue>
  CoercedFieldValue,  // Compute the return type for a single field
  CoercedFormData,    // Compute the return type for coerceFormData
  CoercedToFormValue, // Compute the return type for coerceToForm
} from 'coerce-form-data'
```

## License

[MIT](LICENSE.md)
