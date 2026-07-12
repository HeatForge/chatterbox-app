"use client";

import type { MouseEvent } from "react";

import { Button, type ButtonIcon } from "@/components/lib/button/Button";
import { Intent } from "@/lib/Intent";

import styles from "./thread.module.css";

export type ThreadAction = {
  id: string;
  icon: ButtonIcon;
  label: string;
  onClick: () => void;
  intent?: Intent;
};

export type ThreadProps = {
  text: string;
  leftIcon?: ButtonIcon;
  selected?: boolean;
  onSelect: () => void;
  actions?: ThreadAction[];
  className?: string;
};

const ACTION_ICON_SIZE = 16;

function stopActionClick(event: MouseEvent<HTMLButtonElement>): void {
  event.stopPropagation();
}

export function Thread({
  text,
  leftIcon,
  selected = false,
  onSelect,
  actions = [],
  className,
}: ThreadProps) {
  const hasActions = actions.length > 0;

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-has-actions={hasActions || undefined}
      data-selected={selected || undefined}
    >
      <Button
        text={text}
        leftIcon={leftIcon}
        intent={selected ? Intent.SECONDARY : Intent.PRIMARY}
        minimal
        className={styles.main}
        onClick={onSelect}
      />
      {hasActions ? (
        <div className={styles.actions}>
          {actions.map((action) => (
            <Button
              key={action.id}
              leftIcon={action.icon}
              intent={action.intent ?? Intent.TERTIARY}
              iconSize={ACTION_ICON_SIZE}
              minimal
              aria-label={action.label}
              onClick={(event) => {
                stopActionClick(event);
                action.onClick();
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
