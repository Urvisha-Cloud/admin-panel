import React, { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface DropdownProps<T extends string = string> {
  options: DropdownOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  id?: string;
}

export function Dropdown<T extends string = string>({
  options,
  value,
  defaultValue,
  onChange,
  label,
  placeholder = "Select an option",
  disabled = false,
  error,
  className,
  id,
}: DropdownProps<T>) {
  const generatedId = useId();
  const dropdownId = id || generatedId;
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [internalValue, setInternalValue] = useState<T | undefined>(defaultValue);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const selectedValue = value !== undefined ? value : internalValue;
  const selectedOption = options.find((option) => option.value === selectedValue);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  // Open upward when the menu would overflow the nearest scroll container (e.g. a modal body),
  // which would otherwise add a scrollbar and push the menu against the container's bottom edge.
  useLayoutEffect(() => {
    if (!isOpen) {
      setOpenUpward(false);
      return;
    }

    const button = buttonRef.current;
    const menu = menuRef.current;
    if (!button || !menu) return;

    let boundsTop = 0;
    let boundsBottom = window.innerHeight;
    for (let node = containerRef.current?.parentElement; node; node = node.parentElement) {
      const { overflowY } = getComputedStyle(node);
      if (overflowY === "auto" || overflowY === "scroll" || overflowY === "hidden") {
        const rect = node.getBoundingClientRect();
        boundsTop = Math.max(boundsTop, rect.top);
        boundsBottom = Math.min(boundsBottom, rect.bottom);
        break;
      }
    }

    const gap = 6;
    const buttonRect = button.getBoundingClientRect();
    const menuHeight = menu.offsetHeight + gap;
    const spaceBelow = boundsBottom - buttonRect.bottom;
    const spaceAbove = buttonRect.top - boundsTop;

    setOpenUpward(spaceBelow < menuHeight && spaceAbove > spaceBelow);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const selectedIndex = options.findIndex((option) => option.value === selectedValue);
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : options.findIndex((option) => !option.disabled));
  }, [isOpen, options, selectedValue]);

  const selectOption = (option: DropdownOption<T>) => {
    if (option.disabled) return;
    setInternalValue(option.value);
    onChange?.(option.value);
    setIsOpen(false);
  };

  const moveHighlight = (direction: 1 | -1) => {
    if (!options.length) return;

    let nextIndex = highlightedIndex;
    for (let index = 0; index < options.length; index += 1) {
      nextIndex = (nextIndex + direction + options.length) % options.length;
      if (!options[nextIndex].disabled) {
        setHighlightedIndex(nextIndex);
        return;
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        moveHighlight(event.key === "ArrowDown" ? 1 : -1);
      }
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else if (highlightedIndex >= 0) {
        selectOption(options[highlightedIndex]);
      }
      return;
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  const listboxId = `${dropdownId}-options`;
  const borderColor = error
    ? "var(--danger)"
    : isOpen
      ? "var(--border-active)"
      : "var(--border-color)";

  return (
    <div ref={containerRef} className={`relative w-full ${className || ""}`}>
      {label && (
        <label
          htmlFor={dropdownId}
          className="mb-1.5 block text-[0.8rem] text-admin-muted"
        >
          {label}
        </label>
      )}

      <button
        ref={buttonRef}
        id={dropdownId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-invalid={Boolean(error)}
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={handleKeyDown}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-admin border px-[13px] py-2.5 text-left text-[0.88rem] font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-55"
        style={{ borderColor, backgroundColor: disabled ? "var(--bg-main)" : "var(--bg-surface)", color: selectedOption ? "var(--text-main)" : "var(--text-muted)", boxShadow: isOpen ? "var(--shadow-glow)" : "none" }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          size={17}
          aria-hidden="true"
          style={{
            flexShrink: 0,
            color: "var(--text-muted)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        />
      </button>

      {isOpen && !disabled && (
        <div
          ref={menuRef}
          id={listboxId}
          role="listbox"
          aria-label={label || placeholder}
          className={`absolute left-0 right-0 ${openUpward ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]"} z-[80] flex max-h-[240px] flex-col gap-1 overflow-y-auto rounded-admin border border-[rgba(244,114,182,0.2)] bg-admin-card p-1.5 shadow-admin`}
        >
          {options.map((option, index) => {
            const isSelected = option.value === selectedValue;
            const isHighlighted = index === highlightedIndex;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={option.disabled}
                onMouseEnter={() => !option.disabled && setHighlightedIndex(index)}
                onClick={() => selectOption(option)}
                className="flex w-full items-center justify-between gap-3 rounded-admin px-[11px] py-2.5 text-left text-[0.86rem] transition-colors disabled:cursor-not-allowed disabled:opacity-55"
                style={{ backgroundColor: isHighlighted ? "var(--primary-glow)" : isSelected ? "rgba(244, 114, 182, 0.08)" : "transparent", color: option.disabled ? "var(--text-subtle)" : isSelected ? "var(--primary-light)" : "var(--text-main)", fontWeight: isSelected ? 600 : 500 }}
              >
                <span>{option.label}</span>
                {isSelected && <Check size={16} color="var(--primary)" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-[0.78rem] text-admin-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export default Dropdown;
