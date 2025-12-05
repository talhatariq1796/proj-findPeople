import React, { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import withFormSubmit from "../hoc/withFormSubmit";
import SmartSearchForm from "./SmartSearchForm";
import DynamicTable from "./DynamicTable";

const FormWithTable = ({
  apiResponse,
  loading,
  loadingMore,
  error,
  onLoadMore,
  hasMore,
  ...formProps
}) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="relative w-full flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-7">
      <div className="lg:hidden flex justify-between items-center">
        <button
          type="button"
          onClick={openSidebar}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <FiMenu className="text-base" />
          Filters
        </button>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-11/12 max-w-sm transform bg-white transition-transform rounded-2xl duration-300 shadow-2xl lg:relative lg:inset-auto lg:w-[25%] lg:max-w-none lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Search Filters"
      >
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <p className="text-sm font-semibold text-gray-900">Filters</p>
          <button
            type="button"
            onClick={closeSidebar}
            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
            aria-label="Close filters"
          >
            <FiX />
          </button>
        </div>
        <div className="h-full overflow-y-auto p-4 lg:p-0">
          <SmartSearchForm {...formProps} />
        </div>
      </aside>

      <div className="w-full lg:w-[75%]">
        <DynamicTable
          data={apiResponse}
          loading={loading}
          loadingMore={loadingMore}
          error={error}
          onLoadMore={onLoadMore}
          hasMore={hasMore}
        />
      </div>
    </div>
  );
};

const SmartSearchFormWithSubmit = withFormSubmit(FormWithTable);

export default SmartSearchFormWithSubmit;
