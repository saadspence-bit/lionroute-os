import { describe, expect, it } from "vitest";
import type { SystemEdge, SystemNode } from "../../types";
import { filterTopology, layoutTopology, summarizeTopology, topologyConnections } from "./model";

const nodes: SystemNode[] = [
  { id: "state", label: "LCL", category: "state", status: "passed", subtitle: "Canonical state" },
  { id: "worker", label: "Core", category: "worker", status: "running", subtitle: "Producer" },
  { id: "runtime", label: "Runtime", category: "runtime", status: "running", subtitle: "Progress" },
  { id: "ui", label: "UI", category: "ui", status: "waiting", subtitle: "Observer" },
];

const edges: SystemEdge[] = [
  { id: "state-ui", source: "state", target: "ui", label: "current state" },
  { id: "worker-runtime", source: "worker", target: "runtime", label: "progress" },
  { id: "runtime-ui", source: "runtime", target: "ui", label: "events" },
];

describe("system map model", () => {
  it("filters nodes and removes edges whose endpoints are hidden", () => {
    const filtered = filterTopology(nodes, edges, "runtime", "");
    expect(filtered.nodes.map((node) => node.id)).toEqual(["runtime"]);
    expect(filtered.edges).toEqual([]);

    const searched = filterTopology(nodes, edges, "all", "observer");
    expect(searched.nodes.map((node) => node.id)).toEqual(["ui"]);
    expect(searched.edges).toEqual([]);
  });

  it("summarizes only projected topology records", () => {
    expect(summarizeTopology(nodes, edges)).toEqual({
      nodeCount: 4,
      edgeCount: 3,
      runningCount: 2,
      waitingCount: 1,
      passedCount: 1,
    });
  });

  it("lays nodes into deterministic category lanes", () => {
    const positions = layoutTopology(nodes);
    expect(positions.get("state")?.x).toBeLessThan(positions.get("worker")!.x);
    expect(positions.get("worker")?.x).toBeLessThan(positions.get("runtime")!.x);
    expect(positions.get("runtime")?.x).toBeLessThan(positions.get("ui")!.x);
  });

  it("describes incoming and outgoing peers without inventing missing nodes", () => {
    const connections = topologyConnections("runtime", nodes, edges);
    expect(connections.map(({ direction, peer }) => `${direction}:${peer?.id}`)).toEqual([
      "incoming:worker",
      "outgoing:ui",
    ]);
  });
});
