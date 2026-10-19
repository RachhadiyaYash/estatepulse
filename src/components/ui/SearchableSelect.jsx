import {
  Children,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  isValidElement,
} from "react";

const CHEVRON = (
  <svg
    aria-hidden="true"
    className="shrink-0"
    height="16"
    width="16"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.7"
  >
    <polyline points="6 9 10 13 14 9" />
  </svg>
);

const BASE_CONTROL =
  "border border-outline-subtle rounded-md bg-field-bg text-on-surface transition duration-200 focus:border-accent focus:ring-3 focus:ring-accent/20 focus:outline-none";

const SIZE_CONTROL = {
  default: "h-11 px-3.5 text-[0.84rem]",
  compact: "h-8.5 px-3 text-[0.78rem] font-semibold",
};

const OPTION_TEXT = {
  default: "px-3 py-2 text-[0.82rem]",
  compact: "px-3 py-1.5 text-[0.76rem]",
};

const INPUT_TEXT = {
  default:
    "w-full border-none bg-transparent outline-none text-[0.8rem] py-1.5 placeholder:text-on-surface-muted focus:ring-0 focus:border-none",
  compact:
    "w-full border-none bg-transparent outline-none text-[0.72rem] py-1 placeholder:text-on-surface-muted focus:ring-0 focus:border-none",
};

/** Flatten an <option>'s children (string | number | array | element) to text. */
function optionText(node) {
  if (node == null || typeof node === "boolean") return "";
  if (Array.isArray(node)) return node.map(optionText).join("");
  if (typeof node === "object") return optionText(node.props?.children);
  return String(node);
}

function extractOptions(children) {
  return Children.toArray(children)
    .filter((child) => isValidElement(child) && child.type === "option")
    .map((child) => ({
      value: child.props.value == null ? "" : String(child.props.value),
      label: optionText(child.props.children),
      disabled: !!child.props.disabled,
    }));
}

