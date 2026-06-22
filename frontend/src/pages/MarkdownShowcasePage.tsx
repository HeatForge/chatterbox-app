import MarkdownShowcase from "../components/markdown/MarkdownShowcase";
import "../components/markdown/markdown-showcase.css";
import Heading from "../components/primitive/Heading";

export default function MarkdownShowcasePage() {
  return (
    <main className="markdown-showcase-page">
      <header className="markdown-showcase-page__header">
        <Heading level="banner">CommonMark 0.31.2 Showcase</Heading>
        <p className="markdown-showcase-page__subtitle">
          One example per spec section, rendered with the live markdown component.
        </p>
      </header>
      <MarkdownShowcase />
    </main>
  );
}
