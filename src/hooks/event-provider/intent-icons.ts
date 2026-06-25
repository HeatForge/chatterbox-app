import type { MingcuteIconName } from "@/lib/IconNames";
import { IconNames } from "@/lib/IconNames";
import { Intent } from "@/lib/Intent";

const INTENT_ICON_MAP: Record<Intent, MingcuteIconName> = {
  [Intent.PRIMARY]: IconNames["sparkles-fill"],
  [Intent.SECONDARY]: IconNames["more-2-fill"],
  [Intent.TERTIARY]: IconNames["information-fill"],
  [Intent.WARNING]: IconNames["warning-fill"],
  [Intent.DANGER]: IconNames["alert-fill"],
  [Intent.SUCCESS]: IconNames["check-circle-fill"],
  [Intent.INFO]: IconNames["information-fill"],
};

export function intentDefaultIcon(intent: Intent): MingcuteIconName {
  return INTENT_ICON_MAP[intent];
}
