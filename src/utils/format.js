export function initials(name) {
  if (!name) return 'EP'
  return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
}

export function todayISO() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
