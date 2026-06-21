import type { InputHTMLAttributes } from "react";
import Icon from "./Icon";

export type TextInputVariant = "default" | "password";

const ICON_BY_VARIANT: Record<TextInputVariant, string> = {
  default: "at-line",
  password: "key-2-line",
};

const PLACEHOLDER_BY_VARIANT: Record<TextInputVariant, string> = {
  default: "Email...",
  password: "Password...",
};

export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  variant?: TextInputVariant;
  icon?: string;
}

export default function TextInput({
  variant = "default",
  icon,
  className,
  placeholder,
  ...props
}: TextInputProps) {
  const inputType = variant === "password" ? "password" : "text";

  return (
    <div
      className={["primitive-text-input", className].filter(Boolean).join(" ")}
    >
      <Icon
        name={icon ?? ICON_BY_VARIANT[variant]}
        className="primitive-text-input__icon"
        aria-hidden
      />
      <input
        type={inputType}
        className="primitive-text-input__field"
        placeholder={placeholder ?? PLACEHOLDER_BY_VARIANT[variant]}
        {...props}
      />
    </div>
  );
}
