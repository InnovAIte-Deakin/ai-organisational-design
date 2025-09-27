/**
 * Example client to test the updated OpenAI-compatible MCP Server
 */
const fetch = require("node-fetch");

const MCP_SERVER_URL = "http://localhost:3000";

// Example cart data
const exampleUserMessage =
  "Analyze this cart: I have a laptop ($999.99), headphones ($129.99), and 2 coffees ($12.99 each)";

// Function to test chat completions endpoint
async function testChatCompletions() {
  try {
    const response = await fetch(`${MCP_SERVER_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mcp-cart-analysis",
        messages: [{ role: "user", content: exampleUserMessage }],
        tools: [],
        tool_choice: "auto",
      }),
    });

    const data = await response.json();
    console.log("Chat Completions Response (with tool calls):");
    console.log(JSON.stringify(data, null, 2));

    // If there are tool calls, execute them
    if (
      data.choices &&
      data.choices[0].message &&
      data.choices[0].message.tool_calls &&
      data.choices[0].message.tool_calls.length > 0
    ) {
      const toolCall = data.choices[0].message.tool_calls[0];
      return await executeTool(toolCall);
    }

    return data;
  } catch (error) {
    console.error("Error calling chat completions:", error);
  }
}

// Function to execute a tool call
async function executeTool(toolCall) {
  try {
    console.log(`\nExecuting tool: ${toolCall.function.name}`);

    const response = await fetch(`${MCP_SERVER_URL}/v1/functions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: toolCall.function.name,
        arguments: toolCall.function.arguments,
      }),
    });

    const data = await response.json();
    console.log("Tool Execution Result:");
    console.log(JSON.stringify(data, null, 2));

    // Parse the content to display in a more readable format
    if (data.content) {
      try {
        const result = JSON.parse(data.content);
        console.log("\nFormatted Analysis Results:");
        console.log("-----------------------------");
        console.log(`Total Items: ${result.summary.totalItems}`);
        console.log(`Total Cost: $${result.summary.totalCost}`);
        console.log(`Total Savings: $${result.summary.totalSavings}`);
        console.log(`Final Cost: $${result.summary.finalCost}`);

        console.log("\nCategory Breakdown:");
        result.categoryBreakdown.forEach((cat) => {
          console.log(`- ${cat.category}: ${cat.items} items ($${cat.total})`);
        });

        if (result.deals.applicable.length > 0) {
          console.log("\nApplicable Deals:");
          result.deals.applicable.forEach((deal) => {
            console.log(`- ${deal.description} (Save $${deal.savings})`);
          });
        }

        if (result.deals.potential.length > 0) {
          console.log("\nPotential Deals:");
          result.deals.potential.forEach((deal) => {
            console.log(`- ${deal.description} (${deal.missing})`);
          });
        }

        if (result.recommendations.length > 0) {
          console.log("\nRecommendations:");
          result.recommendations.forEach((rec) => {
            console.log(`- ${rec.category}: ${rec.reason}`);
          });
        }
      } catch (e) {
        console.log("Raw content:", data.content);
      }
    }

    return data;
  } catch (error) {
    console.error("Error executing tool:", error);
  }
}

// Function to check available models
async function checkModels() {
  try {
    const response = await fetch(`${MCP_SERVER_URL}/v1/models`);
    const data = await response.json();
    console.log("Available Models:");
    console.log(JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error("Error checking models:", error);
  }
}

// Run the example
async function runExample() {
  console.log("=== OpenAI-compatible MCP Server Test Client ===\n");

  // First, check available models
  await checkModels();

  console.log("\n");

  // Then, test chat completions with tool calls
  await testChatCompletions();
}

runExample();
