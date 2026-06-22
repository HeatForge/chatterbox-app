import specTests from "../../fixtures/commonmark-0.31.2.spec.json";

export interface MarkdownExample {
  section: string;
  example: number;
  markdown: string;
}

const SKIP_SECTIONS = new Set(["Tabs", "Blank lines", "Insecure characters"]);

function pickShowcaseExamples(): MarkdownExample[] {
  const bySection = new Map<string, MarkdownExample[]>();

  for (const test of specTests) {
    const entry: MarkdownExample = {
      section: test.section,
      example: test.example,
      markdown: test.markdown,
    };
    const list = bySection.get(test.section) ?? [];
    list.push(entry);
    bySection.set(test.section, list);
  }

  const picked: MarkdownExample[] = [];

  for (const [section, sectionTests] of bySection) {
    if (SKIP_SECTIONS.has(section)) {
      continue;
    }

    const candidate =
      sectionTests
        .filter((t) => t.markdown.length <= 280 && !t.markdown.includes("\t"))
        .sort((a, b) => b.markdown.length - a.markdown.length)[0] ?? sectionTests[0];

    picked.push(candidate);
  }

  return picked.sort((a, b) => a.section.localeCompare(b.section));
}

export const markdownExamples = pickShowcaseExamples();
