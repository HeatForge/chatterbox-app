import type { ButtonHTMLAttributes, ReactNode } from "react";
import Icon from "./Icon";

export type ButtonVariant = "primary" | "secondary";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  narrow?: boolean;
  icon?: string;
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  narrow = false,
  icon,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const defaultIcon =
    variant === "primary" ? "login-2-line" : "arrow-right-up-line";

  return (
    <button
      type={type}
      className={[
        "primitive-button",
        `primitive-button--${variant}`,
        narrow ? "primitive-button--narrow" : undefined,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <Icon
        name={icon ?? defaultIcon}
        className="primitive-button__icon"
        aria-hidden
      />
      <span className="primitive-button__label">{children}</span>
    </button>
  );
}
