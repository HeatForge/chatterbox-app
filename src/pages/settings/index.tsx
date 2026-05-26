import Head from "next/head";
import { useRef } from "react";

import { useOverlay } from "~/components/overlays";

import styles from "./index.module.css";

export default function SettingsPage() {
  const { toast, modal, popover } = useOverlay();
  const popoverAnchorRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Head>
        <title>Settings — Chatterbox</title>
      </Head>
      <main className={styles.root}>
        <h1 className={styles.title}>Settings</h1>
        <section className={styles.section} aria-labelledby="overlay-demo-heading">
          <h2 id="overlay-demo-heading" className={styles.sectionTitle}>
            Overlay demo
          </h2>
          <p className={styles.hint}>Phase 0 overlay primitives (ISSUE-005).</p>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.button}
              onClick={() => toast.success("Settings saved.")}
            >
              Toast success
            </button>
            <button
              type="button"
              className={styles.button}
              onClick={() => toast.error("Something went wrong.")}
            >
              Toast error
            </button>
            <button
              type="button"
              className={styles.button}
              onClick={() =>
                modal.confirm({
                  title: "Delete chat?",
                  body: "This cannot be undone.",
                  confirmLabel: "Delete",
                  onConfirm: () => toast.info("Chat deleted (demo)."),
                })
              }
            >
              Confirm modal
            </button>
            <button
              ref={popoverAnchorRef}
              type="button"
              className={styles.button}
              onClick={() =>
                popover.open(popoverAnchorRef, (
                  <p className={styles.popoverText}>Lightweight anchored popover.</p>
                ))
              }
            >
              Open popover
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
