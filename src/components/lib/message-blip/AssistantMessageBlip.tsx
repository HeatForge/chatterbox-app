"use client";

import { MessageBlip, type MessageBlipProps } from "./MessageBlip";

export type AssistantMessageBlipProps = Omit<
  MessageBlipProps,
  "align" | "thinking"
> & {
  thinking?: string;
};

export function AssistantMessageBlip({
  thinking,
  ...rest
}: AssistantMessageBlipProps) {
  return <MessageBlip align="left" thinking={thinking} {...rest} />;
}
