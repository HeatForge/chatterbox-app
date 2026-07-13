"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { BannerPlacement } from "@/hooks/use-banner/types";
import { useBanner } from "@/hooks/use-banner/use-banner";
import { Intent } from "@/lib/Intent";

const AUTH_BANNER_MESSAGES = {
  required: {
    title: "Sign in required",
    description: "You need to sign in before you can access Chatterbox.",
  },
  "not-whitelisted": {
    title: "Not whitelisted yet",
    description:
      "Your email has not been approved for access. Contact the administrator if you believe this is a mistake.",
  },
} as const;

type AuthBannerKey = keyof typeof AUTH_BANNER_MESSAGES;

function isAuthBannerKey(value: string | null): value is AuthBannerKey {
  return value !== null && value in AUTH_BANNER_MESSAGES;
}

export function AuthQueryBanners() {
  const searchParams = useSearchParams();
  const showBanner = useBanner();
  const shownRef = useRef<string | null>(null);
  const authParam = searchParams.get("auth");

  useEffect(() => {
    if (!isAuthBannerKey(authParam)) {
      shownRef.current = null;
      return;
    }

    if (shownRef.current === authParam) {
      return;
    }

    const message = AUTH_BANNER_MESSAGES[authParam];
    showBanner({
      title: message.title,
      description: message.description,
      intent: Intent.WARNING,
      placement: BannerPlacement.TOP,
      dismissable: false,
    });
    shownRef.current = authParam;
  }, [authParam, showBanner]);

  return null;
}
