# N8N Integration Guide

This document provides comprehensive instructions for integrating the AI Co-founder system with n8n workflows. The guide covers setup, configuration, and examples for connecting the various components of the system.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Setting Up n8n](#setting-up-n8n)
4. [Connecting to the MCP Server](#connecting-to-the-mcp-server)
5. [Working with Cart Data Server](#working-with-cart-data-server)
6. [Creating AI Workflows](#creating-ai-workflows)
7. [Example Workflows](#example-workflows)
8. [Troubleshooting](#troubleshooting)

## Overview

The AI Co-founder system uses n8n as its workflow automation engine. n8n allows you to create visual workflows that connect various services and automate tasks. This guide explains how to set up n8n and connect it to the other components of the AI Co-founder system.

## Prerequisites

Before you begin, ensure you have:

- Docker installed (for running n8n)
- Node.js v16+ installed (for running the MCP and data servers)
- All components of the AI Co-founder system cloned and available
- Basic understanding of RESTful APIs and workflow automation

## Setting Up n8n

### Using Docker (Recommended)

1. Start n8n using Docker:
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

2. Access n8n at `http://localhost:5678`

3. Create an account or login

### Using npm (Alternative)

1. Install n8n globally:
```bash
npm install n8n -g
```

2. Start n8n:
```bash
n8n start
```

3. Access n8n at `http://localhost:5678`

## Connecting to the MCP Server

### Using the AI Agent Node

1. Start the MCP server:
```bash
cd cart-analysis-mcp
npm start
```

2. In n8n, create a new workflow

3. Add an "AI Agent" node:
   - Model Provider: OpenAI API Compatible
   - Base URL: `http://localhost:3000` (or your MCP server URL)
   - API Key: `dummy-key` (the MCP server doesn't require authentication)
   - Model: `mcp-cart-analysis`

4. Set up messages in the AI Agent node:
   - Add a message with role "User"
   - Content: Your prompt (e.g., "Analyze this cart with items: laptop $999, headphones $149")

### Using HTTP Request Node (Alternative)

If you're using an older version of n8n without the AI Agent node:

1. Add an "HTTP Request" node:
   - Method: POST
   - URL: `http://localhost:3000/v1/chat/completions`
   - Headers: `Content-Type: application/json`
   - Body:
   ```json
   {
     "model": "mcp-cart-analysis",
     "messages": [
       {"role": "user", "content": "Your prompt here"}
     ],
     "tools": [],
     "tool_choice": "auto"
   }
   ```

2. Add another "HTTP Request" node to execute tool calls if needed

## Working with Cart Data Server

1. Start the Cart Data Server:
```bash
cd cart-data-server
npm start
```

2. In n8n, add an "HTTP Request" node:
   - Method: GET
   - URL: `http://localhost:3001/api/customers` (for all customers)
   - URL: `http://localhost:3001/api/customers/cust01` (for a specific customer)
   - URL: `http://localhost:3001/api/customers/cust01/cart` (for a customer's cart)

3. Use the response data in subsequent nodes

## Creating AI Workflows

### Cart Recovery Workflow

1. Create a workflow triggered by a webhook or schedule
2. Fetch abandoned carts from the Cart Data Server
3. Use the AI Agent node connected to the MCP server to analyze the cart
4. Generate a recovery email or message based on the analysis
5. Send the message via your preferred channel

### Marketing Workflow

1. Create a trigger for new marketing campaign requests
2. Use the AI Agent to generate campaign content
3. Schedule emails or social media posts
4. Track engagement metrics

## Example Workflows

The `examples` folder contains sample n8n workflows:

- `n8n-workflow.json` - Basic cart analysis workflow
- `email-recovery-workflow.json` - Complete cart recovery workflow with email

To import these workflows:

1. In n8n, go to Workflows
2. Click the "Import from File" button
3. Select the workflow JSON file
4. Configure any credentials or settings as needed

## Troubleshooting

### Common Issues

#### MCP Server Connection Failed
- Ensure the MCP server is running
- Check the URL in the AI Agent node
- Verify there are no firewall issues

#### AI Agent Not Working
- Ensure you're using n8n v1.19.0+
- Try the HTTP Request node alternative

#### Cart Data Not Available
- Verify the Cart Data Server is running
- Check the customer ID exists (valid IDs: cust01-cust20)

### Getting Help

If you encounter issues:
- Check the console logs of each server
- Review the n8n execution logs
- Refer to the main documentation for each component