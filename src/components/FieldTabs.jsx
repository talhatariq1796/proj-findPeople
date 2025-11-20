import React from "react";

const LABELS = {
  location: "Location",
  industry: "Industry",
  staffSize: "Staff Size",
  keywords: "Keywords",
  jobTitles: "Job Titles",
};

const FieldTabs = ({ activeFields, currentField, setCurrentField }) => {
  if (activeFields.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {activeFields.map((field) => {
        const isActive = currentField === field;
        return (
          <button
            key={field}
            type="button"
            onClick={() => setCurrentField(field)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition
              ${
                isActive
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
              }`}
          >
            {LABELS[field]}
          </button>
        );
      })}
    </div>
  );
};

export default FieldTabs;
