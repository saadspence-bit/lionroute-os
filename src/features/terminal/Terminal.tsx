import { Activity, LockKeyhole, Search, TerminalSquare } from "lucide-react";
import { useMemo, useState } from "react";
import type { TelemetrySnapshot } from "../../types";
import { buildTerminalRecords, filterTerminalRecords } from "./model";

function safeTime(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? new Date(parsed).toLocaleTimeString() : "--:--:--";
}

export default function Terminal({ data, onOpenOperation }: { data: TelemetrySnapshot; onOpenOperation: (operationId: string) => void }) {
  const [query, setQuery] = useState("");
  const [operationId, setOperationId] = useState("all");
  const records = useMemo(() => buildTerminalRecords(data), [data]);
  const visibleRecords = useMemo(() => filterTerminalRecords(records, query, operationId), [records, query, operationId]);

  return <section className="screen-section terminal-screen">
    <div className="section-title terminal-title"><div><span className="eyebrow">EXECUTION STREAM</span><h1>Terminal</h1><p>Structured read-only operation events rendered as a console. This is not a shell and cannot execute commands.</p></div><div className="terminal-mode"><LockKeyhole size={14}/>read-only</div></div>
    <div className="terminal-boundary panel"><TerminalSquare size={17}/><div><strong>Direct command execution disabled</strong><span>Lines below are projections of structured trace records. No terminal prose is scraped and no input path is connected to LionRoute runtime authority.</span></div></div>
    <div className="terminal-toolbar panel"><label className="operations-search"><Search size={15}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search messages, actors, tools, stages…"/></label><label className="terminal-select"><span>Operation</span><select value={operationId} onChange={(event) => setOperationId(event.target.value)}><option value="all">All projected operations</option>{data.operations.map((operation) => <option key={operation.id} value={operation.id}>{operation.name}</option>)}</select></label></div>
    <section className="panel terminal-console" aria-label="Read-only execution stream">
      <div className="terminal-console-head"><div><span className="terminal-dot"/><span className="terminal-dot"/><span className="terminal-dot"/></div><span>{visibleRecords.length} / {records.length} records</span></div>
      <div className="terminal-lines">{visibleRecords.length ? visibleRecords.map((record) => <div className={`terminal-line terminal-${record.status}`} key={record.id}>
        <span className="terminal-time">{safeTime(record.timestamp)}</span>
        <button type="button" className="terminal-context" onClick={() => onOpenOperation(record.operationId)} title="Open operation"><Activity size={12}/>{record.workstream}</button>
        <span className="terminal-prompt">[{record.actor}{record.tool ? `:${record.tool}` : record.model ? `:${record.model}` : ""}]</span>
        <span className="terminal-message"><b>{record.step}</b> — {record.message}{record.result ? <strong> · {record.result}</strong> : null}</span>
        <span className="terminal-status">{record.status}</span>
      </div>) : <div className="terminal-empty"><Search size={18}/><strong>No execution records match</strong><span>Change the operation filter or search text.</span></div>}</div>
    </section>
  </section>;
}
