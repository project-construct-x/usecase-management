import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { api, BASE } from "../api/api.ts";
import type { SubUseCase, Role, UseCase } from "../types.ts";
import MultiSelect from "../components/MultiSelect.tsx";


export default function SubUseCaseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [item, setItem] = useState<SubUseCase>({
        id: 0,
        name: "",
        description: "",
        roles: [],
        useCase_id: 0,
        bpmn_png_url: undefined,
    });

    const [roles, setRoles] = useState<Role[]>([]);
    const [useCases, setUseCases] = useState<UseCase[]>([])
    const [uploadingBpmn, setUploadingBpmn] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        api.listRoles().then(setRoles);
        api.listUseCases().then(setUseCases);

        if (id !== "new") {
            api.getSubUseCase(Number(id)).then(setItem);
        } else {
            const useCase_id = searchParams.get("useCaseId");
            if (useCase_id) {
                setItem(prev => ({ ...prev, useCase_id: Number(useCase_id) }));
            }
        }
    }, [id, searchParams]);

    // Cleanup preview URL
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        }
    }, [previewUrl]);

    async function save() {
        if (!item.useCase_id) {
            alert("Bitte einen Use Case auswählen!");
            return;
        }

        const payload = {
            name: item.name,
            description: item.description,
            useCase_id: item.useCase_id,
            roles: item.roles.map((r) => r.id),
        };

        try {
            if (id === "new") {
                const created = await api.createSubUseCase(payload);

                if (selectedFile) {
                    setUploadingBpmn(true);
                    await api.uploadSubUseCaseBPMN(created.id, selectedFile);
                    setUploadingBpmn(false);
                }

                navigate(`/subusecases/${created.id}`);
            } else {
                await api.updateSubUseCase(Number(id), payload);

                if (selectedFile) {
                    setUploadingBpmn(true);
                    const updated = await api.uploadSubUseCaseBPMN(Number(id), selectedFile);
                    setItem(updated);
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setUploadingBpmn(false);
                }
                navigate(`/subusecases/${id}`);
            }
        } catch (error) {
            console.error("Fehler beim Speichern:", error);
            alert("Fehler beim Speichern!");
        }
    }

    async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "image/png") {
            alert("Nur PNG-Dateien sind erlaubt!");
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB Limit
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

    const selectedUseCase = useCases.find(uc => uc.id === item.useCase_id);

    const displayImageUrl = previewUrl || (item.bpmn_png_url ? `${BASE}${item.bpmn_png_url}` : null);

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                {id === "new"
                    ? `Neuer SubUseCase${selectedUseCase ? ` für "${selectedUseCase.name}"` : ''}`
                    : `SubUseCase: ${item.name}`
                }
            </h1>

            <div className="bg-white rounded-lg shadow p-6">
                {/* UseCase Dropdown */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">
                        Use Case <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={item.useCase_id || ""}
                        onChange={(e) => setItem({ ...item, useCase_id: Number(e.target.value) })}
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

                {/* Name */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">
                        Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={item.name}
                        onChange={(e) => setItem({ ...item, name: e.target.value })}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="z.B. Lastflussberechnung"
                    />
                </div>

                {/* Description */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">Beschreibung</label>
                    <textarea
                        value={item.description}
                        onChange={(e) => setItem({ ...item, description: e.target.value })}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        placeholder="Beschreibe den SubUseCase..."
                    />
                </div>

                {/* Rollen */}
                <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-1">Rollen</label>
                    <MultiSelect
                        options={roles}
                        value={item.roles.map((r) => r.id)}
                        onChange={(ids) => {
                            const selectedRoles = roles.filter((r) => ids.includes(r.id));
                            setItem({ ...item, roles: selectedRoles });
                        }}
                    />
                </div>

                {/* BPMN-Modell Upload */}
                <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">
                        BPMN-Modell (PNG)
                    </label>

                    {/* Bild Preview/Anzeige */}
                    {displayImageUrl && (
                        <div className="mb-4 border rounded-lg p-4 bg-gray-50">
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

                    {/* Upload Controls */}
                    <div className="flex items-center gap-3">
                        <label className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                            {displayImageUrl ? "Bild ersetzen" : "Bild auswählen"}
                            <input
                                type="file"
                                accept="image/png"
                                onChange={handleFileSelect}
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
                    <p className="text-sm text-gray-500 mt-2">
                        Nur PNG-Dateien, maximal 5MB
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={save}
                        disabled={uploadingBpmn}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {uploadingBpmn ? "Wird hochgeladen..." : "Speichern"}
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        disabled={uploadingBpmn}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors disabled:cursor-not-allowed"
                    >
                        Zurück
                    </button>
                </div>
            </div>
        </div>
    );
}
