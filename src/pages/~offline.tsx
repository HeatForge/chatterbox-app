import Head from "next/head";

export default function OfflinePage() {
  return (
    <>
      <Head>
        <title>Offline — Chatterbox</title>
      </Head>
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h1>You&apos;re offline</h1>
        <p style={{ maxWidth: "24rem", color: "#475569" }}>
          Chatterbox needs a network connection for chat. Check your connection
          and try again.
        </p>
      </main>
    </>
  );
}
