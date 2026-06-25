"use client";

import { useEventContext } from "@/hooks/event-provider/event-provider";
import type { ModalOptions } from "./types";

export function useModal(): (options: ModalOptions) => string {
  const { showModal } = useEventContext();
  return showModal;
}
