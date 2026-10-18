import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, Filter, Layers3, LockKeyhole, Search, ServerCog, ShieldCheck } from "lucide-react";
import type { OperationStatus, TelemetrySnapshot, Workstream } from "../../types";
import { formatDuration } from "../operations/model";
import { filterWorkstreams, findWorkstreamOperation, summarizeWorkstreams, workstreamElapsedMs, type WorkstreamFilter } from "./model";

const filters: Array<{ value: WorkstreamFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "running", label: "Running" },
  { value: "waiting", label: "Waiting" },
  { value: "producer", label: "Producers" },
  { value: "reviewer", label: "Reviewers" },
  { value: "observer", label: "Observers" },
];

function Status({ status }: { status: OperationStatus }) {
  return <span className={`status status-${status}`}><span className="status-dot" />{status}</span>;
}

function safeDateTime(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? new Date(parsed).toLocaleString() : "Unknown";
}

function IcmGuard({ data }: { data: TelemetrySnapshot }) {
  const live = data.icmController.liveState;
  const collision = data.icmController.collisionState;
  const projected = live.state === "projected" && collision.state !== "not-projected";
  const alert = projected && (collision.state === "overlap-detected" || collision.state === "quarantine-present" || live.quarantinedLeaseCount > 0);
  return <section className={`panel workstream-icm ${alert ? "workstream-icm-alert" : ""}`}>
    <div className="workstream-icm-icon">{projected ? alert ? <AlertTriangle size={17}/> : <ShieldCheck size={17}/> : <LockKeyhole size={17}/>}</div>
    <div><span className="eyebrow">CANONICAL ICM OBSERVER</span><strong>{projected ? collision.state : "not projected"}</strong><small>{projected ? `${live.protectedLeaseCount} protected · ${live.activeLeaseCount} active · ${live.quarantinedLeaseCount} quarantined` : live.state === "not-projected" ? live.reasonCode : collision.state === "not-projected" ? collision.reasonCode : "observer unavailable"}</small></div>
    <div className="workstream-icm-boundary"><span>Authority</span><strong>{data.icmController.writeAuthorityMode}</strong><small>Persisted controller state only; process liveness is not projected.</small></div>
  </section>;
}

function WorkstreamInspector({ workstream, data, onOpenOperation }: { workstream: Workstream; data: TelemetrySnapshot; onOpenOperation: (operationId: string) => void }) {
  const operation = findWorkstreamOperation(workstream, data.operations);
  return <aside className="panel workstream-detail">
    <div className="workstream-detail-head"><div><span className="eyebrow">SELECTED WORKSTREAM</span><h2>{workstream.name}</h2></div><Status status={workstream.status}/></div>
    <code className="work-chat-id">{workstream.chatId}</code>
    <p>{workstream.activeOperation}</p>
    <dl className="detail-grid"><div><dt>Project</dt><dd>{workstream.project}</dd></div><div><dt>Role</dt><dd>{workstream.role}</dd></div><div><dt>Model / worker</dt><dd>{workstream.model}</dd></div><div><dt>Authority</dt><dd>{workstream.authorityState}</dd></div><div><dt>Current step</dt><dd>{workstream.currentStep}</dd></div><div><dt>Heavy workload</dt><dd>{workstream.heavyWorkload ? "yes" : "no"}</dd></div><div><dt>Started</dt><dd>{safeDateTime(workstream.startedAt)}</dd></div><div><dt>Elapsed</dt><dd>{formatDuration(workstreamElapsedMs(workstream))}</dd></div></dl>
    {operation && <button type="button" className="open-operation workstream-open-operation" onClick={() => onOpenOperation(operation.id)}><Activity size={14}/>Open projected operation</button>}
    <div className="workstream-scope-block"><span className="eyebrow">READ SCOPE</span>{workstream.readScope.length ? workstream.readScope.map((scope) => <code key={scope}>{scope}</code>) : <small>none projected</small>}</div>
    <div className="workstream-scope-block write"><span className="eyebrow">WRITE SCOPE</span>{workstream.writeScope.length ? workstream.writeScope.map((scope) => <code key={scope}>{scope}</code>) : <small>read-only</small>}</div>
    <div className="map-boundary"><ShieldCheck size={13}/><span>Workstream scope is projected metadata. The UI cannot grant, revoke, lock, or execute against these scopes.</span></div>
  </aside>;
}

