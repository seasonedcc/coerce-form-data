/**
 * Format a {@link Date} or ISO date-time string as a `YYYY-MM-DD` string
 * suitable for `<input type="date">`.
 *
 * Uses local time for Date instances, consistent with how the browser
 * interprets date input values. For datetime-local formatting see
 * {@link parseDatetime}.
 *
 * @param value - A Date instance or an ISO string
 * @returns The date portion as `YYYY-MM-DD`, or `undefined` when the input
 *   is falsy
 *
 * @example
 * ```ts
 * parseDate(new Date(2024, 4, 6)) // '2024-05-06'
 * ```
 *
 * @example
 * ```ts
 * parseDate('2024-05-06T12:00:00Z') // '2024-05-06'
 * ```
 */
function parseDate(value?: Date | string) {
  if (!value) return value

  if (typeof value === 'string') {
    const [date] = value.split('T')
    return date
  }

  const pad = (n: number) => String(n).padStart(2, '0')
  const year = value.getFullYear()
  const month = pad(value.getMonth() + 1)
  const day = pad(value.getDate())
  return `${year}-${month}-${day}`
}

export { parseDate }
