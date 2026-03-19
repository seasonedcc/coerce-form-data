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
