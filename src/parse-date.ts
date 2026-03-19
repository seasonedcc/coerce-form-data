/**
 * Format a {@link Date} or ISO date-time string as a `YYYY-MM-DD` string
 * suitable for `<input type="date">`.
 *
 * For datetime-local formatting see {@link parseDatetime}.
 *
 * @param value - A Date instance or an ISO string
 * @returns The date portion as `YYYY-MM-DD`, or `undefined` when the input
 *   is falsy
 *
 * @example
 * ```ts
 * parseDate(new Date('2024-05-06T12:00:00Z')) // '2024-05-06'
 * ```
 *
 * @example
 * ```ts
 * parseDate('2024-05-06T12:00:00Z') // '2024-05-06'
 * ```
 */
function parseDate(value?: Date | string) {
  if (!value) return value

  const dateTime = typeof value === 'string' ? value : value.toISOString()
  const [date] = dateTime.split('T')
  return date
}

export { parseDate }
