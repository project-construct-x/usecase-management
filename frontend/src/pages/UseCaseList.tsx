import CrudTable from "../components/CrudTable.tsx";
import { api } from "../api/api.ts";
import type { UseCase } from "../types.ts";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FileText } from "lucide-react";

export default function UseCaseList() {
    const [rows, setRows] = useState<UseCase[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setIsLoading(true);
        try {
            const data = await api.listUseCases();
            setRows(data);
        } catch (error) {
            console.error("Fehler beim Laden der Use Cases:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function onDelete(id: number) {
        if (!confirm("Löschen?")) return;
        await api.deleteUseCase(id);
        setRows((prev) => prev.filter((r) => r.id !== id));
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div className="page-header-icon">
                    <FileText size={22} />
                </div>
                <div>
                    <div className="page-header-title">Use Cases</div>
                    <div className="page-header-sub">Verwalten Sie Ihre Use Cases</div>
                </div>
            </div>

            <CrudTable
                basePath="/usecases"
                onDelete={onDelete}
                rows={rows}
                title="Alle Use Cases"
                createLabel="Neuer Use Case"
                onCreateClick={() => navigate("/usecases/new")}
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
                        key: "keywords",
                        title: "Keywords",
                        render: (r) => (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4}}>
                                {r.keywords.slice(0, 3).map((keyword, idx) => (
                                    <span key={idx} className="badge badge-gray">
                                        {keyword}
                                    </span>
                                ))}
                                {r.keywords.length > 3 && (
                                    <span className="badge badge-primary">
                                        +{r.keywords.length - 3}
                                    </span>
                                )}
                            </div>
                        ),
                    },
                    {
                        key: "roles",
                        title: "Rollen",
                        render: (r) => (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                {r.roles.slice(0, 2).map((role, idx) => (
                                    <span key={idx} className="badge badge-primary">
                                        {role.name}
                                    </span>
                                ))}
                                {r.roles.length > 2 && (
                                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                        +{r.roles.length - 2} weitere
                                    </span>
                                )}
                            </div>
                        ),
                    },
                    {
                        key: "subusecases",
                        title: "Sub Use Cases",
                        sortable: true,
                        render: (r) => (
                            <span
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 26,
                                    height: 26,
                                    borderRadius: "var(--radius-sm)",
                                    background: "var(--accent-subtle)",
                                    color: "var(--accent-text)",
                                    fontSize: 12,
                                    fontWeight: 700,
                                }}
                            >
                                {r.subUseCases.length}
                            </span>
                        ),
                    },
                ]}
            />
        </div>
    );
}