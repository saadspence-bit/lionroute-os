import type { Operation, OperationStatus, TraceStep } from "../../types";

export type OperationFilter = "all" | OperationStatus;

export function operationDurationMs(operation: Operation, now = Date.now()): number | undefined {
  const startedAt = Date.parse(operation.startedAt);
  if (!Number.isFinite(startedAt)) return undefined;

  const endedAt = operation.steps
    .map((step) => step.endedAt ? Date.parse(step.endedAt) : Number.NaN)
    .filter(Number.isFinite)
    .reduce((latest, value) => Math.max(latest, value), Number.NEGATIVE_INFINITY);

  const terminal = ["passed", "failed", "skipped"].includes(operation.status);
  if (terminal && !Number.isFinite(endedAt)) return undefined;
  const end = terminal ? endedAt : now;
  return Math.max(0, end - startedAt);
}

export function formatDuration(durationMs: number | undefined): string {
  if (durationMs === undefined) return "Unknown";
  if (durationMs < 1_000) return `${Math.round(durationMs)}ms`;
  const seconds = Math.floor(durationMs / 1_000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return remainingSeconds ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function filterOperations(
  operations: Operation[],
  query: string,
  status: OperationFilter,
): Operation[] {
  const normalizedQuery = query.trim().toLowerCase();

  return operations
    .filter((operation) => status === "all" || operation.status === status)
    .filter((operation) => {
      if (!normalizedQuery) return true;
      return [
        operation.name,
        operation.project,
        operation.workstream,
        operation.stage,
        operation.actor,
        operation.model,
        operation.traceId,
        operation.summary,
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
    })
    .sort((left, right) => Date.parse(right.startedAt) - Date.parse(left.startedAt));
}

export function selectVisibleOperation(operations: Operation[], selectedOperationId: string): Operation | undefined {
  return operations.find((operation) => operation.id === selectedOperationId) ?? operations[0];
}

export function traceChildren(steps: TraceStep[]): Map<string, TraceStep[]> {
  return steps.reduce<Map<string, TraceStep[]>>((index, step) => {
    const key = step.parentSpanId ?? "__root__";
    const existing = index.get(key) ?? [];
    existing.push(step);
    index.set(key, existing);
    return index;
  }, new Map());
}
