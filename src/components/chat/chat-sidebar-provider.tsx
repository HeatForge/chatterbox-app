"use client";

import { Lock, LockOpen } from "lucide-react";
import {
  type CSSProperties,
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import {
  DEFAULT_SIDEBAR_WIDTH,
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
} from "@/components/chat/sidebar-constants";
import { useSidebarResize } from "@/components/chat/use-sidebar-resize";
import { Button } from "@/components/ui/button";
import {
  SidebarProvider as ShadcnSidebarProvider,
  useSidebar as useShadcnSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type ChatSidebarChromeContextValue = {
  width: number;
  setWidth: (width: number) => void;
  locked: boolean;
  toggleLocked: () => void;
  notifyItemSelected: () => void;
};

const ChatSidebarChromeContext =
  createContext<ChatSidebarChromeContextValue | null>(null);

export function useChatSidebarChrome(): ChatSidebarChromeContextValue {
  const context = useContext(ChatSidebarChromeContext);
  if (!context) {
    throw new Error(
      "useChatSidebarChrome must be used within ChatSidebarShellProvider",
    );
  }
  return context;
}

type ChatSidebarChromeProviderProps = {
  width: number;
  setWidth: (width: number) => void;
  locked: boolean;
  setLocked: Dispatch<SetStateAction<boolean>>;
  children: ReactNode;
};

function ChatSidebarChromeProvider({
  width,
  setWidth,
  locked,
  setLocked,
  children,
}: ChatSidebarChromeProviderProps) {
  const { isMobile, setOpen, setOpenMobile } = useShadcnSidebar();

  const toggleLocked = useCallback(() => {
    if (!isMobile) {
      setLocked((current) => !current);
    }
  }, [isMobile, setLocked]);

  const notifyItemSelected = useCallback(() => {
    if (isMobile) {
      setOpenMobile(false);
      return;
    }

    if (!locked) {
      setOpen(false);
    }
  }, [isMobile, locked, setOpen, setOpenMobile]);

  const value = useMemo<ChatSidebarChromeContextValue>(
    () => ({
      width,
      setWidth,
      locked,
      toggleLocked,
      notifyItemSelected,
    }),
    [width, setWidth, locked, toggleLocked, notifyItemSelected],
  );

  return (
    <ChatSidebarChromeContext.Provider value={value}>
      {children}
    </ChatSidebarChromeContext.Provider>
  );
}

export function ChatSidebarShellProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [width, setWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [locked, setLocked] = useState(true);

  return (
    <ShadcnSidebarProvider
      style={
        {
          "--sidebar-width": `${width}px`,
        } as CSSProperties
      }
    >
      <ChatSidebarChromeProvider
        width={width}
        setWidth={setWidth}
        locked={locked}
        setLocked={setLocked}
      >
        {children}
      </ChatSidebarChromeProvider>
    </ShadcnSidebarProvider>
  );
}

/** Lock toggle shown in the sidebar header on desktop. */
export function ChatSidebarLockButton() {
  const { isMobile, open } = useShadcnSidebar();
  const { locked, toggleLocked } = useChatSidebarChrome();

  if (isMobile || !open) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={toggleLocked}
      aria-pressed={locked}
      aria-label={locked ? "Unlock sidebar" : "Lock sidebar open"}
    >
      {locked ? <Lock /> : <LockOpen />}
    </Button>
  );
}

/** Drag handle for resizing the desktop sidebar between 220–480px. */
export function ChatSidebarResizeHandle() {
  const { isMobile, open } = useShadcnSidebar();
  const { width, setWidth } = useChatSidebarChrome();
  const resizeEnabled = open && !isMobile;

  const { onResizePointerDown } = useSidebarResize({
    enabled: resizeEnabled,
    width,
    minWidth: MIN_SIDEBAR_WIDTH,
    maxWidth: MAX_SIDEBAR_WIDTH,
    onWidthChange: setWidth,
  });

  if (!resizeEnabled) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label="Resize sidebar"
      onPointerDown={onResizePointerDown}
      className={cn(
        "absolute top-0 right-0 z-20 h-full w-1 cursor-col-resize border-0 bg-transparent p-0",
        "hover:bg-sidebar-border/80 active:bg-sidebar-border",
      )}
    />
  );
}
