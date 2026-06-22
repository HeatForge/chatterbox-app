import LiveMarkdown from "./LiveMarkdown";
import { markdownExamples } from "./markdownExamples";
import "./markdown-showcase.css";

export default function MarkdownShowcase() {
  return (
    <div className="markdown-showcase">
      {markdownExamples.map((example) => (
        <section key={example.section} className="markdown-showcase__section">
          <h2 className="markdown-showcase__title">{example.section}</h2>
          <p className="markdown-showcase__meta">Example {example.example}</p>
          <div className="markdown-showcase__grid">
            <div className="markdown-showcase__panel">
              <h3 className="markdown-showcase__panel-title">Source</h3>
              <pre className="markdown-showcase__source">{example.markdown}</pre>
            </div>
            <div className="markdown-showcase__panel">
              <h3 className="markdown-showcase__panel-title">Rendered</h3>
              <div className="markdown-showcase__rendered">
                <LiveMarkdown content={example.markdown} />
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
