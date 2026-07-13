"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/lib/button/Button";
import { authClient } from "@/lib/auth-client";
import { Intent } from "@/lib/Intent";

import styles from "./auth.module.css";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/chat",
    });

    setIsSubmitting(false);

    if (signInError) {
      setError(
        signInError.message ?? "Unable to sign in. Check your credentials.",
      );
      return;
    }

    router.push("/chat");
    router.refresh();
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.title}>Chatterbox</h1>
        <p className={styles.subtitle}>
          Sign in to continue to your workspace.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="sign-in-email">
            Email
          </label>
          <input
            id="sign-in-email"
            className={styles.input}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="sign-in-password">
            Password
          </label>
          <input
            id="sign-in-password"
            className={styles.input}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {error ? <p className={styles.error}>{error}</p> : null}

        <div className={styles.actions}>
          <Button
            type="submit"
            text="Sign in"
            intent={Intent.PRIMARY}
            disabled={isSubmitting}
          />
          <Button
            type="button"
            text="Create account"
            intent={Intent.TERTIARY}
            disabled={isSubmitting}
            onClick={() => router.push("/signup")}
          />
        </div>
      </form>

      <p className={styles.footer}>
        Need an account?{" "}
        <Link className={styles.link} href="/signup">
          Go to sign up
        </Link>
      </p>
    </div>
  );
}
