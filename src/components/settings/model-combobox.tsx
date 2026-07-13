"use client";

import { useMemo } from "react";

import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from "@/components/ui/combobox";
import type { AiSettingsConfig } from "@/lib/services/ai-providers";

type ModelOption = AiSettingsConfig["models"][number];

type ModelPickerItem = {
  value: string;
  label: string;
};

type ModelPickerGroup = {
  value: string;
  items: ModelPickerItem[];
};

function getModelValue(model: Pick<ModelOption, "providerId" | "modelId">) {
  return `${model.providerId}:${model.modelId}`;
}

function groupModelsByProvider(models: ModelOption[]): ModelPickerGroup[] {
  const groups = new Map<string, ModelPickerItem[]>();

  for (const model of models) {
    const item: ModelPickerItem = {
      value: getModelValue(model),
      label: model.label,
    };
    const existing = groups.get(model.providerName);

    if (existing) {
      existing.push(item);
      continue;
    }

    groups.set(model.providerName, [item]);
  }

  return Array.from(groups.entries(), ([providerName, items]) => ({
    value: providerName,
    items: items.sort((left, right) => left.label.localeCompare(right.label)),
  })).sort((left, right) => left.value.localeCompare(right.value));
}

type ModelComboboxProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  models: ModelOption[];
  emptyMessage: string;
  placeholder?: string;
  disabled?: boolean;
};

/**
 * Searchable model picker grouped by provider for settings pages.
 */
export function ModelCombobox({
  id,
  value,
  onChange,
  models,
  emptyMessage,
  placeholder = "Select model…",
  disabled = false,
}: ModelComboboxProps) {
  const groups = useMemo(() => groupModelsByProvider(models), [models]);

  const selectedItem = useMemo(() => {
    if (!value) {
      return null;
    }

    for (const group of groups) {
      const match = group.items.find((item) => item.value === value);
      if (match) {
        return match;
      }
    }

    return null;
  }, [groups, value]);

  return (
    <Combobox
      items={groups}
      value={selectedItem}
      disabled={disabled}
      isItemEqualToValue={(left, right) => left.value === right.value}
      onValueChange={(item) => {
        onChange(item?.value ?? "");
      }}
    >
      <ComboboxInput
        id={id}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full"
      />
      <ComboboxContent>
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
        <ComboboxList>
          {(group) => (
            <ComboboxGroup key={group.value} items={group.items}>
              <ComboboxLabel>{group.value}</ComboboxLabel>
              <ComboboxCollection>
                {(item) => (
                  <ComboboxItem key={item.value} value={item}>
                    {item.label}
                  </ComboboxItem>
                )}
              </ComboboxCollection>
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
