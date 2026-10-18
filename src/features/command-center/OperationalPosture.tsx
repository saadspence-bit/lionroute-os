import { Bot, FolderKanban, Radar, ShieldCheck } from "lucide-react";
import type { TelemetrySnapshot } from "../../types";
import { buildCommandCenterPosture } from "./model";

const icons = {
  state: Radar,
  dispatch: Bot,
  icm: ShieldCheck,
  portfolio: FolderKanban,
} as const;

export default function OperationalPosture({
  data,
  degraded,
  onNavigate,
}: {
  data: TelemetrySnapshot;
  degraded: boolean;
  onNavigate: (destination: "authority" | "agents" | "settings" | "projects") => void;
}) {
  const items = buildCommandCenterPosture(data, degraded);

  return <section className="posture-grid" aria-label="Operational posture">
    {items.map((item) => {
      const Icon = icons[item.id];
      return <button
        type="button"
        className={`panel posture-card posture-${item.tone}`}
        key={item.id}
        onClick={() => onNavigate(item.destination)}
      >
        <span className="posture-icon"><Icon size={16}/></span>
        <span className="posture-copy"><small>{item.label}</small><strong>{item.value}</strong><span>{item.detail}</span></span>
        <span className="posture-open">Open</span>
      </button>;
    })}
  </section>;
}
