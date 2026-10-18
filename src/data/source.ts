import { useQuery } from "@tanstack/react-query";
import { mockTelemetry } from "./mockTelemetry";
import type {
  AuthorityRule,
  CapabilityRegistryEntry,
  CapabilityRegistryProjection,
  CurrentState,
  EvidenceItem,
  FederationCliAdapter,
  FederationModelEntry,
  FederationProjection,
  FederationTaskClassMapping,
  IcmCollisionState,
  IcmControllerProjection,
  IcmLiveState,
  IcmObserverReasonCode,
  Operation,
  OperationStatus,
  ProjectConnectionStatus,
  ProjectRegistryEntry,
  ProjectRegistryProjection,
  ProjectRegistryStatus,
  RoutingProvenanceProjection,
  SystemEdge,
  SystemNode,
  TelemetrySnapshot,
  TraceStep,
  Workstream,
  WorkerQualificationEntry,
} from "../types";

export const CONTROL_PLANE_SNAPSHOT_SCHEMA = "lionroute.control-plane.snapshot.v7";

export type TelemetrySourceMode = "mock" | "gateway" | "invalid";

export interface TelemetrySource {
  readonly id: string;
  readonly label: string;
  readonly mode: TelemetrySourceMode;
  readonly endpoint?: string;
  readonly staleTimeMs?: number;
  readonly refreshIntervalMs?: number;
  getSnapshot(): Promise<TelemetrySnapshot>;
}

