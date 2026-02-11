import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronUp, ChevronDown, Search, Trash2, Edit2 } from "lucide-react";

export interface Column<T> {
    key: keyof T | string;
    title: string;
    render?: (row: T) => React.ReactNode;
    sortable?: boolean;
    filterable?: boolean;
}

interface Props<T extends { id: number | string}> {
    columns: Column<T>[];
    rows: T[];
    basePath: string;
    onDelete: (id: T["id"]) => void;
    title?: string;
}

type SortDirection = "asc" | "desc" | null;

export default function CrudTable<T extends { id: number | string }>({
                                                                         columns,
                                                                         rows,
                                                                         basePath,
                                                                         onDelete,
                                                                         title,
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
            if (sortDirection === "asc") {
                setSortDirection("desc");
            } else if (sortDirection === "desc") {
                setSortKey(null);
                setSortDirection(null);
            }
        } else {
            setSortKey(key);
            setSortDirection("asc");
        }
    };

    return (
        <div className="crud-table-container">
            {/* Header */}
            <div className="crud-table-header">
                {title && <h2 className="crud-table-title">{title}</h2>}

                {/* Suchfeld */}
                <div className="crud-search-wrapper">
                    <Search className="crud-search-icon" size={20}/>
                    <input
                        type="text"
                        placeholder="Suchen..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="crud-search-input"
                    />
                </div>
            </div>

            {/* Tabelle */}
            <div className="crud-table-wrapper">
                <table className="crud-table">
                    <thead className="crud-table-thead">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={String(col.key)}
                                className={`crud-table-th ${
                                    col.sortable !== false ? "cursor-pointer select-none" : ""
                                }`}
                                onClick={() => handleSort(String(col.key), col.sortable)}
                            >
                                <div className="crud-table-th-content">
                                    <span>{col.title}</span>
                                    {col.sortable !== false && (
                                        <div className="crud-sort-icons">
                                            <ChevronUp
                                                size={16}
                                                className={
                                                    sortKey === String(col.key) &&
                                                    sortDirection === "asc"
                                                        ? "text-blue-600 dark:text-blue-400"
                                                        : "text-gray-400 dark:text-gray-600"
                                                }
                                            />
                                            <ChevronDown
                                                size={16}
                                                className={
                                                    sortKey === String(col.key) &&
                                                    sortDirection === "desc"
                                                        ? "text-blue-600 dark:text-blue-400"
                                                        : "text-gray-400 dark:text-gray-600"
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            </th>
                        ))}
                        <th className="crud-table-th">Aktionen</th>
                    </tr>
                    </thead>

                    <tbody className="crud-table-tbody">
                    {processedRows.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length + 1}
                                className="crud-table-empty"
                            >
                                Keine Einträge gefunden
                            </td>
                        </tr>
                    ) : (
                        processedRows.map((row) => (
                            <tr key={row.id} className="crud-table-row">
                                {columns.map((col) => (
                                    <td key={String(col.key)} className="crud-table-td">
                                        {col.render
                                            ? col.render(row)
                                            : String(row[col.key as keyof T])}
                                    </td>
                                ))}
                                <td className="crud-table-td">
                                    <div className="crud-actions">
                                        <Link
                                            to={`${basePath}/${row.id}`}
                                            className="crud-action-btn crud-action-edit"
                                            title="Bearbeiten"
                                        >
                                            <Edit2 size={16}/>
                                        </Link>
                                        <button
                                            onClick={() => onDelete(row.id)}
                                            className="crud-action-btn crud-action-delete"
                                            title="Löschen"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* Footer mit Ergebnis-Zähler */}
            {filterText && (
                <div className="crud-table-footer">
                    {processedRows.length} von {rows.length} Einträgen
                </div>
            )}
        </div>
    );
}