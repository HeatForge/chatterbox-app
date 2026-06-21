import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../App";

describe("App", () => {
  it("renders the sign-in page", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Chatterbox",
    );
    expect(screen.getByPlaceholderText("Email...")).toBeDefined();
    expect(screen.getByPlaceholderText("Password...")).toBeDefined();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeDefined();
  });
});
