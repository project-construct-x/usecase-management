import type {VersionConflictDetail} from "../types.ts";

type Props = {
  conflict: VersionConflictDetail | null;
  onReload: () => void;
  onForceOverwrite?: () => void;
  className?: string;
};

export default function VersionConflictAlert({
  conflict,
  onReload,
  className = "",
}: Props) {
  if (!conflict) return null;

  return (
    <div className={`alert alert-warning conflict-alert ${className}`.trim()} role="alert">
      <div className="conflict-alert-content">
        <div className="conflict-alert-title">⚠️ Versionskonflikt</div>
        <div>
          Zwischenzeitlich von <strong>{conflict.updated_by ?? "Unbekannt"}</strong> geändert
          {conflict.updated_at
            ? ` (${new Date(conflict.updated_at).toLocaleString("de-DE")})`
            : ""}
          .
        </div>
      </div>

      <div className="conflict-alert-actions">
        <button type="button" onClick={onReload} className="btn btn-secondary btn-xs">
          Neu laden
        </button>
      </div>
    </div>
  );
}