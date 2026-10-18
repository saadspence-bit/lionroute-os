import type { OperationStatus, TelemetrySnapshot } from "../../types";

export interface TerminalRecord {
  id: string;
  timestamp: string;
  operationId: string;
  operationName: string;
  project: string;
  workstream: string;
  stage: string;
  actor: string;
  step: string;
  tool?: string;
  model?: string;
  status: OperationStatus;
  message: string;
  result?: string;
}

function timestampValue(value: string): number {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
}

export function buildTerminalRecords(snapshot: TelemetrySnapshot): TerminalRecord[] {
  return snapshot.operations
    .flatMap((operation) => operation.steps.map((step) => ({
      id: `${operation.id}:${step.spanId}`,
      timestamp: step.startedAt,
      operationId: operation.id,
      operationName: operation.name,
      project: operation.project,
      workstream: operation.workstream,
      stage: operation.stage,
      actor: step.actor,
      step: step.step,
      tool: step.tool,
      model: step.model,
      status: step.status,
      message: step.message,
      result: step.result,
    })))
    .sort((left, right) => timestampValue(left.timestamp) - timestampValue(right.timestamp) || left.id.localeCompare(right.id));
}

export function filterTerminalRecords(records: TerminalRecord[], query: string, operationId: string): TerminalRecord[] {
  const normalizedQuery = query.trim().toLowerCase();
  return records.filter((record) => {
    if (operationId !== "all" && record.operationId !== operationId) return false;
    if (!normalizedQuery) return true;
    return [record.operationName, record.project, record.workstream, record.stage, record.actor, record.step, record.tool, record.model, record.message, record.result, record.status]
      .filter((value): value is string => Boolean(value))
      .some((value) => value.toLowerCase().includes(normalizedQuery));
  });
}
