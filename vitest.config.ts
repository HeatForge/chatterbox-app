import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    env: {
      DATABASE_URL: "postgresql://postgres:password@localhost:5432/chatterbox",
      BETTER_AUTH_GITHUB_CLIENT_ID: "test",
      BETTER_AUTH_GITHUB_CLIENT_SECRET: "test",
      ENCRYPTION_KEY: "vitest-encryption-key",
    },
  },
});
