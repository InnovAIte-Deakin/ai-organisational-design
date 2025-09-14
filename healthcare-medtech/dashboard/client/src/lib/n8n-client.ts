// n8n Client for AI Summary Generation
export class N8nClient {
  private baseUrl: string;

  constructor() {
    // Default n8n webhook URL - this should be configured based on your n8n setup
    this.baseUrl = "http://localhost:5678"; // Default n8n port
  }

  async generatePatientSummary(recordId: number): Promise<any> {
    try {
      // n8n webhook endpoint for patient summary generation
      const webhookUrl = `${this.baseUrl}/webhook/patient-summary`;
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          record_id: recordId,
          action: 'generate_summary'
        })
      });

      if (!response.ok) {
        throw new Error(`n8n request failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('n8n Client Error:', error);
      throw new Error('Failed to generate AI summary via n8n');
    }
  }

  async triggerWorkflow(workflowId: string, data: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/webhook/${workflowId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`n8n workflow trigger failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('n8n Workflow Error:', error);
      throw new Error(`Failed to trigger n8n workflow: ${workflowId}`);
    }
  }
}

export const n8nClient = new N8nClient();