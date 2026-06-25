import type { MingcuteIconName } from "@/lib/IconNames";
import { IconNames } from "@/lib/IconNames";
import { Intent } from "@/lib/Intent";

const INTENT_ICON_MAP: Record<Intent, MingcuteIconName> = {
  [Intent.PRIMARY]: IconNames["sparkles-line"],
  [Intent.SECONDARY]: IconNames["more-2-line"],
  [Intent.TERTIARY]: IconNames["information-line"],
  [Intent.WARNING]: IconNames["alert-line"],
  [Intent.DANGER]: IconNames["alert-octagon-line"],
  [Intent.SUCCESS]: IconNames["check-circle-line"],
  [Intent.INFO]: IconNames["information-line"],
};

export function intentDefaultIcon(intent: Intent): MingcuteIconName {
  return INTENT_ICON_MAP[intent];
}
