/** options: [{ value, label, icon? }] */
export function SegmentedControl({ options, value, onChange, className = "" }) {
  return (
    <div
      role="tablist"
      className={`inline-flex gap-0.5 rounded-lg border border-outline-subtle bg-surface-dim p-0.75 ${className}`}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`inline-flex items-center justify-center gap-1.5 rounded-[10px] px-3 py-1.5 text-[0.76rem] font-bold transition duration-200 ${
              active
                ? "bg-surface-card text-accent shadow-sm"
                : "text-on-surface-muted hover:text-on-surface"
            }`}
          >
            {o.icon && <i className={`fas ${o.icon}`} />} {o.label}
          </button>
        );
      })}
    </div>
  );
}
