import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/api.ts";
import type { Transaction, Role, SubUseCase } from "../types.ts";

export default function TransactionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Initialen State mit Query-Parameter setzen
    const [item, setItem] = useState<Transaction>(() => {
        const subUseCase_id = searchParams.get("subUseCaseId");
        return {
            id: 0,
            name: "",
            subUseCase_id: subUseCase_id ? Number(subUseCase_id) : 0,
            usesDataspace: false,
            roleIn_id: 0,
            roleOut_id: 0
        };
    });

    const [subUseCases, setSubUseCases] = useState<SubUseCase[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);

    useEffect(() => {
        api.listRoles().then(setRoles);
        api.listSubUseCases().then(setSubUseCases);

        if (id !== "new") {
            api.getTransaction(Number(id)).then(setItem);
        }
    }, [id]);

    async function save() {
        const payload = {
            name: item.name,
            subUseCase_id: item.subUseCase_id,
            usesDataspace: item.usesDataspace,
            roleIn_id: item.roleIn_id,
            roleOut_id: item.roleOut_id
        };

        if (id === "new") {
            const created = await api.createTransaction(payload);
            navigate(`/transactions/${created.id}`);
        } else {
            await api.updateTransaction(Number(id), payload);
            const updated = await api.getTransaction(Number(id));
            setItem(updated)
        }
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                {id === "new" ? "Neue Transaktion" : `Transaktion ${item.id}`}
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

            {/* Nutzt Dateraum */}
            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Nutzt Datenraum</label>
                <input
                    type="checkbox"
                    checked={item.usesDataspace}
                    onChange={(e) => setItem({ ...item, usesDataspace: e.target.checked })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
    );
}
