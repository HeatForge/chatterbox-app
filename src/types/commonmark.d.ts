declare module "commonmark" {
  export class Parser {
    parse(source: string): unknown;
  }

  export class HtmlRenderer {
    render(node: unknown): string;
  }
}
