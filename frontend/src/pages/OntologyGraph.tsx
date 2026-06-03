import { useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  Handle,
  Position,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import { Database } from "lucide-react";
import { api } from "../api/api.ts";

// ------Layout-Funktion mit Dagre--------------------------
const NODE_WIDTH = 200;
const NODE_HEIGHT_CLASS = 70;
const NODE_HEIGHT_GROUP = 60;
const NODE_HEIGHT_PROP = 50;

function getNodeHeight(type: string) {
  if (type === "class") return NODE_HEIGHT_CLASS;
  if (type === "group") return NODE_HEIGHT_GROUP;
  return NODE_HEIGHT_PROP;
}

function applyDagreLayout(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 40, ranksep: 60 });

  nodes.forEach((n) => {
    g.setNode(n.id, { width: NODE_WIDTH, height: getNodeHeight(n.type ?? "") });
  });
  edges.forEach((e) => g.setEdge(e.source, e.target));

  dagre.layout(g);

  return nodes.map((n) => {
    const pos = g.node(n.id);
    return {
      ...n,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - getNodeHeight(n.type ?? "") / 2,
      },
    };
  });
}

// ─── Custom Nodes ─────────────────────────────────────────────────────────────

function ClassNode({ data }: { data: any }) {
  return (
    <div style={{
      background: "var(--blue-600, #2563eb)",
      color: "var(--text-primary)",
      borderRadius: 10,
      padding: "10px 16px",
      minWidth: NODE_WIDTH,
      maxWidth: NODE_WIDTH,
      boxShadow: "0 4px 12px rgba(37,99,235,0.35)",
      border: "2px solid var(--blue-400, #60a5fa)",
      fontSize: 13,
    }}>
      <Handle type="target" position={Position.Top} style={{ background: "#60a5fa" }} />
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{data.label}</div>
      {data.definition && (
        <div style={{ fontSize: 11, opacity: 0.85, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
             title={data.definition}>
          {data.definition}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} style={{ background: "#60a5fa" }} />
    </div>
  );
}

function GroupNode({ data }: { data: any }) {
  return (
    <div style={{
      background: "var(--amber-500)",
      color: "var(--text-primary)",
      borderRadius: 8,
      padding: "8px 14px",
      minWidth: NODE_WIDTH,
      maxWidth: NODE_WIDTH,
      border: "1.5px solid var(--border-color, #334155)",
      fontSize: 12,
    }}>
      <Handle type="target" position={Position.Top} />
      <div style={{ fontWeight: 600, fontSize: 12 }}>{data.label}</div>
      {data.definition && (
        <div style={{ fontSize: 11, opacity: 0.6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
             title={data.definition}>
          {data.definition}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

function PropertyNode({ data }: { data: any }) {
  return (
    <div style={{
      background: "var(--green-500)",
      color: "var(--text-primary)",
      borderRadius: 6,
      padding: "6px 12px",
      minWidth: NODE_WIDTH,
      maxWidth: NODE_WIDTH,
      border: "1px solid var(--green-700, #15803d)",
      fontSize: 11,
    }}>
      <Handle type="target" position={Position.Top} style={{ background: "#15803d" }} />
      <div style={{ fontWeight: 500 }}>{data.label}</div>
    </div>
  );
}

const nodeTypes = {
  class: ClassNode,
  group: GroupNode,
  property: PropertyNode,
};

// ─── Hauptkomponente ──────────────────────────────────────────────────────────

type FilterMode = "all" | "classes-only" | "no-properties";

export default function OntologyGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [rawNodes, setRawNodes] = useState<Node[]>([]);
  const [rawEdges, setRawEdges] = useState<Edge[]>([]);

  // Daten laden
  useEffect(() => {
    api.getOntologyGraph().then(({ nodes: rn, edges: re }) => {
      const flowEdges: Edge[] = re.map((e) => ({
        ...e,
        animated: false,
        markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
        style: { stroke: "var(--border-color, #475569)", strokeWidth: 1.5 },
      }));

      const flowNodes: Node[] = rn.map((n) => ({
        id: n.id,
        type: n.type,
        data: n.data,
        position: { x: 0, y: 0 }, // wird von Dagre überschrieben
      }));

      setRawNodes(flowNodes);
      setRawEdges(flowEdges);
      setLoading(false);
    });
  }, []);

  // Filter anwenden + Layout neu berechnen
  useEffect(() => {
    if (rawNodes.length === 0) return;

    let filteredNodes = rawNodes;
    let filteredEdges = rawEdges;

    if (filterMode === "classes-only") {
      filteredNodes = rawNodes.filter((n) => n.type === "class");
      const nodeIds = new Set(filteredNodes.map((n) => n.id));
      filteredEdges = rawEdges.filter(
        (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
      );
    } else if (filterMode === "no-properties") {
      filteredNodes = rawNodes.filter((n) => n.type !== "property");
      const nodeIds = new Set(filteredNodes.map((n) => n.id));
      filteredEdges = rawEdges.filter(
        (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
      );
    }

    const laid = applyDagreLayout(filteredNodes, filteredEdges);
    setNodes(laid);
    setEdges(filteredEdges);
  }, [rawNodes, rawEdges, filterMode]);

  return (
    <div className="page-container animate-fade-in" style={{ display: "flex", flexDirection: "column", height: "100%" , width: "100%"}}>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-icon">
          <Database size={22} />
        </div>
        <div>
          <div className="page-header-title">Ontologie-Graph</div>
          <div className="page-header-sub">
            Klassen, Merkmalsgruppen und Merkmale
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "var(--text-muted)", marginRight: 4 }}>Ansicht:</span>
        {(["all", "no-properties", "classes-only"] as FilterMode[]).map((mode) => (
          <button
            key={mode}
            className={`btn btn-sm ${filterMode === mode ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setFilterMode(mode)}
          >
            {{
              "all": "Alle",
              "no-properties": "Ohne Merkmale",
              "classes-only": "Nur Klassen",
            }[mode]}
          </button>
        ))}

        {/* Legende */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 14, alignItems: "center", fontSize: 12 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 12, height: 12, borderRadius: 3, background: "#2563eb", display: "inline-block" }} />
                        Klasse
                    </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 12, height: 12, borderRadius: 3, background: "var(--bg-secondary)", border: "1.5px solid var(--border-color)", display: "inline-block" }} />
                        Merkmalsgruppe
                    </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 12, height: 12, borderRadius: 3, background: "#052e16", border: "1px solid #15803d", display: "inline-block" }} />
                        Merkmal
                    </span>
        </div>
      </div>

      {/* Graph */}
      <div className="card" style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
            Laden…
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            minZoom={0.1}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={16} size={1} color="var(--border-color, #334155)" />
            <Controls />
            <MiniMap
              nodeColor={(n) =>
                n.type === "class" ? "#2563eb" :
                  n.type === "group" ? "#475569" : "#15803d"
              }
              maskColor="rgba(0,0,0,0.3)"
            />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}