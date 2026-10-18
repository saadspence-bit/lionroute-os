import type { OperationStatus, TelemetrySnapshot, Workstream } from "../../types";

export interface WorkerProjection {
  id: string;
  name: string;
  chatId: string;
  project: string;
  role: Workstream["role"];
  model: string;
  status: OperationStatus;
  authorityState: Workstream["authorityState"];
  heavyWorkload: boolean;
  currentStep: string;
  activeOperation: string;
  operationId?: string;
  readScopeCount: number;
  writeScopeCount: number;
}

export interface ModelProjection {
  model: string;
  projects: string[];
  roles: string[];
  workstreamAssignments: number;
  operationAssignments: number;
  runningWorkstreams: number;
  heavyAssignments: number;
}

export function buildWorkerProjections(snapshot: TelemetrySnapshot): WorkerProjection[] {
  return snapshot.workstreams.map((workstream) => {
    const operation = snapshot.operations.find((candidate) => candidate.project === workstream.project && candidate.workstream === workstream.name && candidate.name === workstream.activeOperation);
    return {
      id: workstream.id,
      name: workstream.name,
      chatId: workstream.chatId,
      project: workstream.project,
      role: workstream.role,
      model: workstream.model,
      status: workstream.status,
      authorityState: workstream.authorityState,
      heavyWorkload: workstream.heavyWorkload,
      currentStep: workstream.currentStep,
      activeOperation: workstream.activeOperation,
      operationId: operation?.id,
      readScopeCount: workstream.readScope.length,
      writeScopeCount: workstream.writeScope.length,
    };
  }).sort((left, right) => left.name.localeCompare(right.name));
}

export function buildModelProjections(snapshot: TelemetrySnapshot): ModelProjection[] {
  const names = new Set([...snapshot.workstreams.map((workstream) => workstream.model), ...snapshot.operations.map((operation) => operation.model)]);
  return [...names].map((model) => {
    const workstreams = snapshot.workstreams.filter((workstream) => workstream.model === model);
    const operations = snapshot.operations.filter((operation) => operation.model === model);
    return {
      model,
      projects: [...new Set([...workstreams.map((workstream) => workstream.project), ...operations.map((operation) => operation.project)])].sort(),
      roles: [...new Set(workstreams.map((workstream) => workstream.role))].sort(),
      workstreamAssignments: workstreams.length,
      operationAssignments: operations.length,
      runningWorkstreams: workstreams.filter((workstream) => workstream.status === "running").length,
      heavyAssignments: workstreams.filter((workstream) => workstream.heavyWorkload).length,
    };
  }).sort((left, right) => right.runningWorkstreams - left.runningWorkstreams || left.model.localeCompare(right.model));
}
