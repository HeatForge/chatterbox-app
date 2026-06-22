import { HtmlRenderer, Parser } from "commonmark";

const parser = new Parser();
const renderer = new HtmlRenderer();
const safeRenderer = new HtmlRenderer({ safe: true });

export function parseCommonMark(markdown: string, options?: { safe?: boolean }): string {
  const doc = parser.parse(markdown);
  return options?.safe ? safeRenderer.render(doc) : renderer.render(doc);
}
