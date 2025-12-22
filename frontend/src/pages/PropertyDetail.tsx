import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/api.ts";
import type { Property } from "../types.ts";

const emptyProperty: Partial<Property> = {
    active: true,
    name: "",
    definition: "",
    language_of_creator: "de-DE",
    version: 1,
    groups: [],
};

export default function PropertyDetail() {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState<Partial<Property>>(emptyProperty);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"basic" | "technical" | "metadata">("basic");

    useEffect(() => {
        if (uuid !== "new") {
            loadProperty();
        }
    }, [uuid]);

    async function loadProperty() {
        setLoading(true);
        try {
            const data = await api.getProperty(uuid!);
            setItem(data);
        } catch (error) {
            console.error("Fehler beim Laden:", error);
            alert("Property konnte nicht geladen werden");
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            if (uuid === "new") {
                const created = await api.createProperty(item);
                navigate(`/properties/${created.UUID}`);
            } else {
                await api.updateProperty(uuid!, item);
                await loadProperty();
                alert("Property erfolgreich aktualisiert");
            }
        } catch (error) {
            console.error("Fehler beim Speichern:", error);
            alert("Fehler beim Speichern des Properties");
        } finally {
            setLoading(false);
        }
    }

    function updateField(field: keyof Property, value: any) {
        setItem(prev => ({ ...prev, [field]: value }));
    }

    if (loading && uuid !== "new") {
        return <div className="p-6 text-center">Laden...</div>;
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                {uuid === "new" ? "Neues Merkmal" : `Merkmal bearbeiten`}
            </h1>

            <form onSubmit={handleSubmit}>
                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b">
                    <button
                        type="button"
                        onClick={() => setActiveTab("basic")}
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
                        onClick={() => setActiveTab("technical")}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === "technical"
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-600 hover:text-gray-800"
                        }`}
                    >
                        Technische Daten
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("metadata")}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === "metadata"
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-600 hover:text-gray-800"
                        }`}
                    >
                        Metadaten
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow p-6 space-y-6">
                    {/* Grunddaten Tab */}
                    {activeTab === "basic" && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
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
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">
                                        Sprache <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        value={item.language_of_creator || ""}
                                        onChange={(e) => updateField("language_of_creator", e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="de-DE">Deutsch (DE)</option>
                                        <option value="en-EN">Englisch (EN)</option>
                                        <option value="fr-FR">Französisch (FR)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-1">
                                    Definition <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={item.definition || ""}
                                    onChange={(e) => updateField("definition", e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-1">
                                    Beschreibung
                                </label>
                                <textarea
                                    rows={3}
                                    value={item.description || ""}
                                    onChange={(e) => updateField("description", e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-1">
                                    Beispiele
                                </label>
                                <textarea
                                    rows={2}
                                    value={item.examples || ""}
                                    onChange={(e) => updateField("examples", e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Beispielwerte für dieses Merkmal"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="active"
                                    checked={item.active || false}
                                    onChange={(e) => updateField("active", e.target.checked)}
                                    className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <label htmlFor="active" className="text-gray-700 font-medium">
                                    Aktiv
                                </label>
                            </div>
                        </>
                    )}

                    {/* Technische Daten Tab */}
                    {activeTab === "technical" && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">
                                        Datentyp
                                    </label>
                                    <select
                                        value={item.data_type || ""}
                                        onChange={(e) => updateField("data_type", e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Bitte wählen</option>
                                        <option value="numerisch">Numerisch</option>
                                        <option value="reell">Reell</option>
                                        <option value="ganze Zahl">Ganze Zahl</option>
                                        <option value="Text">Text</option>
                                        <option value="Boolean">Boolean</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">
                                        Physikalische Größe
                                    </label>
                                    <input
                                        type="text"
                                        value={item.physical_quantity?.[0] || ""}
                                        onChange={(e) => updateField("physical_quantity", [e.target.value])}
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="z.B. Mass, Length, Temperature"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">
                                        Dimension
                                    </label>
                                    <input
                                        type="text"
                                        value={item.dimension || ""}
                                        onChange={(e) => updateField("dimension", e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="z.B. 10 −20000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">
                                        Einheiten (kommagetrennt)
                                    </label>
                                    <input
                                        type="text"
                                        value={item.units?.join(", ") || ""}
                                        onChange={(e) => updateField("units", e.target.value.split(",").map(s => s.trim()))}
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="z.B. m, mm, kg"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-1">
                                    Messverfahren
                                </label>
                                <textarea
                                    rows={2}
                                    value={item.measurement_method || ""}
                                    onChange={(e) => updateField("measurement_method", e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-1">
                                    Mögliche Werte (kommagetrennt)
                                </label>
                                <input
                                    type="text"
                                    value={item.possible_values?.join(", ") || ""}
                                    onChange={(e) => updateField("possible_values", e.target.value.split(",").map(s => s.trim()))}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="z.B. Yes, No, Not Applicable"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">
                                        Dynamisches Merkmal
                                    </label>
                                    <select
                                        value={item.dynamic || ""}
                                        onChange={(e) => updateField("dynamic", e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Bitte wählen</option>
                                        <option value="nein">Nein</option>
                                        <option value="ja">Ja</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">
                                        Toleranz
                                    </label>
                                    <input
                                        type="text"
                                        value={item.tolerance?.[0] || ""}
                                        onChange={(e) => updateField("tolerance", [e.target.value])}
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Metadaten Tab */}
                    {activeTab === "metadata" && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">
                                        Version <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={item.version || 1}
                                        onChange={(e) => updateField("version", parseInt(e.target.value))}
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">
                                        Nummer der Überarbeitung
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.number_of_revision || ""}
                                        onChange={(e) => updateField("number_of_revision", e.target.value ? parseInt(e.target.value) : null)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">
                                        Ursprungsland
                                    </label>
                                    <input
                                        type="text"
                                        value={item.country_of_origin || ""}
                                        onChange={(e) => updateField("country_of_origin", e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="z.B. DE, FR, US"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">
                                        Verwendung in Ländern (kommagetrennt)
                                    </label>
                                    <input
                                        type="text"
                                        value={item.used_in_countries?.join(", ") || ""}
                                        onChange={(e) => updateField("used_in_countries", e.target.value.split(",").map(s => s.trim()))}
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="z.B. DE, FR, US"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-1">
                                    Bild-URL
                                </label>
                                <input
                                    type="url"
                                    value={item.picture_url || ""}
                                    onChange={(e) => updateField("picture_url", e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-1">
                                    Beziehung zu anderen Katalogen
                                </label>
                                <textarea
                                    rows={2}
                                    value={item.relation_to_other_catalogues || ""}
                                    onChange={(e) => updateField("relation_to_other_catalogues", e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-1">
                                    Erläuterung für Ablehnung
                                </label>
                                <textarea
                                    rows={2}
                                    value={item.reason_for_rejection || ""}
                                    onChange={(e) => updateField("reason_for_rejection", e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    >
                        {loading ? "Speichern..." : "Speichern"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/properties")}
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition-colors"
                    >
                        Zurück
                    </button>
                </div>
            </form>
        </div>
    );
}