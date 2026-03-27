function formatPath(path: string[]) {
  return path.reduce(
    (acc, segment) =>
      /^\d+$/.test(segment)
        ? `${acc}[${segment}]`
        : acc
          ? `${acc}.${segment}`
          : segment,
    ''
  )
}

/**
 * Thrown when a form value cannot be coerced to the declared field type.
 *
 * For nested structures the {@link path} property indicates where the
 * error occurred, formatted as `departments[0].headcount` in the message.
 *
 * @example
 * ```ts
 * try {
 *   coerceValue('not-a-number', { type: 'number' })
 * } catch (error) {
 *   if (error instanceof FormDataCoercionError) {
 *     error.value     // 'not-a-number'
 *     error.fieldType // 'number'
 *     error.path      // []
 *   }
 * }
 * ```
 */
class FormDataCoercionError extends Error {
  public readonly path: string[]

  constructor(
    public readonly value: unknown,
    public readonly fieldType: string,
    path?: string[]
  ) {
    const location = path?.length ? ` at ${formatPath(path)}` : ''
    super(`Cannot coerce ${JSON.stringify(value)} to ${fieldType}${location}`)
    this.name = 'FormDataCoercionError'
    this.path = path ?? []
  }
}

export { FormDataCoercionError }
