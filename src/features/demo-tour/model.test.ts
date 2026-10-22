import { describe, expect, it } from "vitest";
import { mockTelemetry } from "../../data/mockTelemetry";
import { buildDemoSteps, moveTourIndex, safeTourIndex, TOUR_DESTINATIONS } from "./model";

describe("synthetic guided demo model", () => {
  const steps = buildDemoSteps(mockTelemetry);
  it("has five stable, unique inspect-only destinations", () => {
    expect(steps.map((step) => step.id)).toEqual(TOUR_DESTINATIONS);
    expect(new Set(steps.map((step) => step.id)).size).toBe(5);
    expect(steps.map((step) => step.destination)).toEqual(TOUR_DESTINATIONS);
  });
  it("derives displayed counts from fictional snapshot, not hardcoded claims", () => {
    expect(steps[0]!.metricValue).toBe(String(mockTelemetry.projectRegistry.projects.length));
    expect(steps[1]!.metricValue).toBe(String(mockTelemetry.operations.length));
    expect(steps[2]!.metricValue).toBe(String(mockTelemetry.operations.reduce((n, operation) => n + operation.steps.length, 0)));
    expect(steps[3]!.metricValue).toBe(String(mockTelemetry.evidence.length));
    expect(steps[4]!.metricValue).toBe(String(mockTelemetry.systemNodes.length));
  });
  it("selects only an operation that actually exists in the fixture", () => {
    expect(steps[1]!.operationId).toBe(mockTelemetry.operations[0]?.id);
    expect(mockTelemetry.operations.some((op) => op.id === steps[1]!.operationId)).toBe(true);
  });
  it("has honest fallbacks for missing synthetic data", () => {
    const empty = buildDemoSteps({
      ...mockTelemetry,
      operations: [], evidence: [], systemNodes: [],
      projectRegistry: { ...mockTelemetry.projectRegistry, projects: [] },
    });
    expect(empty.map((step) => step.metricValue)).toEqual(["0", "0", "0", "0", "0"]);
    expect(empty[1]!.operationId).toBeUndefined();
    expect(empty.every((step) => step.sample.length > 0)).toBe(true);
  });
  it("clamps invalid navigation indexes instead of wrapping", () => {
    expect(safeTourIndex(-10, 5)).toBe(0);
    expect(safeTourIndex(999, 5)).toBe(4);
    expect(safeTourIndex(Number.NaN, 5)).toBe(0);
    expect(safeTourIndex(2, 0)).toBe(0);
  });
  it("navigates previous and next without exceeding tour bounds", () => {
    expect(moveTourIndex(1, 5, -1)).toBe(0);
    expect(moveTourIndex(0, 5, -1)).toBe(0);
    expect(moveTourIndex(3, 5, 1)).toBe(4);
    expect(moveTourIndex(4, 5, 1)).toBe(4);
  });
  it("contains no action, model-dispatch, or external destination", () => {
    for (const step of steps) {
      expect(step.actionLabel).toMatch(/Explore|Inspect|Browse/);
      expect(step.destination).toMatch(/^(projects|operations|history|evidence|system)$/);
      expect(step.summary.length).toBeGreaterThan(20);
    }
  });
});
