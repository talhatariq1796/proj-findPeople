import React, { useState } from "react";
import {
  includeExcludeFieldConfigs,
  headcountFieldConfig,
} from "../constants/filterConfig";

const parseCommaSeparatedValues = (value = "") =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

const withFormSubmit = (WrappedComponent) => {
  const WithFormSubmit = (props) => {
    const [apiResponse, setApiResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [currentQuery, setCurrentQuery] = useState(null);
    const [currentApiKey, setCurrentApiKey] = useState(null);
    const [paginationToken, setPaginationToken] = useState(null);
    const [searchCount, setSearchCount] = useState(0);

    const hasResults = (response) =>
      response &&
      Array.isArray(response.leads) &&
      response.leads.length > 0;

    const makeApiCall = async (query, apiKey, pagination = null) => {
      const requestBody = {
        query,
        pagination: pagination || { size: 5 },
      };

      const response = await fetch("https://app.icypeas.com/api/find-people", {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `API Error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      // Handle array response (if API returns array with single object)
      const responseData = Array.isArray(data) ? data[0] : data;
      return responseData;
    };

    const handleSubmit = async (values, actions) => {
      try {
        setLoading(true);
        setError(null);
        setApiResponse(null);

        // Transform form data to API format
        const query = {};
        const formFilters = values.formData || {};

        includeExcludeFieldConfigs.forEach(({ key, payloadKeys }) => {
          const includeValues = parseCommaSeparatedValues(
            formFilters[key]?.include || ""
          );
          const excludeValues = parseCommaSeparatedValues(
            formFilters[key]?.exclude || ""
          );

          if (includeValues.length || excludeValues.length) {
            const filter = {};
            if (includeValues.length) {
              filter.include = includeValues;
            }
            if (excludeValues.length) {
              filter.exclude = excludeValues;
            }

            const apiKeys = Array.isArray(payloadKeys)
              ? payloadKeys
              : [payloadKeys || key];

            apiKeys.forEach((apiKey) => {
              if (apiKey) {
                query[apiKey] = { ...filter };
              }
            });
          }
        });

        const headcountValues = formFilters[headcountFieldConfig.key] || {};
        const headcountFilter = {};

        const moreThanValue = parseInt(headcountValues.moreThan, 10);
        if (!Number.isNaN(moreThanValue)) {
          headcountFilter[">"] = moreThanValue;
        }

        const lessThanValue = parseInt(
          headcountValues.lessThanOrEqual,
          10
        );
        if (!Number.isNaN(lessThanValue)) {
          headcountFilter["<="] = lessThanValue;
        }

        if (Object.keys(headcountFilter).length > 0) {
          query.headcount = headcountFilter;
        }

        // Store query and API key for pagination
        const apiKey = values.apiKey?.trim();
        if (!apiKey) {
          throw new Error("API key is required");
        }

        setCurrentQuery(query);
        setCurrentApiKey(apiKey);
        setPaginationToken(null);

        const responseData = await makeApiCall(query, apiKey);
        if (hasResults(responseData)) {
          setSearchCount((prev) => prev + 1);
        }

        // Store pagination token if present
        if (responseData.pagination && responseData.pagination.token) {
          setPaginationToken(responseData.pagination.token);
        } else {
          setPaginationToken(null);
        }

        setApiResponse(responseData);
        actions.setSubmitting(false);
      } catch (err) {
        setError(err.message || "An error occurred while fetching data");
        actions.setSubmitting(false);
      } finally {
        setLoading(false);
      }
    };

    const handleLoadMore = async () => {
      if (!paginationToken || !currentQuery || !currentApiKey) {
        return;
      }

      try {
        setLoadingMore(true);
        setError(null);

        const pagination = {
          size: 5,
          token: paginationToken,
        };

        const responseData = await makeApiCall(currentQuery, currentApiKey, pagination);
        if (hasResults(responseData)) {
          setSearchCount((prev) => prev + 1);
        }

        // Update pagination token
        if (responseData.pagination && responseData.pagination.token) {
          setPaginationToken(responseData.pagination.token);
        } else {
          setPaginationToken(null);
        }

        // Append new leads to existing ones
        if (apiResponse && responseData.leads) {
          setApiResponse({
            ...apiResponse,
            leads: [...apiResponse.leads, ...responseData.leads],
            pagination: responseData.pagination,
          });
        } else {
          setApiResponse(responseData);
        }
      } catch (err) {
        setError(err.message || "An error occurred while loading more data");
      } finally {
        setLoadingMore(false);
      }
    };

    return (
      <WrappedComponent
        {...props}
        onSubmit={handleSubmit}
        apiResponse={apiResponse}
        loading={loading}
        loadingMore={loadingMore}
        error={error}
        onLoadMore={handleLoadMore}
        hasMore={!!paginationToken}
        searchCount={searchCount}
      />
    );
  };

  return WithFormSubmit;
};

export default withFormSubmit;
