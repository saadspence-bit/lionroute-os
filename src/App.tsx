import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Activity,
  Boxes,
  Compass,
  FileCheck2,
  Gauge,
  GitBranch,
  History,
  ListTree,
  Menu,
  Bot,
  FolderKanban,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Workflow,
  X,
} from "lucide-react";
import { Command as CommandMenu } from "cmdk";
import { useTelemetry, type TelemetrySource } from "./data/source";
import { summarizeControlPlane } from "./data/derive";
import type { Operation, OperationStatus, TelemetrySnapshot, TraceStep } from "./types";
import OperationalPosture from "./features/command-center/OperationalPosture";
import { COMPACT_NAVIGATION_QUERY, drawerFocusWrap } from "./features/navigation/model";

const SystemMap = lazy(() => import("./features/system-map/SystemMap"));
const Operations = lazy(() => import("./features/operations/Operations"));
const HistoryReplay = lazy(() => import("./features/history/HistoryReplay"));
const Projects = lazy(() => import("./features/projects/Projects"));
const AgentsModels = lazy(() => import("./features/agents/AgentsModels"));
const Workstreams = lazy(() => import("./features/workstreams/Workstreams"));
const Evidence = lazy(() => import("./features/evidence/Evidence"));
const Authority = lazy(() => import("./features/authority/Authority"));
const Terminal = lazy(() => import("./features/terminal/Terminal"));
const SettingsPlugins = lazy(() => import("./features/settings/SettingsPlugins"));
const DemoTour = lazy(() => import("./features/demo-tour/DemoTour"));

type View = "command" | "tour" | "operations" | "history" | "projects" | "agents" | "workstreams" | "system" | "evidence" | "authority" | "terminal" | "settings";

const nav: Array<{ id: View; label: string; icon: typeof Gauge }> = [
  { id: "command", label: "Command Center", icon: Gauge },
  { id: "tour", label: "Guided Demo", icon: Compass },
  { id: "operations", label: "Operations", icon: ListTree },
  { id: "history", label: "History / Replay", icon: History },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "agents", label: "Agents & Models", icon: Bot },
  { id: "workstreams", label: "Workstreams", icon: Workflow },
  { id: "system", label: "System Map", icon: GitBranch },
  { id: "evidence", label: "Evidence", icon: FileCheck2 },
  { id: "authority", label: "Authority", icon: ShieldCheck },
  { id: "terminal", label: "Terminal", icon: TerminalSquare },
  { id: "settings", label: "Settings / Plugins", icon: Settings2 },
];

function statusClass(status: OperationStatus | "verified" | "recorded" | "pending") {
  return `status status-${status}`;
}

function StatusPill({ status, label }: { status: OperationStatus | "verified" | "recorded" | "pending"; label?: string }) {
  return <span className={statusClass(status)}><span className="status-dot" />{label ?? status}</span>;
}

function freshnessStatus(state: TelemetrySnapshot["currentState"], degraded = false): OperationStatus {
  if (degraded) return "waiting";
  if (state.currentStateStatus === "CURRENT" && state.freshness === "FRESH") return "passed";
  if (state.currentStateStatus === "STALE" || state.freshness === "STALE") return "waiting";
  return "idle";
}

function SourceChip({
  source,
  isFetching,
  degraded,
  updatedAt,
}: {
  source: TelemetrySource;
  isFetching: boolean;
  degraded: boolean;
  updatedAt: number;
}) {
  const state = degraded ? "degraded" : isFetching ? "refreshing" : source.mode;
  const label = degraded
    ? "TELEMETRY DEGRADED"
    : isFetching
      ? "REFRESHING"
      : source.mode === "gateway"
        ? "LIVE GATEWAY"
        : source.mode === "mock"
          ? "MOCK DATA"
          : "CONFIG ERROR";
  const lastUpdated = updatedAt ? new Date(updatedAt).toLocaleTimeString() : "not loaded";
  return <div className={`source-chip source-${state}`} title={`${source.label} · last update ${lastUpdated}`}><span />{label}</div>;
}

