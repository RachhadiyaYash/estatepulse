export function initials(name) {
  if (!name) return 'EP'
  return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
}

export function todayISO() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Format an INR amount in lakhs — e.g. 12000000 -> "₹120 L" (portal-wide consistency). */
export function formatLakh(value) {
  if (value == null || value === '') return null
  const num = Number(value)
  if (!Number.isFinite(num)) return null
  const lakhs = Math.round((num / 100000) * 100) / 100
  return `₹${lakhs.toLocaleString('en-IN')} L`
}

/** Format an INR range in lakhs — e.g. 12000000–40000000 -> "₹120 L - ₹400 L". */
export function formatLakhRange(lo, hi) {
  const a = formatLakh(lo)
  const b = formatLakh(hi)
  if (a && b) return a === b ? a : `${a} - ${b}`
  return a ?? b ?? '—'
}
