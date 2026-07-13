"use client";

import type { ChatSidebarData } from "@/components/chat/ChatInitialDataProvider";
import type { AiSettingsConfig } from "@/lib/services/ai-providers";
import type { ChatThreadPayload } from "@/lib/services/chat";

export type CachedThreadPayload = Omit<
  ChatThreadPayload,
  "createdAt" | "updatedAt"
>;

const CACHE_KEY = "chatterbox:app-cache";
const CACHE_VERSION = 1;
const MAX_CACHED_THREADS = 4;
const MAX_MESSAGES_PER_THREAD = 100;
const CACHE_MAX_AGE_MS = 15 * 60 * 1000;

type PersistedCache = {
  version: number;
  userId: string;
  sidebar: ChatSidebarData | null;
  threads: CachedThreadPayload[];
  settings: AiSettingsConfig | null;
  savedAt: number;
};

type AppCache = {
  userId: string | null;
  sidebar: ChatSidebarData | null;
  threads: Map<string, CachedThreadPayload>;
  settings: AiSettingsConfig | null;
};

const cache: AppCache = {
  userId: null,
  sidebar: null,
  threads: new Map(),
  settings: null,
};

let persistTimer: number | undefined;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function clearPersistedCache(): void {
  if (isBrowser()) {
    window.sessionStorage.removeItem(CACHE_KEY);
  }
}

function toPersistedThread(thread: CachedThreadPayload): CachedThreadPayload {
  return {
    ...thread,
    messages: thread.messages.slice(-MAX_MESSAGES_PER_THREAD),
  };
}

function parsePersistedCache(
  raw: string,
  userId: string,
): PersistedCache | null {
  try {
    const value = JSON.parse(raw) as Partial<PersistedCache>;
    if (
      value.version !== CACHE_VERSION ||
      value.userId !== userId ||
      !Array.isArray(value.threads) ||
      typeof value.savedAt !== "number" ||
      Date.now() - value.savedAt > CACHE_MAX_AGE_MS
    ) {
      return null;
    }

    return value as PersistedCache;
  } catch {
    return null;
  }
}

/**
 * Selects the current user scope for the browser cache. Changing accounts or
 * signing out deletes both memory and session data to prevent cross-account
 * chat/settings disclosure.
 */
export function setAppCacheUserId(userId: string | null): void {
  if (cache.userId === userId) {
    return;
  }

  cache.userId = userId;
  cache.sidebar = null;
  cache.threads.clear();
  cache.settings = null;

  if (!userId || !isBrowser()) {
    clearPersistedCache();
    return;
  }

  const persisted = parsePersistedCache(
    window.sessionStorage.getItem(CACHE_KEY) ?? "",
    userId,
  );
  if (!persisted) {
    clearPersistedCache();
    return;
  }

  cache.sidebar = persisted.sidebar;
  cache.settings = persisted.settings ?? null;
  for (const thread of persisted.threads.slice(0, MAX_CACHED_THREADS)) {
    cache.threads.set(thread.id, thread);
  }
}

/** Returns the cached sidebar only for the authenticated browser user. */
export function getCachedSidebar(): ChatSidebarData | null {
  return cache.userId ? cache.sidebar : null;
}

/** Stores the latest sidebar response and schedules bounded persistence. */
export function setCachedSidebar(sidebar: ChatSidebarData): void {
  if (!cache.userId) {
    return;
  }

  cache.sidebar = sidebar;
  scheduleAppCachePersistence();
}

/** Returns a previously visited full thread payload, if it is still cached. */
export function getCachedThread(threadId: string): CachedThreadPayload | null {
  return cache.userId ? (cache.threads.get(threadId) ?? null) : null;
}

/** Caches a full thread payload and evicts the least recently used entry. */
export function setCachedThread(thread: CachedThreadPayload): void {
  if (!cache.userId) {
    return;
  }

  cache.threads.delete(thread.id);
  cache.threads.set(thread.id, thread);
  while (cache.threads.size > MAX_CACHED_THREADS) {
    const oldestId = cache.threads.keys().next().value;
    if (!oldestId) {
      break;
    }
    cache.threads.delete(oldestId);
  }
  scheduleAppCachePersistence();
}

/** Removes an invalidated thread after deletion, archival, or a 404 response. */
export function deleteCachedThread(threadId: string): void {
  cache.threads.delete(threadId);
  scheduleAppCachePersistence();
}

/** Returns the latest cached settings/configuration snapshot for this user. */
export function getCachedSettings(): AiSettingsConfig | null {
  return cache.userId ? cache.settings : null;
}

/** Stores the settings response after a load or successful settings mutation. */
export function setCachedSettings(settings: AiSettingsConfig): void {
  if (!cache.userId) {
    return;
  }

  cache.settings = settings;
  scheduleAppCachePersistence();
}

/**
 * Schedules a sessionStorage update. Persistence is intentionally best-effort:
 * quota/security failures only disable the warm-cache enhancement, not chat.
 */
export function scheduleAppCachePersistence(): void {
  if (!cache.userId || !isBrowser() || persistTimer) {
    return;
  }

  persistTimer = window.setTimeout(() => {
    persistTimer = undefined;
    flushAppCachePersistence();
  }, 250);
}

/** Persists the bounded cache immediately before navigation or page suspension. */
export function flushAppCachePersistence(): void {
  if (persistTimer) {
    clearTimeout(persistTimer);
    persistTimer = undefined;
  }
  if (!cache.userId || !isBrowser()) {
    return;
  }

  const value: PersistedCache = {
    version: CACHE_VERSION,
    userId: cache.userId,
    sidebar: cache.sidebar,
    threads: [...cache.threads.values()]
      .slice(-MAX_CACHED_THREADS)
      .map(toPersistedThread),
    settings: cache.settings,
    savedAt: Date.now(),
  };

  try {
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(value));
  } catch {
    clearPersistedCache();
  }
}
