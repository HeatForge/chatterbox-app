import Head from "next/head";
import Link from "next/link";
import { type FormEvent, useState } from "react";

import { authClient } from "~/server/better-auth/client";
import { api } from "~/utils/api";
import styles from "./index.module.css";

export default function Home() {
  const hello = api.post.hello.useQuery({ text: "from tRPC" });

  return (
    <>
      <Head>
        <title>Chatterbox</title>
        <meta name="description" content="Personal AI chat" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>
            Chat<span className={styles.pinkSpan}>terbox</span>
          </h1>
          <div className={styles.cardRow}>
            <Link
              className={styles.card}
              href="https://github.com/HeatForge/chatterbox-app"
              target="_blank"
            >
              <h3 className={styles.cardTitle}>Repository →</h3>
              <div className={styles.cardText}>
                Source code and design docs for this application.
              </div>
            </Link>
            <Link className={styles.card} href="/chat">
              <h3 className={styles.cardTitle}>Open chat →</h3>
              <div className={styles.cardText}>
                Go to the chat layout (requires sign-in when routes are
                protected).
              </div>
            </Link>
          </div>
          <div className={styles.showcaseContainer}>
            <p className={styles.showcaseText}>
              {hello.data ? hello.data.greeting : "Loading tRPC query..."}
            </p>
            <AuthShowcase />
          </div>
        </div>
      </main>
    </>
  );
}

function AuthShowcase() {
  const { data: sessionData, isPending } = authClient.useSession();

  const { data: secretMessage } = api.post.getSecretMessage.useQuery(
    undefined,
    { enabled: sessionData?.user !== undefined },
  );

  if (isPending) {
    return <p className={styles.showcaseText}>Loading...</p>;
  }

  return (
    <div className={styles.authContainer}>
      <p className={styles.showcaseText}>
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> — {secretMessage}</span>}
      </p>
      {sessionData ? (
        <button
          type="button"
          className={styles.loginButton}
          onClick={async () => {
            await authClient.signOut();
          }}
        >
          Sign out
        </button>
      ) : (
        <EmailPasswordAuth />
      )}
    </div>
  );
}

function EmailPasswordAuth() {
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "signUp") {
        const result = await authClient.signUp.email({
          email,
          password,
          name: name.trim() || email.split("@")[0] || "User",
        });
        if (result.error) {
          setError(result.error.message ?? "Sign up failed");
        }
      } else {
        const result = await authClient.signIn.email({
          email,
          password,
        });
        if (result.error) {
          setError(result.error.message ?? "Sign in failed");
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <form className={styles.form} onSubmit={handleSubmit}>
        {mode === "signUp" && (
          <input
            className={styles.input}
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        )}
        <input
          className={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          className={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete={
            mode === "signUp" ? "new-password" : "current-password"
          }
        />
        <button
          type="submit"
          className={styles.submitButton}
          disabled={submitting}
        >
          {submitting
            ? "Please wait…"
            : mode === "signUp"
              ? "Create account"
              : "Sign in"}
        </button>
      </form>
      {error && <p className={styles.showcaseText}>{error}</p>}
      <button
        type="button"
        className={styles.loginButton}
        onClick={() => {
          setMode(mode === "signIn" ? "signUp" : "signIn");
          setError(null);
        }}
      >
        {mode === "signIn"
          ? "Need an account? Sign up"
          : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
