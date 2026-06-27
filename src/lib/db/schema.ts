import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface Database {
  messages: MessagesTable;
  email_whitelist: EmailWhitelistTable;
  ai_user_settings: AiUserSettingsTable;
  ai_providers: AiProvidersTable;
  ai_provider_models: AiProviderModelsTable;
  chat_threads: ChatThreadsTable;
  chat_messages: ChatMessagesTable;
}

export interface MessagesTable {
  id: string;
  content: string;
  created_at: Generated<Date>;
}

export interface EmailWhitelistTable {
  email: string;
  created_at: Generated<Date>;
}

export interface AiUserSettingsTable {
  user_id: string;
  system_prompt: string;
  preferred_provider_id: string | null;
  preferred_model_id: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface AiProvidersTable {
  id: string;
  user_id: string;
  provider_key: string;
  display_name: string;
  api_key: string;
  base_url: string | null;
  enabled: boolean;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface AiProviderModelsTable {
  provider_id: string;
  model_id: string;
  display_name: string;
  refreshed_at: Generated<Date>;
}

export interface ChatThreadsTable {
  id: string;
  user_id: string;
  title: string;
  provider_id: string | null;
  model_id: string;
  system_prompt: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface ChatMessagesTable {
  id: string;
  thread_id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  status: "completed" | "streaming" | "error";
  error: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export type Message = Selectable<MessagesTable>;
export type NewMessage = Insertable<MessagesTable>;
export type MessageUpdate = Updateable<MessagesTable>;
export type AiUserSettings = Selectable<AiUserSettingsTable>;
export type NewAiUserSettings = Insertable<AiUserSettingsTable>;
export type AiUserSettingsUpdate = Updateable<AiUserSettingsTable>;
export type AiProvider = Selectable<AiProvidersTable>;
export type NewAiProvider = Insertable<AiProvidersTable>;
export type AiProviderUpdate = Updateable<AiProvidersTable>;
export type AiProviderModel = Selectable<AiProviderModelsTable>;
export type NewAiProviderModel = Insertable<AiProviderModelsTable>;
export type ChatThread = Selectable<ChatThreadsTable>;
export type NewChatThread = Insertable<ChatThreadsTable>;
export type ChatThreadUpdate = Updateable<ChatThreadsTable>;
export type ChatMessage = Selectable<ChatMessagesTable>;
export type NewChatMessage = Insertable<ChatMessagesTable>;
export type ChatMessageUpdate = Updateable<ChatMessagesTable>;
