import React from "react";
import { createPortal } from "react-dom";

const ConfirmationModal = ({
    pageCount,
    setPageCount,
    estimatedLeads,
    estimatedCredits,
    estimatedCost,
    perSearchCost,
    closeModal,
    proceedSubmit,
}) => {

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Confirm Search
                        </h3>
                        <p className="text-sm text-gray-600">
                            Review estimated usage before proceeding.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={closeModal}
                        className="text-gray-500 hover:text-gray-700 text-lg leading-none"
                        aria-label="Close confirmation"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-3">
                    <label className="flex items-center justify-between gap-3 text-sm font-medium text-gray-700">
                        Pages to scrape (50 leads/page)
                        <input
                            type="number"
                            min="1"
                            value={pageCount}
                            onChange={(e) => setPageCount(e.target.value)}
                            className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                            <p className="text-xs text-gray-500">Estimated leads</p>
                            <p className="text-base font-semibold text-gray-900">
                                {estimatedLeads.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                            <p className="text-xs text-gray-500">Credits needed</p>
                            <p className="text-base font-semibold text-gray-900">
                                {estimatedCredits.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 sm:col-span-2">
                            <p className="text-xs text-gray-500">Estimated cost</p>
                            <p className="text-base font-semibold text-gray-900">
                                ${estimatedCost}
                            </p>
                            <p className="text-[11px] text-gray-500 mt-1">
                                Based on ${perSearchCost} per credit (per page, 50 results).
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={closeModal}
                        className="w-full sm:w-auto px-4 py-2 text-sm rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={proceedSubmit}
                        className="w-full sm:w-auto px-4 py-2 text-sm rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                        Proceed & Search
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default ConfirmationModal;