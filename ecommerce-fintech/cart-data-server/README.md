# Cart Data Server

A simple Express server that provides customer cart data for the MCP Cart Analysis tool. This server runs on port 3001 and provides a RESTful API for accessing customer cart information.

## Features

- **Customer Data API**: Access customer information and shopping cart contents
- **Predefined Customer Carts**: Contains 20 sample customers with various shopping carts
- **RESTful Endpoints**: Simple API for retrieving customer data
- **CORS Enabled**: Works seamlessly with the MCP server

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

The server will start on port 3001.

## API Endpoints

### Get All Customers with Carts

```
GET /api/customers
```

Returns a list of all customers with their cart information.

### Get a Specific Customer

```
GET /api/customers/:id
```

Returns information for a specific customer by ID (e.g., `cust01`, `cust02`, etc.).

### Get a Customer's Cart

```
GET /api/customers/:id/cart
```

Returns just the cart contents for a specific customer.

### Health Check

```
GET /health
```

Simple health check endpoint to verify the server is running.

## Integration with MCP Server

The Cart Data Server is designed to work with the MCP server's Cart Analysis tool. When a customer ID is provided to the Cart Analysis tool, it will fetch the customer's cart data from this server automatically.

To test the integration, follow these steps:

1. Start the Cart Data Server:
   ```bash
   cd cart-data-server
   npm start
   ```

2. Start the MCP Server in a separate terminal:
   ```bash
   cd cart-analysis-mcp
   npm start
   ```

3. Run the integration test:
   ```bash
   cd cart-analysis-mcp
   node examples/cart-data-server-test.js
   ```

## Available Customer IDs

The server contains data for customers with IDs from `cust01` through `cust20`. Each customer has a unique shopping cart with different products, categories, and quantities.

## Sample Data Structure

```json
{
  "id": "cust01",
  "name": "Alice",
  "cart": [
    {
      "id": "prod1",
      "name": "Laptop",
      "price": 1200,
      "quantity": 1,
      "category": "electronics"
    },
    {
      "id": "prod2",
      "name": "Mouse",
      "price": 25,
      "quantity": 2,
      "category": "electronics"
    }
  ]
}
```

## License

MIT