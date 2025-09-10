import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const baseUrl = new URL("http://localhost:5678/mcp-test/9cb4d576-7df4-4f23-82eb-59ce51f7cbd5");

let client: Client|undefined = undefined

try {
    client = new Client({name: 'streamable-http-client', version: '1.0.0'});
    const transport = new StreamableHTTPClientTransport(new URL(baseUrl));
    await client.connect(transport);
    console.log("Connected using Streamable HTTP transport");
} catch (error) {
    console.log("Streamable HTTP connection failed, falling back to SSE transport");
    client = new Client({
        name: 'sse-client',
        version: '1.0.0'
    });
    const sseTransport = new SSEClientTransport(baseUrl);
    await client.connect(sseTransport);
    console.log("Connected using SSE transport");
}

// list tools
const tools = await client.listTools();
tools.tools.map(tool => {
    console.log(tool.name, tool.description || "No Description");
})

const tool_response = await client.callTool({
    name: "Patient_Record_Summary",
    arguments: {
        "record_id": 4
    }
})

console.log(tool_response.content);
