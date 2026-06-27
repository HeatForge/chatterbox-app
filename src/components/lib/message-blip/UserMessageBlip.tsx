"use client";

import { MessageBlip, type MessageBlipProps } from "./MessageBlip";

export type UserMessageBlipProps = Omit<MessageBlipProps, "align" | "thinking">;

export function UserMessageBlip(props: UserMessageBlipProps) {
  return <MessageBlip align="right" {...props} />;
}
