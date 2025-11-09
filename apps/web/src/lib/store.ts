// [P2][APP][CODE] Store
// Tags: P2, APP, CODE
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

/**
 * A custom hook for accessing and managing the application's global state.
 * This store uses `zustand` for state management and `persist` middleware to save the state to local storage.
 *
 * @property {PlanningState} planning - The state related to planning, including average wage, labor percentage, and forecast sales.
 * @property {(updates: Partial<PlanningState>) => void} setPlanning - A function to update the planning state.
 *
 * @returns {AppState} The application state and actions.
 */
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
