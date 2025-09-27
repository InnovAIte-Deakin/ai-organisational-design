/**
 * Test file for Cart Analysis Tool with Cart Data Server integration
 *
 * This file demonstrates how to use the Cart Analysis tool to fetch and analyze cart data
 * from the Cart Data Server running on port 3001.
 *
 * Make sure both servers are running:
 * 1. Cart Data Server on port 3001
 * 2. MCP Server on port 3000
 */

const axios = require("axios");

// Test direct customer cart analysis (fetching from Cart Data Server)
async function testCustomerCartAnalysis(customerId) {
  try {
    console.log(`Testing cart analysis for customer ID: ${customerId}`);
    console.log("-".repeat(80));

    const response = await axios.post("http://localhost:3000/v1/functions", {
      name: "analyze_cart",
      arguments: JSON.stringify({
        customerId: customerId,
      }),
    });

    const result = JSON.parse(response.data.content);

    console.log("Analysis Summary:");
    console.log(`Customer ID: ${result.summary.customerId}`);
    console.log(`Total Items: ${result.summary.totalItems}`);
    console.log(`Total Cost: $${result.summary.totalCost}`);
    console.log(`Total Savings: $${result.summary.totalSavings}`);
    console.log(`Final Cost: $${result.summary.finalCost}`);

    console.log("\nCart Details:");
    result.cartDetails.forEach((item) => {
      console.log(`- ${item.name} (${item.quantity}x): $${item.subtotal}`);
    });

    console.log("\nCategory Breakdown:");
    result.categoryBreakdown.forEach((cat) => {
      console.log(`- ${cat.category}: ${cat.items} items, $${cat.total}`);
    });

    console.log("\nApplicable Deals:");
    if (result.deals.applicable.length > 0) {
      result.deals.applicable.forEach((deal) => {
        console.log(`- ${deal.description}: Save $${deal.savings}`);
      });
    } else {
      console.log("No applicable deals");
    }

    console.log("\nRecommendations:");
    if (result.recommendations.length > 0) {
      result.recommendations.forEach((rec) => {
        console.log(`- ${rec.category}: ${rec.reason}`);
      });
    } else {
      console.log("No recommendations");
    }

    console.log("-".repeat(80));
  } catch (error) {
    console.error("Error analyzing cart:");
    if (error.response) {
      console.error("Response error:", error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Run tests for a few different customers
async function runTests() {
  // Check the health of both servers first
  try {
    const cartServerHealth = await axios.get("http://localhost:3001/health");
    console.log("Cart Data Server status:", cartServerHealth.data.status);

    const mcpServerHealth = await axios.get("http://localhost:3000/health");
    console.log("MCP Server status:", mcpServerHealth.data.status);

    console.log("Both servers are running. Starting tests...\n");
  } catch (error) {
    console.error("Error checking server health:");
    console.error("Make sure both servers are running:");
    console.error("1. Cart Data Server on port 3001");
    console.error("2. MCP Server on port 3000");
    return;
  }

  // Test with different customer IDs
  await testCustomerCartAnalysis("cust01"); // Electronics customer
  await testCustomerCartAnalysis("cust03"); // Home and grocery customer
  await testCustomerCartAnalysis("cust11"); // Gaming customer
  await testCustomerCartAnalysis("cust19"); // Fitness customer
}

// Start the tests
console.log("Testing Cart Analysis with Cart Data Server integration");
console.log("=".repeat(80));
runTests();
