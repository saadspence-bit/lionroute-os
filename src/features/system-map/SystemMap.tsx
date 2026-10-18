import { useEffect, useMemo, useState } from "react";
import { Activity, CircleDot, GitBranch, Network, Search } from "lucide-react";
import { Background, Controls, ReactFlow, type Edge, type Node } from "@xyflow/react";
import type { OperationStatus, SystemNode, TelemetrySnapshot } from "../../types";
import { filterTopology, layoutTopology, summarizeTopology, topologyConnections, type TopologyCategory } from "./model";

const categories: Array<{ value: TopologyCategory; label: string }> = [
  { value: "all", label: "All" },
  { value: "state", label: "State" },
  { value: "authority", label: "Authority" },
  { value: "worker", label: "Workers" },
  { value: "runtime", label: "Runtime" },
  { value: "evidence", label: "Evidence" },
  { value: "ui", label: "UI" },
];

function Status({ status }: { status: OperationStatus }) {
  return <span className={`status status-${status}`}><span className="status-dot" />{status}</span>;
}

function MapNodeLabel({ node }: { node: SystemNode }) {
  return <div className="map-node-content">
    <div className="map-node-kicker"><span>{node.category}</span><Status status={node.status}/></div>
    <strong>{node.label}</strong>
    <span>{node.subtitle}</span>
    <code>{node.id}</code>
  </div>;
}

export default function SystemMap({ data }: { data: TelemetrySnapshot }) {
  const [category, setCategory] = useState<TopologyCategory>("all");
  const [query, setQuery] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState(data.systemNodes[0]?.id ?? "");
  const filtered = useMemo(() => filterTopology(data.systemNodes, data.systemEdges, category, query), [data.systemNodes, data.systemEdges, category, query]);
  const positions = useMemo(() => layoutTopology(filtered.nodes), [filtered.nodes]);
  const summary = useMemo(() => summarizeTopology(data.systemNodes, data.systemEdges), [data.systemNodes, data.systemEdges]);
  const selectedNode = filtered.nodes.find((node) => node.id === selectedNodeId) ?? filtered.nodes[0];
  const connections = selectedNode ? topologyConnections(selectedNode.id, data.systemNodes, data.systemEdges) : [];

  useEffect(() => {
    if (!selectedNode || selectedNode.id === selectedNodeId) return;
    setSelectedNodeId(selectedNode.id);
  }, [selectedNode, selectedNodeId]);

  const nodes: Node[] = filtered.nodes.map((node) => ({
    id: node.id,
    position: positions.get(node.id) ?? { x: 0, y: 0 },
    data: { label: <MapNodeLabel node={node}/> },
    className: `map-node map-${node.category} map-status-${node.status}`,
  }));
  const edges: Edge[] = filtered.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    animated: edge.target === "ui" || edge.source === "core",
    className: "map-edge",
  }));

  return (
    <section className="screen-section map-screen">
      <div className="section-title map-title"><div><span className="eyebrow">TOPOLOGY EXPLORER</span><h1>System Map</h1><p>Inspect the logical observer topology and projected relationships without turning the diagram into runtime authority.</p></div><div className="map-mode"><Network size={14}/>observer graph</div></div>

      <section className="map-metrics">
        <div className="panel map-metric"><Network size={16}/><div><strong>{summary.nodeCount}</strong><span>projected nodes</span></div></div>
        <div className="panel map-metric"><GitBranch size={16}/><div><strong>{summary.edgeCount}</strong><span>relationships</span></div></div>
        <div className="panel map-metric"><Activity size={16}/><div><strong>{summary.runningCount}</strong><span>running status</span></div></div>
        <div className="panel map-metric"><CircleDot size={16}/><div><strong>{summary.waitingCount}</strong><span>waiting status</span></div></div>
      </section>

      <div className="map-toolbar panel">
        <label className="operations-search"><Search size={15}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search nodes, categories, status…" /></label>
        <div className="map-filters" aria-label="Topology category filters">{categories.map((option) => <button type="button" key={option.value} className={category === option.value ? "active" : ""} onClick={() => setCategory(option.value)}>{option.label}</button>)}</div>
        <span className="map-visible-count">{filtered.nodes.length} / {data.systemNodes.length} nodes</span>
      </div>

      <div className="topology-layout">
        <div className="panel flow-wrap">
          {nodes.length ? <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            fitViewOptions={{ padding: 0.18 }}
            minZoom={0.45}
            maxZoom={1.55}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId("")}
          >
            <Background gap={24} size={1}/>
            <Controls showInteractive={false}/>
          </ReactFlow> : <div className="map-empty"><Search size={20}/><strong>No topology nodes match</strong><span>Change the category filter or search text.</span></div>}
        </div>

        <aside className="panel map-detail">
          {selectedNode ? <>
            <div className="map-detail-head"><div><span className="eyebrow">SELECTED NODE</span><h2>{selectedNode.label}</h2></div><Status status={selectedNode.status}/></div>
            <p>{selectedNode.subtitle}</p>
            <dl className="detail-grid"><div><dt>Logical ID</dt><dd className="mono">{selectedNode.id}</dd></div><div><dt>Category</dt><dd>{selectedNode.category}</dd></div><div><dt>Incoming</dt><dd>{connections.filter((connection) => connection.direction === "incoming").length}</dd></div><div><dt>Outgoing</dt><dd>{connections.filter((connection) => connection.direction === "outgoing").length}</dd></div></dl>
            <div className="map-connections"><span className="eyebrow">PROJECTED RELATIONSHIPS</span>{connections.length ? connections.map((connection) => <button type="button" key={`${connection.direction}-${connection.edge.id}`} onClick={() => connection.peer && setSelectedNodeId(connection.peer.id)} disabled={!connection.peer}><span className={`map-direction map-direction-${connection.direction}`}>{connection.direction}</span><div><strong>{connection.peer?.label ?? "Unresolved node"}</strong><small>{connection.edge.label ?? "Unlabeled relationship"}</small></div></button>) : <small>No projected relationships for this node.</small>}</div>
            <div className="map-boundary"><CircleDot size={13}/><span>Graph status and relationships are observer projections, not liveness or authority grants.</span></div>
          </> : <div className="map-detail-empty"><Network size={22}/><strong>No node selected</strong><span>Select a visible node to inspect its projected relationships.</span></div>}
        </aside>
      </div>
    </section>
  );
}
