"use client";

import type { LucideIcon } from "lucide-react";
import { MoreHorizontal } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export type SidebarThreadAction = {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "default" | "destructive";
};

export type SidebarThreadItemProps = {
  title: string;
  icon?: LucideIcon;
  selected?: boolean;
  onSelect: () => void;
  actions?: SidebarThreadAction[];
  className?: string;
  subItem?: boolean;
};

function ThreadActionsMenu({ actions }: { actions: SidebarThreadAction[] }) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuAction
            showOnHover
            onClick={(event) => event.stopPropagation()}
          />
        }
      >
        <MoreHorizontal />
        <span className="sr-only">Thread actions</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.id}
            variant={action.variant}
            onClick={(event) => {
              event.stopPropagation();
              action.onClick();
            }}
          >
            <action.icon />
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Sidebar thread row using shadcn SidebarMenuButton with optional
 * hover-revealed DropdownMenu actions.
 */
export function SidebarThreadItem({
  title,
  icon: Icon,
  selected = false,
  onSelect,
  actions = [],
  className,
  subItem = false,
}: SidebarThreadItemProps) {
  if (subItem) {
    return (
      <SidebarMenuSubItem className={className}>
        <SidebarMenuSubButton
          isActive={selected}
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
          }}
        >
          {Icon ? <Icon /> : null}
          <span>{title}</span>
        </SidebarMenuSubButton>
        <ThreadActionsMenu actions={actions} />
      </SidebarMenuSubItem>
    );
  }

  return (
    <SidebarMenuItem className={className}>
      <SidebarMenuButton
        isActive={selected}
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
      >
        {Icon ? <Icon /> : null}
        <span>{title}</span>
      </SidebarMenuButton>
      <ThreadActionsMenu actions={actions} />
    </SidebarMenuItem>
  );
}
