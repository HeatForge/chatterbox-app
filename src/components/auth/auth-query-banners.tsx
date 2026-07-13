"use client";

import { TriangleAlertIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Intent } from "@/lib/Intent";
import { intentClassName } from "@/lib/intent-variants";

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
  const authParam = searchParams.get("auth");

  if (!isAuthBannerKey(authParam)) {
    return null;
  }

  const message = AUTH_BANNER_MESSAGES[authParam];

  return (
    <Alert className={intentClassName(Intent.WARNING)}>
      <TriangleAlertIcon />
      <AlertTitle>{message.title}</AlertTitle>
      <AlertDescription>{message.description}</AlertDescription>
    </Alert>
  );
}
