import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/api.ts";
import type { Role, SubUseCase } from "../types.ts";
import CrudTable from "../components/CrudTable.tsx";

export default function RoleDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [item, setItem] = useState<Role>({
        id: 0,
        name: "",
        definition: "",
    });

    const [subUseCases, setSubUseCases] = useState<SubUseCase[]>([]);

    useEffect(() => {
        if (id !== "new") {
            api.getRole(Number(id)).then(setItem);

            api.listSubUseCasesByRole(Number(id)).then(setSubUseCases)
        }
    }, [id]);

    async function save() {
        const payload = {
            name: item.name,
            definition: item.definition
        };

        if (id === "new") {
            const created = await api.createRole(payload);
            navigate(`/roles/${created.id}`);
        } else {
            await api.updateRole(Number(id), payload);
            const updated = await api.getRole(Number(id));
            setItem(updated)
        }
    }

    async function handleDeleteSubUseCase(subId: number) {
        if (confirm("SubUseCase wirklich löschen?")) {
            await api.deleteSubUseCase(subId);
            const updated = await api.listSubUseCasesByRole(Number(id));
            setSubUseCases(updated);
        }
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                {id === "new" ? "Neue Rolle" : `Rolle ${item.id}`}
            </h1>

            {/* Name */}
            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Name</label>
                <input
                    type="text"
                    value={item.name}
                    onChange={(e) => setItem({ ...item, name: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Definition */}
            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Definition</label>
                <input
                    type="text"
                    value={item.definition}
                    onChange={(e) => setItem({ ...item, definition: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* SubUseCases Tabelle - nur wenn nicht "new" */}
            {id !== "new" && (
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Verwendung in Sub Use Cases</h2>
                    </div>
                    {subUseCases.length === 0 ? (
                        <p className="text-gray-500 italic">Diese Rolle wird in keinem Sub Use Case verwendet.</p>
                    ) : (
                        <CrudTable
                            basePath="/subusecases"
                            onDelete={handleDeleteSubUseCase}
                            rows={subUseCases}
                            columns={[
                                { key: "name", title: "Name" },
                                { key: "description", title: "Beschreibung" },
                                {
                                    key: "roles",
                                    title: "Rollen",
                                    render: (r) => r.roles.map((x) => x.name).join(", "),
                                },
                            ]}
                        />
                    )}
                </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={save}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                    Speichern
                </button>
                <button
                    onClick={() => navigate(-1)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
                >
                    Zurück
                </button>
            </div>

        </div>
    );
}
