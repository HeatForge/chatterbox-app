import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../api/client";
import { AuthProvider } from "../auth/AuthContext";
import AppRoutes from "../AppRoutes";

vi.mock("../api/auth", () => ({
  authApi: {
    me: vi
      .fn()
      .mockRejectedValue(
        new ApiError(401, "unauthorized", "Authentication is required."),
      ),
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
  },
}));

describe("App", () => {
  it("renders the sign-in page", async () => {
    render(
      <MemoryRouter initialEntries={["/signin"]}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent(
      "Chatterbox",
    );
    expect(screen.getByPlaceholderText("Email...")).toBeDefined();
    expect(screen.getByPlaceholderText("Password...")).toBeDefined();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeDefined();
  });
});
