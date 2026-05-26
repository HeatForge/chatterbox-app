import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { OverlayContext } from "./OverlayContext";
import { Modal } from "./Modal";
import { Popover } from "./Popover";
import { ToastList } from "./Toast";
import {
  type ModalConfirmOptions,
  type ModalItem,
  type ModalOpenOptions,
  type OverlayContextValue,
  type PopoverState,
  type ToastItem,
  type ToastVariant,
} from "./types";

const MAX_TOASTS = 5;
const TOAST_DURATION_MS = 4500;

let nextId = 0;
function createId(prefix: string) {
  nextId += 1;
  return `${prefix}-${nextId}`;
}

interface OverlayProviderProps {
  children: ReactNode;
}

export function OverlayProvider({ children }: OverlayProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [modals, setModals] = useState<ModalItem[]>([]);
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const focusReturnRef = useRef<HTMLElement | null>(null);
  const toastTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const timer = toastTimersRef.current.get(id);
    if (timer) clearTimeout(timer);
    toastTimersRef.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (variant: ToastVariant, message: string) => {
      const id = createId("toast");
      setToasts((prev) => {
        const next = [...prev, { id, variant, message }];
        return next.length > MAX_TOASTS ? next.slice(-MAX_TOASTS) : next;
      });
      const timer = setTimeout(() => dismissToast(id), TOAST_DURATION_MS);
      toastTimersRef.current.set(id, timer);
    },
    [dismissToast],
  );

  const restoreFocus = useCallback(() => {
    const el = focusReturnRef.current;
    focusReturnRef.current = null;
    if (el && typeof el.focus === "function") {
      el.focus();
    }
  }, []);

  const closeModal = useCallback(
    (id?: string) => {
      setModals((prev) => {
        if (prev.length === 0) return prev;
        const targetId = id ?? prev[prev.length - 1]?.id;
        const next = prev.filter((m) => m.id !== targetId);
        if (next.length === 0) restoreFocus();
        return next;
      });
    },
    [restoreFocus],
  );

  const openModal = useCallback((options: ModalOpenOptions) => {
    const id = createId("modal");
    const item: ModalItem = { id, ...options };
    setModals((prev) => {
      if (prev.length === 0) {
        const active = document.activeElement;
        if (active instanceof HTMLElement) {
          focusReturnRef.current = active;
        }
      }
      return [...prev, item];
    });
    return id;
  }, []);

  const confirmModal = useCallback(
    (options: ModalConfirmOptions) => {
      return openModal({
        title: options.title,
        body: options.body,
        confirmLabel: options.confirmLabel ?? "Confirm",
        cancelLabel: options.cancelLabel ?? "Cancel",
        onConfirm: options.onConfirm,
        onCancel: options.onCancel,
        disableBackdropClose: true,
      });
    },
    [openModal],
  );

  const value = useMemo<OverlayContextValue>(
    () => ({
      toast: {
        success: (message) => pushToast("success", message),
        error: (message) => pushToast("error", message),
        info: (message) => pushToast("info", message),
      },
      modal: {
        open: openModal,
        confirm: confirmModal,
        close: closeModal,
      },
      popover: {
        open: (anchorRef, content) => {
          const id = createId("popover");
          setPopover({ id, anchorRef, content });
          return id;
        },
        close: () => setPopover(null),
      },
    }),
    [closeModal, confirmModal, openModal, pushToast],
  );

  return (
    <OverlayContext.Provider value={value}>
      {children}
      <ToastList toasts={toasts} onDismiss={dismissToast} />
      {modals.map((modal, index) => {
        const isTop = index === modals.length - 1;
        return (
          <Modal
            key={modal.id}
            modal={modal}
            stackIndex={index}
            isTop={isTop}
            onClose={() => closeModal(modal.id)}
            onConfirm={async () => {
              await modal.onConfirm?.();
              closeModal(modal.id);
            }}
          />
        );
      })}
      {popover ? <Popover state={popover} onClose={() => setPopover(null)} /> : null}
    </OverlayContext.Provider>
  );
}
