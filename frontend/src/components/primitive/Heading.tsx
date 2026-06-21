import type { HTMLAttributes } from "react";

export type HeadingLevel = "banner" | "major" | "medium" | "small";

const TAG_BY_LEVEL: Record<HeadingLevel, "h1" | "h2" | "h3" | "h4"> = {
  banner: "h1",
  major: "h2",
  medium: "h3",
  small: "h4",
};

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
}

export default function Heading({
  level = "medium",
  className,
  children,
  ...props
}: HeadingProps) {
  const Tag = TAG_BY_LEVEL[level];

  return (
    <Tag
      className={[
        "primitive-heading",
        `primitive-heading--${level}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </Tag>
  );
}
