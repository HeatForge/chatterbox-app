"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/lib/button/Button";
import { authClient } from "@/lib/auth-client";
import { Intent } from "@/lib/Intent";

import styles from "./auth.module.css";

function isNotWhitelistedError(error: {
  message?: string;
  code?: string;
  status?: number;
}): boolean {
  return (
    error.code === "NOT_WHITELISTED" ||
    error.status === 403 ||
    (error.message?.toLowerCase().includes("whitelisted") ?? false)
  );
}

export function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signUpError } = await authClient.signUp.email({
      email,
      password,
      name: username,
      username,
      callbackURL: "/chat",
    });

    setIsSubmitting(false);

    if (signUpError) {
      if (isNotWhitelistedError(signUpError)) {
        router.replace("/?auth=not-whitelisted");
        return;
      }

      setError(signUpError.message ?? "Unable to create your account.");
      return;
    }

    router.push("/chat");
    router.refresh();
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.subtitle}>
          Choose a username and password. Access is limited to whitelisted
          emails.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="sign-up-email">
            Email
          </label>
          <input
            id="sign-up-email"
            className={styles.input}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="sign-up-username">
            Username
          </label>
          <input
            id="sign-up-username"
            className={styles.input}
            type="text"
            autoComplete="username"
            required
            minLength={3}
            maxLength={30}
            pattern="[A-Za-z0-9_.]+"
            title="Use letters, numbers, underscores, or dots."
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="sign-up-password">
            Password
          </label>
          <input
            id="sign-up-password"
            className={styles.input}
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {error ? <p className={styles.error}>{error}</p> : null}

        <div className={styles.actions}>
          <Button
            type="submit"
            text="Sign up"
            intent={Intent.PRIMARY}
            disabled={isSubmitting}
          />
          <Button
            type="button"
            text="Back to sign in"
            intent={Intent.TERTIARY}
            disabled={isSubmitting}
            onClick={() => router.push("/")}
          />
        </div>
      </form>

      <p className={styles.footer}>
        Already have an account?{" "}
        <Link className={styles.link} href="/">
          Sign in
        </Link>
      </p>
    </div>
  );
}
