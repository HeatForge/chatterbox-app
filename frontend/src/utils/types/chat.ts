export interface ChatThread {
  id: string;
  title: string;
  children?: ChatThread[];
}

export interface Project {
  id: string;
  name: string;
  threads?: ChatThread[];
}

export type ToolCallStatus = "pending" | "accepted" | "denied" | "allowlisted";

export interface ToolCall {
  name: string;
  description: string;
  status: ToolCallStatus;
}

export interface MessageVariant {
  content: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  variants: MessageVariant[];
  activeVariantIndex: number;
  thinking?: string;
  toolCall?: ToolCall;
}
