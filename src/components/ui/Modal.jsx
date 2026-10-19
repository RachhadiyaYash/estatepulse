import { useEffect } from "react";

export function Modal({
  title,
  subtitle,
  size = "md",
  onClose,
  onSubmit,
  children,
  footer,
}) {
  const Wrapper = onSubmit ? "form" : "div";
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-1000 flex animate-fade-in items-center justify-center bg-(--overlay) p-6 backdrop-blur-[6px]"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`max-h-[90vh] w-full animate-modal-in overflow-y-auto rounded-xl border border-outline-subtle bg-surface-card shadow-lg ${
          size === "lg" ? "max-w-212.5" : "max-w-150"
        }`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-outline-subtle px-6 py-[1.15rem]">
          <div>
            <h3 className="text-[1.1rem] font-extrabold tracking-[-0.03em] text-on-surface">
              {title}
            </h3>
            {subtitle && (
              <span className="text-[0.76rem] text-on-surface-muted">
                {subtitle}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="size-8.5 rounded-[10px] bg-surface-dim text-on-surface-muted transition duration-200 hover:bg-surface-high hover:text-on-surface"
          >
            <i className="fas fa-times" />
          </button>
        </div>
        <Wrapper onSubmit={onSubmit}>
          {children}
          {footer && (
            <div className="flex items-center justify-end gap-3 border-t border-outline-subtle bg-surface-dim px-6 py-4">
              {footer}
            </div>
          )}
        </Wrapper>
      </div>
    </div>
  );
}

export function ModalBody({ children }) {
  return <div className="p-6">{children}</div>;
}
