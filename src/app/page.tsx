import { Suspense } from "react";

import { AuthQueryBanners } from "@/components/auth/auth-query-banners";
import { SignInForm } from "@/components/auth/sign-in-form";

import styles from "./page.module.css";

export default function HomePage() {
  return (
    <div className={styles.page}>
      <Suspense fallback={null}>
        <AuthQueryBanners />
      </Suspense>
      <SignInForm />
    </div>
  );
}
