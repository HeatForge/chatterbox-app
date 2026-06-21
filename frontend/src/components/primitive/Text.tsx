import type { HTMLAttributes } from "react";

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  as?: "p" | "span";
}

export default function Text({
  as: Tag = "p",
  className,
  children,
  ...props
}: TextProps) {
  return (
    <Tag
      className={["primitive-text", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </Tag>
  );
}
