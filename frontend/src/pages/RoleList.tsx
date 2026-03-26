import CrudTable from "../components/CrudTable.tsx";
import { api } from "../api/api.ts";
import type { Role } from "../types.ts";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Users } from "lucide-react";

export default function RoleList() {
    const [rows, setRows] = useState<Role[]>([]);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setIsLoading(true);
        try {
            const data = await api.listRoles();
            setRows(data);
        } catch (error) {
            console.error("Fehler beim Laden der Rollen:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function onDelete(id: number) {
        if (!confirm("Löschen?")) return;
        await api.deleteRole(id);
        setRows((prev) => prev.filter((r) => r.id !== id));
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div className="page-header-icon">
                    <Users size={22} />
                </div>
                <div>
                    <div className="page-header-title">Rollen</div>
                    <div className="page-header-sub">Verwalten Sie Ihre Rollen</div>
                </div>
            </div>

            <CrudTable
                basePath="/roles"
                onDelete={onDelete}
                rows={rows}
                title="Alle Rollen"
                createLabel="Neue Rolle"
                onCreateClick={() => navigate("/roles/new")}
                isLoading={isLoading}
                columns={[
                    {
                        key: "name",
                        title: "Name",
                        render: (r) => (
                            <span style={{ fontWeight: 600 }}>{r.name}</span>
                        )
                    },
                    {
                        key: "definition",
                        title: "Definition"
                    }

                ]}
            />
        </div>
    );
}