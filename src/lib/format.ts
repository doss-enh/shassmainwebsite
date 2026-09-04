export function formatShortDate(date: string | Date) {
  const d = new Date(date)
  return d.toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})
}

export function formatDateTime(date: string | Date) {
  const d = new Date(date)
  return d.toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'})
}

export function buildDailySeries(dates: string[], days = 14) {
  const buckets = new Map<string, number>()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    buckets.set(d.toISOString().slice(0, 10), 0)
  }

  for (const raw of dates) {
    const key = new Date(raw).toISOString().slice(0, 10)
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) || 0) + 1)
  }

  return Array.from(buckets.entries()).map(([key, count]) => ({
    date: formatShortDate(key),
    count,
  }))
}

export function percentChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}
