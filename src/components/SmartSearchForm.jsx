import React, { useMemo } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FaPaperPlane } from "react-icons/fa";
import { RiResetLeftLine } from "react-icons/ri";

const validationSchema = Yup.object().shape({
  apiKey: Yup.string().required("API Key is required"),

  formData: Yup.object().test(
    "at-least-one-field",
    "Please fill at least one search field",
    function (formData = {}) {
      const fields = [
        "location",
        "industry",
        "staffSize",
        "keywords",
        "jobTitles",
      ];

      // Check if any of the fields has a non-empty value
      const hasAnyField = fields.some((f) => {
        const value = formData[f];

        // Handle string or array/string-like fields
        if (Array.isArray(value)) {
          return value.some(
            (v) => typeof v === "string" && v.trim().length > 0
          );
        }

        return typeof value === "string"
          ? value.trim().length > 0
          : value !== null && value !== undefined;
      });

      if (!hasAnyField) {
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
      formData: {
        location: "",
        industry: "",
        staffSize: "",
        keywords: "",
        jobTitles: "",
      },
    }),
    [initialApiKey]
  );

  const fields = ["location", "industry", "staffSize", "keywords", "jobTitles"];

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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-3">
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
              {fields.map((field) => (
                <div key={field} className="relative">
                  <input
                    id={field}
                    name={`formData.${field}`}
                    type="text"
                    placeholder=" "
                    value={values.formData[field]}
                    onChange={(e) =>
                      setFieldValue(`formData.${field}`, e.target.value)
                    }
                    onBlur={() =>
                      setFieldTouched(`formData.${field}`, true, false)
                    }
                    className="
                      block px-3 pb-2.5 pt-4 w-full text-sm text-gray-900
                      bg-transparent rounded-xl border border-gray-300
                      appearance-none focus:outline-none focus:ring-0
                      focus:border-indigo-600 peer
                    "
                  />

                  {/* FLOATING LABEL EXACT LIKE YOUR EXAMPLE */}
                  <label
                    htmlFor={field}
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
                    {field.replace(/([A-Z])/g, " $1")}
                  </label>

                  {/* Field Error */}
                  {errors.formData &&
                    errors.formData[field] &&
                    touched.formData?.[field] && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.formData[field]}
                      </p>
                    )}
                </div>
              ))}
            </div>
      

            {/* Global Error */}
            {typeof errors.formData === "string" && (
              <p className="text-xs text-red-600">{errors.formData}</p>
            )}

            {/* Footer */}
            <div className="flex flex-col gap-5 items-center justify-between pt-3 sm:flex-row">
              <div className="bg-blue-50 border border-blue-700 rounded-lg px-3 py-1 text-center">
                <p className="text-[11px] text-red-700 font-medium tracking-wide">
                  ${COST_PER_SEARCH.toFixed(3)} per search
                </p>
                <p className="text-[11px] text-gray-700">
                  Searches: {searchCount} • Total: ${totalCost}
                </p>
              </div>

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
          </Form>
        );
      }}
    </Formik>
  );
};

export default SmartSearchForm;
