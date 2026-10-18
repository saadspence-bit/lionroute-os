import { describe, expect, it } from "vitest";
import { mockTelemetry } from "../../data/mockTelemetry";
import { filterOperations, formatDuration, operationDurationMs, selectVisibleOperation, traceChildren } from "./model";

describe("operations projections", () => {
  it("filters operations by status and searchable metadata", () => {
    expect(filterOperations(mockTelemetry.operations, "Data Import", "running").map((operation) => operation.id))
      .toEqual(["demo-operation-001"]);
    expect(filterOperations(mockTelemetry.operations, "Dashboard Accessibility", "all").map((operation) => operation.id))
      .toEqual(["demo-operation-002"]);
  });

  it("builds nested trace parent relationships", () => {
    const operation = mockTelemetry.operations[0]!;
    const children = traceChildren(operation.steps);
    expect(children.get("s4")?.map((step) => step.spanId)).toEqual(["s4.1"]);
    expect(children.get("__root__")?.length).toBe(5);
  });

  it("reconciles selection to the first visible operation when filters hide the prior run", () => {
    const visible = filterOperations(mockTelemetry.operations, "Data Import", "running");
    expect(selectVisibleOperation(visible, "demo-operation-002")?.id).toBe("demo-operation-001");
    expect(selectVisibleOperation([], "demo-operation-002")).toBeUndefined();
  });

  it("formats operation duration without mutating source timestamps", () => {
    const operation = mockTelemetry.operations[0]!;
    const duration = operationDurationMs(operation, Date.parse("2027-02-03T12:38:20Z"));
    expect(duration).toBe(1_200_000);
    expect(formatDuration(duration)).toBe("20m");
  });

  it("does not invent a growing duration for terminal runs without an end time", () => {
    const operation = { ...mockTelemetry.operations[0]!, status: "passed" as const, steps: [] };
    expect(operationDurationMs(operation, Date.parse("2027-02-03T13:00:00Z"))).toBeUndefined();
    expect(formatDuration(operationDurationMs(operation))).toBe("Unknown");
  });
});
