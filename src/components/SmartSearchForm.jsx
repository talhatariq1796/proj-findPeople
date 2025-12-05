import React, { useMemo, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FaPaperPlane } from "react-icons/fa";
import { RiResetLeftLine } from "react-icons/ri";
import { FiChevronDown } from "react-icons/fi";
import {
  includeExcludeFieldConfigs,
  headcountFieldConfig,
} from "../constants/filterConfig";

const hasTextValue = (value) =>
  typeof value === "string" && value.trim().length > 0;

const buildInitialFormData = () => {
  const base = {};
  includeExcludeFieldConfigs.forEach(({ key }) => {
    base[key] = { include: "", exclude: "" };
  });
  base[headcountFieldConfig.key] = { moreThan: "", lessThanOrEqual: "" };
  return base;
};

const validationSchema = Yup.object().shape({
  apiKey: Yup.string().required("API Key is required"),

  formData: Yup.object().test(
    "at-least-one-field",
    "Please fill at least one search field",
    function (formData = {}) {
      const hasAnyIncludeExclude = includeExcludeFieldConfigs.some(
        ({ key }) => {
          const value = formData[key] || {};
          return hasTextValue(value.include) || hasTextValue(value.exclude);
        }
      );

      const headcount = formData[headcountFieldConfig.key] || {};
      const hasHeadcount =
        hasTextValue(headcount.moreThan) ||
        hasTextValue(headcount.lessThanOrEqual);

      if (!hasAnyIncludeExclude && !hasHeadcount) {
        return this.createError({
          message: "Please fill at least one search field",
        });
      }

      return true;
    }
  ),
});


const COST_PER_SEARCH = 0.019;

