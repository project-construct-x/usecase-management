import CrudTable from "../components/CrudTable.tsx";
import { api } from "../api/api.ts";
import type { Standard } from "../types.ts";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";

export default function StandardList() {
  const [rows, setRows] = useState<Standard[]>([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const data = await api.listStandards();
      setRows(data);
    } catch (error) {
      console.error("Fehler beim Laden der Standards:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function onDelete(id: number) {
    if (!confirm("Löschen?")) return;
    await api.deleteStandard(id);
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-icon">
          <BookOpen size={22} />
        </div>
        <div>
          <div className="page-header-title">Standards</div>
          <div className="page-header-sub">Verwalten Sie Ihre Standards</div>
        </div>
      </div>

      <CrudTable
        basePath="/standards"
        onDelete={onDelete}
        rows={rows}
        title="Alle Standards"
        createLabel="Neuer Standard"
        onCreateClick={() => navigate("/standards/new")}
        isLoading={isLoading}
        columns={[
          {
            key: "category",
            title: "Kategorie"
          },
          {
            key: "number",
            title: "Nummer",
            render: (s) => (
              <span style={{ fontWeight: 600 }}>{s.number}</span>
            )
          },
          {
            key: "title",
            title: "Titel",
            render: (s) => (
              <span style={{ fontWeight: 600 }}>{s.title}</span>
            )
          },
          {
            key: "subTitle",
            title: "Untertitel"
          },
          {
            key: "keywords",
            title: "Keywords",
            render: (r) => (
              <div style={{display: "flex", flexWrap: "wrap", gap: 4}}>
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
        ]}
      />
    </div>
  );
}