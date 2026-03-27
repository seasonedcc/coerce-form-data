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