const SmartSearchForm = ({
  onSubmit,
  initialApiKey = "",
  apiKeyLoading = false,
  apiKeyError = "",
  searchCount = 0,
}) => {
  const initialValues = useMemo(
    () => ({
      apiKey: initialApiKey || "",
      formData: buildInitialFormData(),
    }),
    [initialApiKey]
  );
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize
      validationSchema={validationSchema}
      validateOnChange={false}
      validateOnBlur
      onSubmit={onSubmit}
    >
      {({
        values,
        errors,
        touched,
        setFieldValue,
        setFieldTouched,
        resetForm,
        isSubmitting,
        setErrors,
      }) => {
        const handleReset = () => {
          resetForm();
          setErrors({});
        };

        const totalCost = (searchCount * COST_PER_SEARCH).toFixed(3);

        return (
          <Form className="w-full mx-auto bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Smart Search
              </h1>
              <p className="text-xs text-gray-500">Fill the fields below.</p>
            </div>

            {/* API Key Field */}
            <div className="relative">
              <input
                id="apiKey"
                name="apiKey"
                type="password"
                placeholder=" "
                value={values.apiKey}
                onChange={(e) => setFieldValue("apiKey", e.target.value)}
                onBlur={() => setFieldTouched("apiKey", true, false)}
                className="
                  block px-3 pb-2.5 pt-4 w-full text-sm text-gray-900
                  bg-transparent rounded-xl border border-gray-300
                  appearance-none focus:outline-none focus:ring-0
                  focus:border-indigo-600 peer
                "
              />
              <label
                htmlFor="apiKey"
                className="
                  absolute text-sm text-gray-500 duration-300 transform 
                  -translate-y-4 scale-75 left-2 capitalize top-2 z-10 origin-left bg-white px-2

                  peer-placeholder-shown:scale-100
                  peer-placeholder-shown:top-1/2
                  peer-placeholder-shown:-translate-y-1/2

                  peer-focus:top-2
                  peer-focus:scale-75
                  peer-focus:-translate-y-4
                  peer-focus:text-indigo-600
                "
              >
                API Key
              </label>
              {errors.apiKey && touched.apiKey ? (
                <p className="text-xs text-red-600 mt-1">{errors.apiKey}</p>
              ) : (
                <>
                  {apiKeyLoading && (
                    <p className="text-xs text-gray-500 mt-1">Loading API key…</p>
                  )}
                  {!apiKeyLoading && apiKeyError && (
                    <p className="text-xs text-amber-600 mt-1">{apiKeyError}</p>
                  )}
                </>
              )}
            </div>
            <div className="bg-blue-50 border border-blue-700 rounded-lg px-3 py-1 text-center">
                <p className="text-[11px] text-red-700 font-medium tracking-wide">
                  ${COST_PER_SEARCH.toFixed(3)} per search
                </p>
                <p className="text-[11px] text-gray-700">
                  Searches: {searchCount} • Total: ${totalCost}
                </p>
              </div>
            <div className="flex flex-col gap-5 items-center justify-end pt-3 sm:flex-row">
    

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 text-sm rounded-full bg-gray-600 text-white hover:bg-gray-700"
                >
                  <RiResetLeftLine />
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 text-sm rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  <FaPaperPlane />
                  {isSubmitting ? "Submitting..." : "Search"}
                </button>
              </div>
            </div>
            {/* Include / Exclude Filters */}
            <div className="grid grid-cols-1 gap-4">
              {includeExcludeFieldConfigs.map((field) => {
                const sectionId = `section-${field.key}`;
                const isExpanded = !!expandedSections[field.key];

                return (
                  <div
                    key={field.key}
                    className="border border-gray-200 rounded-2xl bg-gray-100"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection(field.key)}
                      className="w-full flex items-center justify-between gap-4 px-4 py-3"
                      aria-expanded={isExpanded}
                      aria-controls={sectionId}
                    >
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-900">
                          {field.label}
                        </p>
                        <p className="text-xs text-gray-600 font-medium">
                          {field.description}
                        </p>
                      </div>
                      <FiChevronDown
                        className={`text-lg text-gray-500 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isExpanded && (
                      <div
                        id={sectionId}
                        className="px-4 pb-4 space-y-4 border-t border-gray-200 pt-4"
                      >
                        <p className="text-[11px] text-gray-500 font-medium">
                          Separate multiple values with commas.
                        </p>
                        <div className="grid grid-cols-1 gap-4">
                          {["include", "exclude"].map((type) => (
                            <div key={`${field.key}-${type}`}>
                              <label
                                htmlFor={`${field.key}-${type}`}
                                className="text-xs font-medium text-gray-600 block mb-1"
                              >
                                {type === "include" ? "Include" : "Exclude"}
                              </label>
                              <input
                                id={`${field.key}-${type}`}
                                name={`formData.${field.key}.${type}`}
                                type="text"
                                placeholder={
                                  field.placeholders?.[type] ||
                                  "Comma separated values"
                                }
                                value={values.formData[field.key]?.[type] || ""}
                                onChange={(e) =>
                                  setFieldValue(
                                    `formData.${field.key}.${type}`,
                                    e.target.value
                                  )
                                }
                                onBlur={() =>
                                  setFieldTouched(
                                    `formData.${field.key}.${type}`,
                                    true,
                                    false
                                  )
                                }
                                className="block w-full px-3 py-2 text-sm text-gray-900 bg-white rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                              <p className="text-[11px] text-gray-500 mt-1">
                                {field.examples?.[type] ||
                                  "Example: value one, value two"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Headcount Filter */}
            {(() => {
              const headcountKey = headcountFieldConfig.key;
              const sectionId = `section-${headcountKey}`;
              const isExpanded = !!expandedSections[headcountKey];
              return (
                <div className="border border-gray-200 rounded-2xl bg-gray-100">
                  <button
                    type="button"
                    onClick={() => toggleSection(headcountKey)}
                    className="w-full flex items-center justify-between gap-4 px-4 py-3"
                    aria-expanded={isExpanded}
                    aria-controls={sectionId}
                  >
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">
                        {headcountFieldConfig.label}
                      </p>
                      <p className="text-xs text-gray-600 font-medium">
                        {headcountFieldConfig.description}
                      </p>
                    </div>
                    <FiChevronDown
                      className={`text-lg text-gray-500 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isExpanded && (
                    <div
                      id={sectionId}
                      className="px-4 pb-4 space-y-4 border-t border-gray-200 pt-4"
                    >
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label
                            htmlFor="headcount-more-than"
                            className="text-xs font-medium text-gray-600 block mb-1"
                          >
                            More Than (&gt;)
                          </label>
                          <input
                            id="headcount-more-than"
                            name={`formData.${headcountFieldConfig.key}.moreThan`}
                            type="number"
                            min="0"
                            placeholder={headcountFieldConfig.placeholders.moreThan}
                            value={
                              values.formData[headcountFieldConfig.key]?.moreThan || ""
                            }
                            onChange={(e) =>
                              setFieldValue(
                                `formData.${headcountFieldConfig.key}.moreThan`,
                                e.target.value
                              )
                            }
                            onBlur={() =>
                              setFieldTouched(
                                `formData.${headcountFieldConfig.key}.moreThan`,
                                true,
                                false
                              )
                            }
                            className="block w-full px-3 py-2 text-sm text-gray-900 bg-white rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          <p className="text-[11px] text-gray-500 mt-1">
                            {headcountFieldConfig.examples.moreThan}
                          </p>
                        </div>
                        <div>
                          <label
                            htmlFor="headcount-less-than"
                            className="text-xs font-medium text-gray-600 block mb-1"
                          >
                            Less Than Or Equal (&lt;=)
                          </label>
                          <input
                            id="headcount-less-than"
                            name={`formData.${headcountFieldConfig.key}.lessThanOrEqual`}
                            type="number"
                            min="0"
                            placeholder={
                              headcountFieldConfig.placeholders.lessThanOrEqual
                            }
                            value={
                              values.formData[headcountFieldConfig.key]
                                ?.lessThanOrEqual || ""
                            }
                            onChange={(e) =>
                              setFieldValue(
                                `formData.${headcountFieldConfig.key}.lessThanOrEqual`,
                                e.target.value
                              )
                            }
                            onBlur={() =>
                              setFieldTouched(
                                `formData.${headcountFieldConfig.key}.lessThanOrEqual`,
                                true,
                                false
                              )
                            }
                            className="block w-full px-3 py-2 text-sm text-gray-900 bg-white rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          <p className="text-[11px] text-gray-500 mt-1">
                            {headcountFieldConfig.examples.lessThanOrEqual}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Global Error */}
            {typeof errors.formData === "string" && (
              <p className="text-xs text-red-600">{errors.formData}</p>
            )}

            {/* Footer */}
      
          </Form>
        );
      }}
    </Formik>
  );
};

export default SmartSearchForm;
