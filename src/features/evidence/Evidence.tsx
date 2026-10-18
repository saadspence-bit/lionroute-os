import { useEffect, useMemo, useState } from "react";
import { Database, FileCheck2, Filter, Search, ShieldCheck, TimerReset } from "lucide-react";
import type { EvidenceItem, TelemetrySnapshot } from "../../types";
import { filterEvidence, summarizeEvidence, type EvidenceKindFilter, type EvidenceStatusFilter } from "./model";

const kindFilters: Array<{ value: EvidenceKindFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "test", label: "Tests" },
  { value: "review", label: "Reviews" },
  { value: "receipt", label: "Receipts" },
  { value: "hash", label: "Hashes" },
  { value: "artifact", label: "Artifacts" },
];

function EvidenceStatus({ status }: { status: EvidenceItem["status"] }) {
  return <span className={`status status-${status}`}><span className="status-dot" />{status}</span>;
}

function formatRecorded(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? new Date(parsed).toLocaleString() : "Unknown recorded time";
}

function EvidenceDetail({ item }: { item: EvidenceItem }) {
  return <aside className="panel evidence-detail evidence-detail-v12">
    <div className="inspector-head"><span className="eyebrow">SELECTED PROOF</span><EvidenceStatus status={item.status}/></div>
    <div className={`evidence-icon large ev-${item.kind}`}><FileCheck2 size={22}/></div>
    <h2>{item.title}</h2>
    <strong className="detail-result">{item.result}</strong>
    <p>{item.detail}</p>
    <dl><div><dt>Evidence kind</dt><dd>{item.kind}</dd></div><div><dt>Source</dt><dd>{item.source}</dd></div><div><dt>Recorded</dt><dd>{formatRecorded(item.recordedAt)}</dd></div><div><dt>Reference</dt><dd className="mono">{item.id}</dd></div></dl>
    <div className="evidence-boundary"><TimerReset size={13}/><span>Evidence is provenance recorded at a point in time. A verified record does not by itself prove that current runtime state is still fresh.</span></div>
  </aside>;
}

export default function Evidence({ data }: { data: TelemetrySnapshot }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<EvidenceKindFilter>("all");
  const [status, setStatus] = useState<EvidenceStatusFilter>("all");
  const [selectedId, setSelectedId] = useState("");
  const summary = useMemo(() => summarizeEvidence(data.evidence), [data.evidence]);
  const visible = useMemo(() => filterEvidence(data.evidence, query, kind, status), [data.evidence, query, kind, status]);
  const selected = visible.find((item) => item.id === selectedId) ?? visible[0];

  useEffect(() => {
    if (!selected || selected.id === selectedId) return;
    setSelectedId(selected.id);
  }, [selected, selectedId]);

  return <section className="screen-section evidence-screen">
    <div className="section-title evidence-title"><div><span className="eyebrow">PROVENANCE & PROOF</span><h1>Evidence</h1><p>Inspect projected receipts, reviews, tests, hashes, and artifacts while preserving when and where each proof record was observed.</p></div><div className="evidence-mode"><FileCheck2 size={14}/>observer proof</div></div>

    <section className="evidence-metrics">
      <div className="panel project-metric"><FileCheck2 size={17}/><div><strong>{summary.total}</strong><span>projected records</span></div></div>
      <div className="panel project-metric"><ShieldCheck size={17}/><div><strong>{summary.verified}</strong><span>verified records</span></div></div>
      <div className="panel project-metric"><TimerReset size={17}/><div><strong>{summary.pending}</strong><span>pending records</span></div></div>
      <div className="panel project-metric"><Database size={17}/><div><strong>{summary.sourceCount}</strong><span>projected sources</span></div></div>
    </section>

    <div className="evidence-notice panel"><TimerReset size={16}/><div><strong>Recorded proof, not live-state authority</strong><span>Evidence status describes the projected artifact record. Current operational truth still comes from the relevant freshness-gated observer surface.</span></div></div>

    <div className="evidence-toolbar panel">
      <label className="operations-search"><Search size={15}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search proof, result, source, reference…" /></label>
      <div className="evidence-kind-filters" aria-label="Evidence kind filters"><Filter size={14}/>{kindFilters.map((option) => <button type="button" key={option.value} className={kind === option.value ? "active" : ""} onClick={() => setKind(option.value)}>{option.label}</button>)}</div>
      <label className="evidence-status-select"><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value as EvidenceStatusFilter)}><option value="all">All statuses</option><option value="verified">Verified</option><option value="recorded">Recorded</option><option value="pending">Pending</option></select></label>
    </div>

    <div className="evidence-browser evidence-browser-v12">
      <div className="evidence-list">{visible.length ? visible.map((item) => <button type="button" className={`panel evidence-row ${selected?.id === item.id ? "selected" : ""}`} key={item.id} onClick={() => setSelectedId(item.id)}><div className={`evidence-icon ev-${item.kind}`}><FileCheck2 size={17}/></div><div><div className="evidence-title-row"><strong>{item.title}</strong><EvidenceStatus status={item.status}/></div><p>{item.detail}</p><div className="trace-meta"><span>{item.kind}</span><span>{item.source}</span><span>{formatRecorded(item.recordedAt)}</span><span className="mono">{item.id}</span></div></div><strong className="evidence-result">{item.result}</strong></button>) : <div className="panel operations-empty evidence-empty"><Search size={18}/><strong>No evidence matches</strong><span>Change the kind/status filters or search text.</span></div>}</div>
      {selected ? <EvidenceDetail item={selected}/> : <aside className="panel evidence-detail map-detail-empty"><FileCheck2 size={22}/><strong>No proof selected</strong><span>Choose a visible evidence record to inspect its projected provenance.</span></aside>}
    </div>
  </section>;
}
