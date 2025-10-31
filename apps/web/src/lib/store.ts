import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlanningState {
  avgWage: number;
  laborPct: number;
  forecastSales: number;
}

interface AppState {
  planning: PlanningState;
  setPlanning: (updates: Partial<PlanningState>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      planning: {
        avgWage: 15,
        laborPct: 25,
        forecastSales: 20000,
      },
      setPlanning: (updates) =>
        set((state) => ({
          planning: { ...state.planning, ...updates },
        })),
    }),
    { name: "app-storage" },
  ),
);
