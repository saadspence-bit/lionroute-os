export type OperationStatus = "running" | "passed" | "failed" | "waiting" | "skipped" | "idle";

export type Severity = "info" | "success" | "warning" | "error" | "review";

export interface CurrentState {
  resourceId: string;
  project: string;
  activeStage: string;
  currentStateStatus: "CURRENT" | "STALE" | "UNKNOWN";
  freshness: "FRESH" | "STALE" | "UNKNOWN";
  nextSafeAction: string;
  lastAction: string;
  missionState: string;
  authoritySource: string;
  updatedAt: string;
}

export interface TraceStep {
  traceId: string;
  operationId: string;
  spanId: string;
  parentSpanId?: string;
  eventName: string;
  eventType: string;
  step: string;
  actor: string;
  model?: string;
  tool?: string;
  status: OperationStatus;
  severity: Severity;
  startedAt: string;
  endedAt?: string;
  durationMs?: number;
  progressCurrent?: number;
  progressTotal?: number;
  message: string;
  result?: string;
  evidenceRefs: string[];
}

export interface Operation {
  id: string;
  traceId: string;
  name: string;
  project: string;
  workstream: string;
  stage: string;
  actor: string;
  model: string;
  status: OperationStatus;
  authorityScope: string[];
  forbiddenScope: string[];
  startedAt: string;
  progressCurrent: number;
  progressTotal: number;
  nextAction: string;
  summary: string;
  steps: TraceStep[];
}

export interface Workstream {
  id: string;
  name: string;
  chatId: string;
  project: string;
  role: "producer" | "reviewer" | "observer";
  readScope: string[];
  writeScope: string[];
  activeOperation: string;
  currentStep: string;
  model: string;
  heavyWorkload: boolean;
  authorityState: "granted" | "observer" | "waiting" | "restricted";
  startedAt: string;
  status: OperationStatus;
}

export interface EvidenceItem {
  id: string;
  kind: "test" | "review" | "receipt" | "hash" | "artifact";
  title: string;
  result: string;
  status: "verified" | "recorded" | "pending";
  source: string;
  recordedAt: string;
  detail: string;
}

export interface AuthorityRule {
  id: string;
  label: string;
  state: "allowed" | "forbidden" | "required";
  scope: string;
  source: string;
  detail: string;
}

export interface CapabilityRegistryEntry {
  stageId: string;
  name: string;
  status: string;
  authority: string;
  capabilities: string[];
  projects: string[];
  activationRule: string;
  restrictions: string[];
}

export interface CapabilityRegistryProjection {
  schemaVersion: string;
  registryVersion: string;
  baselineId: string;
  lastSyncedAt: string;
  globalRule: string;
  source: string;
  entries: CapabilityRegistryEntry[];
}

export type ProjectRegistryStatus = "active" | "review" | "unassigned" | "template";
export type ProjectConnectionStatus = "root_path_not_yet_confirmed" | "template_only" | "documented_not_runtime_connected" | "shadow_connected" | "qualified_inactive" | "active_bounded" | "suspended";

export interface ProjectRegistryEntry {
  projectId: string;
  projectName: string;
  projectType: string | null;
  legacyProjectId: string | null;
  registryStatus: ProjectRegistryStatus;
  connectionStatus: ProjectConnectionStatus;
  bootstrapState: string | null;
  bootstrapStandardVersion: string | null;
  projectRootKnown: boolean;
  integrationContractKnown: boolean;
  projectProfileKnown: boolean;
}

export interface ProjectRegistryProjection {
  registrySchemaVersion: 2;
  baselineId: string;
  source: "LIONROUTE_PORTFOLIO_SYNC_INDEX.json";
  projects: ProjectRegistryEntry[];
}

export interface FederationCliAdapter {
  cliId: string;
  displayName: string;
  vendorFamily: string;
  lifecycleState: string;
  adapterMode: string;
  adapterRegistryEnabled: boolean;
  roles: string[];
  capabilities: string[];
  readOnlyControl: string;
  sandboxControl: string;
}

export interface FederationModelEntry {
  modelId: string;
  modelFamily: string;
  hostKind: string;
  providerId: string;
  candidateOrigin: string;
  verificationState: string;
  cliIds: string[];
  effortLevels: string[];
  capabilityTags: string[];
}

export interface FederationTaskClassMapping {
  taskDomain: string;
  taskStoreClass: string;
  modelRoutingPolicyClass: string;
}

