export type SidebarProject = {
  id: string;
  title: string;
  threads: { id: string; title: string }[];
};

export type SidebarStandaloneThread = {
  id: string;
  title: string;
};

export type SidebarSelection =
  | { type: "thread"; threadId: string; projectId: string | null }
  | { type: "project"; projectId: string };

export type SidebarData = {
  projects: SidebarProject[];
  standalone: SidebarStandaloneThread[];
  archived: {
    projects: SidebarProject[];
    standalone: SidebarStandaloneThread[];
  };
};

export const EMPTY_SIDEBAR: SidebarData = {
  projects: [],
  standalone: [],
  archived: { projects: [], standalone: [] },
};
