# coerce-form-data

Zero-dependency form data coercion using web standard APIs.

Converts raw form values (strings from HTML forms or `FormData` objects) into properly typed JavaScript values (numbers, booleans, dates, etc.) and back again.

## Features

- Zero dependencies
- Works with web standard `FormData` and plain objects
- Full TypeScript support with strict typing
- ESM and CommonJS builds
- Reversible: coerce form strings to typed values _and_ typed values back to form strings

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
// { name: 'Jane', age: 30, agree: true, birthday: Date(1994, 5, 15), scheduledAt: Date(2024, 4, 6, 14, 30) }
```

It also works with plain objects:

```ts
coerceFormData(
  { agree: 'on', count: '5' },
  { agree: { type: 'boolean' }, count: { type: 'number' } },
)
// { agree: true, count: 5 }
```

## API

### `coerceFormData(data, fields)`

Coerce every field in a `FormData` or plain record according to a map of field descriptors. Only keys present in `fields` are included in the result.

```ts
coerceFormData(
  data: FormData | FormRecord,
  fields: FieldDescriptors,
): Record<string, unknown>
```

### `coerceValue(value, field?)`

Coerce a single raw form value into its typed representation. When no field descriptor is provided, the value is returned as-is.

```ts
coerceValue('42', { type: 'number' })               // 42
coerceValue('true', { type: 'boolean' })            // true
coerceValue('2024-05-06', { type: 'date' })         // Date(2024, 4, 6)
coerceValue('2024-05-06T14:30', { type: 'datetime' }) // Date(2024, 4, 6, 14, 30)
coerceValue('hello', { type: 'string' })            // 'hello'
```

### `coerceToForm(value, field)`

The reverse of `coerceValue`. Converts a typed JavaScript value into the string (or boolean) that an HTML form input expects.

```ts
coerceToForm(42, { type: 'number' })                              // '42'
coerceToForm(true, { type: 'boolean' })                           // true
coerceToForm(new Date('2024-05-06T12:00:00Z'), { type: 'date' }) // '2024-05-06'
coerceToForm(new Date(2024, 4, 6, 14, 30), { type: 'datetime' }) // '2024-05-06T14:30:00'
```

### `parseDate(value?)`

Formats a `Date` or ISO date-time string as a `YYYY-MM-DD` string suitable for `<input type="date">`.

```ts
parseDate(new Date('2024-05-06T12:00:00Z')) // '2024-05-06'
parseDate('2024-05-06T12:00:00Z')           // '2024-05-06'
parseDate(undefined)                         // undefined
```

### `parseDatetime(value?)`

Formats a `Date` as a `YYYY-MM-DDTHH:mm:ss` string suitable for `<input type="datetime-local">`. Uses local time.

```ts
parseDatetime(new Date(2024, 4, 6, 14, 30, 45)) // '2024-05-06T14:30:45'
parseDatetime('2024-05-06T14:30')                // '2024-05-06T14:30'
parseDatetime(undefined)                          // undefined
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

Where `FieldType` is one of: `'string'` | `'number'` | `'boolean'` | `'date'` | `'datetime'` | `'enum'`

### Coercion behavior by type

| Type | Input | Output |
| --- | --- | --- |
| `string` | `'hello'` | `'hello'` |
| `string` | falsy | `''` |
| `number` | `'42'` | `42` |
| `number` | falsy | `null` |
| `boolean` | `'on'`, `'true'`, truthy | `true` |
| `boolean` | `'false'` | `false` |
| `boolean` | falsy | `false` |
| `date` | `'2024-05-06'` | `Date(2024, 4, 6)` |
| `date` | falsy | `null` |
| `datetime` | `'2024-05-06T14:30'` | `Date(2024, 4, 6, 14, 30)` |
| `datetime` | `'2024-05-06T14:30:45'` | `Date(2024, 4, 6, 14, 30, 45)` |
| `datetime` | falsy | `null` |
| `enum` | `'value'` | `'value'` |
| `enum` | falsy | `''` |

### Missing values

When a field value is missing (falsy), the `optional` and `nullable` flags control what is returned:

| Flags | Missing value returns |
| --- | --- |
| _(none)_ | Type-specific empty value (see table above) |
| `optional: true` | `undefined` |
| `nullable: true` | `null` |
| both | `null` (nullable takes precedence) |

## Types

All types are exported for use in your own code:

```ts
import type {
  FieldType,        // 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'enum'
  FieldDescriptor,  // { type, optional?, nullable? }
  FieldDescriptors, // Record<string, FieldDescriptor>
  FormValue,        // FormDataEntryValue | string | string[] | null | undefined
  FormRecord,       // Record<string, FormValue>
} from 'coerce-form-data'
```

## License

[MIT](LICENSE.md)
