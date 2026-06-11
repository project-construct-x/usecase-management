import {useCallback, useEffect, useState} from "react";
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
import { useNavigate} from "react-router-dom";
import { Database } from "lucide-react";
import { api } from "../api/api.ts";

// ------Layout-Funktion mit Dagre--------------------------
const NODE_WIDTH = 200;
const NODE_HEIGHT_CLASS = 70;
const NODE_HEIGHT_GROUP = 60;
const NODE_HEIGHT_PROP = 50;

function getNodeHeight(type: string) {
  if (type === "class") return NODE_HEIGHT_CLASS;
  if (type === "featureGroup") return NODE_HEIGHT_GROUP;
  return NODE_HEIGHT_PROP;
}

function applyDagreLayout(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR", nodesep: 0, ranksep: 100 });

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

function ClassNode({ data }: { data: { label: string; id: string; definition: string; onNavigate: (path: string) => void} }) {
  return (
    <div
      onClick={() => data.onNavigate(`/classes/${data.id}`)}
      style={{
        background: "var(--blue-500)",
        color: "var(--text-primary)",
        borderRadius: 10,
        padding: "3px",
        textAlign: "center",
        minWidth: NODE_WIDTH,
        maxWidth: NODE_WIDTH,
        boxShadow: "0 1px 6px var(--blue-700)",
        border: "2px solid var(--blue-600)",
        cursor: "pointer",
        transition: "filter 0.15s"
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLDivElement).style.filter = "brightness(1.15)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLDivElement).style.filter ="")
      }
    >
      <Handle type="target" position={Position.Left} style={{ background: "var(--blue-600)" }} />
      <div style={{ fontWeight: 700, fontSize: 13 }} title={data.definition}>{data.label}</div>
      <Handle type="source" position={Position.Right} style={{ background: "var(--blue-600)" }} />
    </div>
  );
}

function PropertyGroupNode({ data }: { data: { label: string; id: string; definition: string; onNavigate: (path: string) => void} }) {
  return (
    <div
      onClick={() => data.onNavigate(`/propertyGroups/${data.id}`)}
      style={{
        background: "var(--amber-500)",
        color: "var(--text-primary)",
        borderRadius: 6,
        padding: "3px",
        textAlign: "center",
        minWidth: NODE_WIDTH,
        maxWidth: NODE_WIDTH,
        boxShadow: "0 1px 6px var(--amber-600)",
        border: "1px solid var(--amber-600)",
        cursor: "pointer",
        transition: "filter 0.15s"
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLDivElement).style.filter = "brightness(1.15)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLDivElement).style.filter ="")
      }
    >
      <Handle type="target" position={Position.Left} style={{ background: "var(--amber-600)" }} />
      <div style={{ fontWeight: 600, fontSize: 12 }} title={data.definition}>{data.label}</div>
      <Handle type="source" position={Position.Right} style={{ background: "var(--amber-600)" }} />
    </div>
  );
}

function PropertyNode({ data }: { data: { label: string; id: string; definition: string; onNavigate: (path: string) => void} }) {
  return (
    <div
      onClick={() => data.onNavigate(`/properties/${data.id}`)}
      style={{
        background: "var(--green-600)",
        color: "var(--text-primary)",
        borderRadius: 10,
        padding: "3px",
        textAlign: "center",
        minWidth: NODE_WIDTH,
        maxWidth: NODE_WIDTH,
        boxShadow: "0 1px 4px var(--green-600)",
        border: "1px solid var(--green-600)",
        cursor: "pointer",
        transition: "filter 0.15s",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLDivElement).style.filter = "brightness(1.15)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLDivElement).style.filter ="")
      }
    >
      <Handle type="target" position={Position.Left} style={{ background: "var(--green-600)" }} />
      <div style={{ fontSize: 11, fontWeight: 500 }} title={data.definition}>{data.label}</div>
    </div>
  );
}

const nodeTypes = {
  class: ClassNode,
  propertyGroup: PropertyGroupNode,
  property: PropertyNode,
};


// Inject ReactFlow Controls dark-mode CSS once
const CONTROLS_STYLE_ID = "rf-controls-dark";
if (typeof document !== "undefined" && !document.getElementById(CONTROLS_STYLE_ID)) {
  const style = document.createElement("style");
  style.id = CONTROLS_STYLE_ID;
  style.textContent = `
    .react-flow__controls {
      background: var(--bg-app) !important;
      border: 1px solid var(--border) !important;
      box-shadow: none !important;
    }
    .react-flow__controls-button {
      background: var(--bg-app) !important;
      border-bottom: 1px solid var(--border) !important;
      color: var(--text-primary) !important;
      fill: var(--text-secondary) !important;
    }
    .react-flow__controls-button:hover {
      background: var(--bg-hover) !important;
    }
    .react-flow__controls-button svg {
      fill: var(--text-primary) !important;
    }
  `;
  document.head.appendChild(style);
}



// ─── Hauptkomponente ──────────────────────────────────────────────────────────

type FilterMode = "all" | "classes-only" | "no-properties";

export default function OntologyGraph() {
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [rawNodes, setRawNodes] = useState<Node[]>([]);
  const [rawEdges, setRawEdges] = useState<Edge[]>([]);

  const handleNavigate = useCallback(
    (path: string) => navigate(path),
    [navigate]
  )

  // Daten laden
  useEffect(() => {
    api.getOntologyGraph().then(({ nodes: rn, edges: re }) => {
      const flowEdges: Edge[] = re.map((e) => ({
        ...e,
        animated: false,
        markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
        style: { stroke: "var(--text-secondary)", strokeWidth: 1.5 },
      }));

      const flowNodes: Node[] = rn.map((n) => ({
        id: n.id,
        type: n.type,
        data: {
          ...n.data,
          id: n.id,
          onNavigate: handleNavigate,
        },
        position: { x: 0, y: 0 }, // wird von Dagre überschrieben
      }));

      setRawNodes(flowNodes);
      setRawEdges(flowEdges);
      setLoading(false);
    });
  }, [handleNavigate]);

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
                        <span style={{ width: 12, height: 12, borderRadius: 3, background: "var(--blue-500)", display: "inline-block" }} />
                        Klasse
                    </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 12, height: 12, borderRadius: 3, background: "var(--amber-500)", display: "inline-block" }} />
                        Merkmalsgruppe
                    </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 12, height: 12, borderRadius: 3, background: "var(--green-500)", display: "inline-block" }} />
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
            minZoom={0.01}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={16} size={1} color="var(--border-color, #334155)" />
            <Controls />
            <MiniMap
              nodeColor={(n) =>
                n.type === "class" ? "var(--blue-500)" :
                  n.type === "propertyGroup" ? "var(--amber-500)" : "var(--green-500)"
              }
              maskColor="rgba(0,0,0,0.3)"
              nodeStrokeWidth={2}
              nodeBorderRadius={0}
              pannable
              zoomable
            />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}