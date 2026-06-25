"use client";

import { useEventContext } from "@/hooks/event-provider/event-provider";
import type { ToastOptions } from "./types";

export function useToaster(): (options: ToastOptions) => string {
  const { showToast } = useEventContext();
  return showToast;
}
