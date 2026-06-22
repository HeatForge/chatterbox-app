import specTests from "../fixtures/commonmark-0.31.2.spec.json";
import { describe, expect, it } from "vitest";
import { normalizeHtml } from "../utils/markdown/normalizeHtml";
import { parseCommonMark } from "../utils/markdown/parseCommonMark";

interface SpecTest {
  markdown: string;
  html: string;
  example: number;
  section: string;
}

const tests = specTests as SpecTest[];

describe("CommonMark 0.31.2 spec conformance", () => {
  it("passes all official spec.json test cases", () => {
    const failures: string[] = [];

    for (const test of tests) {
      const actual = parseCommonMark(test.markdown);
      const normalizedActual = `${normalizeHtml(actual)}\n`;
      const normalizedExpected = `${normalizeHtml(test.html)}\n`;

      if (normalizedActual !== normalizedExpected) {
        failures.push(
          `example ${test.example} (${test.section}): expected ${JSON.stringify(normalizedExpected)}, got ${JSON.stringify(normalizedActual)}`,
        );
      }
    }

    if (failures.length > 0) {
      throw new Error(
        `${failures.length} of ${tests.length} spec tests failed:\n${failures.slice(0, 10).join("\n")}${failures.length > 10 ? `\n...and ${failures.length - 10} more` : ""}`,
      );
    }

    expect(tests.length).toBe(652);
  });
});
