import { detectWriteCollisions } from "../../data/derive";
import type { Operation, Workstream } from "../../types";

export type WorkstreamFilter = "all" | "running" | "waiting" | "producer" | "reviewer" | "observer";

export interface WorkstreamSummary {
  total: number;
  active: number;
  producers: number;
  heavy: number;
  advisoryCollisionCount: number;
  advisoryCollisions: string[];
}

export function workstreamElapsedMs(workstream: Workstream, now = Date.now()): number | undefined {
  if (workstream.status !== "running" && workstream.status !== "waiting") return undefined;
  const startedAt = Date.parse(workstream.startedAt);
  return Number.isFinite(startedAt) ? Math.max(0, now - startedAt) : undefined;
}

export function filterWorkstreams(workstreams: Workstream[], query: string, filter: WorkstreamFilter): Workstream[] {
  const normalizedQuery = query.trim().toLowerCase();
  return workstreams.filter((workstream) => {
    const matchesFilter = filter === "all"
      || (filter === "running" || filter === "waiting" ? workstream.status === filter : workstream.role === filter);
    if (!matchesFilter) return false;
    if (!normalizedQuery) return true;
    return [
      workstream.name,
      workstream.chatId,
      workstream.project,
      workstream.role,
      workstream.model,
      workstream.activeOperation,
      workstream.currentStep,
      workstream.authorityState,
      ...workstream.readScope,
      ...workstream.writeScope,
    ].some((value) => value.toLowerCase().includes(normalizedQuery));
  });
}

export function summarizeWorkstreams(workstreams: Workstream[]): WorkstreamSummary {
  const advisoryCollisions = detectWriteCollisions(workstreams);
  return {
    total: workstreams.length,
    active: workstreams.filter((workstream) => workstream.status === "running" || workstream.status === "waiting").length,
    producers: workstreams.filter((workstream) => workstream.role === "producer").length,
    heavy: workstreams.filter((workstream) => workstream.heavyWorkload).length,
    advisoryCollisionCount: advisoryCollisions.length,
    advisoryCollisions,
  };
}

export function findWorkstreamOperation(workstream: Workstream, operations: Operation[]): Operation | undefined {
  return operations.find((operation) => operation.workstream === workstream.name && operation.name === workstream.activeOperation)
    ?? operations.find((operation) => operation.workstream === workstream.name)
    ?? operations.find((operation) => operation.name === workstream.activeOperation);
}
