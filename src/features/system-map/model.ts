import type { OperationStatus, SystemEdge, SystemNode } from "../../types";

export type TopologyCategory = SystemNode["category"] | "all";

const laneByCategory: Record<SystemNode["category"], number> = {
  state: 0,
  authority: 0,
  worker: 1,
  runtime: 2,
  evidence: 2,
  ui: 3,
};

export interface TopologySummary {
  nodeCount: number;
  edgeCount: number;
  runningCount: number;
  waitingCount: number;
  passedCount: number;
}

export interface TopologyConnection {
  edge: SystemEdge;
  direction: "incoming" | "outgoing";
  peer?: SystemNode;
}

export function summarizeTopology(nodes: SystemNode[], edges: SystemEdge[]): TopologySummary {
  const countStatus = (status: OperationStatus) => nodes.filter((node) => node.status === status).length;
  return {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    runningCount: countStatus("running"),
    waitingCount: countStatus("waiting"),
    passedCount: countStatus("passed"),
  };
}

export function filterTopology(
  nodes: SystemNode[],
  edges: SystemEdge[],
  category: TopologyCategory,
  query: string,
): { nodes: SystemNode[]; edges: SystemEdge[] } {
  const normalizedQuery = query.trim().toLowerCase();
  const visibleNodes = nodes.filter((node) => {
    if (category !== "all" && node.category !== category) return false;
    if (!normalizedQuery) return true;
    return [node.id, node.label, node.subtitle, node.category, node.status]
      .some((value) => value.toLowerCase().includes(normalizedQuery));
  });
  const visibleIds = new Set(visibleNodes.map((node) => node.id));
  return {
    nodes: visibleNodes,
    edges: edges.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target)),
  };
}

export function layoutTopology(nodes: SystemNode[]): Map<string, { x: number; y: number }> {
  const laneCounts = new Map<number, number>();
  const positions = new Map<string, { x: number; y: number }>();
  for (const node of nodes) {
    const lane = laneByCategory[node.category];
    const index = laneCounts.get(lane) ?? 0;
    laneCounts.set(lane, index + 1);
    positions.set(node.id, {
      x: 45 + lane * 275,
      y: 55 + index * 160,
    });
  }
  return positions;
}

export function topologyConnections(nodeId: string, nodes: SystemNode[], edges: SystemEdge[]): TopologyConnection[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const connections: TopologyConnection[] = [];
  for (const edge of edges) {
    if (edge.target === nodeId) connections.push({ edge, direction: "incoming", peer: byId.get(edge.source) });
    if (edge.source === nodeId) connections.push({ edge, direction: "outgoing", peer: byId.get(edge.target) });
  }
  return connections;
}
