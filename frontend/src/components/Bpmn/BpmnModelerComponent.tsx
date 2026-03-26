import {useEffect, useRef} from "react";
import BpmnModeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";

interface BpmnModelerComponentProps {
  xml: string | null;
  onModelerReady?: (modeler: BpmnModeler) => void;
}

const THEMES = {
  light: {
    defaultFillColor:   "#ffffff",  // --n-0
    defaultStrokeColor: "#334155",  // --n-700
    defaultLabelColor:  "#0f172a",  // --n-900
  },
  dark: {
    defaultFillColor:   "#1e293b",  // --n-800
    defaultStrokeColor: "#94a3b8",  // --n-400
    defaultLabelColor:  "#f1f5f9",  // --n-100
  },
} as const;

// Detect whether the .dark class is currently on <html> or <body>
function isDarkMode(): boolean {
  return (
    document.documentElement.classList.contains("dark") ||
    document.body.classList.contains("dark")
  );
}

export default function BpmnModelerComponent({ xml, onModelerReady }: BpmnModelerComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<BpmnModeler | null>(null);
  const isDarkRef = useRef<boolean>(isDarkMode());

  // Save current XML-state
  async function getCurrentXml(): Promise<string | null> {
    if (!modelerRef.current) return null;
    try {
      const { xml: currentXml } = await modelerRef.current.saveXML({ format: true});
      return currentXml ?? null;
    } catch {
      return null;
    }
  }

  // Creates (or re-creates) the modeler with the correct theme colors
  function buildModeler(dark: boolean): BpmnModeler {
    const modeler = new BpmnModeler({
      container: containerRef.current!,
      bpmnRenderer: THEMES[dark ? "dark" : "light"],
      additionalModules: [],
    });

    isDarkRef.current = dark;
    return modeler;
  }

  async function loadXml(modeler: BpmnModeler, bpmnXml: string, viewbox?: object) {
    try {
      await modeler.importXML(bpmnXml);
      const canvas = modeler.get("canvas") as any;
      viewbox ? canvas.viewbox(viewbox) : canvas.zoom("fit-viewport");
    } catch (err) {
      console.error("Fehler beim Laden des BPMN:", err);
    }
  }

  // Initialize modeler
  useEffect(() => {
    if (!containerRef.current) return;

    const modeler = buildModeler(isDarkMode());
    modelerRef.current = modeler;
    onModelerReady?.(modeler);

    // Theme-Wechsel
    const observer = new MutationObserver(async () => {
      const dark = isDarkMode();
      if (dark === isDarkRef.current || !modelerRef.current) return;

      const liveXml = await getCurrentXml();

      let cachedViewbox: object | undefined;
      try {
        cachedViewbox = (modelerRef.current.get("canvas") as any).viewbox();
      } catch (_) {}

      modelerRef.current.destroy();

      const next = buildModeler(dark);
      modelerRef.current = next;
      onModelerReady?.(next);

      const xmlToLoad = liveXml ?? xml;
      if (xmlToLoad) await loadXml(next, xmlToLoad, cachedViewbox);
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"]});
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"]});

    return () => {
      observer.disconnect();
      modelerRef.current?.destroy();
      modelerRef.current = null;
    }

  }, []);

  // Import XML when it changes
  useEffect(() => {
    if (!modelerRef.current || !xml) return;
    loadXml(modelerRef.current, xml);
  }, [xml]);

  return (
    <div
      ref={containerRef}
      className="bpmn-container"
      style={{
        height: "600px",
        width: "100%",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--border)",
        background: "var(--bg-card)",
        overflow: "hidden",
        boxShadow: "var(--shadow-sm)"
      }}
    />
  );
}