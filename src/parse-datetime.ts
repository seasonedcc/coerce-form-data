/**
 * Format a {@link Date} as a `YYYY-MM-DDTHH:mm:ss` string suitable for
 * `<input type="datetime-local">`.
 *
 * Uses local time, consistent with how the browser interprets
 * `datetime-local` values. For date-only formatting see {@link parseDate}.
 *
 * @param value - A Date instance or a datetime string
 * @returns The local datetime as `YYYY-MM-DDTHH:mm:ss`, or `undefined`
 *   when the input is falsy
 *
 * @example
 * ```ts
 * parseDatetime(new Date(2024, 4, 6, 14, 30, 45))
 * // '2024-05-06T14:30:45'
 * ```
 *
 * @example
 * ```ts
 * parseDatetime(undefined) // undefined
 * ```
 */
function parseDatetime(value?: Date | string) {
  if (!value) return value

  if (typeof value === 'string') return value

  const pad = (n: number) => String(n).padStart(2, '0')
  const year = value.getFullYear()
  const month = pad(value.getMonth() + 1)
  const day = pad(value.getDate())
  const hours = pad(value.getHours())
  const minutes = pad(value.getMinutes())
  const seconds = pad(value.getSeconds())
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

export { parseDatetime }
