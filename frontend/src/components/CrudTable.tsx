import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronUp, ChevronDown, Search, Trash2, Edit2, Plus, Inbox } from "lucide-react";

export interface Column<T> {
    key: keyof T | string;
    title: string;
    render?: (row: T) => React.ReactNode;
    sortable?: boolean;
    filterable?: boolean;
}

interface Props<T extends { id: number | string }> {
    columns: Column<T>[];
    rows: T[];
    basePath: string;
    onDelete: (id: T["id"]) => void;
    title?: string;
    createLabel?: string;
    onCreateClick?: () => void;
    isLoading?: boolean;
}

type SortDirection = "asc" | "desc" | null;

export default function CrudTable<T extends { id: number | string }>({
    columns,
    rows,
    basePath,
    onDelete,
    title,
    createLabel = "Neu",
    onCreateClick,
    isLoading = false,
}: Props<T>) {
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const [filterText, setFilterText] = useState("");

    // Sortierung und Filterung
    const processedRows = useMemo(() => {
        let filtered = [...rows];

        // Filtern
        if (filterText) {
            filtered = filtered.filter((row) =>
                columns.some((col) => {
                    if (col.filterable === false) return false;
                    const value = row[col.key as keyof T];
                    return String(value)
                        .toLowerCase()
                        .includes(filterText.toLowerCase());
                })
            );
        }

        // Sortieren
        if (sortKey && sortDirection) {
            filtered.sort((a, b) => {
                const aVal = a[sortKey as keyof T];
                const bVal = b[sortKey as keyof T];

                if (aVal === bVal) return 0;

                let comparison = 0;
                if (typeof aVal === "number" && typeof bVal === "number") {
                    comparison = aVal - bVal;
                } else {
                    comparison = String(aVal).localeCompare(String(bVal));
                }

                return sortDirection === "asc" ? comparison : -comparison;
            });
        }

        return filtered;
    }, [rows, columns, filterText, sortKey, sortDirection]);

    const handleSort = (key: string, sortable?: boolean) => {
        if (sortable === false) return;
        if (sortKey === key) {
            if (sortDirection === "asc") setSortDirection("desc");
            else { setSortKey(null); setSortDirection(null); }
        } else {
            setSortKey(key);
            setSortDirection("asc");
        }
    };

    const handleDelete = async (id: T["id"]) => {
        if (window.confirm("Möchten Sie diesen Eintrag wirklich löschen?")) {
            onDelete(id);
        }
    };

    return (
        <div className="table-container animate-fade-in">
            {/* Toolbar */}
            <div className="table-header">
                {title && <h2 className="table-title">{title}</h2>}

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto"}}>
                    {/* Suchfeld */}
                    <div className="search-wrapper">
                        <Search className="search-icon" size={16} />
                        <input
                            type="text"
                            placeholder="Suchen..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    {/* Create Button */}
                    {onCreateClick && (
                        <button onClick={onCreateClick} className="btn btn-primary btn-m">
                            <Plus size={15} />
                            {createLabel}
                        </button>
                    )}
                </div>
            </div>

            {/* Tabelle */}
            <div style={{ overflowX: "auto"}} className="custom-scrollbar">
                {isLoading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "56px 24px" }}>
                        <div className="spinner" style={{ width: 36, height: 36 }}></div>
                    </div>
                ) : (
                    <table className="table">
                        <thead className="table-thead">
                            <tr>
                                {columns.map((col) => {
                                    const isSorted = sortKey === String(col.key);
                                    return (
                                        <th
                                            key={String(col.key)}
                                            className={`table-th ${col.sortable !== false ? "table-th-sortable" : ""}`}
                                            onClick={() => handleSort(String(col.key), col.sortable)}
                                        >
                                            <div className="table-th-content">
                                                <span>{col.title}</span>
                                                {col.sortable !== false && (
                                                    <div className={`sort-icons ${isSorted ? "sort-icons-active" : ""}`}>
                                                        <ChevronUp
                                                            size={12}
                                                            style={{
                                                                color: isSorted && sortDirection === "asc"
                                                                ? "var(--accent)"
                                                                : undefined,
                                                            }}
                                                        />
                                                        <ChevronDown
                                                            size={12}
                                                            style={{
                                                                color: isSorted && sortDirection === "desc"
                                                                ? "var(--accent)"
                                                                : undefined,
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </th>
                                    );
                                })}
                                <th className="table-th" style={{ width: 72 }}>Aktionen</th>
                            </tr>
                        </thead>

                        <tbody className="table-tbody">
                            {processedRows.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + 1} className="table-empty">
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8}}>
                                            <Inbox
                                                size={40}
                                                style={{ color: "var(--text-muted)", opacity: 0.5 }}
                                                strokeWidth={1.25}
                                            />
                                            <span style={{ fontWeight: 600, color: "var(--text-secondary" }}>
                                                Keine Einträge gefunden
                                            </span>
                                            {filterText && (
                                                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                                    Kein Ergebnis für "{filterText}"
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                processedRows.map((row) => (
                                    <tr key={row.id} className="table-row">
                                        {columns.map((col) => (
                                            <td key={String(col.key)} className="table-td">
                                                {col.render
                                                    ? col.render(row)
                                                    : String(row[col.key as keyof T])}
                                            </td>
                                        ))}
                                        <td className="table-td">
                                            <div className="table-actions">
                                                <Link
                                                    to={`${basePath}/${row.id}`}
                                                    className="action-btn action-edit"
                                                    title="Bearbeiten"
                                                >
                                                    <Edit2 size={15} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(row.id)}
                                                    className="action-btn action-delete"
                                                    title="Löschen"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Footer */}
            {!isLoading && processedRows.length > 0 && (
                <div className="table-footer">
                    {filterText ? (
                        <>
                            <strong style={{ color: "var(--text-primary)" }}>{processedRows.length}</strong>
                            &nbsp;von&nbsp;
                            <strong style={{ color: "var(--text-primary)" }}>{rows.length}</strong>
                            &nbsp;Einträgen&nbsp;
                        </>
                    ) : (
                        <>
                            <strong style={{ color: "var(--text-primary)" }}>{rows.length}</strong>
                            &nbsp;{rows.length === 1 ? "Eintrag" : "Einträge"}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}