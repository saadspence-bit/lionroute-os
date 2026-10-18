import { describe, expect, it } from "vitest";
import { mockTelemetry } from "../../data/mockTelemetry";
import { buildCommandCenterPosture } from "./model";

describe("buildCommandCenterPosture", () => {
  it("keeps unavailable ICM state explicit instead of inventing zero-risk state", () => {
    const unavailable = structuredClone(mockTelemetry);
    unavailable.icmController.liveState = {
      state: "not-projected",
      reasonCode: "NO_CURRENT_STORE_POINTER",
      detail: "No canonical current controller store is selected.",
    };
    unavailable.icmController.collisionState = {
      state: "not-projected",
      reasonCode: "NO_CURRENT_STORE_POINTER",
      detail: "No canonical current controller store is selected.",
    };
    const items = buildCommandCenterPosture(unavailable, false);
    const icm = items.find((item) => item.id === "icm");
    expect(icm).toMatchObject({
      value: "Not projected",
      tone: "neutral",
      detail: "NO_CURRENT_STORE_POINTER",
    });
  });

  it("marks degraded telemetry as a last snapshot rather than healthy live state", () => {
    const items = buildCommandCenterPosture(mockTelemetry, true);
    expect(items.find((item) => item.id === "state")).toMatchObject({
      value: "Last snapshot",
      tone: "warn",
    });
  });

  it("surfaces projected overlap as critical", () => {
    const projected = structuredClone(mockTelemetry);
    projected.icmController.liveState = {
      state: "projected",
      integrity: "sqlite-structural-verified",
      activeLeaseCount: 2,
      quarantinedLeaseCount: 1,
      protectedLeaseCount: 3,
    };
    projected.icmController.collisionState = {
      state: "overlap-detected",
      overlapDetected: true,
    };

    const icm = buildCommandCenterPosture(projected, false).find((item) => item.id === "icm");
    expect(icm).toMatchObject({
      value: "overlap-detected",
      detail: "3 protected · 1 quarantined",
      tone: "critical",
    });
  });
});
