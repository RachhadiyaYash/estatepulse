const VARIANTS = {
  primary: 'bg-brand text-on-brand hover:-translate-y-px hover:brightness-105 active:translate-y-0',
  secondary:
    'border-outline-subtle bg-surface-card text-on-surface hover:border-accent hover:text-accent',
  ghost: 'text-on-surface-variant hover:bg-surface-dim hover:text-on-surface',
}

const SIZES = {
  md: 'h-10 px-4 text-[0.8rem]',
  sm: 'h-8 px-3 text-[0.75rem]',
}

export function Button({
  variant = 'primary', size = 'md', block = false, loading = false,
  className = '', children, type = 'button', ...rest
}) {
  return (
    <button
      type={type}
      disabled={loading || rest.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-outline-subtle font-extrabold whitespace-nowrap transition duration-200 disabled:opacity-70 ${VARIANTS[variant]} ${SIZES[size]} ${block ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading && (
        <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
}

export function IconButton({ className = '', children, ...rest }) {
  return (
    <button
      type="button"
      className={`relative flex size-10 items-center justify-center rounded-lg border border-outline-subtle bg-surface-card text-on-surface-variant transition duration-200 hover:border-accent hover:text-accent ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

/** Small square action button used on lead cards / table rows */
export function CardAction({ className = '', children, ...rest }) {
  return (
    <button
      type="button"
      className={`inline-flex h-7 min-w-7 items-center justify-center gap-1 rounded-sm border border-outline-subtle bg-surface-card text-[0.72rem] text-on-surface-variant transition duration-200 hover:border-accent hover:bg-accent-soft hover:text-accent ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
