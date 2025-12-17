import CrudTable from "../components/CrudTable.tsx";
import { api } from "../api/api.ts";
import type { Transaction } from "../types.ts";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function TransactionList() {
    const [rows, setRows] = useState<Transaction[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.listTransactions().then(setRows)
    }, []);

    async function onDelete(id: number) {
        if (!confirm("Löschen?")) return;
        await api.deleteTransaction(id);
        setRows((prev) => prev.filter((r) => r.id !== id));
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Transaktionen</h1>
                <button
                    onClick={() => navigate("/transactions/new")}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                    Neu
                </button>
            </div>

            <div className="overflow-x-auto">
                <CrudTable
                    basePath="/transactions"
                    onDelete={onDelete}
                    rows={rows}
                    columns={[
                        { key: "name", title: "Name" },
                        { key: "subUseCase_id", title: "Sub Use Case" },
                        { key: "usesDataspace", title: "Nutzt Datenraum"},
                        { key: "roleIn_id", title: "Ausgehende Rolle"},
                        { key: "roleOut_id", title: "Eingehende Rolle"},
                    ]}
                />
            </div>
        </div>
    );
}