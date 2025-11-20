import React from "react";
import { FaSearch } from "react-icons/fa";

const LABELS = {
  location: "Location",
  industry: "Industry",
  staffSize: "Staff Size",
  keywords: "Keywords",
  jobTitles: "Job Titles",
};

const PLACEHOLDERS = {
  location: "Enter location (e.g. Remote, New York)",
  industry: "Enter industry (e.g. SaaS, Fintech)",
  staffSize: "Enter staff size (e.g. 1–10, 50–100)",
  keywords: "Enter keywords (comma separated)",
  jobTitles: "Enter job titles (e.g. Product Manager, Designer)",
};

const SingleInputField = ({
  currentField,
  value,
  error,
  touched,
  setFieldValue,
  setFieldTouched,
  onFieldComplete, 
  onTypingClearError, 
}) => {
  if (!currentField) {
    return (
      <div className="text-sm text-gray-500 italic">
        Select at least one field above to start entering data.
      </div>
    );
  }

  const handleChange = (e) => {
    const newValue = e.target.value;
    setFieldValue(`formData.${currentField}`, newValue);
    if (onTypingClearError) onTypingClearError(newValue);
  };


  const handleBlur = () => {
    setFieldTouched(`formData.${currentField}`, true, false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (onFieldComplete) onFieldComplete();
    }
  };;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {LABELS[currentField]}
      </label>
      <div
        className={`flex items-center gap-2 rounded-xl border px-3 py-2 bg-white shadow-sm
        ${error && touched
            ? "border-red-400 ring-1 ring-red-200"
            : "border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-200"
          }`}
      >
        <FaSearch className="text-gray-400" />
        <input
          type="text"
          className="flex-1 border-none outline-none text-sm bg-transparent"
          placeholder={PLACEHOLDERS[currentField]}
          value={value || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown} 
        />
      </div>
      {error && touched && <p className="mt-1 text-xs text-red-500">{error}</p>}
      <p className="mt-1 text-xs text-gray-400">
        Press Enter to move to the next field.
      </p>
    </div>
  );
};

export default SingleInputField;
