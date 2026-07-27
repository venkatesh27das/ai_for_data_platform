import { create } from "zustand";

interface UiState {
  sidebarCollapsed: boolean;
  environment: string;
  notificationCount: number;
  toggleSidebar: () => void;
  setEnvironment: (environment: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  environment: "Enterprise (Prod)",
  notificationCount: 5,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setEnvironment: (environment) => set({ environment }),
}));
