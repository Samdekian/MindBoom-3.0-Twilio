
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import PreparationProgress from "../PreparationProgress";

describe("PreparationProgress", () => {
  it("renders with correct progress value", () => {
    render(<PreparationProgress prepProgress={50} />);
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute("aria-valuenow", "50");
  });

  it("renders with zero progress", () => {
    render(<PreparationProgress prepProgress={0} />);
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute("aria-valuenow", "0");
  });

  it("renders with full progress", () => {
    render(<PreparationProgress prepProgress={100} />);
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute("aria-valuenow", "100");
  });
});
