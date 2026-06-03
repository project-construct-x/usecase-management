import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api.ts";
import type { Property } from "../types.ts";
import CrudTable from "../components/CrudTable.tsx";
import { Tags } from "lucide-react";

export default function PropertyList() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  async function loadProperties() {
    setIsLoading(true);
    try {
      const data = await api.listProperties();
      setProperties(data);
    } catch (error) {
      console.error("Fehler beim Laden der Properties:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function onDelete(uuid: string) {
    if (confirm("Property wirklich löschen?")) {
      try {
        await api.deleteProperty(uuid);
        await loadProperties();
      } catch (error) {
        console.error("Fehler beim Löschen:", error);
        alert("Fehler beim Löschen des Properties");
      }
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-icon">
          <Tags size={22} />
        </div>
        <div>
          <div className="page-header-title">Merkmale</div>
          <div className="page-header-sub">Verwalten Sie Ihre Merkmale</div>
        </div>
      </div>

      <CrudTable
        basePath="/properties"
        onDelete={(id) => onDelete(String(id))}
        rows={properties.map(p => ({ ...p, id: p.UUID }))}
        title="Alle Merkmale"
        createLabel="Neues Merkmal"
        onCreateClick={() => navigate("/properties/new")}
        isLoading={isLoading}
        maxHeight="100%"
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
          {
            key: "data_type",
            title: "Datentyp",
            render: (p) => (
              <span >{p.data_type || "-"}</span>
            )
          },
        ]}
      />
    </div>
  );
}