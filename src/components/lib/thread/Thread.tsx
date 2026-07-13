"use client";

import {
  type CSSProperties,
  type MouseEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

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
const ACTION_GAP_PX = 6;

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
  const actionsRef = useRef<HTMLDivElement>(null);
  const [actionsWidth, setActionsWidth] = useState(0);

  useLayoutEffect(() => {
    if (!hasActions) {
      setActionsWidth(0);
      return;
    }

    const actionsElement = actionsRef.current;
    if (!actionsElement) {
      return;
    }

    function updateWidth(): void {
      setActionsWidth(actionsElement?.offsetWidth ?? 0);
    }

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(actionsElement);

    return () => {
      observer.disconnect();
    };
  }, [hasActions]);

  const rootStyle = hasActions
    ? ({
        "--thread-actions-width": `${actionsWidth}px`,
        "--thread-actions-gap": `${ACTION_GAP_PX}px`,
      } as CSSProperties)
    : undefined;

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-has-actions={hasActions || undefined}
      data-selected={selected || undefined}
      style={rootStyle}
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
        <div ref={actionsRef} className={styles.actions}>
          {actions.map((action) => (
            <Button
              key={action.id}
              leftIcon={action.icon}
              intent={action.intent ?? Intent.TERTIARY}
              iconSize={ACTION_ICON_SIZE}
              minimal
              className={styles.actionButton}
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
