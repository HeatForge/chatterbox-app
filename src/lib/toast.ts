import { toast } from "sonner";

import { Intent } from "@/lib/Intent";

export type ShowIntentToastOptions = {
  title: string;
  description?: string;
  intent: Intent;
  duration?: number;
};

/**
 * Shows a Sonner toast with intent-mapped styling (success, error, warning, info).
 */
export function showIntentToast({
  title,
  description,
  intent,
  duration,
}: ShowIntentToastOptions): void {
  const options = { description, duration };

  switch (intent) {
    case Intent.SUCCESS:
      toast.success(title, options);
      return;
    case Intent.DANGER:
      toast.error(title, options);
      return;
    case Intent.WARNING:
      toast.warning(title, options);
      return;
    case Intent.INFO:
      toast.info(title, options);
      return;
    default:
      toast(title, options);
  }
}
