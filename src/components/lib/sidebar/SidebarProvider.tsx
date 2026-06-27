"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import { DEFAULT_SIDEBAR_WIDTH, MOBILE_MEDIA_QUERY } from "./constants";

export type SidebarContextValue = {
  open: boolean;
  locked: boolean;
  width: number;
  isMobile: boolean;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  setLocked: (locked: boolean) => void;
  toggleLocked: () => void;
  setWidth: (width: number) => void;
  notifyItemSelected: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

function subscribeMobile(callback: () => void): () => void {
  const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getMobileSnapshot(): boolean {
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

function getServerMobileSnapshot(): boolean {
  return false;
}

function getInitialOpen(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  return !window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

export function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}

type SidebarProviderProps = {
  children: React.ReactNode;
};

export function SidebarProvider({ children }: SidebarProviderProps) {
  const isMobile = useSyncExternalStore(
    subscribeMobile,
    getMobileSnapshot,
    getServerMobileSnapshot,
  );
  const [open, setOpen] = useState(getInitialOpen);
  const [locked, setLocked] = useState(true);
  const [width, setWidth] = useState(DEFAULT_SIDEBAR_WIDTH);

  const toggleOpen = useCallback(() => {
    setOpen((current) => !current);
  }, []);

  const toggleLocked = useCallback(() => {
    setLocked((current) => !current);
  }, []);

  const notifyItemSelected = useCallback(() => {
    if (!locked) {
      setOpen(false);
    }
  }, [locked]);

  const value = useMemo<SidebarContextValue>(
    () => ({
      open,
      locked,
      width,
      isMobile,
      setOpen,
      toggleOpen,
      setLocked,
      toggleLocked,
      setWidth,
      notifyItemSelected,
    }),
    [
      open,
      locked,
      width,
      isMobile,
      toggleOpen,
      toggleLocked,
      notifyItemSelected,
    ],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}
