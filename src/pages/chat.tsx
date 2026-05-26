import Head from "next/head";

/**
 * PWA `start_url` target. Full chat UI arrives in later issues.
 */
export default function ChatPage() {
  return (
    <>
      <Head>
        <title>Chat — Chatterbox</title>
      </Head>
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h1>Chatterbox</h1>
        <p style={{ color: "#475569" }}>Chat UI coming soon.</p>
      </main>
    </>
  );
}
