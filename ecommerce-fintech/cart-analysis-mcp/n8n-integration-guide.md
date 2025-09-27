# Connecting the MCP Server to n8n

This guide explains how to connect your Cart Analysis MCP server to n8n and use it with AI models.

## Prerequisites

1. The MCP server is running (on port 3000 by default)
2. n8n is installed and running (version 1.19.0+ recommended for AI Agent node)
3. Basic understanding of n8n workflows

## Setup with AI Agent Node (Recommended)

The easiest way to connect to your MCP server is using n8n's AI Agent node, which supports OpenAI-compatible APIs.

### Step 1: Create a new workflow in n8n

1. Go to your n8n instance (typically at http://localhost:5678)
2. Click "Create new workflow"
3. Give it a name, e.g., "Cart Analysis with MCP"

### Step 2: Add a trigger node

1. Add a "Webhook" node to trigger your workflow
   - Set "Authentication" to "None" for testing
   - Keep "HTTP Method" as "POST"
   - Save the webhook URL for later testing

### Step 3: Add a Function node to prepare data

1. Add a "Function" node after the Webhook
2. Use this code to extract the cart information:

```javascript
// Extract cart items from the incoming message
const message = $input.item.json.message || "";

// A very simple regex-based extractor - in production you'd want more robust parsing
const items = [];
const regex = /(\w+)\s*\(\$(\d+\.\d+)(?:\s*each)?\)(?:\s*x\s*(\d+))?/g;
let match;

while ((match = regex.exec(message)) !== null) {
  const [_, name, price, quantity] = match;
  items.push({
    name,
    price: parseFloat(price),
    quantity: parseInt(quantity || 1, 10),
    category: guessCategory(name)
  });
}

// Simple category guesser
function guessCategory(name) {
  name = name.toLowerCase();
  if (name.includes("laptop") || name.includes("phone") || name.includes("tv")) return "electronics";
  if (name.includes("headphone") || name.includes("mouse") || name.includes("keyboard")) return "electronics";
  if (name.includes("coffee") || name.includes("tea") || name.includes("water")) return "beverages";
  if (name.includes("chip") || name.includes("cookie") || name.includes("candy")) return "snacks";
  if (name.includes("shirt") || name.includes("pant") || name.includes("jacket")) return "clothing";
  return "other";
}

// Return the formatted data for the next node
return {
  message,
  cartItems: items
};
```

### Step 4: Add an AI Agent node

1. Add the "AI Agent" node after the Function node
2. Configure it:
   - Model Provider: "OpenAI API Compatible"
   - Base URL: `http://localhost:3000` (your MCP server address)
   - API Key: `dummy-key` (your server doesn't check for authentication)
   - Model: `mcp-cart-analysis`
   - Messages: Click "Add Message"
     - Role: "User"
     - Content: `Analyze this cart: {{$json.message}}`

### Step 5: Add a Function node to process the response

1. Add another "Function" node
2. Use this code to process the AI Agent's response:

```javascript
// Get the AI response
const response = $input.item.json;

// Check if there are tool calls
if (response.choices && 
    response.choices[0].message && 
    response.choices[0].message.tool_calls) {
  
  const toolCalls = response.choices[0].message.tool_calls;
  
  // For demonstration, just grab the first tool call
  if (toolCalls.length > 0) {
    const toolCall = toolCalls[0];
    
    return {
      toolName: toolCall.function.name,
      toolArguments: toolCall.function.arguments,
      shouldExecuteTool: true
    };
  }
}

// If no tool calls or other error
return {
  shouldExecuteTool: false,
  message: "No tool calls found in the response."
};
```

### Step 6: Add an IF node

1. Add an "IF" node
2. Configure it with the condition: `{{$json.shouldExecuteTool}}`

### Step 7: Add an HTTP Request node for tool execution

1. On the "true" output of the IF node, add an "HTTP Request" node
2. Configure it:
   - Method: "POST"
   - URL: `http://localhost:3000/v1/functions`
   - Headers: Add "Content-Type" = "application/json"
   - Body: JSON 
   ```json
   {
     "name": "{{$json.toolName}}",
     "arguments": {{$json.toolArguments}}
   }
   ```

### Step 8: Add a Function node to format the result

1. Add a "Function" node after the HTTP Request
2. Use this code to format the result:

```javascript
// Get the tool execution result
const response = $input.item.json;

if (response.content) {
  try {
    const result = JSON.parse(response.content);
    
    // Format the analysis in a readable way
    let message = "## Cart Analysis Results\n\n";
    
    message += "### Summary\n";
    message += `- Total Items: ${result.summary.totalItems}\n`;
    message += `- Total Cost: $${result.summary.totalCost}\n`;
    
    if (parseFloat(result.summary.totalSavings) > 0) {
      message += `- Total Savings: $${result.summary.totalSavings}\n`;
      message += `- Final Cost: $${result.summary.finalCost}\n`;
    }
    
    message += "\n### Items by Category\n";
    result.categoryBreakdown.forEach(cat => {
      message += `- ${cat.category}: ${cat.items} items ($${cat.total})\n`;
    });
    
    if (result.deals.applicable.length > 0) {
      message += "\n### Applicable Deals\n";
      result.deals.applicable.forEach(deal => {
        message += `- ${deal.description} (Save $${deal.savings})\n`;
      });
    }
    
    if (result.deals.potential.length > 0) {
      message += "\n### Potential Deals\n";
      result.deals.potential.forEach(deal => {
        message += `- ${deal.description} (${deal.missing})\n`;
      });
    }
    
    if (result.recommendations.length > 0) {
      message += "\n### Recommendations\n";
      result.recommendations.forEach(rec => {
        message += `- ${rec.category}: ${rec.reason}\n`;
      });
    }
    
    return {
      formattedResult: message,
      rawResult: result
    };
  } catch (error) {
    return {
      formattedResult: "Error parsing the result: " + error.message,
      rawResult: response.content
    };
  }
} else {
  return {
    formattedResult: "No content returned from the tool execution.",
    error: response.error
  };
}
```

### Step 9: Add a Respond to Webhook node

1. Connect both the "true" path (after formatting) and the "false" path from the IF node
2. Configure it to respond with:
   - For "true" path: `{{$json.formattedResult}}`
   - For "false" path: `{{$json.message}}`

### Step 10: Activate and test the workflow

1. Click "Save" and then "Activate"
2. Use a tool like curl or Postman to test your webhook:

```bash
curl -X POST http://YOUR_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"message":"Analyze this cart: I have a laptop ($999.99), headphones ($129.99), and 2 coffees ($12.99 each)"}'
```

## Troubleshooting

- **404 errors**: Ensure your MCP server is running on the expected port
- **Connection refused**: Check if your n8n instance can connect to your MCP server (they might be on different networks)
- **Parsing errors**: Check the format of the cart data you're sending

## Next Steps

Once you have this basic integration working, you can enhance it by:

1. Improving the cart item extraction logic
2. Adding error handling
3. Connecting it to your chat interface
4. Adding more tools to your MCP server

Remember that this MCP server is designed to work with AI models through n8n, allowing natural language processing of cart data and providing rich analysis results.