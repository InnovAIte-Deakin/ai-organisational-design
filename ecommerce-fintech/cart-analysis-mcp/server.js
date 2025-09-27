const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Import our tools
const { analyzeCart } = require("./tools/cartAnalysis");
const { crawlWebsite } = require("./tools/webCrawler");
const { braveSearch } = require("./tools/braveSearch");

// Define available tools in OpenAI function format
const TOOLS = [
  {
    type: "function",
    function: {
      name: "analyze_cart",
      description:
        "Analyzes a customer's shopping cart to provide insights like total cost, item categories, potential recommendations, and saving opportunities. Can either analyze a provided cart or fetch data for a specific customer from the cart server.",
      parameters: {
        type: "object",
        properties: {
          cart: {
            type: "array",
            description:
              "List of items in the customer's cart (optional if customerId is provided)",
            items: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "Unique identifier for the product",
                },
                name: { type: "string", description: "Name of the product" },
                price: { type: "number", description: "Price of the product" },
                quantity: {
                  type: "number",
                  description: "Quantity of the product",
                },
                category: {
                  type: "string",
                  description: "Category of the product",
                },
              },
              required: ["name", "price", "quantity"],
            },
          },
          customerId: {
            type: "string",
            description:
              "Customer ID to fetch cart data from the cart server. When provided, the tool will attempt to retrieve the customer's cart from the cart data server running on port 3001. Available IDs: cust01 through cust20.",
          },
        },
        required: [],
      },
    },
    implementation: analyzeCart,
  },
  {
    type: "function",
    function: {
      name: "crawl_website",
      description:
        "Crawls a website URL to extract information. Can analyze web pages, extract content, and follow links to gather data.",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The URL of the website to crawl",
          },
          options: {
            type: "object",
            description: "Optional configuration for the crawler",
            properties: {
              maxDepth: {
                type: "integer",
                description: "Maximum depth to crawl (1 = just the given URL)",
                default: 1,
              },
              maxPages: {
                type: "integer",
                description: "Maximum number of pages to crawl",
                default: 10,
              },
              allowedDomains: {
                type: "array",
                description:
                  "Domains allowed to crawl (defaults to the domain of the URL)",
                items: {
                  type: "string",
                },
              },
              excludePaths: {
                type: "array",
                description: "URL paths to exclude from crawling",
                items: {
                  type: "string",
                },
              },
            },
          },
          selectors: {
            type: "array",
            description: "CSS selectors to extract specific data from the page",
            items: {
              oneOf: [
                {
                  type: "string",
                  description: "CSS selector to extract text content",
                },
                {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      description: "Name for the extracted data",
                    },
                    selector: {
                      type: "string",
                      description: "CSS selector",
                    },
                    attribute: {
                      type: "string",
                      description:
                        "HTML attribute to extract (e.g., 'href', 'src')",
                    },
                  },
                  required: ["name", "selector"],
                },
              ],
            },
          },
        },
        required: ["url"],
      },
    },
    implementation: crawlWebsite,
  },
  {
    type: "function",
    function: {
      name: "brave_search",
      description:
        "Performs a web search using Brave Search API, providing high-quality search results and optionally AI-generated summaries.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query to perform",
          },
          options: {
            type: "object",
            description: "Optional configuration for the search",
            properties: {
              count: {
                type: "integer",
                description: "Number of results to return (1-20)",
                default: 10,
              },
              offset: {
                type: "integer",
                description: "Offset for pagination",
                default: 0,
              },
              country: {
                type: "string",
                description:
                  "Country code for localized results (e.g., 'US', 'GB', 'JP')",
                default: "US",
              },
              search_lang: {
                type: "string",
                description:
                  "Language for the search results (e.g., 'en', 'fr', 'es')",
              },
              ai_result: {
                type: "boolean",
                description: "Whether to include AI-generated summaries",
                default: true,
              },
            },
          },
        },
        required: ["query"],
      },
    },
    implementation: braveSearch,
  },
];

