import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/api.ts";
import type { UseCase, Role } from "../types.ts";
import TagInput from "../components/TagInput.tsx";
import MultiSelect from "../components/MultiSelect.tsx";
import CrudTable from "../components/CrudTable.tsx";

export default function UseCaseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [item, setItem] = useState<UseCase>({
        id: 0,
        name: "",
        keywords: [],
        roles: [],
        subUseCases: [],
    });

    const [roles, setRoles] = useState<Role[]>([]);

    useEffect(() => {
        api.listRoles().then(setRoles);

        if (id !== "new") {
            api.getUseCase(Number(id)).then(setItem);
        }
    }, [id]);

    async function save() {
        const payload = {
            name: item.name,
            keywords: item.keywords,
            roles: item.roles.map((r) => r.id),
        };

        if (id === "new") {
            const created = await api.createUseCase(payload);
            navigate(`/usecases/${created.id}`);
        } else {
            await api.updateUseCase(Number(id), payload);
            // Reload um aktualisierte subUseCases zu bekommen
            const updated = await api.getUseCase(Number(id));
            setItem(updated);
        }
    }

    async function handleDeleteSubUseCase(subId: number) {
        if (confirm("SubUseCase wirklich löschen?")) {
            await api.deleteSubUseCase(subId);
            // Reload UseCase um aktualisierte Liste zu bekommen
            const updated = await api.getUseCase(Number(id));
            setItem(updated);
        }
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                {id === "new" ? "Neuer UseCase" : `UseCase: ${item.name}`}
            </h1>

            {/* Formular */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Allgemeine Informationen</h2>

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

                {/* Keywords */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">Keywords</label>
                    <TagInput
                        value={item.keywords}
                        onChange={(tags) => {
                            setItem({ ...item, keywords: tags });
                        }}
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

            {/* SubUseCases Tabelle - nur wenn nicht "new" */}
            {id !== "new" && (
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Sub Use Cases</h2>
                        <button
                            onClick={() => navigate(`/subusecases/new?useCaseId=${id}`)}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                        >
                            + Neuer SubUseCase
                        </button>
                    </div>

                    {item.subUseCases.length === 0 ? (
                        <p className="text-gray-500 italic">Keine SubUseCases vorhanden</p>
                    ) : (
                        <CrudTable
                            basePath="/subusecases"
                            onDelete={handleDeleteSubUseCase}
                            rows={item.subUseCases}
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
        </div>
    );
}