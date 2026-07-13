import {
  type CachedThreadPayload,
  deleteCachedThread,
  getCachedThread,
  setCachedThread,
} from "@/lib/cache/app-cache";

export type { CachedThreadPayload };

export type ThreadCache = {
  get: (threadId: string) => CachedThreadPayload | null;
  set: (thread: CachedThreadPayload) => void;
  delete: (threadId: string) => void;
};

/**
 * Combines an in-memory LRU map with the session-scoped `app-cache` layer.
 * Mirrors the dual-cache pattern previously embedded in `chat/page.tsx`.
 */
export function createThreadCache(
  initialThread?: CachedThreadPayload | null,
): ThreadCache {
  const memory = new Map<string, CachedThreadPayload>();

  if (initialThread) {
    memory.set(initialThread.id, initialThread);
  }

  return {
    get(threadId: string) {
      return memory.get(threadId) ?? getCachedThread(threadId);
    },
    set(thread: CachedThreadPayload) {
      memory.set(thread.id, thread);
      setCachedThread(thread);
    },
    delete(threadId: string) {
      memory.delete(threadId);
      deleteCachedThread(threadId);
    },
  };
}
