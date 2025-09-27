/**
 * Test file for the Brave Search tool
 *
 * This file demonstrates how to use the Brave Search API tool.
 * Before running, make sure you have added your Brave Search API key in the .env file
 */

const axios = require("axios");
require("dotenv").config();

// Test the Brave Search tool through the MCP server
async function testBraveSearch() {
  try {
    const response = await axios.post("http://localhost:3000/v1/functions", {
      name: "brave_search",
      arguments: JSON.stringify({
        query: "artificial intelligence latest developments",
        options: {
          count: 5,
          ai_result: true,
        },
      }),
    });

    console.log("Brave Search Results:");
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error("Error response:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

// Make sure the server is running before executing this test
console.log("Testing Brave Search tool...");
console.log("Make sure:");
console.log("1. Your MCP server is running (npm start)");
console.log("2. You have added your Brave Search API key in the .env file");
console.log("------------------------------------------------");

testBraveSearch();
