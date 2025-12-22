import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api.ts";
import type { Property } from "../types.ts";
import CrudTable from "../components/CrudTable.tsx";

export default function PropertyList() {
    const navigate = useNavigate();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProperties();
    }, []);

    async function loadProperties() {
        setLoading(true);
        try {
            const data = await api.listProperties();
            setProperties(data);
        } catch (error) {
            console.error("Fehler beim Laden der Properties:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(uuid: string) {
        if (confirm("Property wirklich löschen?")) {
            try {
                await api.deleteProperty(uuid);
                await loadProperties();
            } catch (error) {
                console.error("Fehler beim Löschen:", error);
                alert("Fehler beim Löschen des Properties");
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
                <h1 className="text-2xl font-bold text-gray-800">Merkmale (Properties)</h1>
                <button
                    onClick={() => navigate("/properties/new")}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                    Neues Merkmal
                </button>
            </div>

            {properties.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                    Keine Properties vorhanden. Erstelle ein neues Property.
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow">
                    <CrudTable
                        basePath="/properties"
                        onDelete={(id) => handleDelete(String(id))}
                        rows={properties.map(p => ({ ...p, id: p.UUID }))}
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
                            {
                                key: "data_type",
                                title: "Datentyp",
                                render: (p) => (
                                    <span className="text-sm text-gray-600">
                                        {p.data_type || "-"}
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