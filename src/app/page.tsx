import { Suspense } from "react";

import { AuthQueryBanners } from "@/components/auth/auth-query-banners";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function HomePage() {
  return (
    <div className="flex flex-1 items-center justify-center px-5 py-8">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <Suspense fallback={null}>
          <AuthQueryBanners />
        </Suspense>
        <SignInForm />
      </div>
    </div>
  );
}
