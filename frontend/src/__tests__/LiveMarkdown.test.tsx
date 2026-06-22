import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LiveMarkdown from "../components/markdown/LiveMarkdown";
import MarkdownShowcase from "../components/markdown/MarkdownShowcase";
import { parseCommonMark } from "../utils/markdown/parseCommonMark";

describe("LiveMarkdown", () => {
  it("renders a heading", () => {
    render(<LiveMarkdown content="# Hello" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Hello");
  });

  it("renders a list", () => {
    render(<LiveMarkdown content={"- one\n- two\n"} />);
    expect(screen.getByText("one")).toBeInTheDocument();
    expect(screen.getByText("two")).toBeInTheDocument();
  });

  it("renders a fenced code block", () => {
    const { container } = render(<LiveMarkdown content={"```\ncode\n```"} />);
    expect(container.querySelector("pre code")).toHaveTextContent("code");
  });

  it("renders a link", () => {
    render(<LiveMarkdown content="[link](https://example.com)" />);
    const link = screen.getByRole("link", { name: "link" });
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("simulates streaming by re-rendering progressively longer content", () => {
    const chunks = ["**bol", "**bold", "**bold**"];
    const { container, rerender } = render(<LiveMarkdown content={chunks[0]} />);

    expect(container.textContent?.trim()).toBe("**bol");
    expect(container.querySelector("strong")).toBeNull();

    rerender(<LiveMarkdown content={chunks[1]} />);
    expect(container.querySelector("strong")).toBeNull();

    rerender(<LiveMarkdown content={chunks[2]} />);
    expect(container.querySelector("strong")).toHaveTextContent("bold");
  });

  it("strips script tags in safe mode", () => {
    const html = parseCommonMark("<script>alert(1)</script>", { safe: true });
    expect(html).not.toContain("<script>");
  });

  it("applies an optional className", () => {
    const { container } = render(
      <LiveMarkdown content="text" className="chat-message__content" />,
    );
    expect(container.firstChild).toHaveClass("live-markdown", "chat-message__content");
  });
});

describe("MarkdownShowcase", () => {
  it("renders all section examples without crashing", () => {
    const { container } = render(<MarkdownShowcase />);
    expect(container.querySelectorAll(".markdown-showcase__section").length).toBeGreaterThan(0);
  });
});
