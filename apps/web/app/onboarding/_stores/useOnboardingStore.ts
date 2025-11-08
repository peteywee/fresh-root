// [P1][APP][ONBOARDING] Onboarding store
// Tags: P1, APP, ONBOARDING, ZUSTAND
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface OnboardingState {
  // Admin responsibility form state
  formToken: string | null;
  role: string;
  
  // Network/Org creation state
  orgName: string;
  venueName: string;
  
  // Network creation response
  networkId: string | null;
  orgId: string | null;
  venueId: string | null;
  status: string | null;
  
  // UI state
  currentStep: number;
  isSubmitting: boolean;
  error: string | null;
}

export interface OnboardingActions {
  setFormToken: (token: string | null) => void;
  setRole: (role: string) => void;
  setOrgName: (name: string) => void;
  setVenueName: (name: string) => void;
  setNetworkData: (data: {
    networkId: string;
    orgId: string;
    venueId: string;
    status: string;
  }) => void;
  setCurrentStep: (step: number) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: OnboardingState = {
  formToken: null,
  role: "network_owner",
  orgName: "",
  venueName: "",
  networkId: null,
  orgId: null,
  venueId: null,
  status: null,
  currentStep: 0,
  isSubmitting: false,
  error: null,
};

export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  persist(
    (set) => ({
      ...initialState,
      
      setFormToken: (token) => set({ formToken: token }),
      setRole: (role) => set({ role }),
      setOrgName: (name) => set({ orgName: name }),
      setVenueName: (name) => set({ venueName: name }),
      setNetworkData: (data) =>
        set({
          networkId: data.networkId,
          orgId: data.orgId,
          venueId: data.venueId,
          status: data.status,
        }),
      setCurrentStep: (step) => set({ currentStep: step }),
      setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
      setError: (error) => set({ error }),
      reset: () => set(initialState),
    }),
    {
      name: "onboarding-storage",
    },
  ),
);
