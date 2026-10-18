import type { OperationStatus, TelemetrySnapshot } from "../../types";

export type HistoryEventKind = "state" | "operation" | "trace" | "evidence";

export interface HistoryEvent {
  id: string;
  kind: HistoryEventKind;
  timestamp: string;
  title: string;
  description: string;
  source: string;
  project: string;
  operationId?: string;
  traceId?: string;
  stage?: string;
  actor?: string;
  status?: OperationStatus | "verified" | "recorded" | "pending";
  evidenceRefs: string[];
}

export interface ReplaySummary {
  position: number;
  total: number;
  operationsObserved: number;
  traceEventsObserved: number;
  evidenceObserved: number;
  stateEventsObserved: number;
}

function timestampValue(value: string): number {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
}

export function buildHistoryEvents(snapshot: TelemetrySnapshot): HistoryEvent[] {
  const events: HistoryEvent[] = [
    {
      id: "history-current-state",
      kind: "state",
      timestamp: snapshot.currentState.updatedAt,
      title: `Current-state projection · ${snapshot.currentState.activeStage}`,
      description: `${snapshot.currentState.currentStateStatus} / ${snapshot.currentState.freshness} · next ${snapshot.currentState.nextSafeAction}`,
      source: snapshot.currentState.authoritySource,
      project: snapshot.currentState.project,
      stage: snapshot.currentState.activeStage,
      status: snapshot.currentState.currentStateStatus === "CURRENT" && snapshot.currentState.freshness === "FRESH" ? "passed" : "waiting",
      evidenceRefs: [],
    },
  ];

  for (const operation of snapshot.operations) {
    events.push({
      id: `history-operation-${operation.id}`,
      kind: "operation",
      timestamp: operation.startedAt,
      title: `Operation observed · ${operation.name}`,
      description: operation.summary,
      source: operation.workstream,
      project: operation.project,
      operationId: operation.id,
      traceId: operation.traceId,
      stage: operation.stage,
      actor: operation.actor,
      status: operation.status,
      evidenceRefs: [],
    });

    for (const step of operation.steps) {
      events.push({
        id: `history-trace-${operation.id}-${step.spanId}`,
        kind: "trace",
        timestamp: step.startedAt,
        title: step.step,
        description: step.message,
        source: step.eventName,
        project: operation.project,
        operationId: operation.id,
        traceId: step.traceId,
        stage: operation.stage,
        actor: step.actor,
        status: step.status,
        evidenceRefs: step.evidenceRefs,
      });
    }
  }

  for (const evidence of snapshot.evidence) {
    events.push({
      id: `history-evidence-${evidence.id}`,
      kind: "evidence",
      timestamp: evidence.recordedAt,
      title: evidence.title,
      description: evidence.detail,
      source: evidence.source,
      project: snapshot.currentState.project,
      status: evidence.status,
      evidenceRefs: [evidence.id],
    });
  }

  return events.sort((left, right) => {
    const byTime = timestampValue(left.timestamp) - timestampValue(right.timestamp);
    return byTime || left.id.localeCompare(right.id);
  });
}

export function filterHistoryEvents(events: HistoryEvent[], query: string, kind: HistoryEventKind | "all"): HistoryEvent[] {
  const normalizedQuery = query.trim().toLowerCase();
  return events.filter((event) => {
    if (kind !== "all" && event.kind !== kind) return false;
    if (!normalizedQuery) return true;
    return [event.title, event.description, event.source, event.project, event.operationId, event.traceId, event.stage, event.actor]
      .filter((value): value is string => Boolean(value))
      .some((value) => value.toLowerCase().includes(normalizedQuery));
  });
}

export function replaySummary(events: HistoryEvent[], selectedEventId: string): ReplaySummary {
  const selectedIndex = events.findIndex((event) => event.id === selectedEventId);
  if (selectedIndex < 0) {
    return {
      position: 0,
      total: events.length,
      operationsObserved: 0,
      traceEventsObserved: 0,
      evidenceObserved: 0,
      stateEventsObserved: 0,
    };
  }
  const observed = events.slice(0, selectedIndex + 1);
  return {
    position: selectedIndex + 1,
    total: events.length,
    operationsObserved: observed.filter((event) => event.kind === "operation").length,
    traceEventsObserved: observed.filter((event) => event.kind === "trace").length,
    evidenceObserved: observed.filter((event) => event.kind === "evidence").length,
    stateEventsObserved: observed.filter((event) => event.kind === "state").length,
  };
}
