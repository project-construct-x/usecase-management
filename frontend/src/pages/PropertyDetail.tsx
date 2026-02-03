import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/api.ts";
import type { Property, PropertyGroup } from "../types.ts";
import { Search } from "lucide-react";

const emptyProperty: Partial<Property> = {
    active: true,
    name: "",
    definition: "",
    language_of_creator: "de-DE",
    version: 1,
    groups: [],
    dynamic: false,
};

export default function PropertyDetail() {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState<Partial<Property>>(emptyProperty);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"basic" | "technical" | "metadata" | "groups">("basic");

    const [allPropertyGroups, setAllPropertyGroups] = useState<PropertyGroup[]>([]);
    const [filteredGroups, setFilteredGroups] = useState<PropertyGroup[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");

    useEffect(() => {
        loadPropertyGroups();
        if (uuid !== "new") {
            loadProperty();
        }
    }, [uuid]);

    useEffect(() => {
        filterPropertyGroups();
    }, [searchTerm, categoryFilter, allPropertyGroups]);

    async function loadPropertyGroups() {
        try {
            const groups = await api.listPropertyGroups();
            setAllPropertyGroups(groups);
        } catch (error) {
            console.error("Fehler beim Laden der PropertyGroups:", error);
        }
    }

    function filterPropertyGroups() {
        let filtered = allPropertyGroups;

        if (categoryFilter !== "all") {
            filtered = filtered.filter(g => g.category === categoryFilter);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(g =>
                g.name.toLowerCase().includes(term) ||
                g.definition.toLowerCase().includes(term)
            );
        }

        setFilteredGroups(filtered);
    }

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

        if (!item.groups || item.groups.length === 0) {
            alert("Bitte wählen Sie mindestens eine PropertyGroup aus");
            return;
        }

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

    function updateField<K extends keyof Property>(field: K, value: Property[K]) {
        setItem(prev => ({ ...prev, [field]: value }));
    }

    function togglePropertyGroup(groupUuid: string) {
        const currentGroups = item.groups || [];
        const isSelected = currentGroups.includes(groupUuid);

        if (isSelected) {
            updateField("groups", currentGroups.filter(g => g !== groupUuid));
        } else {
            updateField("groups", [...currentGroups, groupUuid]);
        }
    }

    const uniqueCategories = Array.from(new Set(allPropertyGroups.map(g => g.category)));

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
                        onClick={() => setActiveTab("groups")}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === "groups"
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-600 hover:text-gray-800"
                        }`}
                    >
                        Merkmalsgruppen {item.groups && item.groups.length > 0 && (
                            <span className="ml-1 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-sm">
                                {item.groups.length}
                            </span>
                        )}
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

                    {/* PropertyGroups Tab */}
                    {activeTab === "groups" && (
                        <>
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-4">
                                    Wählen Sie mindestens eine Merkmalsgruppe aus. <span className="text-red-500">*</span>
                                </p>

                                {/* Filter */}
                                <div className="flex gap-3 mb-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Suche nach Name oder Definition..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">Alle Kategorien</option>
                                        {uniqueCategories.map(cat => (
                                            <option key={cat} value={cat}>
                                                {cat.replace(/_/g, ' ')}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Ausgewählte Gruppen */}
                                {item.groups && item.groups.length > 0 && (
                                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                                        <p className="text-sm font-medium text-blue-900 mb-2">
                                            Ausgewählt: {item.groups.length} Gruppe(n)
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {item.groups.map(groupUuid => {
                                                const group = allPropertyGroups.find(g => g.UUID === groupUuid);
                                                return group ? (
                                                    <span key={groupUuid} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                                        {group.name}
                                                        <button
                                                            type="button"
                                                            onClick={() => togglePropertyGroup(groupUuid)}
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* PropertyGroup Liste */}
                            <div className="border border-gray-200 rounded max-h-96 overflow-y-auto">
                                {filteredGroups.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">
                                        Keine Merkmalsgruppen gefunden
                                    </div>
                                ) : (
                                    filteredGroups.map(group => {
                                        const isSelected = item.groups?.includes(group.UUID) || false;
                                        return (
                                            <label
                                                key={group.UUID}
                                                className={`flex items-start gap-3 p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
                                                    isSelected ? "bg-blue-50" : ""
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => togglePropertyGroup(group.UUID)}
                                                    className="mt-1 w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-gray-900">{group.name}</span>
                                                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                                            {group.category.replace(/_/g, ' ')}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">{group.definition}</p>
                                                </div>
                                            </label>
                                        );
                                    })
                                )}
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
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="dynamic"
                                        checked={item.dynamic || false}
                                        onChange={(e) => updateField("dynamic", e.target.checked)}
                                        className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label htmlFor="active" className="text-gray-700 font-medium">
                                        Dynamisches Merkmal
                                    </label>
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