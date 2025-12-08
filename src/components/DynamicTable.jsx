import React from "react";
import { FaDownload } from "react-icons/fa";

const DynamicTable = ({
  data,
  loading,
  error,
  pagination,
  onPageChange,
}) => {
  const displayLeads = data?.visibleLeads || data?.leads || [];
  const columnSource = data?.leads && data.leads.length ? data.leads : displayLeads;

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
          <div className="text-gray-900 text-center">
            No data available. Kindly perform a query to see results.
          </div>
        </div>
      </div>
    );
  }

  // Get all unique keys from all leads to create columns
  const allKeys = new Set();
  columnSource.forEach((lead) => {
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
  
    const str = String(value).trim();
  
    // URL patterns
    const fullUrlRegex = /^https?:\/\/[^\s]+$/i;
    const wwwRegex = /^www\.[^\s]+$/i;
  
    // Full URL
    if (fullUrlRegex.test(str)) {
      return (
        <a
          href={str}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 underline hover:text-indigo-800 break-all"
        >
          {str}
        </a>
      );
    }
  
    // www only — prepend https://
    if (wwwRegex.test(str)) {
      const fixedUrl = `https://${str}`;
      return (
        <a
          href={fixedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 underline hover:text-indigo-800 break-all"
        >
          {str}
        </a>
      );
    }
  
    // Long strings fallback
    if (str.length > 100) {
      return (
        <span title={str} className="truncate block max-w-xs">
          {str.substring(0, 100)}...
        </span>
      );
    }
  
    return str;
  };
  
  

  // Format column name for display
  const formatColumnName = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const paginationState = pagination || {};
  const pageNumbers = (paginationState.pageNumbers || []).sort((a, b) => a - b);
  const currentPage = paginationState.currentPage || 1;
  const hasMore = paginationState.hasMore;
  const isPageLoading = paginationState.isPageLoading;

  const nextPageNumber =
    pageNumbers.length > 0 ? pageNumbers[pageNumbers.length - 1] + 1 : 1;

  const displayedPages = [...pageNumbers];
  if (hasMore) {
    displayedPages.push(nextPageNumber);
  }

  const handlePageClick = (page) => {
    if (!onPageChange) return;
    const isLoaded = pageNumbers.includes(page);
    const canFetch = hasMore && page === nextPageNumber;
    if (isLoaded || canFetch) {
      onPageChange(page);
    }
  };

  
  return (

    <div className="w-full mx-auto bg-white border border-gray-200 rounded-2xl shadow-md p-6 h-[90vh] overflow-hidden relative pb-[150px]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Search Results</h2>
          {data.total !== undefined && (
            <p className="text-sm text-gray-500 mt-1">
              Total: {data.total.toLocaleString()} | Page {currentPage} • Showing {displayLeads.length} / 50
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
      <div className="overflow-x-auto h-full overflow-y-auto">
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
            {displayLeads.map((lead, index) => (
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
      {/* Pagination */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border border-gray-200 ">
        {displayedPages.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 p-4">
            <button
              onClick={() => handlePageClick(currentPage - 1)}
              disabled={currentPage === 1 || isPageLoading}
              className="px-3 py-1 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Prev
            </button>

            {displayedPages.map((page) => {
              const isActive = page === currentPage;
              const isLoaded = pageNumbers.includes(page);
              const canFetch = hasMore && page === nextPageNumber;
              const disabled = isPageLoading || (!isLoaded && !canFetch);

              return (
                <button
                  key={page}
                  onClick={() => handlePageClick(page)}
                  disabled={disabled}
                  className={`px-3 py-1 text-sm rounded-md border transition-colors ${isActive
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                    } ${disabled ? "opacity-60" : ""}`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => handlePageClick(currentPage + 1)}
              disabled={
                isPageLoading ||
                (!hasMore && currentPage === displayedPages[displayedPages.length - 1])
              }
              className="px-3 py-1 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>

            {isPageLoading && (
              <span className="text-xs text-gray-500 ml-2">Loading page...</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicTable;

