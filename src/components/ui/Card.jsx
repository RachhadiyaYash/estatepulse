export function Card({ className = '', children }) {
  return (
    <div className={`mb-6 overflow-hidden rounded-lg border border-outline-subtle bg-surface-card shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-subtle px-6 py-[1.1rem]">
      <div>
        <h2 className="text-base font-extrabold tracking-[-0.03em] text-on-surface">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[0.78rem] text-on-surface-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}
