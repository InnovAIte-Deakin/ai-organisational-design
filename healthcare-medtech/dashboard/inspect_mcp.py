
from typing import Optional
from mcp import ClientSession
from mcp.types import CallToolResult
from mcp.client.streamable_http import streamablehttp_client
from pydantic import BaseModel

import asyncio
import json

class SummaryResponse(BaseModel):
	id: int
	individual_id: int
	hash: str
	summary: str
	version: int
	created_date: str

async def prepare_summary_response(result: CallToolResult, debug: bool = True) -> Optional[SummaryResponse]:
	try:
		content = result.content[0].text
		if "does not exist" in content:
			print("The record does not exist!")
			return None
		js = json.loads(content)[0]
		value = SummaryResponse.model_validate(js)
		if debug:
			print(value.model_dump_json(indent=4))
		return value
	except Exception as e:
		if debug:
			print(e)
		return None

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
				print(f"- {tool.name} - {tool.description or "No Description"}")
			#
			# TEST CALLING THE TOOL MANUALLY
			args = {"record_id": 5}
			result: CallToolResult = await session.call_tool("Patient_Record_Summary", args)
			summary: Optional[SummaryResponse] = await prepare_summary_response(result, debug=True)
			print("Summary was returned!" if summary is not None else "Summary could not be made!")

if __name__ == "__main__":
	MCP_SERVER_URL = "https://griycor.app.n8n.cloud/mcp-test/9cb4d576-7df4-4f23-82eb-59ce51f7cbd5"
	asyncio.run(main(MCP_SERVER_URL))
