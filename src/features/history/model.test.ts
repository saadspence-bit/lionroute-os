import { describe, expect, it } from "vitest";
import { mockTelemetry } from "../../data/mockTelemetry";
import { buildHistoryEvents, filterHistoryEvents, replaySummary } from "./model";

describe("history replay projection", () => {
  it("builds one ordered projection stream from state, operations, trace steps, and evidence", () => {
    const events = buildHistoryEvents(mockTelemetry);
    const expected = 1 + mockTelemetry.operations.length + mockTelemetry.operations.reduce((sum, operation) => sum + operation.steps.length, 0) + mockTelemetry.evidence.length;
    expect(events).toHaveLength(expected);
    expect(events.map((event) => Date.parse(event.timestamp))).toEqual([...events.map((event) => Date.parse(event.timestamp))].sort((a, b) => a - b));
  });

  it("filters forensic records without mutating the full replay sequence", () => {
    const events = buildHistoryEvents(mockTelemetry);
    const reviews = filterHistoryEvents(events, "Assemble demo proof", "all");
    expect(reviews.some((event) => event.kind === "trace")).toBe(true);
    expect(events.length).toBeGreaterThan(reviews.length);
  });

  it("summarizes only records observed through the selected replay cursor", () => {
    const events = buildHistoryEvents(mockTelemetry);
    const selected = events.find((event) => event.kind === "operation")!;
    const summary = replaySummary(events, selected.id);
    expect(summary.position).toBeLessThanOrEqual(summary.total);
    expect(summary.operationsObserved).toBeGreaterThanOrEqual(1);
  });

  it("does not invent a replay position when no visible record is selected", () => {
    const events = buildHistoryEvents(mockTelemetry);
    expect(replaySummary(events, "missing-record")).toMatchObject({ position: 0, total: events.length, operationsObserved: 0, traceEventsObserved: 0, evidenceObserved: 0 });
  });
});
