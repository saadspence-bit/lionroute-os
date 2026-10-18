import { describe, expect, it, vi } from "vitest";
import { mockTelemetry } from "./mockTelemetry";
import {
  CONTROL_PLANE_SNAPSHOT_SCHEMA,
  buildGatewaySnapshotUrl,
  parseGatewaySnapshot,
  resolveRuntimeTelemetrySource,
} from "./source";

describe("telemetry source routing", () => {
  it("never invokes fetch or EventSource for mock snapshots", async () => {
    const oldFetch = globalThis.fetch;
    const oldEventSource = globalThis.EventSource;
    const fetchSpy = vi.fn(() => { throw new Error("forbidden network call"); });
    const eventSourceSpy = vi.fn(() => { throw new Error("forbidden EventSource"); });
    Object.defineProperty(globalThis, "fetch", { configurable: true, value: fetchSpy });
    Object.defineProperty(globalThis, "EventSource", { configurable: true, value: eventSourceSpy });
    try {
      const source = resolveRuntimeTelemetrySource({
        VITE_LIONROUTE_TELEMETRY_SOURCE: "gateway",
        VITE_LIONROUTE_GATEWAY_URL: "https://example.invalid",
      });
      expect(source.mode).toBe("mock");
      expect((await source.getSnapshot()).currentState.project).toBe("LionRoute Demo Workspace");
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(eventSourceSpy).not.toHaveBeenCalled();
    } finally {
      Object.defineProperty(globalThis, "fetch", { configurable: true, value: oldFetch });
      Object.defineProperty(globalThis, "EventSource", { configurable: true, value: oldEventSource });
    }
  });

  it("returns an independent clone of mock telemetry", async () => {
    const source = resolveRuntimeTelemetrySource({});
    const first = await source.getSnapshot();
    first.currentState.project = "Changed locally";
    const second = await source.getSnapshot();
    expect(second.currentState.project).toBe("LionRoute Demo Workspace");
    expect(second).not.toBe(first);
  });

  it("always uses synthetic data under invalid external runtime config", async () => {
    const source = resolveRuntimeTelemetrySource({ VITE_LIONROUTE_TELEMETRY_SOURCE: "remote" });
    expect(source.mode).toBe("mock");
    expect(await source.getSnapshot()).toEqual(mockTelemetry);
  });

  it("defaults to mock telemetry", () => {
    expect(resolveRuntimeTelemetrySource({}).mode).toBe("mock");
  });
  it("ignores gateway environment variables in the public demo", () => {
    expect(resolveRuntimeTelemetrySource({ VITE_LIONROUTE_TELEMETRY_SOURCE: "gateway", VITE_LIONROUTE_GATEWAY_URL: "http://127.0.0.1:4400" }).mode).toBe("mock");
  });

  it("builds same-origin and configured gateway snapshot URLs", () => {
    expect(buildGatewaySnapshotUrl("")).toBe("/api/control-plane/snapshot");
    expect(buildGatewaySnapshotUrl("http://127.0.0.1:4400/")).toBe("http://127.0.0.1:4400/api/control-plane/snapshot");
  });

  it("accepts only observer-mode versioned gateway snapshots", () => {
    expect(parseGatewaySnapshot({
      schemaVersion: CONTROL_PLANE_SNAPSHOT_SCHEMA,
      generatedAt: "2026-10-15T14:00:00Z",
      mode: "observer",
      snapshot: mockTelemetry,
    })).toEqual(mockTelemetry);

    expect(() => parseGatewaySnapshot({
      schemaVersion: "future-schema",
      generatedAt: "2026-10-15T14:00:00Z",
      mode: "observer",
      snapshot: mockTelemetry,
    })).toThrow(/Unsupported gateway snapshot schema/);

    expect(() => parseGatewaySnapshot({
      schemaVersion: CONTROL_PLANE_SNAPSHOT_SCHEMA,
      generatedAt: "2026-10-15T14:00:00Z",
      mode: "observer",
      snapshot: { ...mockTelemetry, currentState: { ...mockTelemetry.currentState, freshness: "TRUST_ME" } },
    })).toThrow(/payload is incomplete/);

    expect(() => parseGatewaySnapshot({
      schemaVersion: CONTROL_PLANE_SNAPSHOT_SCHEMA,
      generatedAt: "2026-10-15T14:00:00Z",
      mode: "observer",
      snapshot: {
        ...mockTelemetry,
        operations: [{
          ...mockTelemetry.operations[0],
          steps: [{ ...mockTelemetry.operations[0]!.steps[0], model: { invalid: true } }],
        }],
      },
    })).toThrow(/payload is incomplete/);

    expect(() => parseGatewaySnapshot({
      schemaVersion: CONTROL_PLANE_SNAPSHOT_SCHEMA,
      generatedAt: "2026-10-15T14:00:00Z",
      mode: "observer",
      snapshot: { ...mockTelemetry, federation: undefined },
    })).toThrow(/payload is incomplete/);
  });

  it("keeps registry eligibility separate from LCL dispatch authority", () => {
    expect(mockTelemetry.federation.cliAdapters.some((adapter) => adapter.adapterRegistryEnabled)).toBe(true);
    expect(mockTelemetry.federation.workerQualifications.every((worker) => worker.realDispatchState === "REAL_MODEL_DISPATCH_NOT_AUTHORIZED")).toBe(true);
    expect(mockTelemetry.federation.realModelDispatchActivated).toBe(false);
    expect(mockTelemetry.federation.pluginRegistry.state).toBe("not-projected");
    expect(mockTelemetry.federation.sources).toContain("worker-qualification.v1.json");
  });

  it("projects routing provenance contract without inventing current decision history", () => {
    expect(mockTelemetry.routingProvenance.requiredFieldCount).toBe(22);
    expect(mockTelemetry.routingProvenance.determinismTupleFieldCount).toBe(9);
    expect(mockTelemetry.routingProvenance.currentDecisionStore).toMatchObject({ state: "not-projected", count: 0 });
    expect(mockTelemetry.routingProvenance.historicalProof.state).toBe("not-projected");
  });

  it("accepts only bounded canonical project-registry metadata", () => {
    expect(mockTelemetry.projectRegistry).toMatchObject({
      registrySchemaVersion: 2,
      source: "LIONROUTE_PORTFOLIO_SYNC_INDEX.json",
    });
    expect(mockTelemetry.projectRegistry.projects.some((project) => project.projectId === "lionroute-os" && project.registryStatus === "active")).toBe(true);

    const snapshot = structuredClone(mockTelemetry) as unknown as Record<string, unknown>;
    const projectRegistry = snapshot.projectRegistry as Record<string, unknown>;
    const projects = projectRegistry.projects as Array<Record<string, unknown>>;
    projects[0]!.connectionStatus = "trust_me_connected";
    expect(() => parseGatewaySnapshot({
      schemaVersion: CONTROL_PLANE_SNAPSHOT_SCHEMA,
      generatedAt: "2026-10-15T14:00:00Z",
      mode: "observer",
      snapshot,
    })).toThrow(/payload is incomplete/);
  });

  it("projects ICM enforcement policy with sanitized canonical live-store collision state", () => {
    expect(mockTelemetry.icmController).toMatchObject({
      policySchema: "lionroute.icm-ops-controller-policy.v1",
      controllerSchema: "lionroute.icm-ops-controller.v1",
      writeAuthorityMode: "CONTROLLER_BROKER_ONLY",
      realModelDispatch: false,
      providerCallsAllowed: 0,
      reviewerLiveReadAllowed: false,
      liveState: {
        state: "projected",
        integrity: "sqlite-structural-verified",
        activeLeaseCount: 2,
        quarantinedLeaseCount: 1,
        protectedLeaseCount: 3,
      },
      collisionState: { state: "quarantine-present", overlapDetected: false },
    });

    const snapshot = structuredClone(mockTelemetry) as unknown as Record<string, unknown>;
    const icmController = snapshot.icmController as Record<string, unknown>;
    icmController.providerCallsAllowed = 1;
    expect(() => parseGatewaySnapshot({
      schemaVersion: CONTROL_PLANE_SNAPSHOT_SCHEMA,
      generatedAt: "2026-10-15T14:00:00Z",
      mode: "observer",
      snapshot,
    })).toThrow(/payload is incomplete/);
  });

  it("accepts explicit ICM not-projected state without false zero or overlap claims", () => {
    const snapshot = structuredClone(mockTelemetry);
    snapshot.icmController.liveState = {
      state: "not-projected",
      reasonCode: "NO_CURRENT_STORE_POINTER",
      detail: "Core has not designated a current ICM controller store.",
    };
    snapshot.icmController.collisionState = {
      state: "not-projected",
      reasonCode: "NO_CURRENT_STORE_POINTER",
      detail: "Core has not designated a current ICM controller store.",
    };
    expect(parseGatewaySnapshot({
      schemaVersion: CONTROL_PLANE_SNAPSHOT_SCHEMA,
      generatedAt: "2026-10-15T14:00:00Z",
      mode: "observer",
      snapshot,
    }).icmController.liveState).toEqual(snapshot.icmController.liveState);
  });

  it("rejects extra nested ICM live-state keys and malformed unknown-state claims", () => {
    const extra = structuredClone(mockTelemetry) as unknown as Record<string, unknown>;
    const extraIcm = extra.icmController as Record<string, unknown>;
    const extraLive = extraIcm.liveState as Record<string, unknown>;
    extraLive.storeId = "must-not-pass";
    expect(() => parseGatewaySnapshot({
      schemaVersion: CONTROL_PLANE_SNAPSHOT_SCHEMA,
      generatedAt: "2026-10-15T14:00:00Z",
      mode: "observer",
      snapshot: extra,
    })).toThrow(/payload is incomplete/);

    const unknown = structuredClone(mockTelemetry) as unknown as Record<string, unknown>;
    const unknownIcm = unknown.icmController as Record<string, unknown>;
    unknownIcm.liveState = {
      state: "not-projected",
      reasonCode: "NO_CURRENT_STORE_POINTER",
      detail: "unavailable",
      activeLeaseCount: 0,
    };
    unknownIcm.collisionState = {
      state: "not-projected",
      reasonCode: "NO_CURRENT_STORE_POINTER",
      detail: "unavailable",
      overlapDetected: false,
    };
    expect(() => parseGatewaySnapshot({
      schemaVersion: CONTROL_PLANE_SNAPSHOT_SCHEMA,
      generatedAt: "2026-10-15T14:00:00Z",
      mode: "observer",
      snapshot: unknown,
    })).toThrow(/payload is incomplete/);
  });

  it("rejects inconsistent ICM counts collision semantics and not-projected reason pairing", () => {
    const badCounts = structuredClone(mockTelemetry) as unknown as Record<string, unknown>;
    const badCountsIcm = badCounts.icmController as Record<string, unknown>;
    (badCountsIcm.liveState as Record<string, unknown>).protectedLeaseCount = 4;
    expect(() => parseGatewaySnapshot({
      schemaVersion: CONTROL_PLANE_SNAPSHOT_SCHEMA,
      generatedAt: "2026-10-15T14:00:00Z",
      mode: "observer",
      snapshot: badCounts,
    })).toThrow(/payload is incomplete/);

    const badCollision = structuredClone(mockTelemetry) as unknown as Record<string, unknown>;
    const badCollisionIcm = badCollision.icmController as Record<string, unknown>;
    (badCollisionIcm.collisionState as Record<string, unknown>).state = "clear";
    expect(() => parseGatewaySnapshot({
      schemaVersion: CONTROL_PLANE_SNAPSHOT_SCHEMA,
      generatedAt: "2026-10-15T14:00:00Z",
      mode: "observer",
      snapshot: badCollision,
    })).toThrow(/payload is incomplete/);

    const mismatchedReason = structuredClone(mockTelemetry) as unknown as Record<string, unknown>;
    const reasonIcm = mismatchedReason.icmController as Record<string, unknown>;
    reasonIcm.liveState = { state: "not-projected", reasonCode: "STORE_MISSING", detail: "missing" };
    reasonIcm.collisionState = { state: "not-projected", reasonCode: "STORE_BUSY", detail: "busy" };
    expect(() => parseGatewaySnapshot({
      schemaVersion: CONTROL_PLANE_SNAPSHOT_SCHEMA,
      generatedAt: "2026-10-15T14:00:00Z",
      mode: "observer",
      snapshot: mismatchedReason,
    })).toThrow(/payload is incomplete/);
  });

  it("rejects extra ICM policy projection keys instead of tolerating contract drift", () => {
    const snapshot = structuredClone(mockTelemetry) as unknown as Record<string, unknown>;
    const icmController = snapshot.icmController as Record<string, unknown>;
    icmController.unexpectedAuthorityHint = "do-not-accept";
    expect(() => parseGatewaySnapshot({
      schemaVersion: CONTROL_PLANE_SNAPSHOT_SCHEMA,
      generatedAt: "2026-10-15T14:00:00Z",
      mode: "observer",
      snapshot,
    })).toThrow(/payload is incomplete/);
  });

  it("rejects worker qualification records that claim dispatch authorization", () => {
    const snapshot = structuredClone(mockTelemetry) as unknown as Record<string, unknown>;
    const federation = snapshot.federation as Record<string, unknown>;
    const qualifications = federation.workerQualifications as Array<Record<string, unknown>>;
    qualifications[0]!.realDispatchState = "REAL_MODEL_DISPATCH_AUTHORIZED";
    expect(() => parseGatewaySnapshot({
      schemaVersion: CONTROL_PLANE_SNAPSHOT_SCHEMA,
      generatedAt: "2026-10-15T14:00:00Z",
      mode: "observer",
      snapshot,
    })).toThrow(/payload is incomplete/);
  });

});
