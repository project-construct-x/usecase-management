import {useEffect, useRef} from "react";
import BpmnModeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";

interface BpmnModelerComponentProps {
    xml: string | null;
    onModelerReady?: (modeler: BpmnModeler) => void;
}

export default function BpmnModelerComponent({ xml, onModelerReady }: BpmnModelerComponentProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const modelerRef = useRef<BpmnModeler | null>(null);

    // Initialize modeler
    useEffect(() => {
        if (!containerRef.current) return;

        const modeler = new BpmnModeler({
            container: containerRef.current,
        });

        modelerRef.current = modeler;
        onModelerReady?.(modeler);

        return () => {
            modeler.destroy();
            modelerRef.current = null;
        };
    }, []);

    // Import XML when it changes
    useEffect(() => {
        if (!modelerRef.current || !xml) return;

        modelerRef.current.importXML(xml).then(() => {
            const canvas = modelerRef.current!.get('canvas') as any;
            canvas.zoom('fit-viewport');
        }).catch((err: Error) => {
            console.error('Fehler beim Laden des BPMN:', err);
        });
    }, [xml]);

    return (
        <div
            ref={containerRef}
            className="bpmn-container border border-gray-300 rounded bg-white"
            style={{ height: '600px', width: '100%' }}
        />
    );
}