import { describe, expect, it } from "vitest";
import { mockTelemetry } from "../../data/mockTelemetry";
import { buildModelProjections, buildWorkerProjections } from "./model";

describe("agents and models projections", () => {
  it("links workstream projections to matching operations when available", () => {
    const workers = buildWorkerProjections(mockTelemetry);
    expect(workers.find((worker) => worker.name === "Data Pipeline")?.operationId).toBe("demo-operation-001");
    expect(workers.find((worker) => worker.name === "Quality Review")?.role).toBe("reviewer");
  });

  it("does not link a workstream to an unrelated operation when the active operation is absent", () => {
    const snapshot = structuredClone(mockTelemetry);
    snapshot.workstreams[0]!.activeOperation = "Not projected";
    expect(buildWorkerProjections(snapshot).find((worker) => worker.name === "Data Pipeline")?.operationId).toBeUndefined();
  });

  it("requires project identity when linking workstreams to operations", () => {
    const snapshot = structuredClone(mockTelemetry);
    const core = snapshot.workstreams.find((workstream) => workstream.name === "Data Pipeline")!;
    snapshot.operations.unshift({
      ...snapshot.operations[0]!,
      id: "other-project-collision",
      project: "Other Project",
      workstream: core.name,
      name: core.activeOperation,
    });
    expect(buildWorkerProjections(snapshot).find((worker) => worker.name === "Data Pipeline")?.operationId).toBe("demo-operation-001");
  });

  it("aggregates model usage without inventing capability metadata", () => {
    const models = buildModelProjections(mockTelemetry);
    const current = models.find((model) => model.model === "Example Assistant");
    expect(current?.workstreamAssignments).toBe(3);
    expect(current?.operationAssignments).toBe(2);
    expect(current?.heavyAssignments).toBe(1);
  });
});
