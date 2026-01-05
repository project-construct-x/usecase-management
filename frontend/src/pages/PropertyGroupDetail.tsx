import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/api.ts";
import type { PropertyGroup } from "../types.ts";
import { Category } from "../types.ts";

const emptyPropertyGroup: Partial<PropertyGroup> = {
    active: true,
    name: "",
    definition: "",
    language_of_creator: "de-DE",
    version: 1,
    groups: [],
    category: "Klasse"
};

export default function PropertyGroupDetail() {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState<Partial<PropertyGroup>>(emptyPropertyGroup);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"basic" | "technical" | "metadata">("basic");
    const categories = Object.entries(Category).map(([key, value]) => ({
        key,
        value,
        label: value.replace(/_/g, ' ')
    }));

    useEffect(() => {
        if (uuid !== "new") {
            loadPropertyGroup();
        }
    }, [uuid]);

    async function loadPropertyGroup() {
        setLoading(true);
        try {
            const data = await api.getPropertyGroup(uuid!);
            setItem(data);
        } catch (error) {
            console.error("Fehler beim Laden:", error);
            alert("Property Group konnte nicht geladen werden");
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            if (uuid === "new") {
                console.log(JSON.stringify(item))
                const created = await api.createPropertyGroup(item);
                navigate(`/propertygroups/${created.UUID}`);
            } else {
                await api.updatePropertyGroup(uuid!, item);
                await loadPropertyGroup();
                alert("Property Group erfolgreich aktualisiert");
            }
        } catch (error) {
            console.error("Fehler beim Speichern:", error);
            alert("Fehler beim Speichern der Property Group");
        } finally {
            setLoading(false);
        }
    }

    function updateField(field: keyof PropertyGroup, value: any) {
        setItem(prev => ({ ...prev, [field]: value }));
    }

    if (loading && uuid !== "new") {
        return <div className="p-6 text-center">Laden...</div>;
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                {uuid === "new" ? "Neue Merkmalsgruppe" : `Merkmalgruppe bearbeiten`}
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
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">
                                    Kategorie <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={item.category || ""}
                                    onChange={(e) => updateField("category", e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.key} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
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
                        onClick={() => navigate("/propertygroups")}
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition-colors"
                    >
                        Zurück
                    </button>
                </div>
            </form>
        </div>
    );
}