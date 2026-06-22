import type { VersionInfo } from "../types.ts";

type Props = {
  staleInfo: VersionInfo | null;
  onReload: () => void;
  onDismiss: () => void;
  className?: string;
};

export default function StaleDataAlert({
  staleInfo,
  onReload,
  onDismiss,
  className = ""
}: Props) {
  if (!staleInfo) return null;

  return (
    <div className={`alert alert-info ${className}`.trim()} role="status">
      <div className="conflict-alert-content">
        <div className="conflict-alert-title">ℹ️ Neuere Version verfügbar</div>
        <div>
          <strong>{staleInfo.updated_by ?? "Jemand"}</strong> hat diesen Eintrag
          zwischenzeitlich gespeichert
          {staleInfo.updated_at
            ? ` (${new Date(staleInfo.updated_at).toLocaleString("de-DE")})`
            : ""}
          . Beim Speichern wird dein Stand abgelehnt.
        </div>
      </div>

      <div className="conflict-alert-actions">
        <button type="button" onClick={onReload} className="btn btn-secondary">
          Neu laden
        </button>
        <button type="button" onClick={onDismiss} className="btn btn-ghost">
          Ignorieren
        </button>
      </div>
    </div>
  );
}