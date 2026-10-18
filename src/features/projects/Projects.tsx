import { Activity, Boxes, FileCheck2, Gauge, Layers3, ServerCog } from "lucide-react";
import type { OperationStatus, TelemetrySnapshot } from "../../types";
import { buildProjectProjections } from "./model";

function Status({ status }: { status: OperationStatus }) {
  return <span className={`status status-${status}`}><span className="status-dot" />{status}</span>;
}

export default function Projects({ data, onOpenOperation }: { data: TelemetrySnapshot; onOpenOperation: (operationId: string) => void }) {
  const projects = buildProjectProjections(data);
  const totalActive = projects.reduce((sum, project) => sum + project.activeOperationCount, 0);
  const totalWorkstreams = projects.reduce((sum, project) => sum + project.workstreamCount, 0);
  const totalHeavy = projects.reduce((sum, project) => sum + project.heavyWorkloads, 0);

  return <section className="screen-section projects-screen">
    <div className="section-title projects-title"><div><span className="eyebrow">PROJECT PORTFOLIO</span><h1>Projects</h1><p>Canonical project identity and integration metadata from the Core registry, combined with observer-derived activity. Activity status remains a UI summary, not project health or authority.</p></div><div className="project-count"><strong>{projects.length}</strong><span>registry + observed</span></div></div>

    <section className="project-metrics">
      <div className="panel project-metric"><Activity size={17}/><div><strong>{totalActive}</strong><span>active operations</span></div></div>
      <div className="panel project-metric"><Layers3 size={17}/><div><strong>{totalWorkstreams}</strong><span>workstreams</span></div></div>
      <div className="panel project-metric"><ServerCog size={17}/><div><strong>{totalHeavy}</strong><span>heavy workloads</span></div></div>
      <div className="panel project-metric"><FileCheck2 size={17}/><div><strong>{data.evidence.length}</strong><span>snapshot evidence</span></div></div>
    </section>

    <div className="project-grid">{projects.map((project) => {
      const projectOperations = data.operations.filter((operation) => operation.project === project.name);
      return <article className={`panel project-card ${project.currentStateBound ? "current" : ""}`} key={project.name}>
        <div className="project-card-head"><div className="project-icon"><Boxes size={18}/></div><div className="project-card-status"><Status status={project.status}/>{project.registryStatus && <span className="current-badge">registry: {project.registryStatus}</span>}{project.currentStateBound && <span className="current-badge">current-state bound</span>}</div></div>
        <h2>{project.name}</h2>
        <small>{project.projectId ? `Core project ID: ${project.projectId}` : "Observed activity is not matched to a canonical registry entry."}</small>
        <div className="project-facts">
          <div><span>Operations</span><strong>{project.operationCount}</strong><small>{project.activeOperationCount} active/waiting</small></div>
          <div><span>Workstreams</span><strong>{project.workstreamCount}</strong><small>{project.activeWorkstreamCount} active/waiting</small></div>
          <div><span>Registry status</span><strong>{project.registryStatus ?? "unmatched"}</strong><small>{project.projectType ?? "type not declared"}</small></div>
          <div><span>Connection</span><strong>{project.connectionStatus ?? "not projected"}</strong><small>{project.projectRootKnown ? "root known" : "root not known"}</small></div>
          <div><span>Integration contract</span><strong>{project.integrationContractKnown ? "known" : "not recorded"}</strong><small>profile {project.projectProfileKnown ? "known" : "not recorded"}</small></div>
          <div><span>Models</span><strong>{project.models.length}</strong><small>{project.models.join(" · ") || "None projected"}</small></div>
          <div><span>Evidence coverage</span><strong>—</strong><small>project ownership not projected</small></div>
        </div>
        {project.currentStateBound && <div className="project-current-state"><Gauge size={15}/><div><span>Current stage</span><code>{project.activeStage}</code><small>Next: {project.nextSafeAction}</small></div></div>}
        <div className="project-stages"><span className="eyebrow">OBSERVED STAGES</span>{project.stages.length ? project.stages.map((stage) => <code key={stage}>{stage}</code>) : <small>No operation stages projected.</small>}</div>
        <div className="project-runs"><span className="eyebrow">OPERATIONS</span>{projectOperations.length ? projectOperations.map((operation) => <button type="button" key={operation.id} onClick={() => onOpenOperation(operation.id)}><span>{operation.name}</span><Status status={operation.status}/></button>) : <small>No operation records in this snapshot.</small>}</div>
      </article>;
    })}</div>
  </section>;
}
