import { type ReactNode, type RefObject } from "react";

export type ToastVariant = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
}

export interface ModalOpenOptions {
  title: string;
  body: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  /** When true, backdrop click does not close the modal. */
  disableBackdropClose?: boolean;
}

export interface ModalConfirmOptions {
  title: string;
  body: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface ModalItem extends ModalOpenOptions {
  id: string;
}

export interface PopoverState {
  id: string;
  anchorRef: RefObject<HTMLElement | null>;
  content: ReactNode;
}

export interface OverlayContextValue {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
  modal: {
    open: (options: ModalOpenOptions) => string;
    confirm: (options: ModalConfirmOptions) => string;
    close: (id?: string) => void;
  };
  popover: {
    open: (anchorRef: RefObject<HTMLElement | null>, content: ReactNode) => string;
    close: () => void;
  };
}
