export interface UiModuleProjection {
  id: string;
  label: string;
  group: "operations" | "governance" | "platform";
  state: "available" | "contract-limited";
  detail: string;
}

export const uiModules: UiModuleProjection[] = [
  { id: "command", label: "Command Center", group: "operations", state: "available", detail: "Current operation and canonical-state projection." },
  { id: "operations", label: "Operations / Live Trace", group: "operations", state: "available", detail: "Run browsing and nested execution traces." },
  { id: "history", label: "History / Replay", group: "operations", state: "available", detail: "Forensic projection replay from current snapshot records." },
  { id: "terminal", label: "Terminal", group: "operations", state: "available", detail: "Read-only structured execution stream; no command input." },
  { id: "projects", label: "Projects", group: "platform", state: "available", detail: "Canonical project registry plus observer-derived activity." },
  { id: "agents", label: "Agents & Models", group: "platform", state: "available", detail: "Assignments plus read-only Core capability/federation registry projection." },
  { id: "workstreams", label: "Workstreams", group: "platform", state: "available", detail: "Session identity, ownership, scopes, workload and authority state." },
  { id: "system", label: "System Map", group: "platform", state: "available", detail: "Logical resource topology." },
  { id: "evidence", label: "Evidence", group: "governance", state: "contract-limited", detail: "Snapshot evidence is available; project ownership is not projected." },
  { id: "authority", label: "Authority", group: "governance", state: "available", detail: "Read-only ICM/Core policy plus sanitized current-store collision projection." },
];

export function summarizeUiModules(modules = uiModules) {
  return {
    total: modules.length,
    available: modules.filter((module) => module.state === "available").length,
    contractLimited: modules.filter((module) => module.state === "contract-limited").length,
  };
}
