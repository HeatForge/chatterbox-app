import { Suspense } from "react";

import { AuthQueryBanners } from "@/components/auth/auth-query-banners";
import { SignUpForm } from "@/components/auth/sign-up-form";

import styles from "./signup.module.css";

export default function SignUpPage() {
  return (
    <div className={styles.page}>
      <Suspense fallback={null}>
        <AuthQueryBanners />
      </Suspense>
      <SignUpForm />
    </div>
  );
}
