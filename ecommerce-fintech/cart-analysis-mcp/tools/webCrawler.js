/**
 * Web Crawler Tool based on firecrawl
 * Crawls and extracts data from websites
 */

const axios = require("axios");
const cheerio = require("cheerio");
const url = require("url");

/**
 * Crawl a website and extract data based on specified options
 * @param {Object} params - Parameters for the crawler
 * @param {string} params.url - The URL to crawl
 * @param {Object} [params.options] - Optional crawler configuration
 * @param {number} [params.options.maxDepth=1] - Maximum depth to crawl (1 = just the given URL)
 * @param {number} [params.options.maxPages=10] - Maximum number of pages to crawl
 * @param {Array<string>} [params.options.allowedDomains] - Domains allowed to crawl (defaults to the domain of the URL)
 * @param {Array<string>} [params.options.excludePaths] - URL paths to exclude
 * @param {Array<string>} [params.selectors] - CSS selectors to extract data from the page
 * @returns {Object} The crawled data
 */
async function crawlWebsite(params) {
  const { url: targetUrl, options = {}, selectors = [] } = params;

  if (!targetUrl) {
    throw new Error("URL is required");
  }

  // Extract domain from URL
  const parsedUrl = url.parse(targetUrl);
  const domain = parsedUrl.hostname;

  // Set default options
  const crawlOptions = {
    maxDepth: options.maxDepth || 1,
    maxPages: options.maxPages || 10,
    allowedDomains: options.allowedDomains || [domain],
    excludePaths: options.excludePaths || [],
    visited: new Set(),
    results: [],
  };

  // Start crawling from the initial URL
  try {
    await crawl(targetUrl, 1, crawlOptions, selectors);

    return {
      success: true,
      url: targetUrl,
      crawled: {
        pageCount: crawlOptions.results.length,
        pages: crawlOptions.results,
      },
    };
  } catch (error) {
    return {
      success: false,
      url: targetUrl,
      error: error.message,
      details: error.stack,
    };
  }
}

/**
 * Internal recursive crawl function
 */
async function crawl(pageUrl, depth, options, selectors) {
  // Check if we've reached the maximum depth or pages
  if (depth > options.maxDepth || options.visited.size >= options.maxPages) {
    return;
  }

  // Check if we've already visited this URL
  if (options.visited.has(pageUrl)) {
    return;
  }

  // Add URL to visited set
  options.visited.add(pageUrl);

  try {
    console.log(`Crawling ${pageUrl} (depth: ${depth})`);

    // Fetch the page
    const response = await axios.get(pageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    // Load HTML into cheerio
    const $ = cheerio.load(response.data);

    // Extract data based on selectors
    const extractedData = {};
    if (selectors && selectors.length > 0) {
      selectors.forEach((selector) => {
        if (typeof selector === "string") {
          // If it's a simple string selector, extract text
          extractedData[selector] = $(selector).text().trim();
        } else if (typeof selector === "object") {
          // If it's an object with name and selector properties
          const { name, selector: sel, attribute } = selector;
          if (attribute) {
            // Extract attribute
            extractedData[name] = $(sel).attr(attribute);
          } else {
            // Extract text
            extractedData[name] = $(sel).text().trim();
          }
        }
      });
    } else {
      // Default extraction: page title and description
      extractedData.title = $("title").text().trim();
      extractedData.description =
        $('meta[name="description"]').attr("content") || "";
      extractedData.h1 = $("h1").first().text().trim();
    }

    // Add page to results
    options.results.push({
      url: pageUrl,
      data: extractedData,
      links: [],
    });

    // If we haven't reached max depth, find all links to crawl next
    if (depth < options.maxDepth) {
      const links = [];

      $("a[href]").each((_, element) => {
        const href = $(element).attr("href");
        if (!href) return;

        // Resolve relative URLs
        const resolvedUrl = url.resolve(pageUrl, href);
        const parsedLink = url.parse(resolvedUrl);

        // Skip if not http/https
        if (!parsedLink.protocol || !parsedLink.protocol.startsWith("http")) {
          return;
        }

        // Skip if not in allowed domains
        if (!options.allowedDomains.includes(parsedLink.hostname)) {
          return;
        }

        // Skip if path is excluded
        if (
          options.excludePaths.some((path) =>
            parsedLink.pathname.startsWith(path)
          )
        ) {
          return;
        }

        links.push(resolvedUrl);
        options.results[options.results.length - 1].links.push(resolvedUrl);
      });

      // Crawl each link (up to maxPages)
      for (const link of links) {
        if (options.visited.size >= options.maxPages) break;
        await crawl(link, depth + 1, options, selectors);
      }
    }

    return;
  } catch (error) {
    console.error(`Error crawling ${pageUrl}: ${error.message}`);
    // Continue with other URLs even if one fails
    return;
  }
}

module.exports = {
  crawlWebsite,
};
