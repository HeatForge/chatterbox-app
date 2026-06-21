import { useState, type ButtonHTMLAttributes } from "react";
import Icon from "./Icon";

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** MingCute line icon name (e.g. `pencil-line`). Switches to fill on hover. */
  icon: string;
  /** Tooltip label shown on hover / focus. */
  label: string;
}

function toFillIcon(name: string): string {
  if (name.endsWith("-fill")) return name;
  if (name.endsWith("-line")) return name.replace(/-line$/, "-fill");
  return `${name}-fill`;
}

export default function IconButton({
  icon,
  label,
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  const [hovered, setHovered] = useState(false);
  const iconName = hovered ? toFillIcon(icon) : icon;

  return (
    <button
      type={type}
      className={["primitive-icon-button", className].filter(Boolean).join(" ")}
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      {...props}
    >
      <Icon name={iconName} aria-hidden style={{ width: "55%", height: "55%" }} />
      <span className="primitive-icon-button__tooltip" role="tooltip">
        {label}
      </span>
    </button>
  );
}
