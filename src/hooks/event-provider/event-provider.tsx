"use client";

import { nanoid } from "nanoid";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import type { BannerItem, BannerOptions } from "@/hooks/use-banner/types";
import type { ModalItem, ModalOptions } from "@/hooks/use-modal/types";
import type { ToastItem, ToastOptions } from "@/hooks/use-toaster/types";

import { EventOverlays } from "./event-overlays";

const MAX_STACKED_TOASTS = 3;

type EventContextValue = {
  showToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
  showBanner: (options: BannerOptions) => string;
  dismissBanner: (id: string) => void;
  showModal: (options: ModalOptions) => string;
  dismissModal: (id: string) => void;
};

const EventContext = createContext<EventContextValue | null>(null);

export function useEventContext(): EventContextValue {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("Event hooks must be used within EventProvider");
  }
  return context;
}

type EventProviderProps = {
  children: React.ReactNode;
};

export function EventProvider({ children }: EventProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [modals, setModals] = useState<ModalItem[]>([]);
  const modalsRef = useRef(modals);
  modalsRef.current = modals;

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const dismissBanner = useCallback((id: string) => {
    setBanners((current) => current.filter((banner) => banner.id !== id));
  }, []);

  const dismissModal = useCallback((id: string) => {
    const modal = modalsRef.current.find((item) => item.id === id);
    modal?.dismiss();
  }, []);

  const showToast = useCallback((options: ToastOptions) => {
    const id = nanoid();
    const stackable = options.stackable ?? true;

    setToasts((current) => {
      let next = current;

      if (!stackable) {
        next = current.filter((toast) => toast.placement !== options.placement);
      } else {
        const samePlacement = current.filter(
          (toast) => toast.placement === options.placement,
        );
        if (samePlacement.length >= MAX_STACKED_TOASTS) {
          const oldestId = samePlacement[0]?.id;
          next = current.filter((toast) => toast.id !== oldestId);
        }
      }

      return [...next, { ...options, id }];
    });

    return id;
  }, []);

  const showBanner = useCallback((options: BannerOptions) => {
    const id = nanoid();
    setBanners((current) => [...current, { ...options, id }]);
    return id;
  }, []);

  const showModal = useCallback((options: ModalOptions) => {
    const id = nanoid();
    const dismiss = () => {
      setModals((current) => current.filter((item) => item.id !== id));
    };
    const contents = options.contents(dismiss);

    setModals((current) => [
      ...current,
      {
        id,
        dim: options.dim,
        dismissOnOutsidePress: options.dismissOnOutsidePress,
        contents,
        dismiss,
      },
    ]);
    return id;
  }, []);

  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
      showBanner,
      dismissBanner,
      showModal,
      dismissModal,
    }),
    [
      showToast,
      dismissToast,
      showBanner,
      dismissBanner,
      showModal,
      dismissModal,
    ],
  );

  return (
    <EventContext.Provider value={value}>
      {children}
      <EventOverlays
        toasts={toasts}
        banners={banners}
        modals={modals}
        onDismissToast={dismissToast}
        onDismissBanner={dismissBanner}
        onDismissModal={dismissModal}
      />
    </EventContext.Provider>
  );
}
