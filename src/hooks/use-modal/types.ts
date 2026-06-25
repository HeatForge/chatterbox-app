import type { ReactNode } from "react";

export type ModalOptions = {
  dim?: number;
  contents: (dismiss: () => void) => ReactNode;
  dismissOnOutsidePress?: boolean;
};

export type ModalItem = {
  id: string;
  dim?: number;
  contents: ReactNode;
  dismiss: () => void;
  dismissOnOutsidePress?: boolean;
};
