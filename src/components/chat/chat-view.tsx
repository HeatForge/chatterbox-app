"use client";

import { Icon } from "@iconify/react";

import { IconNames } from "@/lib/IconNames";
import "./chat.module.css";
import { BannerPlacement } from "@/hooks/use-banner/types";
import { useBanner } from "@/hooks/use-banner/use-banner";
import { useModal } from "@/hooks/use-modal/use-modal";
import { ToastPlacement } from "@/hooks/use-toaster/types";
import { useToaster } from "@/hooks/use-toaster/use-toaster";
import { Intent } from "@/lib/Intent";

export default function ChatView() {
  const showToast = useToaster();
  const showBanner = useBanner();
  const showModal = useModal();

  function handleShowToast(): void {
    const randomIntent = Object.values(Intent)[Math.floor(Math.random() * Object.values(Intent).length)];

    showToast({
      title: "Hello World",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      intent: randomIntent,
      placement: ToastPlacement.BOTTOM_RIGHT,
    });
  }

  function handleShowBanner(): void {

    const randomIntent = Object.values(Intent)[Math.floor(Math.random() * Object.values(Intent).length)];

    showBanner({
      title: "Hello World",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      intent: randomIntent,
      placement: BannerPlacement.TOP,
    });
  }

  function handleShowModal(): void {
    showModal({
      contents: (dismiss) => (
        <>
          <h1>Hello World</h1>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <button type="button" onClick={dismiss}>
            Dismiss
          </button>
        </>
      ),
    });
  }
  return (
    <main>
        <Icon icon={IconNames["home-2-fill"]} />
        Hello World!
        <button
          type="button"
          onClick={() => {
            handleShowToast();
          }}
        >
          Click me
        </button>
        <button
          type="button"
          onClick={() => {
            handleShowBanner();
          }}
        >
          Click me
        </button>
        <button
          type="button"
          onClick={() => {
            handleShowModal();
          }}
        >
          Click me
        </button>
      </main>
  );
}
