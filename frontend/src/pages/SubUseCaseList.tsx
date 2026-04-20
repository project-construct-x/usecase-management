import CrudTable from "../components/CrudTable.tsx";
import { api } from "../api/api.ts";
import type { SubUseCase } from "../types.ts";
import { useNavigate } from "react-router-dom";
import {useEffect, useState} from "react";
import { Layers } from "lucide-react";

export default function SubUseCaseList() {
  const [rows, setRows] = useState<SubUseCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [])

  async function loadData() {
    setIsLoading(true);
    try {
      const data = await api.listSubUseCases();
      setRows(data);
    } catch (error) {
      console.error("Fehler beim Laden der Sub Use Cases: ", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function onDelete(id: number) {
    if (!confirm("Löschen?")) return;
    await api.deleteSubUseCase(id);
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-icon">
          <Layers size={22} />
        </div>
        <div>
          <div className="page-header-title">Sub Use Cases</div>
          <div className="page-header-sub">Verwalten Sie Ihre Sub Use Cases</div>
        </div>
      </div>

      <CrudTable
        basePath="/subusecases"
        onDelete={onDelete}
        rows={rows}
        title="Alle Sub Use Cases"
        createLabel="Neuer Sub Use Case"
        onCreateClick={()=> navigate("/subusecases/new")}
        isLoading={isLoading}
        columns={[
          {
            key: "useCase_id",
            title: "Use Case",
            render: (r) => (
              <span style={{ fontWeight: 600 }}>{r.useCase_id}</span>
            )
          },
          {
            key: "name",
            title: "Name",
            render: (r) => (
              <span style={{ fontWeight: 600 }}>{r.name}</span>
            )
          },
          {
            key: "description",
            title: "Beschreibung"
          },
          {
            key: "subUseCase_roles",
            title: "Rollen",
            sortable: false,
            render: (r) => {
              const links = r.subUseCase_roles ?? [];
              return (
                <div style={{display: "flex", flexWrap: "wrap", gap: 4}}>
                  {links.slice(0, 2).map((link, idx) => (
                    <span key={idx} className="badge badge-primary">
                      {link.role.name}
                    </span>
                  ))}
                  {links.length > 2 && (
                    <span style={{fontSize: 11, color: "var(--text-muted)"}}>
                      +{links.length - 2} weitere
                    </span>
                  )}
                </div>
              );
            },
          }
        ]}
      />
    </div>
  );
}