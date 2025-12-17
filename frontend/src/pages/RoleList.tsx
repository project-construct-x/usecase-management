import CrudTable from "../components/CrudTable.tsx";
import { api } from "../api/api.ts";
import type { Role } from "../types.ts";
import { useNavigate } from "react-router-dom";
import {useEffect, useState} from "react";

export default function RoleList() {
    const [rows, setRows] = useState<Role[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.listRoles().then(setRows)
    }, []);

    async function onDelete(id: number) {
        if (!confirm("Löschen?")) return;
        await api.deleteRole(id);
        setRows((prev) => prev.filter((r) => r.id !== id));
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Rollen</h1>
                <button
                    onClick={() => navigate("/roles/new")}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                    Neu
                </button>
            </div>

            <div className="overflow-x-auto">
                <CrudTable
                    basePath="/roles"
                    onDelete={onDelete}
                    rows={rows}
                    columns={[
                        { key: "name", title: "Name" },
                        { key: "definition", title: "Definition" },
                    ]}
                />
            </div>
        </div>
    );
}