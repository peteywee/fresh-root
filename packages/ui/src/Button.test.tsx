// @vitest-environment happy-dom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Button } from "./Button";
import React from "react";

describe("Button", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeDefined();
  });

  it("should apply variant classes", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByText("Secondary");
    expect(button.className).toContain("bg-gray-100");
  });

  it("should be disabled when disabled prop is passed", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText("Disabled") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});
