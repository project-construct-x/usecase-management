import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams, useBlocker } from "react-router-dom";
import { api, BASE } from "../api/api.ts";
import type {SubUseCase, Role, UseCase} from "../types.ts";
import MultiSelect from "../components/MultiSelect.tsx";
import BpmnModelerComponent from "../components/BpmnModelerComponent.tsx";
import type BpmnModeler from "bpmn-js/lib/Modeler";

const emptyDiagram = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                  id="Definitions_1"
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="173" y="102" width="36" height="36"/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

const emptySubUseCase: Partial<SubUseCase> = {
    name: "",
    description: "",
    roles: [],
    useCase_id: 0,
    bpmn_png_url: undefined,
};

export default function SubUseCaseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [item, setItem] = useState<Partial<SubUseCase>>(emptySubUseCase);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"basic" | "bpmn" | "legacy">("basic");

    const [roles, setRoles] = useState<Role[]>([]);
    const [useCases, setUseCases] = useState<UseCase[]>([]);

    // BPMN state
    const modelerRef = useRef<BpmnModeler | null>(null);
    const [bpmnXml, setBpmnXml] = useState<string | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const bpmnFileInputRef = useRef<HTMLInputElement>(null);
    const [loadedBpmnXml, setLoadedBpmnXml] = useState<string | null>(null);

    // Legacy PNG upload state
    const [uploadingBpmn, setUploadingBpmn] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // React Router Blocker für Navigation innerhalb der App
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            hasUnsavedChanges &&
            currentLocation.pathname !== nextLocation.pathname
    );

    useEffect(() => {
        api.listRoles().then(setRoles);
        api.listUseCases().then(setUseCases);

        if (id !== "new") {
            loadSubUseCase();
        } else {
            const useCase_id = searchParams.get("useCaseId");
            if (useCase_id) {
                setItem(prev => ({ ...prev, useCase_id: Number(useCase_id) }));
            }
            setBpmnXml(emptyDiagram);
        }
    }, [id, searchParams]);

    // Warnung bei ungespeicherten Änderungen im BPMN
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    useEffect(() => {
        if (blocker.state === "blocked") {
            const shouldLeave = window.confirm(
                "Sie haben ungespeicherte Änderungen am BPMN-Modell. Möchten Sie diese Seite wirklich verlassen?"
            );
            if (shouldLeave) {
                blocker.proceed();
            } else {
                blocker.reset();
            }
        }
    }, [blocker]);

    async function loadSubUseCase() {
        setLoading(true);
        try {
            const data = await api.getSubUseCase(Number(id));
            setItem(data);
            setBpmnXml(data.bpmn_xml || emptyDiagram);
            setLoadedBpmnXml(data.bpmn_xml || emptyDiagram);
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error("Fehler beim Laden:", error);
            alert("SubUseCase konnte nicht geladen werden");
        } finally {
            setLoading(false);
        }
    }

    // Cleanup preview URL
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    // ---- BPMN-Datei aus Dateisystem laden ----
    async function handleBpmnFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Erlaubte Endungen
        const allowedExtensions = [".bpmn", ".xml"];
        const fileName = file.name.toLowerCase();
        const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

        if (!hasValidExtension) {
            alert("Nur .bpmn- oder .xml-Dateien sind erlaubt.");
            // Input zurücksetzen, damit dieselbe Datei erneut gewählt werden kann
            e.target.value = "";
            return;
        }

        // Größenlimit: 500 KB
        if (file.size > 500 * 1024) {
            alert("Datei ist zu groß! Maximal 500 KB erlaubt.");
            e.target.value = "";
            return;
        }

        // Datei einlesen
        let xmlContent: string;
        try {
            xmlContent = await file.text();
        } catch (err) {
            alert("Datei konnte nicht gelesen werden.");
            console.log(err)
            e.target.value = "";
            return;
        }

        // Grundlegende XML-Validierung: Enthält es einen BPMN-Definitions-Block?
        if (!xmlContent.includes("definitions")) {
            alert("Die Datei scheint kein gültiges BPMN-XML zu sein.\n(Erwartet: <bpmn:definitions> oder <definitions>)");
            e.target.value = "";
            return;
        }

        // XML in den Modeler laden
        if (modelerRef.current) {
            try {
                setBpmnXml(xmlContent);
                setHasUnsavedChanges(true);
            } catch (err) {
                console.error("Fehler beim Importieren des BPMN-XML:", err);
                alert("Das BPMN-XML konnte nicht in den Modeler geladen werden.\nBitte prüfen Sie die Datei.");
                e.target.value = "";
                return;
            }
        } else {
            setBpmnXml(xmlContent);
            setHasUnsavedChanges(true);
        }
        e.target.value = "";
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!item.useCase_id) {
            alert("Bitte einen Use Case auswählen!");
            return;
        }

        setLoading(true);

        try {
            // Aktuelles XML aus dem Modeler holen
            let currentBpmnXml: string | null = null;
            if (modelerRef.current) {
                try {
                    const result = await modelerRef.current.saveXML({ format: true });
                    currentBpmnXml = result.xml || null;
                } catch (err) {
                    console.error('Error saving BPMN XML:', err);
                }
            }

            const payload = {
                name: item.name!,
                description: item.description!,
                useCase_id: item.useCase_id,
                roles: item.roles!.map((r) => r.id),
            };

            if (id === "new") {
                const created = await api.createSubUseCase(payload);

                if (currentBpmnXml) {
                    await api.updateSubUseCaseBPMNXML(created.id, currentBpmnXml);
                }

                navigate(`/subusecases/${created.id}`);
            } else {
                await api.updateSubUseCase(Number(id), payload);

                if (currentBpmnXml) {
                    await api.updateSubUseCaseBPMNXML(Number(id), currentBpmnXml);
                }

                // Legacy PNG hochladen, falls ein neues ausgewählt wurde
                if (selectedFile) {
                    setUploadingBpmn(true);
                    await api.uploadSubUseCaseBPMNPNG(Number(id), selectedFile);
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setUploadingBpmn(false);
                }

                if (currentBpmnXml) {
                    setBpmnXml(currentBpmnXml);
                    setLoadedBpmnXml(currentBpmnXml);
                    setHasUnsavedChanges(false);
                }
                alert("SubUseCase erfolgreich aktualisiert");
            }
        } catch (error) {
            console.error("Fehler beim Speichern:", error);
            alert("Fehler beim Speichern des SubUseCase");
        } finally {
            setLoading(false);
        }
    }

    function updateField(field: keyof SubUseCase, value: SubUseCase[keyof SubUseCase]) {
        setItem(prev => ({ ...prev, [field]: value }));
    }

    async function handlePngFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.includes('image/png')) {
            alert("Nur PNG-Dateien sind erlaubt!");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Datei ist zu groß! Maximal 5MB erlaubt.");
            return;
        }

        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setSelectedFile(file);
    }

    function clearFileSelection() {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setSelectedFile(null);
    }

    async function exportBpmnAsXml() {
        if (!modelerRef.current) return;

        try {
            const result = await modelerRef.current.saveXML({ format: true });
            const blob = new Blob([result.xml || ''], { type: 'text/xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${item.name || 'diagram'}.bpmn`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error exporting BPMN:', err);
            alert('Fehler beim Exportieren des BPMN-Modells');
        }
    }

    async function exportBpmnAsSvg() {
        if (!modelerRef.current) return;

        try {
            const result = await modelerRef.current.saveSVG();
            const blob = new Blob([result.svg || ''], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${item.name || 'diagram'}.svg`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error exporting SVG:', err);
            alert('Fehler beim Exportieren als SVG');
        }
    }

    // Hier wird unter anderem verglichen, ob ein geändertes BPMN doch wieder dem letzten Speicherstand entspricht.
    // Dadurch ist das Banner zu ungespeicherten Änderungen wirklich nur da, wenn es welche gibt.
    // Um nicht nach jeder Änderung zu vergleichen und den Load zu reduzieren, wurde ein Timer ergänzt.

    function handleModelerReady(modeler: BpmnModeler) {
        modelerRef.current = modeler;

        const eventBus = modeler.get('eventBus') as any;
        let debounceTimer: number | undefined;

        eventBus.on('commandStack.changed', () => {
            window.clearTimeout(debounceTimer);
            debounceTimer = window.setTimeout(async () => {
                if (!loadedBpmnXml || !modelerRef.current) return;
                const { xml } = await modelerRef.current.saveXML({ format: false });
                const isDirty = normalizeXml(xml ?? '') !== normalizeXml(loadedBpmnXml);
                setHasUnsavedChanges(isDirty);
            }, 300)
        });
    }

    function handleTabChange(tab: "basic" | "bpmn" | "legacy") {
        if (hasUnsavedChanges && activeTab === "bpmn" && tab !== "bpmn") {
            const shouldSwitch = window.confirm(
                "Sie haben ungespeicherte Änderungen am BPMN-Modell. Möchten sie den Tab wirklich wechseln?"
            );
            if (!shouldSwitch) {
                return;
            }
            setHasUnsavedChanges(false);
        }
        setActiveTab(tab);
    }

    function normalizeXml(xml: string): string {
        return xml
            .replace(/>\s+</g, '><')   // Whitespace zwischen Tags
            .replace(/\s+/g, ' ')      // Mehrfach-Spaces
            .trim();
    }

    const selectedUseCase = useCases.find(uc => uc.id === item.useCase_id);
    const displayImageUrl = previewUrl || (item.bpmn_png_url ? `${BASE}${item.bpmn_png_url}` : null);

    if (loading && id !== "new") {
        return <div className="p-6 text-center">Laden...</div>;
    }

    return (
        <div className="p-6 max-w-8xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                {id === "new"
                    ? `Neuer SubUseCase${selectedUseCase ? ` für "${selectedUseCase.name}"` : ''}`
                    : `Sub Use Case bearbeiten`
                }
            </h1>

            {hasUnsavedChanges && (
                <div className="mb-4 bg-yellow-50 border border-yellow-400 text-yellow-800 px-4 py-3 rounded">
                    ⚠️ Sie haben ungespeicherte Änderungen am BPMN-Modell.
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b">
                    <button
                        type="button"
                        onClick={() => handleTabChange("basic")}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === "basic"
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-600 hover:text-gray-800"
                        }`}
                    >
                        Grunddaten
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange("bpmn")}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === "bpmn"
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-600 hover:text-gray-800"
                        }`}
                    >
                        BPMN-Modell
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange("legacy")}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === "legacy"
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-600 hover:text-gray-800"
                        }`}
                    >
                        PNG-Upload (Legacy)
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow p-6 space-y-6">
                    {/* Grunddaten Tab */}
                    {activeTab === "basic" && (
                        <>
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">
                                    Use Case <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={item.useCase_id || ""}
                                    onChange={(e) => updateField("useCase_id", Number(e.target.value))}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={id !== "new"}
                                >
                                    <option value="">-- Bitte wählen --</option>
                                    {useCases.map((uc) => (
                                        <option key={uc.id} value={uc.id}>
                                            {uc.name}
                                        </option>
                                    ))}
                                </select>
                                {id !== "new" && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        Der Use Case kann nach dem Erstellen nicht mehr geändert werden.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-1">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={item.name || ""}
                                    onChange={(e) => updateField("name", e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="z.B. Lastflussberechnung"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-1">
                                    Beschreibung
                                </label>
                                <textarea
                                    rows={4}
                                    value={item.description || ""}
                                    onChange={(e) => updateField("description", e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Beschreibe den SubUseCase..."
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-1">
                                    Rollen
                                </label>
                                <MultiSelect
                                    options={roles}
                                    value={item.roles?.map((r) => r.id) || []}
                                    onChange={(ids) => {
                                        const selectedRoles = roles.filter((r) => ids.includes(r.id));
                                        updateField("roles", selectedRoles);
                                    }}
                                />
                            </div>
                        </>
                    )}

                    {/* BPMN-Modell Tab */}
                    {activeTab === "bpmn" && (
                        <>
                            <div className="space-y-4">
                                {/* Toolbar: Import + Export */}
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex gap-2">
                                        {/* Versteckter File-Input für .bpmn/.xml */}
                                        <input
                                            ref={bpmnFileInputRef}
                                            type="file"
                                            accept=".bpmn,.xml"
                                            onChange={handleBpmnFileUpload}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => bpmnFileInputRef.current?.click()}
                                            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                                        >
                                            BPMN-Datei importieren
                                        </button>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={exportBpmnAsXml}
                                            className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
                                        >
                                            Als XML exportieren
                                        </button>
                                        <button
                                            type="button"
                                            onClick={exportBpmnAsSvg}
                                            className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
                                        >
                                            Als SVG exportieren
                                        </button>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600">
                                    Bearbeiten Sie hier Ihr BPMN-Prozessmodell. Das Modell wird beim Speichern gesichert.
                                    Sie können auch eine bestehende .bpmn- oder .xml-Datei importieren.
                                </p>

                                {bpmnXml && activeTab === "bpmn" && (
                                    <BpmnModelerComponent
                                        key={id}
                                        xml={bpmnXml}
                                        onModelerReady={handleModelerReady}
                                    />
                                )}

                                <p className="text-xs text-gray-500">
                                    Tipp: Nutzen Sie die Werkzeugleiste links zum Erstellen von BPMN-Elementen.
                                    Mit dem Mausrad können Sie zoomen, mit gedrückter Maustaste verschieben.
                                </p>
                            </div>
                        </>
                    )}

                    {/* Legacy PNG Upload Tab */}
                    {activeTab === "legacy" && (
                        <>
                            <div className="space-y-4">
                                <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Hinweis:</strong> Der PNG-Upload ist eine Legacy-Funktion.
                                        Es wird empfohlen, den BPMN-Modeler im Tab "BPMN-Modell" zu verwenden,
                                        da dieser eine bessere Bearbeitung und automatische Speicherung bietet.
                                    </p>
                                </div>

                                {displayImageUrl && (
                                    <div className="border rounded-lg p-4 bg-gray-50">
                                        <img
                                            src={displayImageUrl}
                                            alt="BPMN Modell"
                                            className="max-w-full h-auto rounded shadow"
                                        />
                                        {previewUrl && (
                                            <p className="text-sm text-blue-600 mt-2">
                                                ✓ Neue Datei ausgewählt (wird beim Speichern hochgeladen)
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-3 flex-wrap">
                                    <label className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                                        {displayImageUrl ? "PNG ersetzen" : "PNG hochladen"}
                                        <input
                                            type="file"
                                            accept="image/png"
                                            onChange={handlePngFileSelect}
                                            className="hidden"
                                        />
                                    </label>

                                    {selectedFile && (
                                        <button
                                            type="button"
                                            onClick={clearFileSelection}
                                            className="text-red-600 hover:underline"
                                        >
                                            Auswahl aufheben
                                        </button>
                                    )}

                                    {item.bpmn_png_url && !previewUrl && (
                                        <a
                                            href={`${BASE}${item.bpmn_png_url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            In neuem Tab öffnen
                                        </a>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500">
                                    PNG-Bilder, maximal 5MB
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                    <button
                        type="submit"
                        disabled={loading || uploadingBpmn}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading || uploadingBpmn ? "Speichern..." : "Speichern"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        disabled={loading || uploadingBpmn}
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition-colors disabled:cursor-not-allowed"
                    >
                        Zurück
                    </button>
                </div>
            </form>
        </div>
    );
}