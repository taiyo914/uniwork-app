import { create } from 'zustand'

type ChatStore = {
  isSidebarExpanded: boolean
  toggleSidebar: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  isSidebarExpanded: true,
  toggleSidebar: () => set((state) => ({ isSidebarExpanded: !state.isSidebarExpanded })),
}))