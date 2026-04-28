import CrudTable from "../components/CrudTable.tsx";
import { api } from "../api/api.ts";
import type { Transaction } from "../types.ts";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeftRight } from "lucide-react";

export default function TransactionList() {
    const [rows, setRows] = useState<Transaction[]>([]);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setIsLoading(true);
        try {
            const data = await api.listTransactions();
            setRows(data);
        } catch (error) {
            console.error("Fehler beim Laden der Transaktionen:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function onDelete(id: number) {
        if (!confirm("Löschen?")) return;
        await api.deleteTransaction(id);
        setRows((prev) => prev.filter((r) => r.id !== id));
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div className="page-header-icon">
                    <ArrowLeftRight size={22} />
                </div>
                <div>
                    <div className="page-header-title">Transaktionen</div>
                    <div className="page-header-sub">Verwalten Sie Ihre Transaktionen</div>
                </div>
            </div>

            <CrudTable
                basePath="/transactions"
                onDelete={onDelete}
                rows={rows}
                title="Alle Transaktionen"
                createLabel="Neue Transaktion"
                onCreateClick={() => navigate("/transactions/new")}
                isLoading={isLoading}
                columns={[
                    {
                        key: "subUseCase_name",
                        title: "Sub Use Case",
                    },
                    {
                        key: "name",
                        title: "Name",
                        render: (r) => (
                            <span style={{ fontWeight: 600 }}>{r.name}</span>
                        )
                    },
                    {
                        key: "roleOut",
                        title: "Ausgehende Rolle",
                        render: (r) => (
                            <span>{r.roleOut.name}</span>
                        )
                    },
                    {
                        key: "roleIn",
                        title: "Eingehende Rolle",
                        render: (r) => (
                            <span>{r.roleIn.name}</span>
                        )
                    },
                    {
                        key: "related_class_id",
                        title: "Klasse",
                    },
                    {
                        key: "usesDataspace",
                        title: "Nutzt Datenraum",
                        render: (r) => (
                            <span>{r.usesDataspace ? "Ja" : "Nein"}</span>
                        )
                    }
                ]}
            />
        </div>
    );
}