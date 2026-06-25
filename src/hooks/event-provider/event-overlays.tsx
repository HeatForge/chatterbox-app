"use client";

import { BannerBar } from "@/hooks/use-banner/banner-bar";
import type { BannerItem } from "@/hooks/use-banner/types";
import { ModalOverlay } from "@/hooks/use-modal/modal-overlay";
import type { ModalItem } from "@/hooks/use-modal/types";
import { ToastStack } from "@/hooks/use-toaster/toast-stack";
import type { ToastItem } from "@/hooks/use-toaster/types";

type EventOverlaysProps = {
  toasts: ToastItem[];
  banners: BannerItem[];
  modals: ModalItem[];
  onDismissToast: (id: string) => void;
  onDismissBanner: (id: string) => void;
  onDismissModal: (id: string) => void;
};

export function EventOverlays({
  toasts,
  banners,
  modals,
  onDismissToast,
  onDismissBanner,
  onDismissModal,
}: EventOverlaysProps) {
  return (
    <>
      <ToastStack toasts={toasts} onDismiss={onDismissToast} />
      {banners.map((banner) => (
        <BannerBar
          key={banner.id}
          banner={banner}
          onDismiss={() => onDismissBanner(banner.id)}
        />
      ))}
      {modals.map((modal, index) => (
        <ModalOverlay
          key={modal.id}
          modal={modal}
          layer={index}
          onDismiss={() => onDismissModal(modal.id)}
        />
      ))}
    </>
  );
}
