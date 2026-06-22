import { useMemo } from "react";
import { parseCommonMark } from "../../utils/markdown/parseCommonMark";
import "./live-markdown.css";

interface LiveMarkdownProps {
  content: string;
  className?: string;
}

export default function LiveMarkdown({ content, className }: LiveMarkdownProps) {
  const html = useMemo(() => parseCommonMark(content, { safe: true }), [content]);

  return (
    <div
      className={className ? `live-markdown ${className}` : "live-markdown"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
