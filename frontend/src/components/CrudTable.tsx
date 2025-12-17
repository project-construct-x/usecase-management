import React from "react";
import { Link } from "react-router-dom";

export interface Column<T> {
    key: keyof T | string;
    title: string;
    render?: (row: T) => React.ReactNode;
}

interface Props<T extends { id: number }> {
    columns: Column<T>[];
    rows: T[];
    basePath: string;
    onDelete: (id: number) => void;
}

export default function CrudTable<T extends { id: number }>({
                                                                columns,
                                                                rows,
                                                                basePath,
                                                                onDelete,
                                                            }: Props<T>) {
    return (
        <table className="min-w-full bg-white border rounded shadow-sm">
            <thead className="bg-gray-100 border-b">
            <tr>
                {columns.map((c) => (
                    <th
                        key={String(c.key)}
                        className="text-left px-4 py-2 font-medium text-gray-600"
                    >
                        {c.title}
                    </th>
                ))}
                <th className="px-4 py-2 font-medium text-gray-600">Aktionen</th>
            </tr>
            </thead>

            <tbody>
            {rows.map((row) => (
                <tr key={row.id} className="border-b hover:bg-gray-50">
                    {columns.map((c) => (
                        <td key={String(c.key)} className="px-4 py-2">
                            {c.render
                                ? c.render(row)
                                : String(row[c.key as keyof T])}
                        </td>
                    ))}
                    <td className="px-4 py-2">
                        <Link className="text-blue-600 hover:underline" to={`${basePath}/${row.id}`}>Edit</Link>
                        {" | "}
                        <button
                            className="text-red-600 hover:underline"
                            onClick={() => onDelete(row.id)}
                        >
                            Delete
                        </button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}
