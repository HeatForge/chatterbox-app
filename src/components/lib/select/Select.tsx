"use client";

import { Icon } from "@iconify/react";
import {
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/lib/button/Button";
import { IconNames } from "@/lib/IconNames";
import { Intent } from "@/lib/Intent";

import styles from "./select.module.css";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectOptions = SelectOption[] | Record<string, SelectOption[]>;

type SelectBaseProps = {
  options: SelectOptions;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
  emptyMessage?: string;
};

type SelectSingleProps = SelectBaseProps & {
  multiple?: false;
  value: string;
  onChange: (value: string) => void;
};

type SelectMultipleProps = SelectBaseProps & {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
};

export type SelectProps = SelectSingleProps | SelectMultipleProps;

type NormalizedOption = SelectOption & {
  category?: string;
};

type CategoryGroup = {
  name: string;
  options: NormalizedOption[];
};

function normalizeOptions(options: SelectOptions): NormalizedOption[] {
  if (Array.isArray(options)) {
    return options;
  }

  const normalized: NormalizedOption[] = [];

  for (const [category, items] of Object.entries(options)) {
    for (const item of items) {
      normalized.push({ ...item, category });
    }
  }

  return normalized;
}

function groupOptions(options: NormalizedOption[]): CategoryGroup[] | null {
  if (options.every((option) => !option.category)) {
    return null;
  }

  const groups = new Map<string, NormalizedOption[]>();

  for (const option of options) {
    const category = option.category ?? "";
    const existing = groups.get(category);

    if (existing) {
      existing.push(option);
      continue;
    }

    groups.set(category, [option]);
  }

  return Array.from(groups.entries(), ([name, groupOptions]) => ({
    name,
    options: groupOptions,
  }));
}

function matchesSearch(option: NormalizedOption, query: string): boolean {
  if (!query) {
    return true;
  }

  return option.label.toLowerCase().includes(query.toLowerCase());
}

function getSelectedValues(props: SelectProps): string[] {
  if (props.multiple) {
    return props.value;
  }

  return props.value ? [props.value] : [];
}

function getOptionLabel(
  options: NormalizedOption[],
  value: string,
): string | undefined {
  return options.find((option) => option.value === value)?.label;
}

type CategorySelectionState = "none" | "partial" | "all";

function getCategorySelectionState(
  options: NormalizedOption[],
  selectedValues: string[],
): CategorySelectionState {
  const selectable = options.filter((option) => !option.disabled);

  if (selectable.length === 0) {
    return "none";
  }

  const selectedCount = selectable.filter((option) =>
    selectedValues.includes(option.value),
  ).length;

  if (selectedCount === 0) {
    return "none";
  }

  if (selectedCount === selectable.length) {
    return "all";
  }

  return "partial";
}

export function Select(props: SelectProps) {
  const {
    options,
    placeholder = "Select…",
    searchable = false,
    disabled = false,
    id,
    className,
    "aria-label": ariaLabel,
    emptyMessage = "No options found",
  } = props;

  const generatedId = useId();
  const listboxId = `${id ?? generatedId}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const allOptions = useMemo(() => normalizeOptions(options), [options]);
  const filteredOptions = useMemo(
    () => allOptions.filter((option) => matchesSearch(option, searchQuery)),
    [allOptions, searchQuery],
  );
  const groups = useMemo(
    () => groupOptions(filteredOptions),
    [filteredOptions],
  );
  const selectedValues = getSelectedValues(props);
  const selectedLabel = props.multiple
    ? undefined
    : getOptionLabel(allOptions, props.value);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setSearchQuery("");
  }, []);

  const openDropdown = useCallback(() => {
    if (disabled) {
      return;
    }

    setIsOpen(true);
  }, [disabled]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: globalThis.MouseEvent): void {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeDropdown();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [closeDropdown, isOpen]);

  useEffect(() => {
    if (isOpen && searchable) {
      searchInputRef.current?.focus();
    }
  }, [isOpen, searchable]);

  function isSelected(value: string): boolean {
    return selectedValues.includes(value);
  }

  function selectOption(value: string): void {
    if (props.multiple) {
      const nextValue = isSelected(value)
        ? props.value.filter((item) => item !== value)
        : [...props.value, value];
      props.onChange(nextValue);
      return;
    }

    props.onChange(value);
    closeDropdown();
  }

  function removeValue(
    event: MouseEvent<HTMLButtonElement>,
    value: string,
  ): void {
    event.preventDefault();
    event.stopPropagation();

    if (!props.multiple) {
      return;
    }

    props.onChange(props.value.filter((item) => item !== value));
  }

  function toggleCategory(categoryOptions: NormalizedOption[]): void {
    if (!props.multiple) {
      return;
    }

    const selectable = categoryOptions.filter((option) => !option.disabled);
    const state = getCategorySelectionState(selectable, props.value);

    if (state === "all") {
      const removable = new Set(selectable.map((option) => option.value));
      props.onChange(props.value.filter((value) => !removable.has(value)));
      return;
    }

    const nextValues = new Set(props.value);
    for (const option of selectable) {
      nextValues.add(option.value);
    }
    props.onChange(Array.from(nextValues));
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>): void {
    if (
      event.key === "ArrowDown" ||
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      openDropdown();
      return;
    }

    if (event.key === "Escape") {
      closeDropdown();
    }
  }

  function renderOption(option: NormalizedOption) {
    const selected = isSelected(option.value);

    return (
      <button
        key={option.value}
        type="button"
        role="option"
        className={styles.option}
        data-selected={selected || undefined}
        aria-selected={selected}
        disabled={option.disabled}
        onClick={() => selectOption(option.value)}
      >
        {props.multiple ? (
          <span className={styles.optionCheck} aria-hidden>
            {selected ? (
              <Icon icon={IconNames["check-line"]} width={12} height={12} />
            ) : null}
          </span>
        ) : null}
        <span className={styles.optionLabel}>{option.label}</span>
        {!props.multiple && selected ? (
          <Icon
            icon={IconNames["check-line"]}
            width={16}
            height={16}
            aria-hidden
          />
        ) : null}
      </button>
    );
  }

  function renderGroup(group: CategoryGroup) {
    const categoryState = props.multiple
      ? getCategorySelectionState(group.options, props.value)
      : null;

    return (
      <div key={group.name} className={styles.group}>
        {props.multiple ? (
          <button
            type="button"
            className={styles.categoryButton}
            data-checked={categoryState === "all" || undefined}
            data-indeterminate={categoryState === "partial" || undefined}
            onClick={() => toggleCategory(group.options)}
          >
            <span className={styles.categoryCheck} aria-hidden>
              {categoryState === "all" ? (
                <Icon icon={IconNames["check-line"]} width={12} height={12} />
              ) : categoryState === "partial" ? (
                <Icon
                  icon={IconNames["subtract-line"]}
                  width={12}
                  height={12}
                />
              ) : null}
            </span>
            <span>{group.name}</span>
          </button>
        ) : (
          <div className={styles.categoryLabel}>{group.name}</div>
        )}
        {group.options.map(renderOption)}
      </div>
    );
  }

  const hasVisibleOptions = filteredOptions.length > 0;

  return (
    <div
      ref={rootRef}
      className={[styles.root, className].filter(Boolean).join(" ")}
    >
      <button
        id={id}
        type="button"
        className={styles.trigger}
        data-open={isOpen || undefined}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => (isOpen ? closeDropdown() : openDropdown())}
        onKeyDown={handleTriggerKeyDown}
      >
        <div className={styles.triggerContent}>
          {props.multiple ? (
            <div className={styles.tags}>
              {props.value.length > 0 ? (
                props.value.map((value) => {
                  const label = getOptionLabel(allOptions, value) ?? value;

                  return (
                    <Button
                      key={value}
                      className={styles.tagButton}
                      text={label}
                      rightIcon={IconNames["close-line"]}
                      intent={Intent.TERTIARY}
                      minimal
                      iconSize={14}
                      style={
                        {
                          "--button-font-size": "0.8125rem",
                          padding: "0.25rem 0.5rem",
                        } as CSSProperties
                      }
                      onClick={(event) => removeValue(event, value)}
                    />
                  );
                })
              ) : (
                <span className={styles.placeholder}>{placeholder}</span>
              )}
            </div>
          ) : (
            <span className={selectedLabel ? styles.value : styles.placeholder}>
              {selectedLabel ?? placeholder}
            </span>
          )}
        </div>
        <Icon
          className={styles.chevron}
          icon={IconNames["arrow-down-line"]}
          width={18}
          height={18}
          aria-hidden
        />
      </button>

      {isOpen ? (
        <div
          id={listboxId}
          className={styles.dropdown}
          role="listbox"
          aria-multiselectable={props.multiple || undefined}
        >
          {searchable ? (
            <div className={styles.search}>
              <Icon
                className={styles.searchIcon}
                icon={IconNames["search-line"]}
                width={16}
                height={16}
                aria-hidden
              />
              <input
                ref={searchInputRef}
                type="search"
                className={styles.searchInput}
                value={searchQuery}
                placeholder="Search options…"
                aria-label="Search options"
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.stopPropagation();
                    closeDropdown();
                  }
                }}
              />
            </div>
          ) : null}

          <div className={styles.list}>
            {hasVisibleOptions ? (
              groups ? (
                groups.map(renderGroup)
              ) : (
                filteredOptions.map(renderOption)
              )
            ) : (
              <p className={styles.empty}>{emptyMessage}</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
