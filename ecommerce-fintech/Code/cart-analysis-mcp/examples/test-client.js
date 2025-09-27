/**
 * Example client to test the Cart Analysis MCP Server
 */
const fetch = require("node-fetch");

const MCP_SERVER_URL = "http://localhost:3000";

// Example cart data
const cartData = {
  cart: [
    {
      name: "Laptop",
      price: 999.99,
      quantity: 1,
      category: "electronics",
    },
    {
      name: "Wireless Mouse",
      price: 49.99,
      quantity: 1,
      category: "accessories",
    },
    {
      name: "Headphones",
      price: 129.99,
      quantity: 1,
      category: "electronics",
    },
    {
      name: "Coffee",
      price: 12.99,
      quantity: 2,
      category: "beverages",
    },
    {
      name: "Chips",
      price: 3.99,
      quantity: 3,
      category: "snacks",
    },
  ],
};

// Function to list available tools
async function listTools() {
  try {
    const response = await fetch(`${MCP_SERVER_URL}/mcp/tools`);
    const data = await response.json();
    console.log("Available Tools:");
    console.log(JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error("Error listing tools:", error);
  }
}

// Function to analyze a cart
async function analyzeCart(cart) {
  try {
    const response = await fetch(`${MCP_SERVER_URL}/mcp/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        toolId: "analyze_cart",
        parameters: { cart },
      }),
    });
    const data = await response.json();
    console.log("Cart Analysis Results:");
    console.log(JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error("Error analyzing cart:", error);
  }
}

// Run the example
async function runExample() {
  console.log("=== MCP Server Test Client ===");

  // First, list the available tools
  await listTools();

  console.log("\n");

  // Then, analyze a sample cart
  await analyzeCart(cartData.cart);
}

runExample();
