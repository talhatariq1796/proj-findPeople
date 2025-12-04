import React, { useState } from "react";

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

        // Parse location (include/exclude)
        if (values.formData.location) {
          const locations = values.formData.location
            .split(",")
            .map((loc) => loc.trim())
            .filter((loc) => loc);
          if (locations.length > 0) {
            query.location = { include: locations };
          }
        }

        // Parse industry
        if (values.formData.industry) {
          const industries = values.formData.industry
            .split(",")
            .map((ind) => ind.trim())
            .filter((ind) => ind);
          if (industries.length > 0) {
            query.industry = { include: industries };
          }
        }

        // Parse keywords
        if (values.formData.keywords) {
          const keywords = values.formData.keywords
            .split(",")
            .map((kw) => kw.trim())
            .filter((kw) => kw);
          if (keywords.length > 0) {
            query.keyword = { include: keywords };
          }
        }

        // Parse job titles
        if (values.formData.jobTitles) {
          const jobTitles = values.formData.jobTitles
            .split(",")
            .map((jt) => jt.trim())
            .filter((jt) => jt);
          if (jobTitles.length > 0) {
            query.currentJobTitle = { include: jobTitles };
          }
        }

        // Parse staff size (headcount)
        if (values.formData.staffSize) {
          const staffSize = values.formData.staffSize.trim();
          // Try to parse number or range
          const match = staffSize.match(/>\s*(\d+)/);
          if (match) {
            query.headcount = { ">": parseInt(match[1]) };
          } else {
            const numMatch = staffSize.match(/(\d+)/);
            if (numMatch) {
              query.headcount = { ">": parseInt(numMatch[1]) };
            }
          }
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
        setSearchCount((prev) => prev + 1);

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
        setSearchCount((prev) => prev + 1);

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
