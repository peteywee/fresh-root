// [P1][TEST][STORE] Onboarding Store tests
// Tags: P1, TEST, STORE, ZUSTAND
import { describe, it, expect, beforeEach } from "vitest";
import { useOnboardingStore } from "../useOnboardingStore";

describe("useOnboardingStore", () => {
  beforeEach(() => {
    // Reset the store before each test
    useOnboardingStore.getState().reset();
  });

  it("has correct initial state", () => {
    const state = useOnboardingStore.getState();
    expect(state.formToken).toBeNull();
    expect(state.role).toBe("network_owner");
    expect(state.orgName).toBe("");
    expect(state.venueName).toBe("");
    expect(state.networkId).toBeNull();
    expect(state.orgId).toBeNull();
    expect(state.venueId).toBeNull();
    expect(state.status).toBeNull();
    expect(state.currentStep).toBe(0);
    expect(state.isSubmitting).toBe(false);
    expect(state.error).toBeNull();
  });

  it("sets form token", () => {
    const store = useOnboardingStore.getState();
    store.setFormToken("test-token");
    expect(useOnboardingStore.getState().formToken).toBe("test-token");
  });

  it("sets role", () => {
    const store = useOnboardingStore.getState();
    store.setRole("org_admin");
    expect(useOnboardingStore.getState().role).toBe("org_admin");
  });

  it("sets org name", () => {
    const store = useOnboardingStore.getState();
    store.setOrgName("Test Organization");
    expect(useOnboardingStore.getState().orgName).toBe("Test Organization");
  });

  it("sets venue name", () => {
    const store = useOnboardingStore.getState();
    store.setVenueName("Test Venue");
    expect(useOnboardingStore.getState().venueName).toBe("Test Venue");
  });

  it("sets network data", () => {
    const store = useOnboardingStore.getState();
    const networkData = {
      networkId: "net123",
      orgId: "org456",
      venueId: "venue789",
      status: "pending_verification",
    };
    store.setNetworkData(networkData);
    
    const state = useOnboardingStore.getState();
    expect(state.networkId).toBe("net123");
    expect(state.orgId).toBe("org456");
    expect(state.venueId).toBe("venue789");
    expect(state.status).toBe("pending_verification");
  });

  it("sets current step", () => {
    const store = useOnboardingStore.getState();
    store.setCurrentStep(2);
    expect(useOnboardingStore.getState().currentStep).toBe(2);
  });

  it("sets isSubmitting", () => {
    const store = useOnboardingStore.getState();
    store.setIsSubmitting(true);
    expect(useOnboardingStore.getState().isSubmitting).toBe(true);
    
    store.setIsSubmitting(false);
    expect(useOnboardingStore.getState().isSubmitting).toBe(false);
  });

  it("sets error", () => {
    const store = useOnboardingStore.getState();
    store.setError("Test error");
    expect(useOnboardingStore.getState().error).toBe("Test error");
    
    store.setError(null);
    expect(useOnboardingStore.getState().error).toBeNull();
  });

  it("resets to initial state", () => {
    const store = useOnboardingStore.getState();
    
    // Set some values
    store.setFormToken("token");
    store.setRole("org_admin");
    store.setOrgName("Org");
    store.setVenueName("Venue");
    store.setCurrentStep(3);
    store.setIsSubmitting(true);
    store.setError("Error");
    
    // Reset
    store.reset();
    
    const state = useOnboardingStore.getState();
    expect(state.formToken).toBeNull();
    expect(state.role).toBe("network_owner");
    expect(state.orgName).toBe("");
    expect(state.venueName).toBe("");
    expect(state.currentStep).toBe(0);
    expect(state.isSubmitting).toBe(false);
    expect(state.error).toBeNull();
  });
});
