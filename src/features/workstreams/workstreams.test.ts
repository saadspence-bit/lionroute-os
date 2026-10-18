import { describe, expect, it } from "vitest";
import { mockTelemetry } from "../../data/mockTelemetry";
import { filterWorkstreams, findWorkstreamOperation, summarizeWorkstreams, workstreamElapsedMs } from "./model";

describe("workstream concurrency model", () => {
  it("calculates elapsed time only for active workstreams", () => {
    const active = mockTelemetry.workstreams[0]!;
    expect(workstreamElapsedMs(active, Date.parse("2027-02-03T12:38:20Z"))).toBe(1_200_000);
    expect(workstreamElapsedMs({ ...active, status: "passed" }, Date.parse("2027-02-03T12:38:20Z"))).toBeUndefined();
  });

  it("filters by status, role and projected metadata", () => {
    expect(filterWorkstreams(mockTelemetry.workstreams, "", "waiting").map((item) => item.id)).toEqual(["demo-workstream-3"]);
    expect(filterWorkstreams(mockTelemetry.workstreams, "", "producer").map((item) => item.id)).toEqual(["demo-workstream-1", "demo-workstream-2"]);
    expect(filterWorkstreams(mockTelemetry.workstreams, "Awaiting demo review", "all").map((item) => item.id)).toEqual(["demo-workstream-3"]);
  });

  it("summarizes projected concurrency while keeping collisions advisory", () => {
    expect(summarizeWorkstreams(mockTelemetry.workstreams)).toMatchObject({
      total: 3,
      active: 3,
      producers: 2,
      heavy: 1,
      advisoryCollisionCount: 0,
      advisoryCollisions: [],
    });
  });

  it("links a workstream to an already projected operation without inventing an id", () => {
    const core = mockTelemetry.workstreams.find((item) => item.id === "demo-workstream-1")!;
    expect(findWorkstreamOperation(core, mockTelemetry.operations)?.name).toBe("Example Data Import");
  });
});