export function SearchableSelect({
  children,
  size = "default",
  className = "",
  value,
  defaultValue,
  onChange,
  disabled,
  required,
  id,
  name,
  form,
}) {
  const options = extractOptions(children);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(-1);
  const [dropUp, setDropUp] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const listboxId = useId();

  const currentValue = useMemo(() => String(value ?? ""), [value]);

  const selectedOption = useMemo(
    () => options.find((o) => o.value === currentValue),
    [options, currentValue],
  );

  const placeholderOption = useMemo(
    () => (options.length && options[0].disabled ? options[0] : null),
    [options],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const displayLabel = useMemo(
    () => selectedOption?.label ?? placeholderOption?.label ?? "",
    [selectedOption, placeholderOption],
  );

  const selectValue = useCallback(
    (nextValue) => {
      setQuery("");
      setHighlight(-1);
      setOpen(false);
      onChange?.({ target: { value: nextValue } });
    },
    [onChange],
  );

  const openDropdown = useCallback(() => {
    if (disabled) return;
    setOpen(true);
    setQuery("");
    setHighlight(filtered.findIndex((o) => o.value === currentValue));
    // Open toward the side with more room inside the nearest scrollable
    // ancestor (e.g. a form modal) so the listbox never extends its scroll
    // area and forces unwanted scrollbars onto the modal.
    const wrapper = wrapperRef.current;
    if (wrapper) {
      const rect = wrapper.getBoundingClientRect();
      const dialog = wrapper.closest('[role="dialog"]');
      const bounds = dialog
        ? dialog.getBoundingClientRect()
        : { top: 0, bottom: window.innerHeight };
      const needed = Math.min(256, filtered.length * 36 + 60);
      const spaceBelow = bounds.bottom - rect.bottom;
      const spaceAbove = rect.top - bounds.top;
      setDropUp(needed > spaceBelow && spaceAbove > spaceBelow);
    }
  }, [disabled, filtered, currentValue]);

  // Close when clicking / tapping outside the component
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
        setHighlight(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, {
      passive: true,
    });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Focus the search input when the dropdown opens
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const onTriggerKeyDown = useCallback(
    (event) => {
      if (disabled) return;
      if (!open) {
        if (
          event.key === "Enter" ||
          event.key === " " ||
          event.key === "ArrowDown"
        ) {
          event.preventDefault();
          openDropdown();
        }
        return;
      }

      switch (event.key) {
        case "Escape":
          event.preventDefault();
          setOpen(false);
          setHighlight(-1);
          break;
        case "ArrowDown":
          if (filtered.length === 0) break;
          event.preventDefault();
          setHighlight((prev) => (prev + 1) % filtered.length);
          break;
        case "ArrowUp":
          if (filtered.length === 0) break;
          event.preventDefault();
          setHighlight(
            (prev) => (prev - 1 + filtered.length) % filtered.length,
          );
          break;
        case "Home":
          if (filtered.length === 0) break;
          event.preventDefault();
          setHighlight(0);
          break;
        case "End":
          if (filtered.length === 0) break;
          event.preventDefault();
          setHighlight(filtered.length - 1);
          break;
        case "Enter": {
          event.preventDefault();
          const active = filtered[highlight];
          if (active && !active.disabled) {
            selectValue(active.value);
          }
          break;
        }
        default:
          break;
      }
    },
    [disabled, open, filtered, highlight, openDropdown, selectValue],
  );

  const onTriggerClick = useCallback(() => {
    if (disabled) return;
    setOpen((prev) => !prev);
    if (!open) openDropdown();
  }, [disabled, open, openDropdown]);

  const optionClass = (option, index) => {
    const isSelected = option.value === currentValue;
    const isHighlighted = index === highlight;
    if (option.disabled) return "text-on-surface-muted cursor-not-allowed";
    if (isHighlighted) return "bg-accent text-on-accent";
    if (isSelected) return "bg-accent-soft text-accent font-semibold";
    return "text-on-surface cursor-pointer hover:bg-surface-dim dark:hover:bg-surface-high";
  };

  return (
    <div ref={wrapperRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        disabled={disabled}
        onClick={onTriggerClick}
        onKeyDown={onTriggerKeyDown}
        className={`flex items-center justify-between gap-2 ${size === "default" ? "w-full" : ""} min-w-30 ${BASE_CONTROL} ${SIZE_CONTROL[size]} ${disabled ? "disabled:bg-surface-dim disabled:text-on-surface-muted disabled:border-outline-subtle" : ""}`}
      >
        <span
          className={`truncate min-w-0 pl-1 ${
            !selectedOption && placeholderOption
              ? "text-on-surface-muted"
              : "text-on-surface"
          }`}
        >
          {displayLabel}
        </span>
        <span
          className={`shrink-0 ml-1.5 text-on-surface-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          {CHEVRON}
        </span>
      </button>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Search options"
          className={`z-50 absolute left-0 right-0 w-full flex flex-col max-h-64 overflow-clip rounded-md border border-outline-subtle bg-field-bg text-on-surface shadow-lg ring-1 ring-black/10 outline-none ${dropUp ? "bottom-full mb-1.5" : "mt-1.5"}`}
        >
          <div className="px-3 py-2 border-b border-outline-subtle shrink-0">
            <input
              ref={inputRef}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck="false"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setHighlight(-1);
              }}
              placeholder="Search options…"
              className={INPUT_TEXT[size]}
            />
          </div>
          <div
            role="none"
            className="scrollbar-hidden flex-1 min-h-0 overflow-y-auto overscroll-contain"
            style={{
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE/Edge
            }}
          >
            {filtered.length === 0 ? (
              <div
                role="option"
                aria-disabled="true"
                className="px-3 py-3 text-[0.78rem] text-on-surface-muted"
              >
                No matching options
              </div>
            ) : (
              filtered.map((option, index) => (
                <div
                  key={option.value}
                  role="option"
                  id={`${listboxId}-${index}`}
                  aria-selected={option.value === currentValue}
                  aria-disabled={option.disabled || undefined}
                  onMouseMove={() => {
                    if (!option.disabled) setHighlight(index);
                  }}
                  onClick={() => {
                    if (!option.disabled) selectValue(option.value);
                  }}
                  className={`relative cursor-pointer select-none ${OPTION_TEXT[size]} ${optionClass(option, index)}`}
                >
                  {option.label}
                  {option.value === currentValue && (
                    <span className="absolute right-3 text-[0.7rem] font-bold text-inherit">
                      ✓
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <select
        id={id}
        name={name}
        form={form}
        value={value ?? ""}
        defaultValue={defaultValue}
        disabled={disabled}
        required={required}
        tabIndex={-1}
        aria-hidden="true"
        onChange={() => {}}
        style={{
          position: "fixed",
          left: -9999,
          top: 0,
          width: 1,
          height: 1,
          opacity: 0,
        }}
      >
        {children}
      </select>
    </div>
  );
}
