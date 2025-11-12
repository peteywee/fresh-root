// [P1][OBSERVABILITY][LOGGING] Login Page Spec tests
// Tags: P1, OBSERVABILITY, LOGGING, TEST
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import LoginPage from "../../app/(auth)/login/page";

describe("LoginPage", () => {
  it("renders controls", () => {
    render(<LoginPage />);
    expect(screen.getByText(/Sign in/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continue with Google/i })).toBeInTheDocument();
  });
});
