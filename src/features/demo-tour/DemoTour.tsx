import { ArrowLeft, ArrowRight, Check, Compass, ExternalLink, ShieldCheck } from "lucide-react";
import type { TelemetrySnapshot } from "../../types";
import { buildDemoSteps, safeTourIndex, type DemoDestination } from "./model";

interface DemoTourProps {
  data: TelemetrySnapshot;
  index: number;
  onIndexChange: (index: number) => void;
  onExplore: (destination: DemoDestination, operationId?: string) => void;
  onFinish: () => void;
}

export default function DemoTour({ data, index, onIndexChange, onExplore, onFinish }: DemoTourProps) {
  const steps = buildDemoSteps(data);
  const selectedIndex = safeTourIndex(index, steps.length);
  const step = steps[selectedIndex];
  if (!step) return null;

  return <section className="demo-tour screen-section" aria-labelledby="demo-tour-title">
    <header className="demo-tour-hero panel">
      <span className="demo-tour-eyebrow"><Compass size={16}/> GUIDED DEMONSTRATION <span className="demo-tour-mode">FICTIONAL DATA ONLY</span></span>
      <h1 id="demo-tour-title">Explore LionRoute OS</h1>
      <p>Follow a five-stop tour through the public Control Plane. Every project, operation, trace, evidence record, and diagram is a synthetic example. Your choices only change what the UI displays.</p>
      <div className="demo-tour-safety"><ShieldCheck size={16}/><span>Read-only exploration. No live systems, accounts, commands, or AI provider calls.</span></div>
    </header>
    <div className="demo-tour-progress" role="group" aria-label="Choose tour stop">
      {steps.map((item, position) => (
        <button type="button" key={item.id}
          className={"demo-tour-stop" + (position === selectedIndex ? " selected" : "")}
          aria-current={position === selectedIndex ? "step" : undefined}
          aria-label={"Stop " + (position + 1) + " of " + steps.length + ": " + item.title}
          onClick={() => onIndexChange(position)}>
          <span className="demo-tour-number">{position < selectedIndex ? <Check size={14}/> : position + 1}</span>
          <span className="demo-tour-stop-label">{item.eyebrow}</span>
        </button>
      ))}
    </div>
    <article className="demo-tour-content panel" aria-live="polite" aria-atomic="true">
      <div className="demo-tour-content-top">
        <div><span className="eyebrow">STOP {selectedIndex + 1} / {steps.length} ? {step.eyebrow}</span><h2>{step.title}</h2></div>
        <div className="demo-tour-metric"><strong>{step.metricValue}</strong><span>{step.metricLabel}</span></div>
      </div>
      <p>{step.summary}</p>
      <div className="demo-tour-sample"><span className="eyebrow">FROM THE DEMO SNAPSHOT</span><strong>{step.sample}</strong></div>
      <div className="demo-tour-question"><span className="eyebrow">THINK ABOUT</span><p>{step.question}</p></div>
      <div className="demo-tour-actions">
        <button type="button" className="demo-tour-primary" onClick={() => onExplore(step.destination, step.operationId)}>
          {step.actionLabel}<ExternalLink size={16}/>
        </button>
        <span className="demo-tour-action-hint">Open the existing interactive screen, then return to this walkthrough.</span>
      </div>
    </article>
    <div className="demo-tour-footer">
      <button type="button" className="demo-tour-secondary" disabled={selectedIndex === 0} onClick={() => onIndexChange(selectedIndex - 1)}><ArrowLeft size={16}/> Previous</button>
      <span className="demo-tour-counter" aria-label={"Step " + (selectedIndex + 1) + " of " + steps.length}>{selectedIndex + 1} / {steps.length}</span>
      {selectedIndex === steps.length - 1
        ? <button type="button" className="demo-tour-primary" onClick={onFinish}>Finish tour <Check size={16}/></button>
        : <button type="button" className="demo-tour-primary" onClick={() => onIndexChange(selectedIndex + 1)}>Next stop <ArrowRight size={16}/></button>}
    </div>
  </section>;
}