function Metric({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

function TraceRow({ step, depth = 0 }: { step: TraceStep; depth?: number }) {
  const progress = step.progressTotal ? Math.round(((step.progressCurrent ?? 0) / step.progressTotal) * 100) : undefined;
  return (
    <div className="trace-row" style={{ paddingLeft: `${16 + depth * 22}px` }}>
      <div className="trace-rail"><span className={`trace-node trace-${step.status}`} /></div>
      <div className="trace-main">
        <div className="trace-title"><strong>{step.step}</strong><StatusPill status={step.status} /></div>
        <p>{step.message}</p>
        <div className="trace-meta"><span>{step.actor}</span>{step.model && <span>{step.model}</span>}{step.tool && <span>{step.tool}</span>}{step.durationMs && <span>{(step.durationMs / 1000).toFixed(1)}s</span>}</div>
        {progress !== undefined && <div className="progress"><span style={{ width: `${progress}%` }} /></div>}
      </div>
    </div>
  );
}

function LiveTrace({ operation }: { operation: Operation }) {
  const childrenByParent = operation.steps.reduce<Map<string, TraceStep[]>>((index, step) => {
    const key = step.parentSpanId ?? "__root__";
    const existing = index.get(key) ?? [];
    existing.push(step);
    index.set(key, existing);
    return index;
  }, new Map());

  const renderBranch = (step: TraceStep, depth: number): ReactNode => (
    <div key={step.spanId}>
      <TraceRow step={step} depth={depth} />
      {(childrenByParent.get(step.spanId) ?? []).map((child) => renderBranch(child, depth + 1))}
    </div>
  );

  const roots = childrenByParent.get("__root__") ?? [];
  return (
    <section className="panel trace-panel">
      <div className="panel-head"><div><span className="eyebrow">LIVE TRACE</span><h2>Execution timeline</h2></div><span className="mono">{operation.traceId}</span></div>
      <div className="trace-list">
        {roots.map((root) => renderBranch(root, 0))}
      </div>
    </section>
  );
}

function Inspector({ operation }: { operation: Operation }) {
  return (
    <aside className="inspector">
      <div className="inspector-head"><span className="eyebrow">OPERATION</span><StatusPill status={operation.status} /></div>
      <h2>{operation.name}</h2><p>{operation.summary}</p>
      <div className="inspector-block"><span>Current stage</span><strong className="mono">{operation.stage}</strong></div>
      <div className="inspector-block"><span>Actor / model</span><strong>{operation.actor}</strong><small>{operation.model}</small></div>
      <div className="inspector-block"><span>Next action</span><strong>{operation.nextAction}</strong></div>
      <div className="scope allowed"><span>Granted scope</span>{operation.authorityScope.map((s) => <code key={s}>{s}</code>)}</div>
      <div className="scope forbidden"><span>Explicitly forbidden</span>{operation.forbiddenScope.map((s) => <code key={s}>{s}</code>)}</div>
    </aside>
  );
}

function CommandCenter({ data, operation, degraded, onNavigate }: { data: TelemetrySnapshot; operation: Operation; degraded: boolean; onNavigate: (view: View) => void }) {
  const summary = summarizeControlPlane(data.operations, data.workstreams);
  const percent = operation.progressTotal > 0 ? Math.round((operation.progressCurrent / operation.progressTotal) * 100) : undefined;
  const currentStep = operation.status === "running"
    ? [...operation.steps].reverse().find((step) => step.status === "running")?.step ?? "Running"
    : "Awaiting next event";
  return <>
    <section className="demo-tour-invite panel"><div><span className="eyebrow">NEW ? INTERACTIVE GUIDE</span><strong>See how the sample Control Plane works</strong><small>Five fictional, read-only stops through projects, runs, history, evidence, and architecture.</small></div><button type="button" onClick={() => onNavigate("tour")}>Start guided demo <Compass size={17}/></button></section>
    <section className="hero panel">
      <div className="hero-top"><div><div className="kicker"><Activity size={15} /> {operation.status === "running" ? "ACTIVE OPERATION" : "PROJECTED OPERATION"}</div><h1>{operation.name}</h1><p>{operation.summary}</p></div><StatusPill status={operation.status} label={percent === undefined ? "progress unknown" : `${percent}% complete`} /></div>
      {percent !== undefined && <div className="hero-progress"><span style={{ width: `${percent}%` }} /></div>}
      <div className="hero-grid"><div><span>Stage</span><strong className="mono">{operation.stage}</strong></div><div><span>Workstream</span><strong>{operation.workstream}</strong></div><div><span>Current step</span><strong>{currentStep}</strong></div><div><span>Authority</span><strong>{operation.authorityScope.length} granted · {operation.forbiddenScope.length} blocked</strong></div></div>
    </section>
    <section className="metrics-grid"><Metric label="Running operations" value={summary.runningOperations} detail="Across registered workstreams"/><Metric label="Active workstreams" value={summary.activeWorkstreams} detail="Concurrent registered sessions"/><Metric label="Heavy workloads" value={summary.heavyWorkloads} detail="Host resource guard active"/><Metric label="Advisory scope overlaps" value={summary.writeCollisions.length} detail={summary.writeCollisions.length ? summary.writeCollisions.join(", ") : "UI heuristic · none detected"}/></section>
    <section className="state-strip panel"><div><span className="eyebrow">CANONICAL STATE</span><strong>{data.currentState.activeStage}</strong><small>{data.currentState.authoritySource}</small></div><StatusPill status={freshnessStatus(data.currentState, degraded)} label={`${data.currentState.currentStateStatus} / ${data.currentState.freshness}${degraded ? " · LAST SNAPSHOT" : ""}`} /><div className="state-next"><span>Next safe action</span><code>{data.currentState.nextSafeAction}</code></div></section>
    <OperationalPosture data={data} degraded={degraded} onNavigate={onNavigate}/>
    <LiveTrace operation={operation} />
    <section className="panel mobile-authority-detail">
      <div className="panel-head"><div><span className="eyebrow">OPERATION AUTHORITY</span><h2>Exact projected scope</h2></div><StatusPill status={operation.status}/></div>
      <div className="mobile-authority-body"><div className="scope allowed"><span>Granted scope</span>{operation.authorityScope.map((scope) => <code key={scope}>{scope}</code>)}</div><div className="scope forbidden"><span>Explicitly forbidden</span>{operation.forbiddenScope.map((scope) => <code key={scope}>{scope}</code>)}</div></div>
    </section>
  </>;
}

function IdleCommandCenter({ data, degraded, onNavigate }: { data: TelemetrySnapshot; degraded: boolean; onNavigate: (view: View) => void }) {
  const summary = summarizeControlPlane(data.operations, data.workstreams);
  return <>
    <section className="demo-tour-invite panel"><div><span className="eyebrow">INTERACTIVE GUIDE</span><strong>Explore the synthetic Control Plane</strong><small>Five read-only walkthrough stops; no accounts or live systems required.</small></div><button type="button" onClick={() => onNavigate("tour")}>Start guided demo <Compass size={17}/></button></section>
    <section className="hero panel idle-hero">
      <div className="hero-top"><div><div className="kicker"><Activity size={15} /> OBSERVER STATUS</div><h1>No active operation</h1><p>The telemetry source is available and currently projects no operation records.</p></div><StatusPill status="idle" label="idle" /></div>
      <div className="hero-grid"><div><span>Stage</span><strong className="mono">{data.currentState.activeStage}</strong></div><div><span>Operations</span><strong>0 projected</strong></div><div><span>Workstreams</span><strong>{summary.activeWorkstreams} active</strong></div><div><span>Telemetry</span><strong>{degraded ? "Last snapshot" : "Connected"}</strong></div></div>
    </section>
    <section className="state-strip panel"><div><span className="eyebrow">CANONICAL STATE</span><strong>{data.currentState.activeStage}</strong><small>{data.currentState.authoritySource}</small></div><StatusPill status={freshnessStatus(data.currentState, degraded)} label={`${data.currentState.currentStateStatus} / ${data.currentState.freshness}${degraded ? " · LAST SNAPSHOT" : ""}`} /><div className="state-next"><span>Next safe action</span><code>{data.currentState.nextSafeAction}</code></div></section>
    <OperationalPosture data={data} degraded={degraded} onNavigate={onNavigate}/>
  </>;
}

function Palette({
  open,
  setOpen,
  setView,
  data,
  onSelectOperation,
}: {
  open: boolean;
  setOpen: (v:boolean)=>void;
  setView:(v:View)=>void;
  data: TelemetrySnapshot;
  onSelectOperation: (operationId: string) => void;
}) {
  const chooseView = (view: View) => { setView(view); setOpen(false); };
  const chooseOperation = (operationId: string) => { onSelectOperation(operationId); setView("operations"); setOpen(false); };
  return <CommandMenu.Dialog open={open} onOpenChange={setOpen} label="LionRoute command palette"><div className="palette"><div className="palette-search"><Search size={18}/><CommandMenu.Input placeholder="Search surfaces, runs, projects, workstreams, models…" /></div><CommandMenu.List><CommandMenu.Empty>No command found.</CommandMenu.Empty><CommandMenu.Group heading="Navigate">{nav.map(({id,label,icon:Icon}) => <CommandMenu.Item key={id} value={`surface ${label}`} onSelect={() => chooseView(id)}><Icon size={17}/><span className="palette-item-copy"><strong>{label}</strong><small>Open surface</small></span></CommandMenu.Item>)}</CommandMenu.Group>{data.operations.length > 0 && <CommandMenu.Group heading="Operations">{data.operations.map((operation) => <CommandMenu.Item key={operation.id} value={`operation ${operation.name} ${operation.project} ${operation.workstream} ${operation.stage}`} onSelect={() => chooseOperation(operation.id)}><TerminalSquare size={17}/><span className="palette-item-copy"><strong>{operation.name}</strong><small>{operation.project} · {operation.stage}</small></span><span className="palette-item-meta">{operation.status}</span></CommandMenu.Item>)}</CommandMenu.Group>}{data.projectRegistry.projects.length > 0 && <CommandMenu.Group heading="Projects">{data.projectRegistry.projects.map((project) => <CommandMenu.Item key={project.projectId} value={`project ${project.projectName} ${project.projectId} ${project.registryStatus} ${project.connectionStatus}`} onSelect={() => chooseView("projects")}><FolderKanban size={17}/><span className="palette-item-copy"><strong>{project.projectName}</strong><small>{project.projectId} · {project.connectionStatus}</small></span><span className="palette-item-meta">{project.registryStatus}</span></CommandMenu.Item>)}</CommandMenu.Group>}{data.workstreams.length > 0 && <CommandMenu.Group heading="Workstreams">{data.workstreams.map((workstream) => <CommandMenu.Item key={workstream.id} value={`workstream ${workstream.name} ${workstream.chatId} ${workstream.project} ${workstream.model} ${workstream.role}`} onSelect={() => chooseView("workstreams")}><Workflow size={17}/><span className="palette-item-copy"><strong>{workstream.name}</strong><small>{workstream.project} · {workstream.model}</small></span><span className="palette-item-meta">{workstream.status}</span></CommandMenu.Item>)}</CommandMenu.Group>}{data.federation.models.length > 0 && <CommandMenu.Group heading="Registry models">{data.federation.models.slice(0, 12).map((model) => <CommandMenu.Item key={model.modelId} value={`model ${model.modelId} ${model.modelFamily} ${model.providerId} ${model.hostKind} ${model.verificationState}`} onSelect={() => chooseView("agents")}><Bot size={17}/><span className="palette-item-copy"><strong>{model.modelId}</strong><small>{model.modelFamily} · {model.hostKind}</small></span><span className="palette-item-meta">{model.verificationState}</span></CommandMenu.Item>)}</CommandMenu.Group>}</CommandMenu.List><div className="palette-foot"><span>Observer mode · search projected state only</span><kbd>esc</kbd></div></div></CommandMenu.Dialog>;
}

export function App() {
  const { data, isLoading, error, isFetching, dataUpdatedAt, source } = useTelemetry();
  const [view, setView] = useState<View>("command");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [selectedOperationId, setSelectedOperationId] = useState("");
  const [tourIndex, setTourIndex] = useState(0);
  const [tourReturnAvailable, setTourReturnAvailable] = useState(false);
  const [isCompact, setIsCompact] = useState(() => window.matchMedia(COMPACT_NAVIGATION_QUERY).matches);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const shouldRestoreFocus = useRef(false);

  const closeMenu = () => {
    shouldRestoreFocus.current = isCompact;
    setMenuOpen(false);
  };
  const navigateTo = (nextView: View) => {
    if (nextView === "tour") setTourReturnAvailable(true);
    setView(nextView);
    if (menuOpen) closeMenu();
  };

  useEffect(() => { const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((v) => !v); setMenuOpen(false); } }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, []);
  useEffect(() => {
    const query = window.matchMedia(COMPACT_NAVIGATION_QUERY);
    const update = () => {
      setIsCompact(query.matches);
      if (!query.matches) setMenuOpen(false);
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!isCompact || !menuOpen) return;
    const navElement = navRef.current;
    navElement?.querySelector<HTMLButtonElement>(".nav-items button.active")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
      }
      if (event.key !== "Tab" || !navElement) return;
      const buttons = [...navElement.querySelectorAll<HTMLButtonElement>("button:not([disabled])")];
      if (!buttons.length) return;
      const destination = drawerFocusWrap(
        event.shiftKey,
        buttons.findIndex((button) => button === document.activeElement),
        buttons.length,
        navElement.contains(document.activeElement),
      );
      if (destination) {
        event.preventDefault();
        (destination === "first" ? buttons[0] : buttons[buttons.length - 1])?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isCompact, menuOpen]);

  useEffect(() => {
    if (!isCompact || !menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [isCompact, menuOpen]);

  useEffect(() => {
    if (!menuOpen && shouldRestoreFocus.current) {
      shouldRestoreFocus.current = false;
      menuButtonRef.current?.focus();
    }
  }, [menuOpen]);

  const selectedOperation = useMemo(() => data?.operations.find((o) => o.id === selectedOperationId) ?? data?.operations[0], [data, selectedOperationId]);

  const exploreDemoDestination = (destination: "projects" | "operations" | "history" | "evidence" | "system", operationId?: string) => {
    if (operationId && data?.operations.some((operation) => operation.id === operationId)) {
      setSelectedOperationId(operationId);
    }
    setTourReturnAvailable(true);
    navigateTo(destination);
  };
  const finishTour = () => {
    setTourReturnAvailable(false);
    setTourIndex(0);
    navigateTo("command");
  };

  const selectNextOperation = () => {
    if (!data || data.operations.length < 2 || !selectedOperation) return;
    const currentIndex = data.operations.findIndex((operation) => operation.id === selectedOperation.id);
    const nextOperation = data.operations[(currentIndex + 1) % data.operations.length];
    if (nextOperation) setSelectedOperationId(nextOperation.id);
  };

  if (isLoading) return <div className="boot"><Sparkles/><span>Loading {source.label}…</span></div>;
  if (!data) {
    const message = error instanceof Error ? error.message : "Unable to load observer telemetry.";
    return <div className="boot error"><div className="boot-message"><strong>{source.label} unavailable</strong><span>{message}</span><small>The Control Plane remains observer-only; no fallback data is promoted to live authority.</small></div></div>;
  }

  const telemetryDegraded = Boolean(error);
  const showGlobalInspector = Boolean(selectedOperation && !["tour", "operations", "history", "projects", "agents", "workstreams", "system", "evidence", "authority", "terminal", "settings"].includes(view));

  const navigation = (
    <nav
      ref={navRef}
      id="primary-navigation"
      className={`nav-rail${menuOpen ? " drawer-open" : ""}`}
      aria-label="Primary navigation"
      aria-hidden={isCompact && !menuOpen ? true : undefined}
      inert={isCompact && !menuOpen}
    >
      <div className="brand">
        <div className="brand-mark">LR</div>
        <div><strong>LionRoute</strong><span>CONTROL PLANE</span></div>
        <button type="button" className="mobile-nav-close" aria-label="Close navigation" onClick={closeMenu}><X size={20}/></button>
      </div>
      <div className="nav-items">
        {nav.map(({id,label,icon:Icon}) => (
          <button type="button" className={view === id ? "active" : ""} key={id} onClick={() => navigateTo(id)} aria-label={label} aria-current={view === id ? "page" : undefined}>
            <Icon size={19}/><span>{label}</span>
          </button>
        ))}
      </div>
      <div className="nav-bottom">
        <button type="button" onClick={() => { setPaletteOpen(true); if (menuOpen) setMenuOpen(false); }}><Search size={18}/><span>Command</span><kbd>Ctrl/Cmd K</kbd></button>
        <div className="observer-chip"><span className="pulse"/>Observer only</div>
      </div>
    </nav>
  );

  return <div className={`app-shell ${showGlobalInspector ? "" : "no-inspector"}`}>
    {isCompact && menuOpen && <button type="button" className="mobile-nav-backdrop" aria-label="Close navigation menu" tabIndex={-1} onClick={closeMenu} />}
    {isCompact && menuOpen
      ? <div className="mobile-nav-dialog" role="dialog" aria-modal="true" aria-label="Navigation menu">{navigation}</div>
      : navigation}
    <main className="main" inert={isCompact && menuOpen}><header className="topbar"><button ref={menuButtonRef} type="button" className="mobile-menu-trigger" aria-label="Open navigation" aria-controls="primary-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><Menu size={20}/></button><div className="crumb"><Boxes size={16}/><span>{data.currentState.project}</span><span>/</span><strong>{nav.find((n)=>n.id===view)?.label}</strong></div><div className="top-actions">{tourReturnAvailable && view !== "tour" && <button type="button" className="demo-tour-return" aria-label="Back to guided demo" onClick={() => navigateTo("tour")}><Compass size={15}/><span>Back to guide</span></button>}<SourceChip source={source} isFetching={isFetching} degraded={telemetryDegraded} updatedAt={dataUpdatedAt}/><div className={`fresh fresh-${telemetryDegraded ? "stale" : data.currentState.freshness.toLowerCase()}`}><span/>{telemetryDegraded ? "LCL LAST SNAPSHOT" : `LCL ${data.currentState.freshness}`}</div><button className="operation-switch" onClick={selectNextOperation} disabled={!selectedOperation}><TerminalSquare size={16}/>{selectedOperation?.workstream ?? "No active operation"}</button></div></header><div className="content">{view === "tour" && <Suspense fallback={<div className="panel map-loading">Loading demo guide?</div>}><DemoTour data={data} index={tourIndex} onIndexChange={setTourIndex} onExplore={exploreDemoDestination} onFinish={finishTour}/></Suspense>} {view === "command" && (selectedOperation ? <CommandCenter data={data} operation={selectedOperation} degraded={telemetryDegraded} onNavigate={navigateTo}/> : <IdleCommandCenter data={data} degraded={telemetryDegraded} onNavigate={navigateTo}/>)} {view === "operations" && <Suspense fallback={<div className="panel map-loading">Loading operations…</div>}><Operations operations={data.operations} evidence={data.evidence} selectedOperationId={selectedOperation?.id ?? ""} onSelectOperation={setSelectedOperationId}/></Suspense>} {view === "history" && <Suspense fallback={<div className="panel map-loading">Loading history…</div>}><HistoryReplay data={data} onOpenOperation={(operationId) => { setSelectedOperationId(operationId); setView("operations"); }}/></Suspense>} {view === "projects" && <Suspense fallback={<div className="panel map-loading">Loading projects…</div>}><Projects data={data} onOpenOperation={(operationId) => { setSelectedOperationId(operationId); setView("operations"); }}/></Suspense>} {view === "agents" && <Suspense fallback={<div className="panel map-loading">Loading agents and models…</div>}><AgentsModels data={data} onOpenOperation={(operationId) => { setSelectedOperationId(operationId); setView("operations"); }}/></Suspense>} {view === "workstreams" && <Suspense fallback={<div className="panel map-loading">Loading workstreams…</div>}><Workstreams data={data} onOpenOperation={(operationId) => { setSelectedOperationId(operationId); setView("operations"); }}/></Suspense>} {view === "system" && <Suspense fallback={<div className="panel map-loading">Loading topology…</div>}><SystemMap data={data}/></Suspense>} {view === "evidence" && <Suspense fallback={<div className="panel map-loading">Loading evidence…</div>}><Evidence data={data}/></Suspense>} {view === "authority" && <Suspense fallback={<div className="panel map-loading">Loading authority…</div>}><Authority data={data}/></Suspense>} {view === "terminal" && <Suspense fallback={<div className="panel map-loading">Loading terminal stream…</div>}><Terminal data={data} onOpenOperation={(operationId) => { setSelectedOperationId(operationId); setView("operations"); }}/></Suspense>} {view === "settings" && <Suspense fallback={<div className="panel map-loading">Loading settings…</div>}><SettingsPlugins source={source} data={data} degraded={telemetryDegraded} updatedAt={dataUpdatedAt}/></Suspense>}</div></main>
    {showGlobalInspector && selectedOperation && <Inspector operation={selectedOperation}/>}
    <Palette open={paletteOpen} setOpen={setPaletteOpen} setView={navigateTo} data={data} onSelectOperation={setSelectedOperationId}/>
  </div>;
}
