import type { MingcuteIconName } from "@/lib/IconNames";
import type { Intent } from "@/lib/Intent";

export enum ToastPlacement {
  TOP_LEFT = "top-left",
  TOP_CENTER = "top-center",
  TOP_RIGHT = "top-right",
  BOTTOM_LEFT = "bottom-left",
  BOTTOM_CENTER = "bottom-center",
  BOTTOM_RIGHT = "bottom-right",
}

export type ToastOptions = {
  icon?: MingcuteIconName;
  title: string;
  description?: string;
  duration?: number;
  dismissable?: boolean;
  intent: Intent;
  placement: ToastPlacement;
  stackable?: boolean;
};

export type ToastItem = ToastOptions & {
  id: string;
};
