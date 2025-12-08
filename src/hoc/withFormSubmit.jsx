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

const PAGE_SIZE = 50;

const withFormSubmit = (WrappedComponent) => {
  const WithFormSubmit = (props) => {
    const [apiResponse, setApiResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingPage, setLoadingPage] = useState(false);
    const [error, setError] = useState(null);
    const [currentQuery, setCurrentQuery] = useState(null);
    const [currentApiKey, setCurrentApiKey] = useState(null);
    const [paginationToken, setPaginationToken] = useState(null);
    const [searchCount, setSearchCount] = useState(0);
    const [pages, setPages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [allLeads, setAllLeads] = useState([]);

    const hasResults = (response) =>
      response &&
      Array.isArray(response.leads) &&
      response.leads.length > 0;

    const makeApiCall = async (query, apiKey, pagination = null) => {
      const requestBody = {
        query,
        pagination: pagination || { size: PAGE_SIZE },
      };

      const response = await fetch("https://app.icypeas.com/api/sfind-people", {
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

    const resetPaginationState = () => {
      setPaginationToken(null);
      setPages([]);
      setCurrentPage(1);
      setAllLeads([]);
    };

    const addPageData = (pageNumber, responseData) => {
      const newLeads = responseData.leads || [];

      setPages((prev) => {
        const filtered = prev.filter((page) => page.pageNumber !== pageNumber);
        return [...filtered, { pageNumber, leads: newLeads }].sort(
          (a, b) => a.pageNumber - b.pageNumber
        );
      });

      setAllLeads((prev) => [...prev, ...newLeads]);

      setApiResponse((prev) => {
        const combinedLeads = [...(prev?.leads || []), ...newLeads];
        return {
          ...(prev || {}),
          ...responseData,
          leads: combinedLeads,
        };
      });
    };

    const handleSubmit = async (values, actions) => {
      try {
        setLoading(true);
        setError(null);
        setApiResponse(null);
        resetPaginationState();

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

        const responseData = await makeApiCall(query, apiKey, {
          size: PAGE_SIZE,
        });
        if (hasResults(responseData)) {
          setSearchCount((prev) => prev + 1);
        }

        resetPaginationState();

        const initialToken =
          responseData.pagination && responseData.pagination.token
            ? responseData.pagination.token
            : null;
        setPaginationToken(initialToken);

        const initialLeads = responseData.leads || [];
        setPages([{ pageNumber: 1, leads: initialLeads }]);
        setAllLeads(initialLeads);
        setCurrentPage(1);

        setApiResponse(responseData);
        actions.setSubmitting(false);
      } catch (err) {
        setError(err.message || "An error occurred while fetching data");
        actions.setSubmitting(false);
      } finally {
        setLoading(false);
      }
    };

    const handleFetchNextPage = async () => {
      if (!paginationToken || !currentQuery || !currentApiKey) {
        return;
      }

      try {
        setLoadingPage(true);
        setError(null);

        const pagination = {
          size: PAGE_SIZE,
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

        const nextPageNumber = pages.length + 1;
        addPageData(nextPageNumber, responseData);
        setCurrentPage(nextPageNumber);
      } catch (err) {
        setError(err.message || "An error occurred while loading more data");
      } finally {
        setLoadingPage(false);
      }
    };

    const handlePageChange = async (targetPage) => {
      const totalPages = apiResponse?.total
        ? Math.ceil(apiResponse.total / PAGE_SIZE)
        : null;

      if (targetPage < 1) return;
      if (totalPages && targetPage > totalPages) return;

      const isPageLoaded = pages.some((page) => page.pageNumber === targetPage);
      const nextPageToFetch = pages.length + 1;

      if (isPageLoaded) {
        setCurrentPage(targetPage);
        return;
      }

      // Only allow fetching the immediate next page to keep pagination tokens valid
      if (targetPage !== nextPageToFetch) {
        setError("Please load pages sequentially.");
        return;
      }

      await handleFetchNextPage();
    };

    const visibleLeads =
      pages.find((page) => page.pageNumber === currentPage)?.leads || [];

    return (
      <WrappedComponent
        {...props}
        onSubmit={handleSubmit}
        apiResponse={apiResponse}
        loading={loading}
        error={error}
        onPageChange={handlePageChange}
        paginationInfo={{
          currentPage,
          totalPages: apiResponse?.total
            ? Math.ceil(apiResponse.total / PAGE_SIZE)
            : null,
          pageNumbers: pages.map((page) => page.pageNumber),
          hasMore: !!paginationToken,
          isPageLoading: loadingPage,
        }}
        visibleLeads={visibleLeads}
        allLeads={allLeads}
        searchCount={searchCount}
      />
    );
  };

  return WithFormSubmit;
};

export default withFormSubmit;
