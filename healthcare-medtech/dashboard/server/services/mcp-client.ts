import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import assert from "assert";
import * as dotenv from 'dotenv'
dotenv.config()

export class MCPServerClient {
  private baseUrl: URL;
  private client: Client | undefined;

  constructor(url: string) {
    // Use the same MCP server URL as in the test file
    this.baseUrl = new URL(url);
  }

  get_url(): URL {
    return this.baseUrl;
  }

  async connect(): Promise<void> {
    if (this.client) {
      return; // Already connected
    }

    console.log(`MCP: Attempting to connect to ${this.baseUrl.toString()}`);

    try {
      // Try StreamableHTTP transport first
      this.client = new Client({name: 'dashboard-mcp-client', version: '1.0.0'});
      const transport = new StreamableHTTPClientTransport(new URL(this.baseUrl));
      await this.client.connect(transport);
      console.log("MCP: ✅ Connected using Streamable HTTP transport");
    } catch (error: any) {
      console.log("MCP: ❌ Streamable HTTP connection failed, falling back to SSE transport");
      console.log("MCP: HTTP Error:", error.message);
      
      try {
        this.client = new Client({
          name: 'dashboard-sse-client',
          version: '1.0.0'
        });
        const sseTransport = new SSEClientTransport(this.baseUrl);
        await this.client.connect(sseTransport);
        console.log("MCP: ✅ Connected using SSE transport");
      } catch (sseError: any) {
        console.error("MCP: ❌ Failed to connect with both transports");
        console.error("MCP: HTTP Error:", error.message);
        console.error("MCP: SSE Error:", sseError.message);
        this.client = undefined;
        throw new Error(`Failed to connect to MCP server at ${this.baseUrl.toString()}. Make sure the MCP server is running.`);
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = undefined;
      console.log("MCP: Disconnected from server");
    }
  }

  async listTools(): Promise<any> {
    await this.connect();
    if (!this.client) {
      throw new Error("MCP client not connected");
    }

    const tools = await this.client.listTools();
    console.log("MCP: Available tools:");
    tools.tools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.description || "No Description"}`);
    });
    return tools;
  }

  async isServerAvailable(): Promise<boolean> {
    try {
      await this.connect();
      return !!this.client;
    } catch (error) {
      return false;
    }
  }

  async generatePatientSummary(recordId: number): Promise<any> {
    console.log(`MCP: Generating patient summary for record ID: ${recordId}`);

    try {
      await this.connect();
      if (!this.client) {
        throw new Error("MCP client not connected");
      }

      const toolResponse = await this.client.callTool({
        name: "Patient_Record_Summary",
        arguments: {
          "record_id": recordId
        }
      });

      console.log("MCP: ✅ Tool response received:", toolResponse.content);
      return toolResponse;
    } catch (error: any) {
      console.error("MCP: ❌ Error calling Patient_Record_Summary tool:", error.message);
      
      // Return a fallback response structure
      return {
        content: [{
          type: 'text',
          text: `Fallback AI Summary for Patient ID ${recordId}:\n\nThe MCP server is currently unavailable. This is a placeholder summary generated when the AI service cannot be reached.\n\nTo get a proper AI-generated summary, please ensure the MCP server is running at: ${this.baseUrl.toString()}\n\nGenerated at: ${new Date().toISOString()}`
        }],
        isError: false,
        _meta: {
          fallback: true,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  async callTool(toolName: string, toolArguments: any): Promise<any> {
    await this.connect();
    if (!this.client) {
      throw new Error("MCP client not connected");
    }

    console.log(`MCP: Calling tool ${toolName} with arguments:`, toolArguments);

    try {
      const toolResponse = await this.client.callTool({
        name: toolName,
        arguments: toolArguments
      });

      console.log(`MCP: Tool ${toolName} response:`, toolResponse.content);
      return toolResponse;
    } catch (error) {
      let errora = error as any;
      console.error(`MCP: Error calling tool ${toolName}:`, errora);
      throw new Error(`Failed to call MCP tool ${toolName}: ${errora.message}`);
    }
  }
}

// Create a singleton instance
const client_url = process.env.MCP_SERVER_URL as string;
assert(client_url !== undefined, "Environment MCP_SERVER_URL must be set!");

export const mcpServerClient = new MCPServerClient(client_url);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('MCP: Shutting down...');
  await mcpServerClient.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('MCP: Shutting down...');
  await mcpServerClient.disconnect();
  process.exit(0);
});