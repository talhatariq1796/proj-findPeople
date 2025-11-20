import React from "react";

const ALL_FIELDS = [
  "location",
  "industry",
  "staffSize",
  "keywords",
  "jobTitles",
];

const LABELS = {
  location: "Location",
  industry: "Industry",
  staffSize: "Staff Size",
  keywords: "Keywords",
  jobTitles: "Job Titles",
};

const FieldChecklist = ({ values, setFieldValue }) => {
  const toggleField = (fieldKey) => {
    const isActive = values.activeFields.includes(fieldKey);
    if (isActive) {
      setFieldValue(
        "activeFields",
        values.activeFields.filter((f) => f !== fieldKey)
      );
      // optionally also clear formData for that key
      setFieldValue(`formData.${fieldKey}`, "");
    } else {
      setFieldValue("activeFields", [...values.activeFields, fieldKey]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">
        Select fields to include
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {ALL_FIELDS.map((field) => {
          const isActive = values.activeFields.includes(field);

          return (
            <button
              key={field}
              type="button"
              onClick={() => toggleField(field)}
              className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                    : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                }`}
            >
              {LABELS[field]}
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-xs text-gray-500">
        Tap a button to toggle a field. Only active ones will be validated and
        sent.
      </p>
    </div>
  );
};

export default FieldChecklist;
