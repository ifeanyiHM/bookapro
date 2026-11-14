"use client";

import { CaretDown, Check } from "@phosphor-icons/react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

interface SelectProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: (SelectOption | SelectOptionGroup)[];
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
}

function isOptionGroup(
  item: SelectOption | SelectOptionGroup,
): item is SelectOptionGroup {
  return "options" in item;
}

export function Select({
  id,
  value,
  onChange,
  options,
  placeholder = "Choose an option",
  name,
  disabled = false,
  invalid = false,
  className = "",
}: SelectProps) {
  const generatedId = useId();
  const listboxId = `${id}-listbox-${generatedId}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const flatOptions = useMemo(
    () =>
      options.flatMap((item) => (isOptionGroup(item) ? item.options : [item])),
    [options],
  );

  const enabledOptions = useMemo(
    () =>
      flatOptions
        .map((option, index) => ({ option, index }))
        .filter(({ option }) => !option.disabled),
    [flatOptions],
  );

  const selectedOption = flatOptions.find((option) => option.value === value);

  const activeOption = flatOptions[activeIndex];

  const activeDescendant =
    open && activeOption && !activeOption.disabled
      ? `${listboxId}-option-${activeIndex}`
      : undefined;

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    optionRefs.current[activeIndex]?.scrollIntoView({
      block: "nearest",
    });
  }, [open, activeIndex]);

  function findEnabledIndex(startIndex: number, direction: 1 | -1): number {
    if (enabledOptions.length === 0) return -1;

    const currentPosition = enabledOptions.findIndex(
      ({ index }) => index === startIndex,
    );

    const nextPosition =
      currentPosition === -1
        ? direction === 1
          ? 0
          : enabledOptions.length - 1
        : (currentPosition + direction + enabledOptions.length) %
          enabledOptions.length;

    return enabledOptions[nextPosition].index;
  }

  function openDropdown(direction: 1 | -1 = 1) {
    if (disabled) return;

    const selectedIndex = flatOptions.findIndex(
      (option) => option.value === value,
    );

    const startIndex =
      selectedIndex >= 0
        ? selectedIndex
        : direction === 1
          ? -1
          : flatOptions.length;

    const nextIndex =
      selectedIndex >= 0 && !flatOptions[selectedIndex].disabled
        ? selectedIndex
        : findEnabledIndex(startIndex, direction);

    setActiveIndex(nextIndex >= 0 ? nextIndex : 0);
    setOpen(true);
  }

  function selectOption(option: SelectOption) {
    if (option.disabled || disabled) return;

    onChange(option.value);
    setOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();

        if (!open) {
          openDropdown(1);
        } else {
          setActiveIndex((current) => findEnabledIndex(current, 1));
        }
        break;

      case "ArrowUp":
        event.preventDefault();

        if (!open) {
          openDropdown(-1);
        } else {
          setActiveIndex((current) => findEnabledIndex(current, -1));
        }
        break;

      case "Home":
        if (open) {
          event.preventDefault();
          setActiveIndex(
            enabledOptions.length > 0 ? enabledOptions[0].index : 0,
          );
        }
        break;

      case "End":
        if (open) {
          event.preventDefault();
          setActiveIndex(
            enabledOptions.length > 0
              ? enabledOptions[enabledOptions.length - 1].index
              : 0,
          );
        }
        break;

      case "Enter":
      case " ":
        if (!open) {
          event.preventDefault();
          openDropdown();
        } else {
          event.preventDefault();

          if (activeOption && !activeOption.disabled) {
            selectOption(activeOption);
          }
        }
        break;

      case "Escape":
        if (open) {
          event.preventDefault();
          setOpen(false);
        }
        break;

      case "Tab":
        setOpen(false);
        break;
    }
  }

  let optionIndex = 0;

  function renderOption(option: SelectOption) {
    const index = optionIndex++;
    const selected = option.value === value;
    const active = index === activeIndex;

    return (
      <div
        key={option.value}
        id={`${listboxId}-option-${index}`}
        ref={(element) => {
          optionRefs.current[index] = element;
        }}
        role="option"
        aria-selected={selected}
        aria-disabled={option.disabled || undefined}
        onClick={() => selectOption(option)}
        className={[
          "flex min-h-11 cursor-pointer items-center justify-between gap-3",
          "rounded-sm px-3 py-2.5 text-sm transition-colors",
          "xl1:min-h-12 xl1:px-4 xl1:text-base",
          option.disabled
            ? "cursor-not-allowed opacity-40"
            : active
              ? "bg-surface-2 text-ink"
              : "text-ink-soft hover:bg-surface-2 hover:text-ink",
          selected ? "font-semibold text-ink" : "",
        ].join(" ")}
      >
        <span className="min-w-0">{option.label}</span>

        {selected && (
          <Check
            aria-hidden="true"
            size={18}
            weight="bold"
            className="shrink-0 text-brand"
          />
        )}
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`relative w-full ${className}`}>
      {name && (
        <input type="hidden" name={name} value={value} disabled={disabled} />
      )}

      <button
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={activeDescendant}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        onClick={() => {
          if (open) {
            setOpen(false);
          } else {
            openDropdown();
          }
        }}
        onKeyDown={handleKeyDown}
        className={[
          "flex min-h-12 w-full items-center justify-between gap-3",
          "rounded-md border bg-surface px-4 py-3 text-left text-sm",
          "outline-none transition-colors",
          "focus-visible:ring-2 focus-visible:ring-brand/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "xl1:min-h-14 xl1:px-5 xl1:text-base",
          invalid
            ? "border-danger focus-visible:border-danger"
            : "border-line-strong hover:border-ink/30 focus-visible:border-brand",
        ].join(" ")}
      >
        <span
          className={
            selectedOption
              ? "min-w-0 truncate text-ink"
              : "min-w-0 truncate text-muted"
          }
        >
          {selectedOption?.label ?? placeholder}
        </span>

        <CaretDown
          aria-hidden="true"
          size={18}
          className={[
            "shrink-0 text-muted transition-transform duration-200",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {open && (
        <div
          className={[
            "absolute inset-x-0 top-full z-50 mt-2",
            "overflow-hidden rounded-md border border-line-strong",
            "bg-surface shadow-lg",
          ].join(" ")}
        >
          <div
            id={listboxId}
            role="listbox"
            aria-labelledby={id}
            className="max-h-64 overflow-y-auto p-1.5 overscroll-contain xl1:max-h-80"
          >
            {options.map((item, groupIndex) => {
              if (isOptionGroup(item)) {
                return (
                  <div
                    key={`${item.label}-${groupIndex}`}
                    role="group"
                    aria-label={item.label}
                  >
                    <div className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-muted xl1:px-4 xl1:text-sm">
                      {item.label}
                    </div>

                    {item.options.map(renderOption)}
                  </div>
                );
              }

              return renderOption(item);
            })}

            {flatOptions.length === 0 && (
              <p className="px-3 py-4 text-sm text-muted">
                No options available.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
