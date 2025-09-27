/**
 * Brave Search Tool
 * Uses Brave Search API to perform web searches
 */

const axios = require("axios");

/**
 * The base URL for Brave Search API
 */
const BRAVE_SEARCH_API_URL = "https://api.search.brave.com/res/v1/web/search";

/**
 * Perform a search using Brave Search API
 * @param {Object} params - Search parameters
 * @param {string} params.query - The search query
 * @param {Object} [params.options] - Optional search configuration
 * @param {number} [params.options.count=10] - Number of results to return (1-20)
 * @param {number} [params.options.offset=0] - Offset for pagination
 * @param {string} [params.options.country='US'] - Country code for localized results
 * @param {string} [params.options.search_lang] - Language for the search results
 * @param {boolean} [params.options.ai_result=true] - Whether to include AI-generated summaries
 * @returns {Object} Search results
 */
async function braveSearch(params) {
  const { query, options = {} } = params;

  if (!query || typeof query !== "string" || query.trim() === "") {
    throw new Error("A valid search query is required");
  }

  // Get API key from environment
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;

  if (!apiKey) {
    throw new Error("BRAVE_SEARCH_API_KEY is not set in environment variables");
  }

  try {
    // Build request parameters
    const requestParams = {
      q: query,
      count: options.count || 10,
      offset: options.offset || 0,
    };

    // Add optional parameters if provided
    if (options.country) requestParams.country = options.country;
    if (options.search_lang) requestParams.search_lang = options.search_lang;

    // For Data for AI product
    if (options.ai_result !== undefined) {
      requestParams.ai_result = options.ai_result;
    } else {
      // Default to true for AI result
      requestParams.ai_result = true;
    }

    // Make the API request
    const response = await axios.get(BRAVE_SEARCH_API_URL, {
      params: requestParams,
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": apiKey,
      },
    });

    // Process the response to extract the most relevant information
    const searchData = response.data;

    // Prepare the formatted results
    const formattedResults = {
      query: query,
      totalResults: searchData.total || 0,
      aiSummary: searchData.ai_result || null,
      results: [],
    };

    // Extract web page results
    if (searchData.web && searchData.web.results) {
      formattedResults.results = searchData.web.results.map((result) => ({
        title: result.title,
        url: result.url,
        description: result.description,
        favicon: result.favicon,
        age: result.age,
        extra_snippets: result.extra_snippets,
      }));
    }

    // Extract any related queries if available
    if (searchData.related_queries) {
      formattedResults.relatedQueries = searchData.related_queries;
    }

    return formattedResults;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(
        `Brave Search API error: ${error.response.status} - ${
          error.response.data.message || JSON.stringify(error.response.data)
        }`
      );
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error("No response received from Brave Search API");
    } else {
      // Something happened in setting up the request that triggered an Error
      throw error;
    }
  }
}

module.exports = {
  braveSearch,
};
