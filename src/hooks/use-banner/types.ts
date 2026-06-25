import type { MingcuteIconName } from "@/lib/IconNames";
import type { Intent } from "@/lib/Intent";

export enum BannerPlacement {
  TOP = "top",
  BOTTOM = "bottom",
}

export type BannerOptions = {
  icon?: MingcuteIconName;
  title: string;
  description?: string;
  duration?: number;
  dismissable?: boolean;
  intent: Intent;
  placement: BannerPlacement;
};

export type BannerItem = BannerOptions & {
  id: string;
};
