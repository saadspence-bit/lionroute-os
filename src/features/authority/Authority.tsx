import { useEffect, useMemo, useState } from "react";
import { Ban, Command, FileLock2, Filter, KeyRound, LockKeyhole, Search, ShieldCheck } from "lucide-react";
import type { AuthorityRule, TelemetrySnapshot } from "../../types";
import { filterAuthorityRules, summarizeAuthority, type AuthorityStateFilter } from "./model";

const stateFilters: Array<{ value: AuthorityStateFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "allowed", label: "Allowed" },
  { value: "forbidden", label: "Forbidden" },
  { value: "required", label: "Requires authority" },
];

function RuleIcon({ state }: { state: AuthorityRule["state"] }) {
  if (state === "allowed") return <ShieldCheck size={17}/>;
  if (state === "forbidden") return <LockKeyhole size={17}/>;
  return <Command size={17}/>;
}

function RuleState({ state }: { state: AuthorityRule["state"] }) {
  return <span className={`authority-state authority-state-${state}`}><span/>{state}</span>;
}

function PolicyCeiling({ data }: { data: TelemetrySnapshot }) {
  const policy = data.icmController;
  return <section className="panel authority-policy">
    <div className="authority-policy-head"><div className="authority-policy-icon"><FileLock2 size={18}/></div><div><span className="eyebrow">PROJECTED ICM POLICY CEILING</span><h2>{policy.writeAuthorityMode}</h2><small>{policy.controllerSchema} · {policy.controllerVersion}</small></div></div>
    <div className="authority-policy-grid">
      <div><span>Real model dispatch</span><strong>{policy.realModelDispatch ? "allowed by policy" : "not allowed by policy"}</strong></div>
      <div><span>Provider calls allowed</span><strong>{policy.providerCallsAllowed}</strong></div>
      <div><span>Reviewer live read</span><strong>{policy.reviewerLiveReadAllowed ? "allowed" : "not allowed"}</strong></div>
      <div><span>Fable bulk work</span><strong>{policy.fableBulkWorkAllowed ? "allowed" : "not allowed"}</strong></div>
    </div>
    <div className="authority-claims"><span className="eyebrow">CLAIM BOUNDARY</span><div><span className={policy.claimBoundary.cooperativeLocalWorkers ? "claim-yes" : "claim-no"}>cooperative local workers</span><span className={policy.claimBoundary.hostileSameUserWorkers ? "claim-yes" : "claim-no"}>hostile same-user workers</span><span className={policy.claimBoundary.untrustedRealModelWorkers ? "claim-yes" : "claim-no"}>untrusted real-model workers</span></div></div>
    <div className="authority-policy-note"><Ban size={13}/><span>This is a projected policy ceiling, not activation evidence. The UI cannot turn a policy allowance into executable authority.</span></div>
  </section>;
}

function RuleDetail({ rule }: { rule: AuthorityRule }) {
  return <aside className={`panel authority-detail authority-detail-${rule.state}`}>
    <div className="authority-detail-head"><div><span className="eyebrow">SELECTED RULE</span><h2>{rule.label}</h2></div><RuleState state={rule.state}/></div>
    <div className="authority-detail-icon"><RuleIcon state={rule.state}/></div>
    <div className="authority-scope"><span>Projected scope</span><code>{rule.scope}</code></div>
    <p>{rule.detail}</p>
    <dl><div><dt>Rule state</dt><dd>{rule.state}</dd></div><div><dt>Source</dt><dd>{rule.source}</dd></div><div><dt>Reference</dt><dd className="mono">{rule.id}</dd></div></dl>
    <div className="authority-detail-note"><KeyRound size={13}/><span>Displayed rule state is observer metadata. `required` means authority remains unresolved outside this UI; it is not an approval button or pending action queue.</span></div>
  </aside>;
}

export default function Authority({ data }: { data: TelemetrySnapshot }) {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<AuthorityStateFilter>("all");
  const [selectedId, setSelectedId] = useState("");
  const summary = useMemo(() => summarizeAuthority(data.authority), [data.authority]);
  const visible = useMemo(() => filterAuthorityRules(data.authority, query, state), [data.authority, query, state]);
  const selected = visible.find((rule) => rule.id === selectedId) ?? visible[0];

  useEffect(() => {
    if (!selected || selected.id === selectedId) return;
    setSelectedId(selected.id);
  }, [selected, selectedId]);

  return <section className="screen-section authority-screen">
    <div className="section-title authority-title"><div><span className="eyebrow">BOUNDARIES & POLICY</span><h1>Authority</h1><p>Inspect projected rules, explicit prohibitions, unresolved authority requirements, and the ICM policy ceiling without turning observation into control.</p></div><div className="authority-mode"><ShieldCheck size={14}/>observer boundary</div></div>

    <section className="authority-metrics">
      <div className="panel project-metric"><ShieldCheck size={17}/><div><strong>{summary.allowed}</strong><span>allowed rules</span></div></div>
      <div className="panel project-metric authority-metric-forbidden"><LockKeyhole size={17}/><div><strong>{summary.forbidden}</strong><span>forbidden rules</span></div></div>
      <div className="panel project-metric authority-metric-required"><Command size={17}/><div><strong>{summary.required}</strong><span>requires authority</span></div></div>
      <div className="panel project-metric"><FileLock2 size={17}/><div><strong>{summary.sourceCount}</strong><span>projected sources</span></div></div>
    </section>

    <PolicyCeiling data={data}/>

    <div className="authority-toolbar panel"><label className="operations-search"><Search size={15}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search rule, scope, source, boundary…" /></label><div className="authority-filters" aria-label="Authority state filters"><Filter size={14}/>{stateFilters.map((option) => <button type="button" key={option.value} className={state === option.value ? "active" : ""} onClick={() => setState(option.value)}>{option.label}</button>)}</div></div>

    <div className="authority-layout">
      <section className="panel authority-list"><div className="authority-list-head"><span>Rule</span><span>State</span><span>Source</span></div>{visible.length ? visible.map((rule) => <button type="button" className={`authority-row authority-row-${rule.state} ${selected?.id === rule.id ? "selected" : ""}`} key={rule.id} onClick={() => setSelectedId(rule.id)}><span className="authority-row-icon"><RuleIcon state={rule.state}/></span><span className="authority-row-copy"><strong>{rule.label}</strong><code>{rule.scope}</code><small>{rule.detail}</small></span><RuleState state={rule.state}/><span className="authority-row-source">{rule.source}</span></button>) : <div className="operations-empty"><Search size={18}/><strong>No authority rules match</strong><span>Change the state filter or search text.</span></div>}</section>
      {selected ? <RuleDetail rule={selected}/> : <aside className="panel authority-detail map-detail-empty"><ShieldCheck size={22}/><strong>No rule selected</strong><span>Choose a visible rule to inspect its projected authority boundary.</span></aside>}
    </div>
  </section>;
}
