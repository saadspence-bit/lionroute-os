import { describe, expect, it } from "vitest";
import { mockTelemetry } from "../../data/mockTelemetry";
import { buildTerminalRecords, filterTerminalRecords } from "./model";

describe("terminal observer projection", () => {
  it("builds a deterministic structured event stream without command text synthesis", () => {
    const records = buildTerminalRecords(mockTelemetry);
    expect(records.length).toBe(mockTelemetry.operations.reduce((sum, operation) => sum + operation.steps.length, 0));
    expect(records[0]?.timestamp).toBe("2027-02-03T12:18:20Z");
    expect(records.some((record) => record.message.includes("Illustrative step generated"))).toBe(true);
  });

  it("filters by exact operation and searchable projected fields", () => {
    const records = buildTerminalRecords(mockTelemetry);
    expect(filterTerminalRecords(records, "Review sample output", "demo-operation-001").map((record) => record.id))
      .toEqual(["demo-operation-001:s4"]);
    expect(filterTerminalRecords(records, "Inspect preview", "demo-operation-002")).toHaveLength(1);
  });
});
