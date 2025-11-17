// [P2][APP][CODE] Store
// Tags: P2, APP, CODE
import { create } from "zustand";
import { persist } from "zustand/middleware";
export const useAppStore = create()(persist((set) => ({
    planning: {
        avgWage: 15,
        laborPct: 25,
        forecastSales: 20000,
    },
    setPlanning: (updates) => set((state) => ({
        planning: { ...state.planning, ...updates },
    })),
}), { name: "app-storage" }));
