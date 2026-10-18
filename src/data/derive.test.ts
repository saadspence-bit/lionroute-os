import { describe, expect, it } from "vitest";
import { detectWriteCollisions, summarizeControlPlane } from "./derive";
import { mockTelemetry } from "./mockTelemetry";

describe("control-plane derivations", () => {
  it("keeps the isolated UI and core migration producer scopes collision-free", () => {
    expect(detectWriteCollisions(mockTelemetry.workstreams)).toEqual([]);
  });

  it("normalizes Windows and POSIX separators before advisory collision checks", () => {
    const first = { ...mockTelemetry.workstreams[0]!, writeScope: ["apps\\control-plane\\**"] };
    const second = { ...mockTelemetry.workstreams[1]!, writeScope: ["apps/control-plane/src/**"] };
    expect(detectWriteCollisions([first, second])).toEqual([`${first.name} ↔ ${second.name}`]);
  });

  it("summarizes active work without promoting UI state to authority", () => {
    const summary = summarizeControlPlane(mockTelemetry.operations, mockTelemetry.workstreams);
    expect(summary.runningOperations).toBe(2);
    expect(summary.activeWorkstreams).toBe(2);
    expect(summary.heavyWorkloads).toBe(1);
    expect(summary.writeCollisions).toEqual([]);
  });
});
