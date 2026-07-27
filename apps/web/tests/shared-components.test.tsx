import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  ProgressBar,
  ScoreIndicator,
  StatusBadge,
} from "@/src/components/ui";

describe("shared status and progress components", () => {
  it("renders a semantic status with readable text", () => {
    render(<StatusBadge status="Needs Attention" />);
    expect(screen.getByText("Needs Attention")).toBeVisible();
  });

  it("exposes score and progress values to assistive technology", () => {
    render(
      <>
        <ScoreIndicator score={92} label="Knowledge quality" />
        <ProgressBar value={84} label="Scenario pass rate" />
      </>,
    );
    expect(
      screen.getByLabelText("Knowledge quality: 92 out of 100"),
    ).toBeVisible();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "84",
    );
  });
});