export interface WorkerQualificationEntry {
  workerId: string;
  cliId: string;
  adapterId: string;
  modelId: string;
  qualificationState: string;
  realDispatchState: "REAL_MODEL_DISPATCH_NOT_AUTHORIZED";
  roles: string[];
  capabilityTags: string[];
  effortLevels: string[];
  strengthTier: number;
  localExecution: boolean;
  networkRequiredForInference: boolean;
  writeSupport: boolean;
  sandboxSupport: boolean;
  readOnlySupport: boolean;
  availability: boolean;
  reliabilityTier: number;
  observedAt: string;
}

export interface FederationProjection {
  realModelDispatchActivated: boolean;
  dispatchAuthoritySource: string;
  policyMode: string;
  policyVersion: string;
  taskDomains: string[];
  taskClassMappings: FederationTaskClassMapping[];
  cliRegistryVersion: string;
  modelCatalogVersion: string;
  workerQualificationVersion: string;
  cliAdapters: FederationCliAdapter[];
  models: FederationModelEntry[];
  workerQualifications: WorkerQualificationEntry[];
  pluginRegistry: {
    state: "not-projected";
    detail: string;
  };
  sources: string[];
}

export interface RoutingProvenanceProjection {
  contractSchemaVersion: string;
  contractSource: string;
  requiredFieldCount: number;
  requiredFields: string[];
  determinismTupleFieldCount: number;
  determinismTupleFields: string[];
  producer: string;
  consumer: string;
  currentDecisionStore: {
    state: "not-projected";
    count: 0;
    detail: string;
  };
  historicalProof: {
    state: "not-projected";
    detail: string;
  };
}

export type IcmObserverReasonCode =
  | "NO_CURRENT_STORE_POINTER"
  | "CURRENT_STORE_RETIRED"
  | "POINTER_INVALID"
  | "POINTER_HISTORY_LIMIT_EXCEEDED"
  | "STORE_MISSING"
  | "STORE_BUSY"
  | "STORE_STRUCTURAL_INTEGRITY_FAILED"
  | "STORE_SCHEMA_MISMATCH"
  | "STORE_TARGET_INVALID"
  | "STORE_POLICY_MISMATCH"
  | "STORE_IDENTITY_MISMATCH"
  | "LEASE_LIMIT_EXCEEDED"
  | "OBSERVER_READ_FAILED"
  | "OBSERVER_ADAPTER_UNAVAILABLE"
  | "OBSERVER_ADAPTER_FAILED";

export type IcmLiveState =
  | {
    state: "projected";
    integrity: "sqlite-structural-verified";
    activeLeaseCount: number;
    quarantinedLeaseCount: number;
    protectedLeaseCount: number;
  }
  | {
    state: "not-projected";
    reasonCode: IcmObserverReasonCode;
    detail: string;
  };

export type IcmCollisionState =
  | {
    state: "clear" | "protected" | "quarantine-present" | "overlap-detected";
    overlapDetected: boolean;
  }
  | {
    state: "not-projected";
    reasonCode: IcmObserverReasonCode;
    detail: string;
  };

export interface IcmControllerProjection {
  policySchema: "lionroute.icm-ops-controller-policy.v1";
  controllerSchema: "lionroute.icm-ops-controller.v1";
  controllerVersion: string;
  source: "icm-ops-controller-policy.v1.json";
  writeAuthorityMode: "CONTROLLER_BROKER_ONLY";
  realModelDispatch: false;
  fableBulkWorkAllowed: false;
  providerCallsAllowed: 0;
  reviewerLiveReadAllowed: false;
  claimBoundary: {
    cooperativeLocalWorkers: true;
    hostileSameUserWorkers: false;
    untrustedRealModelWorkers: false;
  };
  liveState: IcmLiveState;
  collisionState: IcmCollisionState;
}

export interface SystemNode {
  id: string;
  label: string;
  category: "authority" | "state" | "runtime" | "worker" | "evidence" | "ui";
  status: OperationStatus;
  subtitle: string;
}

export interface SystemEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface TelemetrySnapshot {
  currentState: CurrentState;
  operations: Operation[];
  workstreams: Workstream[];
  evidence: EvidenceItem[];
  authority: AuthorityRule[];
  capabilityRegistry: CapabilityRegistryProjection;
  projectRegistry: ProjectRegistryProjection;
  icmController: IcmControllerProjection;
  federation: FederationProjection;
  routingProvenance: RoutingProvenanceProjection;
  systemNodes: SystemNode[];
  systemEdges: SystemEdge[];
}
