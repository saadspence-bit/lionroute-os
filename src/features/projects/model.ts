import type { OperationStatus, ProjectConnectionStatus, ProjectRegistryStatus, TelemetrySnapshot } from "../../types";

export interface ProjectProjection {
  name: string;
  registered: boolean;
  projectId?: string;
  projectType?: string | null;
  registryStatus?: ProjectRegistryStatus;
  connectionStatus?: ProjectConnectionStatus;
  projectRootKnown?: boolean;
  integrationContractKnown?: boolean;
  projectProfileKnown?: boolean;
  currentStateBound: boolean;
  status: OperationStatus;
  operationCount: number;
  activeOperationCount: number;
  workstreamCount: number;
  activeWorkstreamCount: number;
  heavyWorkloads: number;
  models: string[];
  stages: string[];
  activeStage?: string;
  nextSafeAction?: string;
}

const statusPriority: OperationStatus[] = ["failed", "running", "waiting", "passed", "skipped", "idle"];

function projectedStatus(statuses: OperationStatus[]): OperationStatus {
  if (!statuses.length) return "idle";
  return statusPriority.find((status) => statuses.includes(status)) ?? "idle";
}

export function buildProjectProjections(snapshot: TelemetrySnapshot): ProjectProjection[] {
  const names = new Set<string>([
    ...snapshot.projectRegistry.projects.map((project) => project.projectName),
    snapshot.currentState.project,
    ...snapshot.operations.map((operation) => operation.project),
    ...snapshot.workstreams.map((workstream) => workstream.project),
  ]);
  const registryByName = new Map(snapshot.projectRegistry.projects.map((project) => [project.projectName, project] as const));

  return [...names].map((name) => {
    const registry = registryByName.get(name);
    const operations = snapshot.operations.filter((operation) => operation.project === name);
    const workstreams = snapshot.workstreams.filter((workstream) => workstream.project === name);
    const currentStateBound = name === snapshot.currentState.project;
    const statuses = [...operations.map((operation) => operation.status), ...workstreams.map((workstream) => workstream.status)];
    return {
      name,
      registered: Boolean(registry),
      projectId: registry?.projectId,
      projectType: registry?.projectType,
      registryStatus: registry?.registryStatus,
      connectionStatus: registry?.connectionStatus,
      projectRootKnown: registry?.projectRootKnown,
      integrationContractKnown: registry?.integrationContractKnown,
      projectProfileKnown: registry?.projectProfileKnown,
      currentStateBound,
      status: projectedStatus(statuses),
      operationCount: operations.length,
      activeOperationCount: operations.filter((operation) => operation.status === "running" || operation.status === "waiting").length,
      workstreamCount: workstreams.length,
      activeWorkstreamCount: workstreams.filter((workstream) => workstream.status === "running" || workstream.status === "waiting").length,
      heavyWorkloads: workstreams.filter((workstream) => workstream.heavyWorkload).length,
      models: [...new Set([...operations.map((operation) => operation.model), ...workstreams.map((workstream) => workstream.model)])].sort(),
      stages: [...new Set(operations.map((operation) => operation.stage))].sort(),
      activeStage: currentStateBound ? snapshot.currentState.activeStage : undefined,
      nextSafeAction: currentStateBound ? snapshot.currentState.nextSafeAction : undefined,
    };
  }).sort((left, right) => Number(right.currentStateBound) - Number(left.currentStateBound) || Number(right.registered) - Number(left.registered) || left.name.localeCompare(right.name));
}
