import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  ChevronRight,
  Clock3,
  FileCheck2,
  Filter,
  Search,
  TimerReset,
} from "lucide-react";
import type { EvidenceItem, Operation, OperationStatus, TraceStep } from "../../types";
import {
  filterOperations,
  formatDuration,
  operationDurationMs,
  selectVisibleOperation,
  traceChildren,
  type OperationFilter,
} from "./model";

const filters: Array<{ value: OperationFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "running", label: "Running" },
  { value: "waiting", label: "Waiting" },
  { value: "failed", label: "Failed" },
  { value: "passed", label: "Passed" },
];

function Status({ status }: { status: OperationStatus }) {
  return <span className={`status status-${status}`}><span className="status-dot" />{status}</span>;
}

function TraceBranch({
  step,
  childrenByParent,
  depth,
  selectedSpanId,
  onSelect,
}: {
  step: TraceStep;
  childrenByParent: Map<string, TraceStep[]>;
  depth: number;
  selectedSpanId: string;
  onSelect: (step: TraceStep) => void;
}): ReactNode {
  const children = childrenByParent.get(step.spanId) ?? [];
  const progress = step.progressTotal
    ? Math.round(((step.progressCurrent ?? 0) / step.progressTotal) * 100)
    : undefined;

  return <div className="trace-tree-branch" key={step.spanId}>
    <button
      type="button"
      className={`trace-tree-row ${selectedSpanId === step.spanId ? "selected" : ""}`}
      style={{ paddingLeft: `${14 + depth * 22}px` }}
      onClick={() => onSelect(step)}
    >
      <span className={`trace-node trace-${step.status}`} />
      <span className="trace-tree-copy">
        <strong>{step.step}</strong>
        <small>{step.actor}{step.tool ? ` · ${step.tool}` : ""}{step.model ? ` · ${step.model}` : ""}</small>
      </span>
      {progress !== undefined && <span className="trace-progress-label">{progress}%</span>}
      <Status status={step.status} />
      <ChevronRight size={14} />
    </button>
    {children.map((child) => <TraceBranch key={child.spanId} step={child} childrenByParent={childrenByParent} depth={depth + 1} selectedSpanId={selectedSpanId} onSelect={onSelect} />)}
  </div>;
}

function StepInspector({ step, evidence }: { step?: TraceStep; evidence: EvidenceItem[] }) {
  if (!step) {
    return <aside className="panel trace-step-detail empty"><Activity size={20}/><strong>Select a trace step</strong><span>Inspect timing, actor, progress, result, and evidence references.</span></aside>;
  }

  return <aside className="panel trace-step-detail">
    <div className="trace-detail-head"><div><span className="eyebrow">STEP DETAIL</span><h2>{step.step}</h2></div><Status status={step.status}/></div>
    <p>{step.message}</p>
    <dl className="detail-grid">
      <div><dt>Event</dt><dd className="mono">{step.eventName}</dd></div>
      <div><dt>Actor</dt><dd>{step.actor}</dd></div>
      <div><dt>Started</dt><dd>{new Date(step.startedAt).toLocaleTimeString()}</dd></div>
      <div><dt>Duration</dt><dd>{step.durationMs !== undefined ? formatDuration(step.durationMs) : step.status === "running" ? "In progress" : "Not projected"}</dd></div>
      {step.model && <div><dt>Model</dt><dd>{step.model}</dd></div>}
      {step.tool && <div><dt>Tool</dt><dd>{step.tool}</dd></div>}
      {step.result && <div><dt>Result</dt><dd>{step.result}</dd></div>}
      {step.progressTotal !== undefined && <div><dt>Progress</dt><dd>{step.progressCurrent ?? 0} / {step.progressTotal}</dd></div>}
    </dl>
    <div className="trace-evidence"><span className="eyebrow">EVIDENCE REFERENCES</span>{step.evidenceRefs.length ? step.evidenceRefs.map((reference) => {
      const item = evidence.find((candidate) => candidate.id === reference);
      return item
        ? <div className="trace-evidence-item" key={reference}><FileCheck2 size={14}/><div><strong>{item.title}</strong><small>{item.result} · {item.status}</small></div></div>
        : <div className="trace-evidence-item missing" key={reference}><FileCheck2 size={14}/><div><strong>Unresolved evidence reference</strong><small className="mono">{reference}</small></div></div>;
    }) : <small>No evidence references recorded for this step.</small>}</div>
  </aside>;
}

