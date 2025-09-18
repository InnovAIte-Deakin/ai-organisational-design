// Server-side n8n Client for AI Summary Generation
export class N8nServerClient {
  private baseUrl: string;

  constructor() {
    // n8n server URL - should be configured via environment variables
    this.baseUrl = process.env.N8N_URL || "http://localhost:5678";
  }

  async generatePatientSummary(
    recordId: number,
    patientData?: any
  ): Promise<any> {
    try {
      // n8n webhook endpoint for patient summary generation
      const webhookUrl = `${this.baseUrl}/webhook/patient-summary`;

      const payload = {
        record_id: recordId,
        action: "generate_summary",
        patient_data: patientData,
        timestamp: new Date().toISOString(),
      };

      console.log("Triggering n8n workflow for patient summary:", payload);

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `n8n request failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("n8n workflow response:", result);

      return result;
    } catch (error) {
      let errora = error as any;
      console.error("n8n Server Client Error:", errora);
      throw new Error(
        `Failed to generate AI summary via n8n: ${errora.message}`
      );
    }
  }

  async triggerWorkflow(workflowName: string, data: any): Promise<any> {
    try {
      const webhookUrl = `${this.baseUrl}/webhook/${workflowName}`;

      console.log(`Triggering n8n workflow: ${workflowName}`, data);

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(
          `n8n workflow trigger failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log(`n8n workflow ${workflowName} response:`, result);

      return result;
    } catch (error) {
      let errora = error as any;
      console.error(`n8n Workflow Error (${workflowName}):`, errora);
      throw new Error(
        `Failed to trigger n8n workflow ${workflowName}: ${errora.message}`
      );
    }
  }

  // Specific method for medical record summary workflow
  async generateMedicalRecordSummary(
    patientId: number,
    includeHistory: boolean = true
  ): Promise<any> {
    return this.triggerWorkflow("medical-record-summary", {
      patient_id: patientId,
      include_history: includeHistory,
      source: "dashboard",
    });
  }

  // Wrapper function for Transcription_to_SOAP MCP tool
  async processTranscriptionToSOAP(
    recordId: number,
    transcription: string
  ): Promise<any> {
    try {
      console.log(
        `🎤 Processing transcription to SOAP notes for record ID: ${recordId}`
      );
      console.log(`Transcription length: ${transcription.length} characters`);

      // Use the MCP server URL from environment variable
      const mcpServerUrl = process.env.MCP_SERVER_URL;
      if (!mcpServerUrl) {
        throw new Error("MCP_SERVER_URL environment variable is not set");
      }

      console.log(`Using MCP server: ${mcpServerUrl}`);

      // Call the MCP server's Transcription_to_SOAP tool
      let mcpResponse = await this.triggerWorkflow("Transcription_to_SOAP", {
        patient_id: recordId,
        transcription: transcription,
      });

      const result = await mcpResponse.json();
      console.log("✅ MCP Transcription_to_SOAP response:", result);

      return result;
    } catch (error) {
      let errora = error as any;
      console.error("❌ Transcription_to_SOAP Error:", errora);
      throw new Error(
        `Failed to process transcription to SOAP via MCP: ${errora.message}`
      );
    }
  }

  // Alternative method using n8n webhook if MCP is not available
  async processTranscriptionToSOAPViaWebhook(
    recordId: number,
    transcription: string
  ): Promise<any> {
    return this.triggerWorkflow("transcription-to-soap", {
      record_id: recordId,
      transcription: transcription,
      source: "dashboard",
    });
  }
}

export const n8nServerClient = new N8nServerClient();
