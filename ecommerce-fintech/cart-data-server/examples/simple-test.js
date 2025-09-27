/**
 * Simple test for the Cart Data Server
 * Tests that the server is running and returning the expected data
 */

const axios = require("axios");

async function testCartDataServer() {
  try {
    // Test health endpoint
    const healthResponse = await axios.get("http://localhost:3001/health");
    console.log("Health check:", healthResponse.data);

    // Test getting all customers
    const customersResponse = await axios.get(
      "http://localhost:3001/api/customers"
    );
    console.log(`Retrieved ${customersResponse.data.length} customers`);

    // Test getting a specific customer
    const customerResponse = await axios.get(
      "http://localhost:3001/api/customers/cust01"
    );
    console.log("Customer details:", customerResponse.data);

    // Test getting a specific customer's cart
    const cartResponse = await axios.get(
      "http://localhost:3001/api/customers/cust01/cart"
    );
    console.log("Customer cart:", cartResponse.data);

    console.log("All tests passed!");
  } catch (error) {
    console.error("Error testing cart data server:");
    if (error.response) {
      console.error("Response error:", error.response.data);
    } else {
      console.error(error.message);
    }
    console.error("Make sure the server is running on port 3001");
  }
}

// Run the tests
testCartDataServer();
