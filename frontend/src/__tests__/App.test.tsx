import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "../App";

vi.mock("../api/client", () => ({
  api: {
    get: vi.fn().mockRejectedValue(new Error("test")),
  },
}));

describe("App", () => {
  it("renders the app name", async () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "chatterbox-app",
    );
  });

  it("shows error when backend is unreachable", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Unreachable/)).toBeDefined();
    });
  });
});
