// MCP Client for AI Summary Generation

import assert from "assert";
import * as dotenv from 'dotenv'
dotenv.config()

export class MCPClient {
  private baseUrl: string;

  constructor() {
    const client_url = process.env.MCP_SERVER_URL as string;
    assert(client_url !== undefined, "Environment MCP_SERVER_URL must be set!");
    this.baseUrl = client_url;
  }

  async generatePatientSummary(recordId: number): Promise<any> {
    try {
      // This would use the MCP SDK in a real implementation
      // For now, we'll simulate the API call structure
      const response = await fetch(`${this.baseUrl}/tools/Patient_Record_Summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: "Patient_Record_Summary",
          arguments: {
            record_id: recordId
          }
        })
      });

      if (!response.ok) {
        throw new Error(`MCP request failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('MCP Client Error:', error);
      throw new Error('Failed to generate AI summary via MCP');
    }
  }
}

export const mcpClient = new MCPClient();