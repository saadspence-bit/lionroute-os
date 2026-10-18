import type { Operation, Workstream } from "../types";

export interface ControlPlaneSummary {
  runningOperations: number;
  blockedOperations: number;
  activeWorkstreams: number;
  heavyWorkloads: number;
  writeCollisions: string[];
}

function normalizeScope(scope: string) {
  return scope
    .trim()
    .toLowerCase()
    .replaceAll("\\", "/")
    .replace(/\/+/g, "/")
    .replace(/\/\*\*$/, "")
    .replace(/\/$/, "");
}

function normalizedScopes(workstream: Workstream) {
  return workstream.writeScope.map(normalizeScope).filter(Boolean);
}

export function detectWriteCollisions(workstreams: Workstream[]): string[] {
  const activeProducers = workstreams.filter(
    (workstream) => workstream.role === "producer" && workstream.status === "running",
  );
  const collisions = new Set<string>();

  for (let leftIndex = 0; leftIndex < activeProducers.length; leftIndex += 1) {
    const left = activeProducers[leftIndex];
    if (!left) continue;
    const leftScopes = normalizedScopes(left);

    for (let rightIndex = leftIndex + 1; rightIndex < activeProducers.length; rightIndex += 1) {
      const right = activeProducers[rightIndex];
      if (!right) continue;
      const rightScopes = normalizedScopes(right);

      for (const leftScope of leftScopes) {
        for (const rightScope of rightScopes) {
          const leftBase = leftScope;
          const rightBase = rightScope;
          if (
            leftBase === rightBase ||
            leftBase.startsWith(`${rightBase}/`) ||
            rightBase.startsWith(`${leftBase}/`)
          ) {
            collisions.add(`${left.name} ↔ ${right.name}`);
          }
        }
      }
    }
  }

  return Array.from(collisions);
}

export function summarizeControlPlane(
  operations: Operation[],
  workstreams: Workstream[],
): ControlPlaneSummary {
  return {
    runningOperations: operations.filter((operation) => operation.status === "running").length,
    blockedOperations: operations.filter(
      (operation) => operation.status === "failed" || operation.status === "waiting",
    ).length,
    activeWorkstreams: workstreams.filter((workstream) => workstream.status === "running").length,
    heavyWorkloads: workstreams.filter((workstream) => workstream.heavyWorkload).length,
    writeCollisions: detectWriteCollisions(workstreams),
  };
}
