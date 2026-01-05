import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api.ts";
import type { PropertyGroup } from "../types.ts";
import CrudTable from "../components/CrudTable.tsx";

export default function PropertyGroupList() {
    const navigate = useNavigate();
    const [propertyGroups, setPropertyGroups] = useState<PropertyGroup[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPropertyGroups();
    }, []);

    async function loadPropertyGroups() {
        setLoading(true);
        try {
            const data = await api.listPropertyGroups();
            setPropertyGroups(data);
        } catch (error) {
            console.error("Fehler beim Laden der Property Groups:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(uuid: string) {
        if (confirm("Property Group wirklich löschen?")) {
            try {
                await api.deletePropertyGroup(uuid);
                await loadPropertyGroups();
            } catch (error) {
                console.error("Fehler beim Löschen:", error);
                alert("Fehler beim Löschen der Property Group");
            }
        }
    }

    if (loading) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="text-center py-12">Laden...</div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Merkmalsgruppen (Property Groups)</h1>
                <button
                    onClick={() => navigate("/propertygroups/new")}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                    Neue Merkmalsgruppe
                </button>
            </div>

            {propertyGroups.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                    Keine Merkmalsgruppen vorhanden. Erstelle eine neue Merkmalsgruppe.
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow">
                    <CrudTable
                        basePath="/propertygroups"
                        onDelete={(id) => handleDelete(String(id))}
                        rows={propertyGroups.map(p => ({ ...p, id: p.UUID }))}
                        columns={[
                            {
                                key: "name",
                                title: "Name",
                                render: (p) => (
                                    <div>
                                        <div className="font-medium">{p.name}</div>
                                        <div className="text-xs text-gray-500">
                                            {p.language_of_creator}
                                        </div>
                                    </div>
                                )
                            },
                            {
                                key: "definition",
                                title: "Definition",
                                render: (p) => (
                                    <div className="max-w-md truncate" title={p.definition}>
                                        {p.definition}
                                    </div>
                                )
                            },
                            {
                                key: "active",
                                title: "Status",
                                render: (p) => (
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        p.active 
                                            ? "bg-green-100 text-green-800" 
                                            : "bg-gray-100 text-gray-800"
                                    }`}>
                                        {p.active ? "Aktiv" : "Inaktiv"}
                                    </span>
                                )
                            },
                            {
                                key: "version",
                                title: "Version",
                                render: (p) => (
                                    <span className="text-sm">
                                        v{p.version}
                                        {p.number_of_revision && `.${p.number_of_revision}`}
                                    </span>
                                )
                            },
                        ]}
                    />
                </div>
            )}
        </div>
    );
}