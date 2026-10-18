import { describe, expect, it } from "vitest";
import { mockTelemetry } from "../../data/mockTelemetry";
import { filterAuthorityRules, summarizeAuthority } from "./model";

describe("authority center model", () => {
  it("filters authority rules by exact projected state", () => {
    expect(filterAuthorityRules(mockTelemetry.authority, "", "forbidden").every((rule) => rule.state === "forbidden")).toBe(true);
    expect(filterAuthorityRules(mockTelemetry.authority, "", "required").map((rule) => rule.id)).toEqual(["demo-rule-006"]);
  });

  it("searches labels, scopes, sources and details without changing rules", () => {
    expect(filterAuthorityRules(mockTelemetry.authority, "credentials", "all").map((rule) => rule.id)).toEqual(["demo-rule-003"]);
    expect(filterAuthorityRules(mockTelemetry.authority, "human review", "all").map((rule) => rule.id)).toEqual(["demo-rule-006"]);
  });

  it("summarizes only the projected authority rule set", () => {
    expect(summarizeAuthority(mockTelemetry.authority)).toEqual({
      total: 6,
      allowed: 2,
      forbidden: 3,
      required: 1,
      sourceCount: 5,
    });
  });
});