export interface RuntimeSourceEnv {
  VITE_LIONROUTE_TELEMETRY_SOURCE?: string;
  VITE_LIONROUTE_GATEWAY_URL?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasExactKeys(value: unknown, keys: readonly string[]): value is Record<string, unknown> {
  return isRecord(value)
    && Object.keys(value).length === keys.length
    && keys.every((key) => Object.prototype.hasOwnProperty.call(value, key));
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || isString(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isInteger(value: unknown): value is number {
  return isFiniteNumber(value) && Number.isInteger(value);
}

function isOptionalFiniteNumber(value: unknown): value is number | undefined {
  return value === undefined || isFiniteNumber(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isOperationStatus(value: unknown): value is OperationStatus {
  return ["running", "passed", "failed", "waiting", "skipped", "idle"].includes(String(value));
}

function isCurrentState(value: unknown): value is CurrentState {
  return isRecord(value)
    && isString(value.resourceId)
    && isString(value.project)
    && isString(value.activeStage)
    && ["CURRENT", "STALE", "UNKNOWN"].includes(String(value.currentStateStatus))
    && ["FRESH", "STALE", "UNKNOWN"].includes(String(value.freshness))
    && isString(value.nextSafeAction)
    && isString(value.lastAction)
    && isString(value.missionState)
    && isString(value.authoritySource)
    && isString(value.updatedAt);
}

function isTraceStep(value: unknown): value is TraceStep {
  return isRecord(value)
    && isString(value.traceId)
    && isString(value.operationId)
    && isString(value.spanId)
    && (value.parentSpanId === undefined || isString(value.parentSpanId))
    && isString(value.eventName)
    && isString(value.eventType)
    && isString(value.step)
    && isString(value.actor)
    && isOptionalString(value.model)
    && isOptionalString(value.tool)
    && isOperationStatus(value.status)
    && ["info", "success", "warning", "error", "review"].includes(String(value.severity))
    && isString(value.startedAt)
    && isOptionalString(value.endedAt)
    && isOptionalFiniteNumber(value.durationMs)
    && isOptionalFiniteNumber(value.progressCurrent)
    && isOptionalFiniteNumber(value.progressTotal)
    && isString(value.message)
    && isOptionalString(value.result)
    && isStringArray(value.evidenceRefs);
}

function isOperation(value: unknown): value is Operation {
  return isRecord(value)
    && isString(value.id)
    && isString(value.traceId)
    && isString(value.name)
    && isString(value.project)
    && isString(value.workstream)
    && isString(value.stage)
    && isString(value.actor)
    && isString(value.model)
    && isOperationStatus(value.status)
    && isStringArray(value.authorityScope)
    && isStringArray(value.forbiddenScope)
    && isString(value.startedAt)
    && isFiniteNumber(value.progressCurrent)
    && isFiniteNumber(value.progressTotal)
    && isString(value.nextAction)
    && isString(value.summary)
    && Array.isArray(value.steps)
    && value.steps.every(isTraceStep);
}

function isWorkstream(value: unknown): value is Workstream {
  return isRecord(value)
    && isString(value.id)
    && isString(value.name)
    && isString(value.chatId)
    && isString(value.project)
    && ["producer", "reviewer", "observer"].includes(String(value.role))
    && isStringArray(value.readScope)
    && isStringArray(value.writeScope)
    && isString(value.activeOperation)
    && isString(value.currentStep)
    && isString(value.model)
    && typeof value.heavyWorkload === "boolean"
    && ["granted", "observer", "waiting", "restricted"].includes(String(value.authorityState))
    && isString(value.startedAt)
    && isOperationStatus(value.status);
}

function isEvidenceItem(value: unknown): value is EvidenceItem {
  return isRecord(value)
    && isString(value.id)
    && ["test", "review", "receipt", "hash", "artifact"].includes(String(value.kind))
    && isString(value.title)
    && isString(value.result)
    && ["verified", "recorded", "pending"].includes(String(value.status))
    && isString(value.source)
    && isString(value.recordedAt)
    && isString(value.detail);
}

function isAuthorityRule(value: unknown): value is AuthorityRule {
  return isRecord(value)
    && isString(value.id)
    && isString(value.label)
    && ["allowed", "forbidden", "required"].includes(String(value.state))
    && isString(value.scope)
    && isString(value.source)
    && isString(value.detail);
}

function isCapabilityRegistryEntry(value: unknown): value is CapabilityRegistryEntry {
  return isRecord(value)
    && isString(value.stageId)
    && isString(value.name)
    && isString(value.status)
    && isString(value.authority)
    && isStringArray(value.capabilities)
    && isStringArray(value.projects)
    && isString(value.activationRule)
    && isStringArray(value.restrictions);
}

function isCapabilityRegistryProjection(value: unknown): value is CapabilityRegistryProjection {
  return isRecord(value)
    && isString(value.schemaVersion)
    && isString(value.registryVersion)
    && isString(value.baselineId)
    && isString(value.lastSyncedAt)
    && isString(value.globalRule)
    && isString(value.source)
    && Array.isArray(value.entries)
    && value.entries.every(isCapabilityRegistryEntry);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || isString(value);
}

function isProjectRegistryStatus(value: unknown): value is ProjectRegistryStatus {
  return ["active", "review", "unassigned", "template"].includes(String(value));
}

function isProjectConnectionStatus(value: unknown): value is ProjectConnectionStatus {
  return ["root_path_not_yet_confirmed", "template_only", "documented_not_runtime_connected", "shadow_connected", "qualified_inactive", "active_bounded", "suspended"].includes(String(value));
}

function isProjectRegistryEntry(value: unknown): value is ProjectRegistryEntry {
  return isRecord(value)
    && isString(value.projectId)
    && isString(value.projectName)
    && isNullableString(value.projectType)
    && isNullableString(value.legacyProjectId)
    && isProjectRegistryStatus(value.registryStatus)
    && isProjectConnectionStatus(value.connectionStatus)
    && isNullableString(value.bootstrapState)
    && isNullableString(value.bootstrapStandardVersion)
    && isBoolean(value.projectRootKnown)
    && isBoolean(value.integrationContractKnown)
    && isBoolean(value.projectProfileKnown);
}

function isProjectRegistryProjection(value: unknown): value is ProjectRegistryProjection {
  return isRecord(value)
    && value.registrySchemaVersion === 2
    && isString(value.baselineId)
    && value.source === "LIONROUTE_PORTFOLIO_SYNC_INDEX.json"
    && Array.isArray(value.projects)
    && value.projects.every(isProjectRegistryEntry);
}

function isFederationCliAdapter(value: unknown): value is FederationCliAdapter {
  return isRecord(value)
    && isString(value.cliId)
    && isString(value.displayName)
    && isString(value.vendorFamily)
    && isString(value.lifecycleState)
    && isString(value.adapterMode)
    && isBoolean(value.adapterRegistryEnabled)
    && isStringArray(value.roles)
    && isStringArray(value.capabilities)
    && isString(value.readOnlyControl)
    && isString(value.sandboxControl);
}

function isFederationModelEntry(value: unknown): value is FederationModelEntry {
  return isRecord(value)
    && isString(value.modelId)
    && isString(value.modelFamily)
    && isString(value.hostKind)
    && isString(value.providerId)
    && isString(value.candidateOrigin)
    && isString(value.verificationState)
    && isStringArray(value.cliIds)
    && isStringArray(value.effortLevels)
    && isStringArray(value.capabilityTags);
}

function isFederationTaskClassMapping(value: unknown): value is FederationTaskClassMapping {
  return isRecord(value)
    && isString(value.taskDomain)
    && isString(value.taskStoreClass)
    && isString(value.modelRoutingPolicyClass);
}

function isWorkerQualificationEntry(value: unknown): value is WorkerQualificationEntry {
  return isRecord(value)
    && isString(value.workerId)
    && isString(value.cliId)
    && isString(value.adapterId)
    && isString(value.modelId)
    && isString(value.qualificationState)
    && value.realDispatchState === "REAL_MODEL_DISPATCH_NOT_AUTHORIZED"
    && isStringArray(value.roles)
    && isStringArray(value.capabilityTags)
    && isStringArray(value.effortLevels)
    && isInteger(value.strengthTier)
    && isBoolean(value.localExecution)
    && isBoolean(value.networkRequiredForInference)
    && isBoolean(value.writeSupport)
    && isBoolean(value.sandboxSupport)
    && isBoolean(value.readOnlySupport)
    && isBoolean(value.availability)
    && isInteger(value.reliabilityTier)
    && isString(value.observedAt);
}

function isFederationProjection(value: unknown): value is FederationProjection {
  return isRecord(value)
    && isBoolean(value.realModelDispatchActivated)
    && isString(value.dispatchAuthoritySource)
    && isString(value.policyMode)
    && isString(value.policyVersion)
    && isStringArray(value.taskDomains)
    && Array.isArray(value.taskClassMappings) && value.taskClassMappings.every(isFederationTaskClassMapping)
    && isString(value.cliRegistryVersion)
    && isString(value.modelCatalogVersion)
    && isString(value.workerQualificationVersion)
    && Array.isArray(value.cliAdapters) && value.cliAdapters.every(isFederationCliAdapter)
    && Array.isArray(value.models) && value.models.every(isFederationModelEntry)
    && Array.isArray(value.workerQualifications) && value.workerQualifications.every(isWorkerQualificationEntry)
    && isRecord(value.pluginRegistry)
    && value.pluginRegistry.state === "not-projected"
    && isString(value.pluginRegistry.detail)
    && isStringArray(value.sources);
}

function isRoutingProvenanceProjection(value: unknown): value is RoutingProvenanceProjection {
  return isRecord(value)
    && value.contractSchemaVersion === "1.0.0"
    && isString(value.contractSource)
    && value.requiredFieldCount === 22
    && isStringArray(value.requiredFields)
    && value.requiredFields.length === value.requiredFieldCount
    && value.determinismTupleFieldCount === 9
    && isStringArray(value.determinismTupleFields)
    && value.determinismTupleFields.length === value.determinismTupleFieldCount
    && isString(value.producer)
    && isString(value.consumer)
    && isRecord(value.currentDecisionStore)
    && value.currentDecisionStore.state === "not-projected"
    && value.currentDecisionStore.count === 0
    && isString(value.currentDecisionStore.detail)
    && isRecord(value.historicalProof)
    && value.historicalProof.state === "not-projected"
    && isString(value.historicalProof.detail);
}

const ICM_OBSERVER_REASON_CODES = [
  "NO_CURRENT_STORE_POINTER", "CURRENT_STORE_RETIRED", "POINTER_INVALID", "POINTER_HISTORY_LIMIT_EXCEEDED",
  "STORE_MISSING", "STORE_BUSY", "STORE_STRUCTURAL_INTEGRITY_FAILED", "STORE_SCHEMA_MISMATCH",
  "STORE_TARGET_INVALID", "STORE_POLICY_MISMATCH", "STORE_IDENTITY_MISMATCH", "LEASE_LIMIT_EXCEEDED",
  "OBSERVER_READ_FAILED", "OBSERVER_ADAPTER_UNAVAILABLE", "OBSERVER_ADAPTER_FAILED",
] as const;

function isIcmObserverReasonCode(value: unknown): value is IcmObserverReasonCode {
  return ICM_OBSERVER_REASON_CODES.includes(value as typeof ICM_OBSERVER_REASON_CODES[number]);
}

function isIcmNotProjectedState(value: unknown): value is Extract<IcmLiveState, { state: "not-projected" }> {
  return hasExactKeys(value, ["state", "reasonCode", "detail"])
    && value.state === "not-projected"
    && isIcmObserverReasonCode(value.reasonCode)
    && isString(value.detail);
}

function isIcmProjectedLiveState(value: unknown): value is Extract<IcmLiveState, { state: "projected" }> {
  return hasExactKeys(value, ["state", "integrity", "activeLeaseCount", "quarantinedLeaseCount", "protectedLeaseCount"])
    && value.state === "projected"
    && value.integrity === "sqlite-structural-verified"
    && isInteger(value.activeLeaseCount) && value.activeLeaseCount >= 0
    && isInteger(value.quarantinedLeaseCount) && value.quarantinedLeaseCount >= 0
    && isInteger(value.protectedLeaseCount) && value.protectedLeaseCount >= 0
    && value.activeLeaseCount + value.quarantinedLeaseCount === value.protectedLeaseCount;
}

function isIcmProjectedCollisionState(value: unknown): value is Extract<IcmCollisionState, { state: "clear" | "protected" | "quarantine-present" | "overlap-detected" }> {
  if (!hasExactKeys(value, ["state", "overlapDetected"]) || !isBoolean(value.overlapDetected)) return false;
  if (!["clear", "protected", "quarantine-present", "overlap-detected"].includes(String(value.state))) return false;
  return value.overlapDetected === (value.state === "overlap-detected");
}

function isIcmControllerProjection(value: unknown): value is IcmControllerProjection {
  if (!hasExactKeys(value, [
    "policySchema", "controllerSchema", "controllerVersion", "source", "writeAuthorityMode",
    "realModelDispatch", "fableBulkWorkAllowed", "providerCallsAllowed", "reviewerLiveReadAllowed",
    "claimBoundary", "liveState", "collisionState",
  ])) return false;
  if (value.policySchema !== "lionroute.icm-ops-controller-policy.v1"
    || value.controllerSchema !== "lionroute.icm-ops-controller.v1"
    || !isString(value.controllerVersion)
    || value.source !== "icm-ops-controller-policy.v1.json"
    || value.writeAuthorityMode !== "CONTROLLER_BROKER_ONLY"
    || value.realModelDispatch !== false
    || value.fableBulkWorkAllowed !== false
    || value.providerCallsAllowed !== 0
    || value.reviewerLiveReadAllowed !== false
    || !hasExactKeys(value.claimBoundary, ["cooperativeLocalWorkers", "hostileSameUserWorkers", "untrustedRealModelWorkers"])
    || value.claimBoundary.cooperativeLocalWorkers !== true
    || value.claimBoundary.hostileSameUserWorkers !== false
    || value.claimBoundary.untrustedRealModelWorkers !== false) return false;

  if (isIcmNotProjectedState(value.liveState)) {
    return isIcmNotProjectedState(value.collisionState)
      && value.liveState.reasonCode === value.collisionState.reasonCode;
  }
  if (!isIcmProjectedLiveState(value.liveState) || !isIcmProjectedCollisionState(value.collisionState)) return false;
  const expectedCollision = value.collisionState.overlapDetected
    ? "overlap-detected"
    : value.liveState.quarantinedLeaseCount > 0
      ? "quarantine-present"
      : value.liveState.activeLeaseCount > 0
        ? "protected"
        : "clear";
  return value.collisionState.state === expectedCollision;
}

function isSystemNode(value: unknown): value is SystemNode {
  return isRecord(value)
    && isString(value.id)
    && isString(value.label)
    && ["authority", "state", "runtime", "worker", "evidence", "ui"].includes(String(value.category))
    && isOperationStatus(value.status)
    && isString(value.subtitle);
}

function isSystemEdge(value: unknown): value is SystemEdge {
  return isRecord(value)
    && isString(value.id)
    && isString(value.source)
    && isString(value.target)
    && (value.label === undefined || isString(value.label));
}

function isTelemetrySnapshot(value: unknown): value is TelemetrySnapshot {
  return isRecord(value)
    && isCurrentState(value.currentState)
    && Array.isArray(value.operations) && value.operations.every(isOperation)
    && Array.isArray(value.workstreams) && value.workstreams.every(isWorkstream)
    && Array.isArray(value.evidence) && value.evidence.every(isEvidenceItem)
    && Array.isArray(value.authority) && value.authority.every(isAuthorityRule)
    && isCapabilityRegistryProjection(value.capabilityRegistry)
    && isProjectRegistryProjection(value.projectRegistry)
    && isIcmControllerProjection(value.icmController)
    && isFederationProjection(value.federation)
    && isRoutingProvenanceProjection(value.routingProvenance)
    && Array.isArray(value.systemNodes) && value.systemNodes.every(isSystemNode)
    && Array.isArray(value.systemEdges) && value.systemEdges.every(isSystemEdge);
}

export function parseGatewaySnapshot(value: unknown): TelemetrySnapshot {
  if (!isRecord(value)) throw new Error("Gateway snapshot response is not an object.");
  if (value.schemaVersion !== CONTROL_PLANE_SNAPSHOT_SCHEMA) {
    throw new Error(`Unsupported gateway snapshot schema: ${String(value.schemaVersion ?? "missing")}.`);
  }
  if (!isString(value.generatedAt)) throw new Error("Gateway snapshot generatedAt is missing.");
  if (value.mode !== "observer") throw new Error("Gateway snapshot is not marked observer-only.");
  if (!isTelemetrySnapshot(value.snapshot)) throw new Error("Gateway snapshot payload is incomplete.");
  return value.snapshot;
}

export function buildGatewaySnapshotUrl(baseUrl: string) {
  const trimmed = baseUrl.trim().replace(/\/+$/, "");
  return `${trimmed}/api/control-plane/snapshot`;
}

export const mockTelemetrySource: TelemetrySource = {
  id: "mock",
  label: "Mock telemetry",
  mode: "mock",
  staleTimeMs: 5_000,
  refreshIntervalMs: 15_000,
  async getSnapshot() {
    return structuredClone(mockTelemetry);
  },
};

/** This portfolio build always uses synthetic fixtures. Environment variables cannot enable a private gateway. */
export function resolveRuntimeTelemetrySource(_env: RuntimeSourceEnv = import.meta.env) {
  return mockTelemetrySource;
}

export const runtimeTelemetrySource = resolveRuntimeTelemetrySource();

/** Public portfolio: runtime reads bundled fictional data only. */
export function useTelemetry() {
  const source = runtimeTelemetrySource;
  const query = useQuery({
    queryKey: ["telemetry", source.id],
    queryFn: () => source.getSnapshot(),
    staleTime: source.staleTimeMs ?? 5_000,
    refetchInterval: source.refreshIntervalMs ?? 15_000,
    refetchOnWindowFocus: true,
  });
  return { ...query, source };
}
