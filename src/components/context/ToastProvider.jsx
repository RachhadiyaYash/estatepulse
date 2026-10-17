import { useCallback, useMemo, useRef, useState } from 'react'
import { ToastContext } from './ToastContext'

const ICONS = {
  info: 'fa-circle-info',
  success: 'fa-circle-check',
  warning: 'fa-triangle-exclamation',
  error: 'fa-circle-xmark',
  primary: 'fa-bell',
}

const ICON_COLOR = {
  info: 'text-accent',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  primary: 'text-brand',
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const toast = useCallback(
    (message, type = 'info') => {
      const id = ++nextId.current
      setToasts((t) => [...t, { id, message, type }])
      setTimeout(() => dismiss(id), 3500)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-6 bottom-6 z-2000 flex flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex min-w-70 animate-toast-in items-center gap-3 rounded-md border border-outline-subtle bg-surface-card px-5 py-3.5 text-[0.82rem] font-semibold text-on-surface shadow-lg"
          >
            <i className={`fas ${ICONS[t.type] || ICONS.info} text-[1.1rem] ${ICON_COLOR[t.type] || ICON_COLOR.info}`} />
            <span className="flex-1">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
