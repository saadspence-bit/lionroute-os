import type { TelemetrySnapshot } from "../../types";

export type DemoDestination = "projects" | "operations" | "history" | "evidence" | "system";

export interface DemoStep {
  id: DemoDestination;
  number: number;
  title: string;
  eyebrow: string;
  summary: string;
  question: string;
  destination: DemoDestination;
  actionLabel: string;
  metricLabel: string;
  metricValue: string;
  sample: string;
  operationId?: string;
}

export const TOUR_DESTINATIONS: readonly DemoDestination[] = [
  "projects", "operations", "history", "evidence", "system",
] as const;

export function safeTourIndex(index: number, length: number): number {
  if (!Number.isInteger(index) || length < 1) return 0;
  return Math.min(Math.max(index, 0), length - 1);
}

export function moveTourIndex(index: number, length: number, movement: -1 | 1): number {
  return safeTourIndex(safeTourIndex(index, length) + movement, length);
}

/** Every number and example name comes from the bundled fictional snapshot. */
export function buildDemoSteps(data: TelemetrySnapshot): DemoStep[] {
  const operation = data.operations[0];
  const traceCount = data.operations.reduce((total, run) => total + run.steps.length, 0);
  const evidence = data.evidence[0];
  const project = data.projectRegistry.projects[0];
  const node = data.systemNodes[0];
  return [
    {
      id: "projects", number: 1, eyebrow: "PROJECT REGISTRY", title: "Meet the example projects",
      summary: "Explore how a registry view separates project identity from observer-reported activity.",
      question: "Which projects have fictional operations or workstreams?",
      destination: "projects", actionLabel: "Explore projects",
      metricLabel: "Example projects", metricValue: String(data.projectRegistry.projects.length),
      sample: project?.projectName ?? "No example projects in this snapshot",
    },
    {
      id: "operations", number: 2, eyebrow: "OPERATIONS", title: "Inspect a sample operation",
      summary: "Select a run, inspect the projected stage, and expand its nested execution trace.",
      question: "Which step is active, and what is only projected rather than completed?",
      destination: "operations", actionLabel: "Inspect operation",
      metricLabel: "Example operations", metricValue: String(data.operations.length),
      sample: operation?.name ?? "No example operations in this snapshot",
      operationId: operation?.id,
    },
    {
      id: "history", number: 3, eyebrow: "HISTORY / REPLAY", title: "Follow the recorded story",
      summary: "Browse an observer-derived timeline and distinguish operation, trace, and state records.",
      question: "What can a timeline establish, and what remains unverified?",
      destination: "history", actionLabel: "Explore history",
      metricLabel: "Example trace steps", metricValue: String(traceCount),
      sample: operation?.steps[0]?.step ?? "No trace steps in this snapshot",
    },
    {
      id: "evidence", number: 4, eyebrow: "EVIDENCE", title: "Examine example proof",
      summary: "Review sample evidence status and references without treating demo badges as real proof.",
      question: "Does a recorded item mean the private system was tested? (No.)",
      destination: "evidence", actionLabel: "Browse evidence",
      metricLabel: "Example evidence items", metricValue: String(data.evidence.length),
      sample: evidence?.title ?? "No evidence items in this snapshot",
    },
    {
      id: "system", number: 5, eyebrow: "SYSTEM MAP", title: "See the logical architecture",
      summary: "Explore how sample nodes and edges represent a read-only systems map.",
      question: "How do the example UI, state, authority, and evidence nodes relate?",
      destination: "system", actionLabel: "Explore system map",
      metricLabel: "Example map nodes", metricValue: String(data.systemNodes.length),
      sample: node?.label ?? "No system nodes in this snapshot",
    },
  ];
}
