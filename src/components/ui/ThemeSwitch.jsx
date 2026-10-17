import { useTheme } from '../context/useTheme'

const OPTIONS = [
  { mode: 'light', icon: 'fa-sun', label: 'Light theme' },
  { mode: 'dark', icon: 'fa-moon', label: 'Dark theme' },
  { mode: 'system', icon: 'fa-circle-half-stroke', label: 'Match system theme' },
]

export default function ThemeSwitch() {
  const { mode, setMode } = useTheme()
  return (
    <div
      role="group"
      aria-label="Theme"
      className="inline-flex gap-0.5 rounded-lg border border-outline-subtle bg-surface-card p-0.75"
    >
      {OPTIONS.map((o) => {
        const active = mode === o.mode
        return (
          <button
            key={o.mode}
            type="button"
            title={o.label}
            aria-label={o.label}
            aria-pressed={active}
            onClick={() => setMode(o.mode)}
            className={`inline-flex h-8 w-8.5 items-center justify-center rounded-[10px] text-[0.82rem] transition duration-200 ${
              active ? 'bg-accent/15 text-accent' : 'text-on-surface-muted hover:text-on-surface'
            }`}
          >
            <i className={`fas ${o.icon}`} />
          </button>
        )
      })}
    </div>
  )
}
