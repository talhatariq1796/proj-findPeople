import React from "react";
import { FaDownload } from "react-icons/fa";

const DynamicTable = ({ data, loading, loadingMore, error, onLoadMore, hasMore }) => {
  if (loading) {
    return (
      <div className="w-full mx-auto bg-white border border-gray-200 rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full mx-auto bg-white border border-red-200 rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!data || !data.leads || data.leads.length === 0) {
    return (
      <div className="w-full mx-auto bg-white border border-gray-200 rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">No data available</div>
        </div>
      </div>
    );
  }

  // Get all unique keys from all leads to create columns
  const allKeys = new Set();
  data.leads.forEach((lead) => {
    Object.keys(lead).forEach((key) => allKeys.add(key));
  });

  const columns = Array.from(allKeys);

  const downloadJson = () => {
    const jsonData = {
      total: data.total,
      success: data.success,
      leads: data.leads,
      downloadedAt: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `find-people-results-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const escapeCsvValue = (value) => {
    if (value === null || value === undefined) {
      return "";
    }
    let stringValue = value;
    if (typeof value === "object") {
      stringValue = JSON.stringify(value);
    }
    stringValue = String(stringValue);
    if (stringValue.includes('"') || stringValue.includes(",") || stringValue.includes("\n")) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const downloadCsv = () => {
    const headerRow = columns.map((column) => escapeCsvValue(column)).join(",");
    const rows = data.leads.map((lead) =>
      columns.map((column) => escapeCsvValue(lead[column])).join(",")
    );
    const csvString = [headerRow, ...rows].join("\n");

    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `find-people-results-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Format cell value for display
  const formatCellValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-gray-400 italic">—</span>;
    }
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    if (typeof value === "string" && value.length > 100) {
      return (
        <span title={value} className="truncate block max-w-xs">
          {value.substring(0, 100)}...
        </span>
      );
    }
    return String(value);
  };

  // Format column name for display
  const formatColumnName = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <div className="w-full mx-auto bg-white border border-gray-200 rounded-2xl shadow-md p-6 mt-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Search Results</h2>
          {data.total !== undefined && (
            <p className="text-sm text-gray-500 mt-1">
              Total: {data.total.toLocaleString()} | Showing: {data.leads.length}
              {hasMore && (
                <span className="ml-2 text-indigo-600">(More available)</span>
              )}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadJson}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            title="Download data as JSON"
          >
            <FaDownload />
            JSON
          </button>
          <button
            onClick={downloadCsv}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
            title="Download data as CSV"
          >
            <FaDownload />
            CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200"
                >
                  {formatColumnName(column)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.leads.map((lead, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={column}
                    className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100"
                  >
                    {formatCellValue(lead[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loadingMore ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}

      {!hasMore && data && data.leads && data.leads.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          No more results to load
        </div>
      )}
    </div>
  );
};

export default DynamicTable;

