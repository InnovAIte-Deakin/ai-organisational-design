# Cart Analysis MCP Server

A Model Context Protocol (MCP) server that provides tools for analyzing customer shopping carts, crawling websites for data, and performing web searches. This server can be connected to n8n workflows or AI models to provide shopping cart analysis, web crawling, and search capabilities.

## Features

- **Cart Analysis Tool**: Analyzes shopping carts to provide insights on:
  - Total cost and item count
  - Category breakdown
  - Applicable discounts and potential savings
  - Product recommendations

- **Web Crawler Tool**: Crawls websites to extract data:
  - Extracts content from web pages
  - Follows links to crawl multiple pages
  - Configurable crawl depth and limits
  - CSS selector-based data extraction

- **Brave Search Tool**: Performs web searches using Brave Search API:
  - Retrieves high-quality search results
  - Includes AI-generated summaries of content (optional)
  - Configurable result count and filtering options
  - Data for AI compatible

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Brave Search API key (for search functionality)

### Installation

1. Clone this repository or download the files
2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env` (or create a new `.env` file)
   - Add your Brave Search API key to the `.env` file:
     ```
     BRAVE_SEARCH_API_KEY=your_api_key_here
     ```

4. Start the server:

```bash
npm start
```

The server will start on port 3000 (or the port specified in your .env file).

## API Endpoints

### OpenAI-Compatible Endpoints

This server implements OpenAI-compatible endpoints to work with AI models and tools:

```
GET /v1/models
```
Returns available models (for AI tool discovery)

```
POST /v1/chat/completions
```
Main endpoint for chat completions with function calling

```
POST /v1/functions
```
Execute functions/tools

### Legacy MCP Endpoints

```
GET /mcp/tools
```
Returns a list of all available tools with their descriptions and input schemas.

```
POST /mcp/execute
```
Executes a specific tool with the provided parameters.

Request Body:
```json
{
  "toolId": "analyze_cart",
  "parameters": {
    "cart": [
      {
        "name": "Laptop",
        "price": 999.99,
        "quantity": 1,
        "category": "electronics"
      },
      {
        "name": "Headphones",
        "price": 149.99,
        "quantity": 1,
        "category": "accessories"
      }
    ]
  }
}
```

## Connecting to n8n

To connect this MCP server to n8n:

1. In n8n, create a new workflow
2. Add an "AI Agent" node (requires n8n 1.19.0 or later)
3. Configure the AI Agent node:
   - Model Provider: OpenAI API Compatible
   - Base URL: `http://localhost:3000` (or your server's address)
   - API Key: Can be any value (the server doesn't require authentication)
   - Model: `mcp-cart-analysis`

Alternatively, for manual setup:

1. Add an "HTTP Request" node configured as:
   - Method: POST
   - URL: `http://localhost:3000/v1/chat/completions`
   - Headers: `Content-Type: application/json`
   - Body:
   ```json
   {
     "model": "mcp-cart-analysis",
     "messages": [
       {"role": "user", "content": "Please analyze this cart: ..."}
     ],
     "tools": [],
     "tool_choice": "auto"
   }
   ```

2. Process the response which will include tool calls
3. Execute the tool calls using another HTTP Request to `/v1/functions`

## Example Usage with n8n

### Setting up the workflow:

1. **Trigger node** (HTTP Request, Webhook, etc.)
2. **AI Agent node** configured to use your MCP server
3. **Function node** to extract and format tool calls
4. **HTTP Request node** to execute the tool
5. **Respond node** to return the analysis results

### Workflow steps:

1. User sends a message like "Analyze my cart with these items: laptop, headphones, and coffee"
2. AI Agent recognizes the intent and creates tool calls
3. The workflow executes the tool calls against your MCP server
4. Results are returned to the user

## Testing the Integration

Once your server is running, you can test it with a simple curl command:

```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mcp-cart-analysis",
    "messages": [
      {"role": "user", "content": "What tools can you use?"}
    ],
    "tools": [],
    "tool_choice": "auto"
  }'
```

You should receive a response with tool_calls that includes available tools.

### Testing the Brave Search Tool

You can test the Brave Search tool using the provided example:

```bash
node examples/brave-search-test.js
```

Make sure you've set your Brave Search API key in the `.env` file before running the test.

Sample query using curl:

```bash
curl -X POST http://localhost:3000/v1/functions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "brave_search",
    "arguments": "{\"query\":\"artificial intelligence latest developments\",\"options\":{\"count\":5,\"ai_result\":true}}"
  }'
```

## License

MIT