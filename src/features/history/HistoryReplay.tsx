import { useMemo, useState } from "react";
import { Activity, ArrowLeft, ArrowRight, FileCheck2, History, Search, ShieldCheck } from "lucide-react";
import type { TelemetrySnapshot } from "../../types";
import { buildHistoryEvents, filterHistoryEvents, replaySummary, type HistoryEvent, type HistoryEventKind } from "./model";

type HistoryFilter = HistoryEventKind | "all";

const filters: Array<{ value: HistoryFilter; label: string }> = [
  { value: "all", label: "All records" },
  { value: "operation", label: "Operations" },
  { value: "trace", label: "Trace" },
  { value: "evidence", label: "Evidence" },
  { value: "state", label: "State" },
];

function safeDateTime(value: string): string {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? new Date(parsed).toLocaleString() : "Unknown time";
}

function HistoryStatus({ status }: { status?: HistoryEvent["status"] }) {
  if (!status) return null;
  return <span className={`status status-${status}`}><span className="status-dot" />{status}</span>;
}

function EventIcon({ kind }: { kind: HistoryEventKind }) {
  if (kind === "evidence") return <FileCheck2 size={15}/>;
  if (kind === "state") return <ShieldCheck size={15}/>;
  if (kind === "operation") return <Activity size={15}/>;
  return <History size={15}/>;
}

export default function HistoryReplay({ data, onOpenOperation }: { data: TelemetrySnapshot; onOpenOperation: (operationId: string) => void }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const events = useMemo(() => buildHistoryEvents(data), [data]);
  const visibleEvents = useMemo(() => filterHistoryEvents(events, query, filter), [events, query, filter]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const selectedEvent = visibleEvents.find((event) => event.id === selectedEventId) ?? visibleEvents.at(-1);
  const selectedFullIndex = selectedEvent ? events.findIndex((event) => event.id === selectedEvent.id) : -1;
  const summary = replaySummary(events, selectedEvent?.id ?? "");
  const referencedEvidence = selectedEvent?.evidenceRefs.map((id) => ({ id, item: data.evidence.find((evidence) => evidence.id === id) })) ?? [];

  const moveCursor = (delta: number) => {
    if (!selectedEvent || !visibleEvents.length) return;
    const visibleIndex = visibleEvents.findIndex((event) => event.id === selectedEvent.id);
    const next = visibleEvents[Math.min(visibleEvents.length - 1, Math.max(0, visibleIndex + delta))];
    if (next) setSelectedEventId(next.id);
  };

  return <section className="screen-section history-screen">
    <div className="section-title history-title"><div><span className="eyebrow">FORENSIC PROJECTION</span><h1>History / Replay</h1><p>Step through timestamped records already present in the observer snapshot. Replay here is inspection only — it never re-executes work or claims canonical historical state.</p></div><div className="replay-mode"><History size={15}/><span>Projection replay</span></div></div>

    <div className="history-notice panel"><ShieldCheck size={17}/><div><strong>Read-only replay boundary</strong><span>This sequence is derived from the current observer snapshot. Exact canonical historical reconstruction requires an immutable Core history contract and is not inferred by this UI.</span></div></div>

    <div className="history-toolbar panel">
      <label className="operations-search"><Search size={15}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search history, traces, evidence, stages…" /></label>
      <div className="history-filters" aria-label="History record filters">{filters.map((option) => <button type="button" key={option.value} className={filter === option.value ? "active" : ""} onClick={() => setFilter(option.value)}>{option.label}</button>)}</div>
    </div>

    <section className="replay-strip panel">
      <div><span className="eyebrow">REPLAY CURSOR</span><strong>{summary.position} / {summary.total}</strong></div>
      <div className="replay-stats"><span>{summary.operationsObserved} operations</span><span>{summary.traceEventsObserved} trace records</span><span>{summary.evidenceObserved} evidence</span><span>{summary.stateEventsObserved} state projection</span></div>
      <div className="replay-controls"><button type="button" onClick={() => moveCursor(-1)} disabled={!selectedEvent || visibleEvents.indexOf(selectedEvent) <= 0} aria-label="Previous replay record"><ArrowLeft size={15}/></button><button type="button" onClick={() => moveCursor(1)} disabled={!selectedEvent || visibleEvents.indexOf(selectedEvent) >= visibleEvents.length - 1} aria-label="Next replay record"><ArrowRight size={15}/></button></div>
    </section>

    <div className="history-layout">
      <section className="panel history-timeline">
        <div className="history-timeline-head"><span>Projected sequence</span><strong>{visibleEvents.length} visible</strong></div>
        <div className="history-events">{visibleEvents.length ? visibleEvents.map((event) => <button type="button" key={event.id} className={`history-event ${selectedEvent?.id === event.id ? "selected" : ""}`} onClick={() => setSelectedEventId(event.id)}>
          <span className={`history-event-icon history-${event.kind}`}><EventIcon kind={event.kind}/></span>
          <span className="history-event-copy"><span className="history-event-top"><strong>{event.title}</strong><HistoryStatus status={event.status}/></span><small>{event.description}</small><span className="history-event-meta"><span>{safeDateTime(event.timestamp)}</span><span>{event.kind}</span><span>{event.source}</span></span></span>
        </button>) : <div className="operations-empty"><Search size={18}/><strong>No history records match</strong><span>Change the record filter or search text.</span></div>}</div>
      </section>

      <aside className="panel history-detail">
        {selectedEvent ? <>
          <div className="history-detail-head"><div><span className="eyebrow">REPLAY RECORD</span><h2>{selectedEvent.title}</h2></div><HistoryStatus status={selectedEvent.status}/></div>
          <p>{selectedEvent.description}</p>
          <dl className="detail-grid"><div><dt>Time</dt><dd>{safeDateTime(selectedEvent.timestamp)}</dd></div><div><dt>Kind</dt><dd>{selectedEvent.kind}</dd></div><div><dt>Source</dt><dd>{selectedEvent.source}</dd></div><div><dt>Sequence</dt><dd>{selectedFullIndex >= 0 ? selectedFullIndex + 1 : "Unknown"} / {events.length}</dd></div>{selectedEvent.stage && <div><dt>Stage</dt><dd className="mono">{selectedEvent.stage}</dd></div>}{selectedEvent.actor && <div><dt>Actor</dt><dd>{selectedEvent.actor}</dd></div>}{selectedEvent.traceId && <div><dt>Trace</dt><dd className="mono">{selectedEvent.traceId}</dd></div>}</dl>
          {selectedEvent.operationId && <button type="button" className="open-operation" onClick={() => onOpenOperation(selectedEvent.operationId!)}><Activity size={14}/>Open operation</button>}
          <div className="history-evidence"><span className="eyebrow">EVIDENCE AT RECORD</span>{referencedEvidence.length ? referencedEvidence.map(({ id, item }) => item ? <div className="trace-evidence-item" key={id}><FileCheck2 size={14}/><div><strong>{item.title}</strong><small>{item.result} · {item.status}</small></div></div> : <div className="trace-evidence-item missing" key={id}><FileCheck2 size={14}/><div><strong>Unresolved evidence reference</strong><small className="mono">{id}</small></div></div>) : <small>No evidence reference attached to this record.</small>}</div>
        </> : <div className="history-detail-empty"><History size={22}/><strong>No replay record selected</strong><span>Choose a visible record to inspect its projected context.</span></div>}
      </aside>
    </div>
  </section>;
}
