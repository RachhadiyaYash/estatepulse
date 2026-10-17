const CONTROL =
  'w-full rounded-md border border-outline-subtle bg-field-bg px-3.5 text-[0.84rem] text-on-surface transition duration-200 placeholder:text-on-surface-muted focus:border-accent focus:ring-3 focus:ring-accent/20 focus:outline-none'

export function Field({ label, children, className = '' }) {
  return (
    <div className={`mb-[1.1rem] ${className}`}>
      {label && <label className="mb-1.5 block text-[0.72rem] font-bold text-on-surface">{label}</label>}
      {children}
    </div>
  )
}

export function FormRow({ children }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>
}

export function Input({ className = '', ...rest }) {
  return <input className={`h-11 ${CONTROL} ${className}`} {...rest} />
}

export function Select({ className = '', children, ...rest }) {
  return (
    <select className={`h-11 ${CONTROL} ${className}`} {...rest}>
      {children}
    </select>
  )
}

export function Textarea({ className = '', ...rest }) {
  return <textarea className={`py-3 leading-normal ${CONTROL} resize-y ${className}`} {...rest} />
}

/** Compact select for toolbars/filters */
export function FilterSelect({ className = '', children, ...rest }) {
  return (
    <select
      className={`h-[34px] rounded-md border border-outline-subtle bg-field-bg px-3 text-[0.78rem] font-semibold text-on-surface focus:border-accent focus:outline-none ${className}`}
      {...rest}
    >
      {children}
    </select>
  )
}
