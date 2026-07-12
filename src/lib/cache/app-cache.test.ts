import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  flushAppCachePersistence,
  getCachedSidebar,
  getCachedThread,
  setAppCacheUserId,
  setCachedSidebar,
  setCachedThread,
} from "@/lib/cache/app-cache";

function createSessionStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
}

describe("app cache", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      clearTimeout,
      sessionStorage: createSessionStorage(),
      setTimeout,
    });
    setAppCacheUserId(null);
  });

  afterEach(() => {
    setAppCacheUserId(null);
    vi.unstubAllGlobals();
  });

  it("persists a bounded user-scoped sidebar and thread snapshot", () => {
    const sidebar = {
      projects: [],
      standalone: [{ id: "thread-1", title: "Cached thread" }],
      archived: { projects: [], standalone: [] },
    };
    setAppCacheUserId("user-1");
    setCachedSidebar(sidebar);
    setCachedThread({
      id: "thread-1",
      title: "Cached thread",
      modelId: "model",
      projectId: null,
      providerId: "provider",
      systemPrompt: "",
      messages: [],
    });
    flushAppCachePersistence();

    expect(getCachedSidebar()).toEqual(sidebar);
    expect(getCachedThread("thread-1")?.title).toBe("Cached thread");
    expect(window.sessionStorage.getItem("chatterbox:app-cache")).toContain(
      "user-1",
    );
  });

  it("clears persisted data when the active user changes", () => {
    setAppCacheUserId("user-1");
    setCachedSidebar({
      projects: [],
      standalone: [],
      archived: { projects: [], standalone: [] },
    });
    flushAppCachePersistence();

    setAppCacheUserId("user-2");

    expect(getCachedSidebar()).toBeNull();
    expect(getCachedThread("thread-1")).toBeNull();
  });
});
