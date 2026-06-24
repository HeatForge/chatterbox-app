"use client";

import { Icon } from "@iconify/react";

import { IconNames } from "@/lib/IconNames";
import "./chat.module.css";

export default function ChatView() {
  return (
    <>
      <main>
        <Icon icon={IconNames["home-2-fill"]} />
        Hello World!
      </main>
    </>
  );
}
