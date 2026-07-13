"use client";

import { useEffect } from "react";

import { authClient } from "@/lib/auth-client";
import {
  flushAppCachePersistence,
  setAppCacheUserId,
} from "@/lib/cache/app-cache";

/**
 * Scopes browser cache entries to the active Better Auth session and persists
 * pending changes when the page is hidden. A missing session clears cached
 * user data instead of allowing a later account to read it.
 */
export function AppCacheSessionSync() {
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending) {
      setAppCacheUserId(session?.user.id ?? null);
    }
  }, [isPending, session?.user.id]);

  useEffect(() => {
    const flush = () => flushAppCachePersistence();
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flush();
      }
    };

    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}
