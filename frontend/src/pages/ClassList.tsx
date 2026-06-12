import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {api} from "../api/api.ts";
import type {PropertyGroup} from "../types.ts";
import CrudTable from "../components/CrudTable.tsx";
import {Boxes} from "lucide-react";
import {getLabel} from "../components/helper.tsx";

export default function ClassList() {
  const navigate = useNavigate();
  // es werden hier Klassen gelistet, im Hintergrund handelt es sich aber auch um PropertyGroups
  // im Backend sind Klassen auch als PropertyGroup gespeichert
  const [classes, setClasses] = useState<PropertyGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClasses();
  }, []);

  async function loadClasses() {
    setIsLoading(true);
    try {
      const data = await api.listPropertyGroupsByCategory("CLASS");
      setClasses(data);
    } catch (error) {
      console.error("Fehler beim Laden der Klassen:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function onDelete(uuid: string) {
    if (!confirm("Klasse wirklich löschen?")) return;
    await api.deletePropertyGroup(uuid);
    await loadClasses();
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-icon">
          <Boxes size={22}/>
        </div>
        <div>
          <div className="page-header-title">Klassen</div>
          <div className="page-header-sub">Verwalten Sie Ihre Klassen</div>
        </div>
      </div>

      <CrudTable
        basePath="/classes"
        onDelete={(id) => onDelete(String(id))}
        rows={classes.map(r => ({...r, id: r.UUID}))}
        title="Alle Klassen"
        createLabel="Neue Klasse"
        onCreateClick={() => navigate("/classes/new")}
        isLoading={isLoading}
        columns={[
          {
            key: "name",
            title: "Name",
            render: (r) => (
              <span style={{fontWeight: 600}}>{getLabel(r.name)}</span>
            )
          },
          {
            key: "definition",
            title: "Definition",
            render: (r) => (
              <span>{getLabel(r.definition)}</span>
            )
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