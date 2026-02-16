import { create } from "zustand";

interface AppState {
    // ─── UI State ───
    selectedSceneId: string | null;
    rightPanelOpen: boolean;
    compiledScriptOpen: boolean;

    // ─── Actions ───
    selectScene: (id: string | null) => void;
    toggleRightPanel: () => void;
    setRightPanelOpen: (open: boolean) => void;
    setCompiledScriptOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
    selectedSceneId: null,
    rightPanelOpen: true,
    compiledScriptOpen: false,

    selectScene: (id) => set({ selectedSceneId: id }),
    toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
    setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
    setCompiledScriptOpen: (open) => set({ compiledScriptOpen: open }),
}));
