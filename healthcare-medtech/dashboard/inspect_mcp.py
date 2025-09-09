
import asyncio
import json

from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client

async def main(server_url: str):
	# Connect to the specified MCP server using Streamable HTTP transport
	async with streamablehttp_client(server_url) as (read_stream, write_stream, _):
		# Create and initialize the client session
		async with ClientSession(read_stream, write_stream) as session:
			await session.initialize()
			# Retrieve and list the available tools
			response = await session.list_tools()
			#
			tools = response.tools
			print("\n\n")
			print("Available tools:")
			for tool in tools:
				print(f"- {tool.name} - {tool.description} - {json.dumps(tool.inputSchema, indent=None)}")

if __name__ == "__main__":
	MCP_SERVER_URL = "https://AAAAAAA.app.n8n.cloud/mcp/AAAAAAA"
	asyncio.run(main(MCP_SERVER_URL))
