/**
 * Example client to test the Web Crawler MCP tool
 */
const fetch = require("node-fetch");

const MCP_SERVER_URL = "http://localhost:3000";

// Example URL to crawl
const exampleUrl = "https://example.com";

// Function to test web crawler
async function testWebCrawler() {
  try {
    console.log(`Testing web crawler with URL: ${exampleUrl}`);

    // First, simulate a chat completion that will call the crawl_website tool
    const chatResponse = await fetch(`${MCP_SERVER_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mcp-cart-analysis",
        messages: [
          { role: "user", content: `Please crawl this website: ${exampleUrl}` },
        ],
        tools: [],
        tool_choice: "auto",
      }),
    });

    const chatData = await chatResponse.json();
    console.log("Chat Completions Response (with tool calls):");
    console.log(JSON.stringify(chatData, null, 2));

    // Extract the tool call
    if (
      chatData.choices &&
      chatData.choices[0].message &&
      chatData.choices[0].message.tool_calls &&
      chatData.choices[0].message.tool_calls.length > 0
    ) {
      const toolCall = chatData.choices[0].message.tool_calls[0];

      // Now execute the tool directly
      console.log(`\nExecuting tool: ${toolCall.function.name}`);

      const toolResponse = await fetch(`${MCP_SERVER_URL}/v1/functions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: toolCall.function.name,
          arguments: toolCall.function.arguments,
        }),
      });

      const toolData = await toolResponse.json();
      console.log("Web Crawler Results:");
      console.log(JSON.stringify(toolData, null, 2));

      // Try to parse the content
      if (toolData.content) {
        try {
          const result = JSON.parse(toolData.content);

          if (result.success) {
            console.log("\nSuccessfully crawled website!");
            console.log(`URL: ${result.url}`);
            console.log(`Pages crawled: ${result.crawled.pageCount}`);

            // Show the first page data
            if (result.crawled.pages.length > 0) {
              const firstPage = result.crawled.pages[0];
              console.log("\nFirst page data:");
              console.log(`URL: ${firstPage.url}`);
              console.log("Extracted data:");
              console.log(JSON.stringify(firstPage.data, null, 2));
              console.log(`Links found: ${firstPage.links.length}`);
            }
          } else {
            console.log("\nCrawl failed:");
            console.log(result.error);
          }
        } catch (e) {
          console.log("Raw content:", toolData.content);
        }
      }
    }
  } catch (error) {
    console.error("Error testing web crawler:", error);
  }
}

// Custom crawl with additional options
async function customCrawl() {
  try {
    console.log("\n\nTesting custom crawl with specific selectors:");

    const response = await fetch(`${MCP_SERVER_URL}/v1/functions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "crawl_website",
        arguments: JSON.stringify({
          url: "https://news.ycombinator.com",
          options: {
            maxDepth: 1,
            maxPages: 1,
          },
          selectors: [
            { name: "title", selector: "title" },
            { name: "headlines", selector: ".titleline > a" },
            { name: "scores", selector: ".score" },
            { name: "topLink", selector: ".titleline > a", attribute: "href" },
          ],
        }),
      }),
    });

    const data = await response.json();

    if (data.content) {
      try {
        const result = JSON.parse(data.content);
        console.log("\nCustom Crawl Results:");
        console.log(JSON.stringify(result, null, 2));
      } catch (e) {
        console.log("Raw content:", data.content);
      }
    }
  } catch (error) {
    console.error("Error with custom crawl:", error);
  }
}

// Run the examples
async function runExamples() {
  console.log("=== Web Crawler MCP Tool Test Client ===\n");

  // Test basic web crawler
  await testWebCrawler();

  // Test custom crawl
  await customCrawl();
}

runExamples();
