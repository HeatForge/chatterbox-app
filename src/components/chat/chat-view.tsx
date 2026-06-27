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
import { Button } from "../lib/button/Button";
import { ChatInput, ChatInputState } from "../lib/chat-input/ChatInput";

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
          <Button 
            text="Dismiss"
            leftIcon={IconNames["close-line"]}
            onClick={dismiss}
            intent={Intent.DANGER}
            iconSize={32}
          />
        </>
      ),
    });
  }
  return (
    <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex : 1 }}>
        <Icon icon={IconNames["home-2-fill"]} />
        Hello World!
        <div style={{display : "flex"}}>
          <Button
            text="Toaster"
            onClick={handleShowToast}
            intent={Intent.INFO}
            leftIcon={IconNames["information-line"]}
          />
          <Button
            text="Banner"
            onClick={handleShowBanner}
            intent={Intent.WARNING}
            rightIcon={IconNames["alert-line"]}
          />
          <Button
            onClick={handleShowModal}
            intent={Intent.DANGER}
            leftIcon={IconNames["square-arrow-up-line"]}
          />
        </div>
        <div style={{display : "flex", flex : 1, height : "100%"}} />
        <ChatInput
          onSubmit={() => {}}
        />
      </main>
  );
}
