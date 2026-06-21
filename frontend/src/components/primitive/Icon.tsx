import { Icon as IconifyIcon, type IconProps as IconifyIconProps } from "@iconify/react";

export interface IconProps extends Omit<IconifyIconProps, "icon"> {
  /** MingCute icon name (e.g. `mail-line`) or full Iconify id (e.g. `mingcute:mail-line`). */
  name: string;
}

export default function Icon({ name, className, ...props }: IconProps) {
  const icon = name.includes(":") ? name : `mingcute:${name}`;

  return (
    <IconifyIcon
      icon={icon}
      className={["primitive-icon", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
