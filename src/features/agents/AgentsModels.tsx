import { Activity, Bot, BrainCircuit, CircleHelp, Cpu, LockKeyhole, Search, ServerCog } from "lucide-react";
import { useMemo, useState } from "react";
import type { OperationStatus, TelemetrySnapshot } from "../../types";
import { buildModelProjections, buildWorkerProjections } from "./model";

type Tab = "workers" | "models" | "registry" | "qualification" | "routing" | "capabilities";

function Status({ status }: { status: OperationStatus }) {
  return <span className={`status status-${status}`}><span className="status-dot" />{status}</span>;
}

export default function AgentsModels({ data, onOpenOperation }: { data: TelemetrySnapshot; onOpenOperation: (operationId: string) => void }) {
  const [tab, setTab] = useState<Tab>("workers");
  const [query, setQuery] = useState("");
  const workers = useMemo(() => buildWorkerProjections(data), [data]);
  const models = useMemo(() => buildModelProjections(data), [data]);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleWorkers = workers.filter((worker) => !normalizedQuery || [worker.name, worker.chatId, worker.project, worker.role, worker.model, worker.currentStep, worker.activeOperation].some((value) => value.toLowerCase().includes(normalizedQuery)));
  const visibleModels = models.filter((model) => !normalizedQuery || [model.model, ...model.projects, ...model.roles].some((value) => value.toLowerCase().includes(normalizedQuery)));
  const visibleRegistryModels = data.federation.models.filter((model) => !normalizedQuery || [model.modelId, model.modelFamily, model.hostKind, model.providerId, model.verificationState, ...model.capabilityTags].some((value) => value.toLowerCase().includes(normalizedQuery)));
  const visibleQualifications = data.federation.workerQualifications.filter((worker) => !normalizedQuery || [worker.workerId, worker.cliId, worker.adapterId, worker.modelId, worker.qualificationState, worker.realDispatchState, ...worker.roles, ...worker.capabilityTags].some((value) => value.toLowerCase().includes(normalizedQuery)));
  const visibleCapabilities = data.capabilityRegistry.entries.filter((entry) => !normalizedQuery || [entry.stageId, entry.name, entry.status, entry.authority, ...entry.capabilities, ...entry.projects].some((value) => value.toLowerCase().includes(normalizedQuery)));

  return <section className="screen-section agents-screen">
    <div className="section-title agents-title"><div><span className="eyebrow">INTELLIGENCE LANES</span><h1>Agents & Models</h1><p>Observed assignments plus Core-owned capability, federation, worker-qualification, and routing-provenance metadata. Prepared readiness and routing contracts never override LCL dispatch authority.</p></div><div className="agent-summary"><span><Bot size={14}/>{workers.length} workstreams</span><span><BrainCircuit size={14}/>{data.federation.models.length} registry models</span><span><ServerCog size={14}/>{data.federation.workerQualifications.length} qualified workers</span><span><ServerCog size={14}/>{data.capabilityRegistry.entries.length} capability stages</span></div></div>

    <div className="agents-contract-note panel"><CircleHelp size={17}/><div><strong>Real model dispatch: {data.federation.realModelDispatchActivated ? "ACTIVATED" : "DISABLED"}</strong><span>CLI/model/qualification records and the V5 routing contract are read-only metadata. Worker qualification remains REAL_MODEL_DISPATCH_NOT_AUTHORIZED. No current routing-decision ledger is projected, and the authority bit still comes separately from freshness-gated LCL.</span></div></div>

    <div className="agents-toolbar panel"><div className="agents-tabs"><button type="button" className={tab === "workers" ? "active" : ""} onClick={() => setTab("workers")}><Bot size={14}/>Workstreams / Agents</button><button type="button" className={tab === "models" ? "active" : ""} onClick={() => setTab("models")}><Cpu size={14}/>Observed Models</button><button type="button" className={tab === "registry" ? "active" : ""} onClick={() => setTab("registry")}><ServerCog size={14}/>Federation Registry</button><button type="button" className={tab === "qualification" ? "active" : ""} onClick={() => setTab("qualification")}><LockKeyhole size={14}/>Qualification</button><button type="button" className={tab === "routing" ? "active" : ""} onClick={() => setTab("routing")}><ServerCog size={14}/>Routing Provenance</button><button type="button" className={tab === "capabilities" ? "active" : ""} onClick={() => setTab("capabilities")}><LockKeyhole size={14}/>Capabilities</button></div><label className="operations-search"><Search size={15}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={tab === "workers" ? "Search workstreams, roles, models…" : tab === "registry" ? "Search registry models, capabilities…" : tab === "qualification" ? "Search qualified workers, models, roles…" : tab === "routing" ? "Routing contract is fixed metadata" : tab === "capabilities" ? "Search capability stages, status, authority…" : "Search observed models, projects, roles…"}/></label></div>

    {tab === "workers" ? <div className="agents-grid">{visibleWorkers.length ? visibleWorkers.map((worker) => <article className="panel agent-card" key={worker.id}>
      <div className="agent-card-head"><div className="agent-avatar"><Bot size={18}/></div><Status status={worker.status}/></div>
      <h2>{worker.name}</h2><code className="agent-chat-id">{worker.chatId}</code>
      <div className="agent-assignment"><span>Assigned model</span><strong>{worker.model}</strong><small>{worker.role} · {worker.project}</small></div>
      <dl className="agent-facts"><div><dt>Authority</dt><dd>{worker.authorityState}</dd></div><div><dt>Heavy workload</dt><dd>{worker.heavyWorkload ? "yes" : "no"}</dd></div><div><dt>Read scopes</dt><dd>{worker.readScopeCount}</dd></div><div><dt>Write scopes</dt><dd>{worker.writeScopeCount || "read-only"}</dd></div></dl>
      <div className="agent-step"><Activity size={14}/><div><span>Current step</span><strong>{worker.currentStep}</strong><small>{worker.activeOperation}</small></div></div>
      {worker.operationId ? <button type="button" className="open-operation agent-open" onClick={() => onOpenOperation(worker.operationId!)}><Activity size={14}/>Open operation</button> : <div className="agent-no-operation"><LockKeyhole size={13}/>No matching operation record</div>}
    </article>) : <div className="panel agents-empty"><Search size={18}/><strong>No workstreams match</strong><span>Change the search text.</span></div>}</div> : tab === "models" ? <div className="models-grid">{visibleModels.length ? visibleModels.map((model) => <article className="panel model-card" key={model.model}>
      <div className="model-card-head"><div className="model-icon"><BrainCircuit size={19}/></div><span className="model-running">{model.runningWorkstreams} running</span></div>
      <h2>{model.model}</h2>
      <div className="model-metrics"><div><strong>{model.workstreamAssignments}</strong><span>workstreams</span></div><div><strong>{model.operationAssignments}</strong><span>operations</span></div><div><strong>{model.heavyAssignments}</strong><span>heavy</span></div></div>
      <div className="model-detail"><span>Projects</span><strong>{model.projects.join(" · ") || "None projected"}</strong></div><div className="model-detail"><span>Observed roles</span><strong>{model.roles.join(" · ") || "No workstream role projected"}</strong></div>
      <div className="model-unknown"><ServerCog size={14}/><div><span>Assignment metadata</span><strong>Observed only</strong></div></div><div className="model-unknown"><ServerCog size={14}/><div><span>Registry linkage</span><strong>See Federation Registry</strong></div></div>
    </article>) : <div className="panel agents-empty"><Search size={18}/><strong>No models match</strong><span>Change the search text.</span></div>}</div> : tab === "registry" ? <div className="models-grid">{visibleRegistryModels.length ? visibleRegistryModels.map((model) => <article className="panel model-card" key={model.modelId}>
      <div className="model-card-head"><div className="model-icon"><ServerCog size={19}/></div><span className="model-running">{model.verificationState}</span></div>
      <h2>{model.modelId}</h2>
      <div className="model-detail"><span>Family / host</span><strong>{model.modelFamily} · {model.hostKind}</strong></div>
      <div className="model-detail"><span>Provider / CLI</span><strong>{model.providerId || "local / none"} · {model.cliIds.join(" · ") || "none"}</strong></div>
      <div className="model-detail"><span>Capabilities</span><strong>{model.capabilityTags.join(" · ") || "none projected"}</strong></div>
      <div className="model-unknown"><LockKeyhole size={14}/><div><span>Dispatch authority</span><strong>{data.federation.realModelDispatchActivated ? "LCL activated" : "LCL disabled"}</strong></div></div>
    </article>) : <div className="panel agents-empty"><Search size={18}/><strong>No registry models match</strong><span>Change the search text.</span></div>}</div> : tab === "qualification" ? <div className="models-grid">{visibleQualifications.length ? visibleQualifications.map((worker) => <article className="panel model-card" key={worker.workerId}>
      <div className="model-card-head"><div className="model-icon"><LockKeyhole size={19}/></div><span className="model-running">{worker.qualificationState}</span></div>
      <h2>{worker.modelId}</h2>
      <div className="model-detail"><span>Worker / CLI</span><strong>{worker.workerId} · {worker.cliId}</strong></div>
      <div className="model-detail"><span>Roles</span><strong>{worker.roles.join(" · ") || "none projected"}</strong></div>
      <div className="model-detail"><span>Capabilities</span><strong>{worker.capabilityTags.join(" · ") || "none projected"}</strong></div>
      <dl className="agent-facts"><div><dt>Available at qualification</dt><dd>{worker.availability ? "yes" : "no"}</dd></div><div><dt>Local execution</dt><dd>{worker.localExecution ? "yes" : "no"}</dd></div><div><dt>Network inference</dt><dd>{worker.networkRequiredForInference ? "required" : "not required"}</dd></div><div><dt>Read-only support</dt><dd>{worker.readOnlySupport ? "yes" : "no"}</dd></div></dl>
      <div className="model-detail"><span>Support</span><strong>write {worker.writeSupport ? "yes" : "no"} · sandbox {worker.sandboxSupport ? "yes" : "no"} · strength {worker.strengthTier} · reliability {worker.reliabilityTier}</strong></div>
      <div className="model-unknown"><LockKeyhole size={14}/><div><span>Real dispatch state</span><strong>{worker.realDispatchState}</strong></div></div>
      <div className="model-detail"><span>Qualification observed</span><strong>{worker.observedAt}</strong></div>
    </article>) : <div className="panel agents-empty"><Search size={18}/><strong>No qualification records match</strong><span>Change the search text.</span></div>}</div> : tab === "routing" ? <div className="models-grid"><article className="panel model-card">
      <div className="model-card-head"><div className="model-icon"><ServerCog size={19}/></div><span className="model-running">contract {data.routingProvenance.contractSchemaVersion}</span></div>
      <h2>Federation routing provenance</h2>
      <div className="model-detail"><span>Producer</span><strong>{data.routingProvenance.producer}</strong></div>
      <div className="model-detail"><span>Consumer</span><strong>{data.routingProvenance.consumer}</strong></div>
      <div className="model-detail"><span>Decision contract</span><strong>{data.routingProvenance.requiredFieldCount} required fields · {data.routingProvenance.determinismTupleFieldCount}-part determinism tuple</strong></div>
      <div className="model-detail"><span>Determinism binding</span><strong>{data.routingProvenance.determinismTupleFields.join(" · ")}</strong></div>
      <div className="model-unknown"><LockKeyhole size={14}/><div><span>Current decision store</span><strong>{data.routingProvenance.currentDecisionStore.state} · {data.routingProvenance.currentDecisionStore.count} records</strong></div></div>
      <div className="model-detail"><span>Boundary</span><strong>{data.routingProvenance.currentDecisionStore.detail}</strong></div>
    </article></div> : <div className="models-grid">{visibleCapabilities.length ? visibleCapabilities.map((entry) => <article className="panel model-card" key={entry.stageId}>
      <div className="model-card-head"><div className="model-icon"><LockKeyhole size={19}/></div><span className="model-running">{entry.status}</span></div>
      <h2>{entry.stageId} · {entry.name}</h2>
      <div className="model-detail"><span>Authority class</span><strong>{entry.authority}</strong></div>
      <div className="model-detail"><span>Capabilities</span><strong>{entry.capabilities.join(" · ") || "none projected"}</strong></div>
      <div className="model-detail"><span>Projects</span><strong>{entry.projects.join(" · ") || "none projected"}</strong></div>
      <div className="model-unknown"><CircleHelp size={14}/><div><span>Activation rule</span><strong>{entry.activationRule || "not projected"}</strong></div></div>
    </article>) : <div className="panel agents-empty"><Search size={18}/><strong>No capability stages match</strong><span>Change the search text.</span></div>}</div>}
  </section>;
}
