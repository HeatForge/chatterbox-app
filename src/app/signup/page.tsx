import { Suspense } from "react";

import { AuthQueryBanners } from "@/components/auth/auth-query-banners";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-5 py-8">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <Suspense fallback={null}>
          <AuthQueryBanners />
        </Suspense>
        <SignUpForm />
      </div>
    </div>
  );
}
