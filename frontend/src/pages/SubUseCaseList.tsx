import CrudTable from "../components/CrudTable.tsx";
import { api } from "../api/api.ts";
import type { SubUseCase } from "../types.ts";
import { useNavigate } from "react-router-dom";
import {useEffect, useState} from "react";

export default function SubUseCaseList() {
    const [rows, setRows] = useState<SubUseCase[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.listSubUseCases().then(setRows)
    }, []);

    async function onDelete(id: number) {
        if (!confirm("Löschen?")) return;
        await api.deleteSubUseCase(id);
        setRows((prev) => prev.filter((r) => r.id !== id));
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-800">SubUseCases</h1>
                <button
                    onClick={() => navigate("/subusecases/new")}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                    Neu
                </button>
            </div>

            <div className="overflow-x-auto">
                <CrudTable
                    basePath="/subusecases"
                    onDelete={onDelete}
                    rows={rows}
                    columns={[
                        { key: "useCase_id", title: "Use Case"},
                        { key: "name", title: "Name" },
                        { key: "description", title: "Beschreibung"},
                        {
                            key: "roles",
                            title: "Rollen",
                            render: (r) => r.roles.map((x) => x.name).join(", "),
                        },
                    ]}
                />
            </div>
        </div>
    );
}