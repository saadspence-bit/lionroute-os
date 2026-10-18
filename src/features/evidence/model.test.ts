import { describe, expect, it } from "vitest";
import { mockTelemetry } from "../../data/mockTelemetry";
import { evidenceRecordedMs, filterEvidence, sortEvidenceNewestFirst, summarizeEvidence } from "./model";

describe("evidence center model", () => {
  it("filters by kind, status and projected proof metadata", () => {
    expect(filterEvidence(mockTelemetry.evidence, "", "review", "all").every((item) => item.kind === "review")).toBe(true);
    expect(filterEvidence(mockTelemetry.evidence, "", "all", "verified").every((item) => item.status === "verified")).toBe(true);
    expect(filterEvidence(mockTelemetry.evidence, "Sample inventory", "all", "all").map((item) => item.id)).toEqual(["demo-evidence-004"]);
  });

  it("sorts parseable evidence timestamps newest first", () => {
    const sorted = sortEvidenceNewestFirst(mockTelemetry.evidence);
    const parsed = sorted.map(evidenceRecordedMs).filter((value): value is number => value !== undefined);
    expect(parsed).toEqual([...parsed].sort((left, right) => right - left));
  });

  it("summarizes only projected evidence records", () => {
    const summary = summarizeEvidence(mockTelemetry.evidence);
    expect(summary.total).toBe(mockTelemetry.evidence.length);
    expect(summary.verified).toBe(mockTelemetry.evidence.filter((item) => item.status === "verified").length);
    expect(summary.pending).toBe(mockTelemetry.evidence.filter((item) => item.status === "pending").length);
    expect(summary.sourceCount).toBeGreaterThan(0);
  });
});