// Standard OpenAI-compatible chat completions endpoint
app.post("/v1/chat/completions", async (req, res) => {
  const { messages, tools, tool_choice } = req.body;

  // If tools are requested, return the tools information
  if (tool_choice === "auto" || tool_choice === true) {
    // Try to determine which tool to call based on the last message
    const lastMessage = messages[messages.length - 1];
    let toolToCall = null;

    if (lastMessage && lastMessage.content) {
      const content = lastMessage.content.toLowerCase();

      // Simple heuristic to determine which tool to use
      if (
        content.includes("crawl") ||
        content.includes("website") ||
        content.includes("url") ||
        content.includes("web")
      ) {
        // Try to extract URL from the message
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urlMatch = content.match(urlRegex);
        const url = urlMatch ? urlMatch[0] : "https://example.com";

        toolToCall = {
          id: "call_" + Date.now(),
          type: "function",
          function: {
            name: "crawl_website",
            arguments: JSON.stringify({
              url: url,
              options: {
                maxDepth: 1,
              },
            }),
          },
        };
      } else if (
        content.includes("search") ||
        content.includes("find") ||
        content.includes("look up") ||
        content.includes("brave")
      ) {
        // Extract the search query
        let searchQuery = content;

        // Remove common phrases
        searchQuery = searchQuery.replace(/please search (for|about)?/i, "");
        searchQuery = searchQuery.replace(/can you (find|search|look up)/i, "");
        searchQuery = searchQuery.replace(/i need information (on|about)/i, "");
        searchQuery = searchQuery.replace(/using brave search/i, "");

        // Limit search query length
        searchQuery = searchQuery.trim();
        if (searchQuery.length > 100) {
          searchQuery = searchQuery.substring(0, 100);
        }

        // If query is too short or generic, use a default
        if (searchQuery.length < 3 || searchQuery === "search") {
          searchQuery = "latest technology news";
        }

        toolToCall = {
          id: "call_" + Date.now(),
          type: "function",
          function: {
            name: "brave_search",
            arguments: JSON.stringify({
              query: searchQuery,
              options: {
                count: 5,
                ai_result: true,
              },
            }),
          },
        };
      } else {
        // Default to cart analysis
        toolToCall = {
          id: "call_" + Date.now(),
          type: "function",
          function: {
            name: "analyze_cart",
            arguments: JSON.stringify({
              cart: [
                {
                  name: "Example Product",
                  price: 19.99,
                  quantity: 1,
                  category: "example",
                },
              ],
            }),
          },
        };
      }
    } else {
      // Default tool call if no message content
      toolToCall = {
        id: "call_" + Date.now(),
        type: "function",
        function: {
          name: "analyze_cart",
          arguments: JSON.stringify({
            cart: [
              {
                name: "Example Product",
                price: 19.99,
                quantity: 1,
                category: "example",
              },
            ],
          }),
        },
      };
    }

    res.json({
      id: "chatcmpl-" + Date.now(),
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: "mcp-cart-analysis",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: null,
            tool_calls: [toolToCall],
          },
          finish_reason: "tool_calls",
        },
      ],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    });
    return;
  }

  // If no tool_choice, just return a normal message
  res.json({
    id: "chatcmpl-" + Date.now(),
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model: "mcp-cart-analysis",
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content:
            "I can analyze shopping carts for you. Please provide a cart with items to analyze.",
        },
        finish_reason: "stop",
      },
    ],
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
  });
});

// Legacy MCP endpoint to list available tools (for backward compatibility)
app.get("/mcp/tools", (req, res) => {
  // Return tools in the new format
  res.json({
    tools: TOOLS,
  });
});

// Handle the tool execution
app.post("/v1/functions", async (req, res) => {
  const { name, arguments: argsStr } = req.body;

  // Find the requested tool
  const tool = TOOLS.find((t) => t.function.name === name);

  if (!tool) {
    return res.status(404).json({
      error: `Tool with name '${name}' not found`,
    });
  }

  try {
    // Parse arguments
    const args = JSON.parse(argsStr);

    // Execute the tool function with the provided parameters
    const result = await tool.implementation(args);

    // Return the result
    res.json({
      content: JSON.stringify(result),
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});

// Legacy MCP endpoint to execute a tool (for backward compatibility)
app.post("/mcp/execute", async (req, res) => {
  const { toolId, parameters } = req.body;

  // Find the requested tool
  const tool = TOOLS.find((t) => t.function.name === toolId);

  if (!tool) {
    return res.status(404).json({
      error: `Tool with ID '${toolId}' not found`,
    });
  }

  try {
    // Execute the tool function with the provided parameters
    const result = await tool.implementation(parameters);

    // Return the result
    res.json({
      result,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// OpenAI-compatible models endpoint for discovery
app.get("/v1/models", (req, res) => {
  res.json({
    object: "list",
    data: [
      {
        id: "mcp-cart-analysis",
        object: "model",
        created: Math.floor(Date.now() / 1000),
        owned_by: "organization-owner",
      },
    ],
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
  console.log(
    `OpenAI-compatible API available at http://localhost:${PORT}/v1/chat/completions`
  );
  console.log(`Tool list available at http://localhost:${PORT}/mcp/tools`);
});