export default function Operations({
  operations,
  evidence,
  selectedOperationId,
  onSelectOperation,
}: {
  operations: Operation[];
  evidence: EvidenceItem[];
  selectedOperationId: string;
  onSelectOperation: (operationId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<OperationFilter>("all");
  const [selectedSpanId, setSelectedSpanId] = useState("");
  const visibleOperations = useMemo(() => filterOperations(operations, query, filter), [operations, query, filter]);
  const selectedOperation = selectVisibleOperation(visibleOperations, selectedOperationId);
  const childrenByParent = useMemo(() => traceChildren(selectedOperation?.steps ?? []), [selectedOperation]);
  const selectedStep = selectedOperation?.steps.find((step) => step.spanId === selectedSpanId) ?? selectedOperation?.steps.find((step) => step.status === "running") ?? selectedOperation?.steps[0];

  useEffect(() => {
    if (!selectedOperation || selectedOperation.id === selectedOperationId) return;
    onSelectOperation(selectedOperation.id);
    setSelectedSpanId("");
  }, [onSelectOperation, selectedOperation, selectedOperationId]);

  const chooseOperation = (operationId: string) => {
    onSelectOperation(operationId);
    setSelectedSpanId("");
  };

  return <section className="screen-section operations-screen">
    <div className="section-title operations-title"><div><span className="eyebrow">RUN HISTORY</span><h1>Operations</h1><p>Inspect active and historical LionRoute runs, then drill into the exact nested execution trace and recorded proof.</p></div><div className="operation-count"><strong>{operations.length}</strong><span>projected runs</span></div></div>

    <div className="operations-toolbar panel">
      <label className="operations-search"><Search size={15}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search runs, stages, models, traces…" /></label>
      <div className="operations-filters" aria-label="Operation status filters"><Filter size={14}/>{filters.map((option) => <button type="button" key={option.value} className={filter === option.value ? "active" : ""} onClick={() => setFilter(option.value)}>{option.label}</button>)}</div>
    </div>

    <div className="operations-layout">
      <div className="panel operations-list">
        <div className="operations-list-head"><span>Operation</span><span>Status</span><span>Progress</span><span>Duration</span></div>
        {visibleOperations.length ? visibleOperations.map((operation) => {
          const percent = operation.progressTotal > 0 ? Math.round((operation.progressCurrent / operation.progressTotal) * 100) : undefined;
          return <button type="button" className={`operation-row ${selectedOperation?.id === operation.id ? "selected" : ""}`} key={operation.id} onClick={() => chooseOperation(operation.id)}>
            <span className="operation-primary"><strong>{operation.name}</strong><small>{operation.project} · {operation.workstream}</small><code>{operation.stage}</code></span>
            <Status status={operation.status}/>
            <span className="operation-progress-cell">{percent === undefined ? <span>unknown</span> : <><span>{percent}%</span><span className="progress"><span style={{ width: `${percent}%` }}/></span></>}</span>
            <span className="operation-duration"><Clock3 size={13}/>{formatDuration(operationDurationMs(operation))}</span>
          </button>;
        }) : <div className="operations-empty"><Search size={18}/><strong>No operations match</strong><span>Change the status filter or search text.</span></div>}
      </div>

      {selectedOperation && <div className="operation-workspace">
        <section className="panel operation-overview">
          <div className="operation-overview-head"><div><span className="eyebrow">SELECTED RUN</span><h2>{selectedOperation.name}</h2><p>{selectedOperation.summary}</p></div><Status status={selectedOperation.status}/></div>
          <div className="operation-facts"><div><span>Trace</span><code>{selectedOperation.traceId}</code></div><div><span>Actor</span><strong>{selectedOperation.actor}</strong><small>{selectedOperation.model}</small></div><div><span>Started</span><strong>{new Date(selectedOperation.startedAt).toLocaleString()}</strong></div><div><span>Next action</span><strong>{selectedOperation.nextAction}</strong></div></div>
        </section>

        <div className="trace-workspace">
          <section className="panel trace-tree-panel">
            <div className="panel-head"><div><span className="eyebrow">LIVE TRACE</span><h2>Nested execution</h2></div><span className="trace-count"><TimerReset size={13}/>{selectedOperation.steps.length} steps</span></div>
            <div className="trace-tree">{(childrenByParent.get("__root__") ?? []).map((step) => <TraceBranch key={step.spanId} step={step} childrenByParent={childrenByParent} depth={0} selectedSpanId={selectedStep?.spanId ?? ""} onSelect={(selected) => setSelectedSpanId(selected.spanId)} />)}</div>
          </section>
          <StepInspector step={selectedStep} evidence={evidence}/>
        </div>
      </div>}
    </div>
  </section>;
}