export default function Workstreams({ data, onOpenOperation }: { data: TelemetrySnapshot; onOpenOperation: (operationId: string) => void }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<WorkstreamFilter>("all");
  const [selectedId, setSelectedId] = useState(data.workstreams[0]?.id ?? "");
  const summary = useMemo(() => summarizeWorkstreams(data.workstreams), [data.workstreams]);
  const visible = useMemo(() => filterWorkstreams(data.workstreams, query, filter), [data.workstreams, query, filter]);
  const selected = visible.find((workstream) => workstream.id === selectedId) ?? visible[0];

  useEffect(() => {
    if (!selected || selected.id === selectedId) return;
    setSelectedId(selected.id);
  }, [selected, selectedId]);

  return <section className="screen-section workstreams-screen">
    <div className="section-title workstreams-title"><div><span className="eyebrow">CONCURRENCY & OWNERSHIP</span><h1>Workstreams</h1><p>Inspect projected chat ownership, execution roles, workload state, and read/write scope while keeping advisory UI overlap separate from canonical ICM collision state.</p></div><div className="workstreams-mode"><Layers3 size={14}/>observer concurrency</div></div>

    <section className="workstream-metrics">
      <div className="panel project-metric"><Layers3 size={17}/><div><strong>{summary.total}</strong><span>projected workstreams</span></div></div>
      <div className="panel project-metric"><Activity size={17}/><div><strong>{summary.active}</strong><span>running / waiting</span></div></div>
      <div className="panel project-metric"><ServerCog size={17}/><div><strong>{summary.producers}</strong><span>producer lanes</span></div></div>
      <div className={`panel project-metric ${summary.advisoryCollisionCount ? "workstream-advisory-alert" : ""}`}><AlertTriangle size={17}/><div><strong>{summary.advisoryCollisionCount}</strong><span>advisory UI overlaps</span></div></div>
    </section>

    <IcmGuard data={data}/>

    <div className="workstream-toolbar panel"><label className="operations-search"><Search size={15}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search chats, scopes, roles, models…" /></label><div className="workstream-filters" aria-label="Workstream filters"><Filter size={14}/>{filters.map((option) => <button type="button" key={option.value} className={filter === option.value ? "active" : ""} onClick={() => setFilter(option.value)}>{option.label}</button>)}</div></div>

    <div className="workstream-layout">
      <section className="panel workstream-list">
        <div className="workstream-list-head"><span>Workstream</span><span>Role</span><span>Status</span><span>Load</span></div>
        {visible.length ? visible.map((workstream) => <button type="button" className={`workstream-row ${selected?.id === workstream.id ? "selected" : ""}`} key={workstream.id} onClick={() => setSelectedId(workstream.id)}>
          <span className="workstream-primary"><strong>{workstream.name}</strong><small>{workstream.project} · {workstream.model}</small><code>{workstream.currentStep}</code></span>
          <span className="workstream-role">{workstream.role}</span>
          <Status status={workstream.status}/>
          <span className="workstream-load">{workstream.heavyWorkload ? "heavy" : "normal"}</span>
        </button>) : <div className="operations-empty"><Search size={18}/><strong>No workstreams match</strong><span>Change the filter or search text.</span></div>}
      </section>
      {selected ? <WorkstreamInspector workstream={selected} data={data} onOpenOperation={onOpenOperation}/> : <aside className="panel workstream-detail map-detail-empty"><Layers3 size={22}/><strong>No workstream selected</strong><span>Choose a visible workstream to inspect projected ownership and scope.</span></aside>}
    </div>

    <section className="panel workstream-advisory"><div><span className="eyebrow">ADVISORY UI OVERLAP HEURISTIC</span><h2>{summary.advisoryCollisionCount ? `${summary.advisoryCollisionCount} possible overlap${summary.advisoryCollisionCount === 1 ? "" : "s"}` : "No overlap detected"}</h2></div><p>{summary.advisoryCollisionCount ? summary.advisoryCollisions.join(" · ") : "The path-normalization heuristic found no overlap among running producer write scopes."}</p><small>This heuristic is operator awareness only. It is not a lock, lease, authority decision, or substitute for the canonical ICM observer above.</small></section>
  </section>;
}
