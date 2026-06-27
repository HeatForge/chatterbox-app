import { HtmlRenderer, Parser } from "commonmark";

const parser = new Parser();
const renderer = new HtmlRenderer();

export function renderMarkdown(source: string): string {
  return renderer.render(parser.parse(source));
}
