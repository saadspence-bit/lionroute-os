import type { TelemetrySnapshot } from "../../types";

export type PostureTone = "good" | "warn" | "neutral" | "critical";

export interface CommandCenterPostureItem {
  id: "state" | "dispatch" | "icm" | "portfolio";
  label: string;
  value: string;
  detail: string;
  tone: PostureTone;
  destination: "authority" | "agents" | "settings" | "projects";
}

export function buildCommandCenterPosture(data: TelemetrySnapshot, degraded: boolean): CommandCenterPostureItem[] {
  const stateHealthy = !degraded
    && data.currentState.currentStateStatus === "CURRENT"
    && data.currentState.freshness === "FRESH";

  const icmLive = data.icmController.liveState;
  const icmCollision = data.icmController.collisionState;
  const icmProjected = icmLive.state === "projected" && icmCollision.state !== "not-projected";
  const icmCritical = icmProjected && icmCollision.state === "overlap-detected";
  const icmWarn = icmProjected && (icmCollision.state === "quarantine-present" || icmLive.quarantinedLeaseCount > 0);
  const icmDetail = icmProjected
    ? `${icmLive.protectedLeaseCount} protected · ${icmLive.quarantinedLeaseCount} quarantined`
    : icmLive.state === "not-projected"
      ? icmLive.reasonCode
      : icmCollision.state === "not-projected"
        ? icmCollision.reasonCode
        : "observer state unavailable";

  const registeredActiveProjects = data.projectRegistry.projects.filter((project) => project.registryStatus === "active").length;

  return [
    {
      id: "state",
      label: "Canonical state",
      value: degraded ? "Last snapshot" : `${data.currentState.currentStateStatus} / ${data.currentState.freshness}`,
      detail: data.currentState.activeStage,
      tone: stateHealthy ? "good" : "warn",
      destination: "authority",
    },
    {
      id: "dispatch",
      label: "Real model dispatch",
      value: data.federation.realModelDispatchActivated ? "Activated by LCL" : "Disabled by LCL",
      detail: `${data.federation.workerQualifications.length} qualification records projected`,
      tone: "neutral",
      destination: "agents",
    },
    {
      id: "icm",
      label: "ICM collision guard",
      value: icmProjected ? icmCollision.state : "Not projected",
      detail: icmDetail,
      tone: icmCritical ? "critical" : icmWarn ? "warn" : icmProjected ? "good" : "neutral",
      destination: "settings",
    },
    {
      id: "portfolio",
      label: "Project registry",
      value: `${registeredActiveProjects} active / ${data.projectRegistry.projects.length} total`,
      detail: `${data.operations.length} operation records · ${data.workstreams.length} workstreams`,
      tone: "neutral",
      destination: "projects",
    },
  ];
}
