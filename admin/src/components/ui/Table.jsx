import React from 'react';
import LoadingSpinner from './LoadingSpinner';

function Table({ columns, data, loading = false, onRowClick, emptyMessage = 'No data available' }) {
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-heritage p-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-heritage p-12 text-center">
                <p className="text-gray-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-heritage overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-heritage-beige border-b border-gray-200">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className="px-6 py-4 text-left text-sm font-semibold text-heritage-dark"
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {data.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                onClick={() => onRowClick && onRowClick(row)}
                                className={onRowClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className="px-6 py-4 text-sm text-gray-700"
                                    >
                                        {column.render
                                            ? column.render(row[column.key], row)
                                            : row[column.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Table;
