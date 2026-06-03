import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api.ts";
import type { PropertyGroup } from "../types.ts";
import CrudTable from "../components/CrudTable.tsx";
import { FolderTree } from "lucide-react";

export default function PropertyGroupList() {
  const navigate = useNavigate();
  const [propertyGroups, setPropertyGroups] = useState<PropertyGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPropertyGroups();
  }, []);

  async function loadPropertyGroups() {
    setIsLoading(true);
    try {
      const data = await api.listPropertyGroups();
      const filtered = data.filter(
        (pg: PropertyGroup) => pg.category !== "Klasse"
      );
      setPropertyGroups(filtered);
    } catch (error) {
      console.error("Fehler beim Laden der Property Groups:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function onDelete(uuid: string) {
    if (!confirm("Property Group wirklich löschen?")) return;
    await api.deletePropertyGroup(uuid);
    await loadPropertyGroups();
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-icon">
          <FolderTree size={22} />
        </div>
        <div>
          <div className="page-header-title">Merkmalsgruppen</div>
          <div className="page-header-sub">Verwalten Sie Ihre Merkmalsgruppen</div>
        </div>
      </div>

      <CrudTable
        basePath="/propertygroups"
        onDelete={(id) => onDelete(String(id))}
        rows={propertyGroups.map(r => ({ ...r, id: r.UUID }))}
        title="Alle Merkmalsgruppen"
        createLabel="Neue Merkmalsgruppe"
        onCreateClick={() => navigate("/propertygroups/new")}
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
            title: "Definition",
          },
          {
            key: "active",
            title: "Status",
            render: (r) => (
              <span>{r.active ? "Aktiv" : "Inaktiv"}</span>
            )
          },
          {
            key: "version",
            title: "Version",
            render: (r) => (
              <span>{`${r.version}.${r.number_of_revision}`}</span>
            )
          },
        ]}
      />
    </div>
  );
}