import type { VariantProps } from "class-variance-authority";

import type { badgeVariants } from "@/components/ui/badge";
import type { buttonVariants } from "@/components/ui/button";
import { Intent } from "@/lib/Intent";
import { cn } from "@/lib/utils";

type ButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>["variant"]
>;
type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

const INTENT_BUTTON_VARIANT: Record<Intent, ButtonVariant> = {
  [Intent.PRIMARY]: "default",
  [Intent.SECONDARY]: "secondary",
  [Intent.TERTIARY]: "outline",
  [Intent.WARNING]: "outline",
  [Intent.DANGER]: "destructive",
  [Intent.SUCCESS]: "secondary",
  [Intent.INFO]: "outline",
};

const INTENT_BADGE_VARIANT: Record<Intent, BadgeVariant> = {
  [Intent.PRIMARY]: "default",
  [Intent.SECONDARY]: "secondary",
  [Intent.TERTIARY]: "outline",
  [Intent.WARNING]: "outline",
  [Intent.DANGER]: "destructive",
  [Intent.SUCCESS]: "secondary",
  [Intent.INFO]: "outline",
};

const INTENT_SURFACE_CLASS: Partial<Record<Intent, string>> = {
  [Intent.TERTIARY]:
    "border-[var(--color-tertiary)] bg-[var(--intent-tertiary-bg)] text-[var(--intent-tertiary-fg)] hover:bg-[color-mix(in_srgb,var(--intent-tertiary-bg),var(--color-text)_8%)]",
  [Intent.WARNING]:
    "border-[var(--color-warn)] bg-[var(--intent-warning-bg)] text-[var(--intent-warning-fg)] hover:bg-[color-mix(in_srgb,var(--intent-warning-bg),var(--color-text)_8%)]",
  [Intent.SUCCESS]:
    "border-[var(--color-secondary)] bg-[var(--intent-success-bg)] text-[var(--intent-success-fg)] hover:bg-[color-mix(in_srgb,var(--intent-success-bg),var(--color-text)_8%)]",
  [Intent.INFO]:
    "border-[var(--color-info)] bg-[var(--intent-info-bg)] text-[var(--intent-info-fg)] hover:bg-[color-mix(in_srgb,var(--intent-info-bg),var(--color-text)_8%)]",
};

export type IntentVariants = {
  buttonVariant: ButtonVariant;
  badgeVariant: BadgeVariant;
  className?: string;
};

/**
 * Maps app `Intent` values to shadcn `Button` / `Badge` variants and optional
 * surface classes backed by `tokens.css` intent variables.
 */
export function intentVariants(intent: Intent): IntentVariants {
  return {
    buttonVariant: INTENT_BUTTON_VARIANT[intent],
    badgeVariant: INTENT_BADGE_VARIANT[intent],
    className: INTENT_SURFACE_CLASS[intent],
  };
}

/**
 * Convenience helper for composing intent surface classes with other utilities.
 */
export function intentClassName(
  intent: Intent,
  ...classes: Array<string | undefined>
): string {
  return cn(intentVariants(intent).className, ...classes);
}
