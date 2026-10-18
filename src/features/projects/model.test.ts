import { describe, expect, it } from "vitest";
import { mockTelemetry } from "../../data/mockTelemetry";
import { buildProjectProjections } from "./model";

describe("project projections", () => {
  it("does not invent per-project evidence ownership", () => {
    const snapshot = structuredClone(mockTelemetry);
    snapshot.operations.push({ ...snapshot.operations[0]!, id: "other-op", project: "Other Project", name: "Other run" });
    const projects = buildProjectProjections(snapshot);
    expect(Object.hasOwn(projects.find((project) => project.name === snapshot.currentState.project)!, "evidenceCount")).toBe(false);
    expect(Object.hasOwn(projects.find((project) => project.name === "Other Project")!, "evidenceCount")).toBe(false);
  });

  it("derives activity counts without treating them as canonical project state", () => {
    const project = buildProjectProjections(mockTelemetry)[0]!;
    expect(project.currentStateBound).toBe(true);
    expect(project.operationCount).toBe(2);
    expect(project.activeOperationCount).toBe(2);
    expect(project.workstreamCount).toBe(3);
    expect(project.heavyWorkloads).toBe(1);
  });

  it("includes canonical registry projects even when they have no observed activity", () => {
    const projects = buildProjectProjections(mockTelemetry);
    const marketAi = projects.find((project) => project.projectId === "demo-analytics");
    expect(marketAi).toMatchObject({
      name: "Cedar Analytics",
      registered: true,
      registryStatus: "active",
      connectionStatus: "documented_not_runtime_connected",
      operationCount: 0,
      workstreamCount: 0,
    });
  });

  it("keeps unmatched observed activity visibly separate from canonical registry identity", () => {
    const snapshot = structuredClone(mockTelemetry);
    snapshot.operations.push({ ...snapshot.operations[0]!, id: "unregistered-op", project: "Unregistered Activity", name: "Observed run" });
    const project = buildProjectProjections(snapshot).find((item) => item.name === "Unregistered Activity")!;
    expect(project.registered).toBe(false);
    expect(project.projectId).toBeUndefined();
    expect(project.operationCount).toBe(1);
  });
});
