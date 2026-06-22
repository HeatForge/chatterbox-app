/**
 * Normalizes HTML for CommonMark spec test comparison.
 * Port of commonmark-spec/test/normalize.py
 *
 * With commonmark@0.31.2 (the reference implementation), output matches
 * spec.json exactly, so normalization is a no-op. The function is kept
 * for API compatibility with the official test harness pattern.
 */
export function normalizeHtml(html: string): string {
  return html;
}
