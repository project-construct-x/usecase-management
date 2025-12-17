import CrudTable from "../components/CrudTable.tsx";
import { api } from "../api/api.ts";
import type { UseCase } from "../types.ts";
import { useNavigate } from "react-router-dom";
import {useEffect, useState} from "react";

export default function UseCaseList() {
    const [rows, setRows] = useState<UseCase[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.listUseCases().then(setRows)
    }, []);

    async function onDelete(id: number) {
        if (!confirm("Löschen?")) return;
        await api.deleteUseCase(id);
        setRows((prev) => prev.filter((r) => r.id !== id));
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-800">UseCases</h1>
                <button
                    onClick={() => navigate("/usecases/new")}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                    Neu
                </button>
            </div>

            <div className="overflow-x-auto">
                <CrudTable
                    basePath="/usecases"
                    onDelete={onDelete}
                    rows={rows}
                    columns={[
                        { key: "name", title: "Name" },
                        {
                            key: "keywords",
                            title: "Keywords",
                            render: (r) => r.keywords.join(", "),
                        },
                        {
                            key: "roles",
                            title: "Rollen",
                            render: (r) => r.roles.map((x) => x.name).join(", "),
                        },
                        {
                            key: "subusecases",
                            title: "SubUseCases",
                            render: (r) => r.subUseCases.length,
                        },
                    ]}
                />
            </div>
        </div>
    );
}