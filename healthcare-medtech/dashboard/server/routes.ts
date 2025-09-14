import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { supabaseStorage } from "./supabase-storage";
import { generateDentalXraySummary, generatePatientSummary, generateTreatmentNotes } from "./services/openai";
import { mcpServerClient } from "./services/mcp-client";
import { 
  insertPatientSchema,
  insertDentalXraySchema,
  insertAppointmentSchema,
  insertDentalHistorySchema
} from "../shared/schema";
import multer from "multer";
import { z } from "zod";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Use Supabase storage for patient data
  const activeStorage = supabaseStorage;

  // Patients routes
  app.get("/api/patients", async (req, res) => {
    try {
      const patients = await activeStorage.getPatients();
      res.json(patients);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.get("/api/patients/:id", async (req, res) => {
    try {
      const patient = await activeStorage.getPatient(req.params.id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      console.error("Failed to fetch patient:", error);
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  app.post("/api/patients", async (req, res) => {
    try {
      const patientData = insertPatientSchema.parse(req.body);
      const patient = await activeStorage.createPatient(patientData);
      res.json(patient);
    } catch (error) {
      console.error("Failed to create patient:", error);
      res.status(400).json({ message: "Invalid patient data" });
    }
  });

  app.post("/api/patients/:id/ai-summary", async (req, res) => {
    try {
      const patient = await activeStorage.getPatient(req.params.id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      console.log(`Generating AI summary for patient ${patient.id} via MCP...`);
      
      // Check if MCP server is available
      const mcpAvailable = await mcpServerClient.isServerAvailable();
      console.log(`MCP Server Status: ${mcpAvailable ? '✅ Available' : '❌ Unavailable'}`);
      
      // Use MCP to generate the summary using the Patient_Record_Summary tool
      const mcpResponse = await mcpServerClient.generatePatientSummary(parseInt(req.params.id));

      // Extract summary and version from MCP response
      let aiSummary = `AI-generated summary for ${patient.name} created via MCP.`;
      let mcpVersion = 1; // Default version
      
      if (mcpResponse && mcpResponse.content && mcpResponse.content.length > 0) {
        const content = mcpResponse.content[0];
        
        // Try to parse the response as JSON first (MCP returns structured data)
        try {
          let responseData;
          if (content.type === 'text' && content.text) {
            responseData = JSON.parse(content.text);
          } else if (typeof content === 'string') {
            responseData = JSON.parse(content);
          } else {
            responseData = content;
          }
          
          // Extract the summary and version from the structured response
          if (responseData && responseData.summary) {
            aiSummary = responseData.summary;
            mcpVersion = responseData.version || 1;
            console.log("✅ Extracted summary and version from MCP response");
          } else if (Array.isArray(responseData) && responseData[0] && responseData[0].summary) {
            aiSummary = responseData[0].summary;
            mcpVersion = responseData[0].version || 1;
            console.log("✅ Extracted summary and version from MCP array response");
          } else {
            console.log("⚠️ No 'summary' key found in MCP response, using full content");
            aiSummary = content.text || JSON.stringify(responseData);
          }
        } catch (parseError) {
          // Fallback to plain text if JSON parsing fails
          console.log("⚠️ Could not parse MCP response as JSON, using as plain text");
          aiSummary = content.text || content.toString();
        }
      }

      console.log("MCP Summary generated:", aiSummary.substring(0, 100) + "...");
      console.log("Full MCP Response:", JSON.stringify(mcpResponse, null, 2));

      const updatedPatient = await activeStorage.updatePatientAISummary(req.params.id, aiSummary, mcpVersion);
      console.log("Updated patient with summary:", updatedPatient.aiSummary ? "✅ Summary saved" : "❌ No summary in patient");
      
      res.json({
        ...updatedPatient,
        mcpResponse,
        generatedAt: new Date().toISOString(),
        source: "MCP",
        mcpServerAvailable: mcpAvailable,
        isFallback: mcpResponse._meta?.fallback || false,
        debug: {
          summaryLength: aiSummary.length,
          summaryPreview: aiSummary.substring(0, 200)
        }
      });
    } catch (error) {
      console.error("Failed to generate AI summary via MCP:", error);
      res.status(500).json({ 
        message: "Failed to generate AI summary via MCP", 
        error: error.message 
      });
    }
  });

  // MCP tools endpoint for testing and advanced usage
  app.get("/api/mcp/tools", async (req, res) => {
    try {
      const tools = await mcpServerClient.listTools();
      res.json(tools);
    } catch (error) {
      console.error("Failed to list MCP tools:", error);
      res.status(500).json({ 
        message: "Failed to list MCP tools", 
        error: error.message 
      });
    }
  });

  // Generic MCP tool call endpoint
  app.post("/api/mcp/call-tool", async (req, res) => {
    try {
      const { toolName, arguments: toolArgs } = req.body;
      
      if (!toolName) {
        return res.status(400).json({ message: "Tool name is required" });
      }

      const mcpResponse = await mcpServerClient.callTool(toolName, toolArgs || {});
      
      res.json({
        toolName,
        arguments: toolArgs,
        response: mcpResponse,
        calledAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Failed to call MCP tool:", error);
      res.status(500).json({ 
        message: "Failed to call MCP tool", 
        error: error.message 
      });
    }
  });

  // Test endpoint to manually trigger MCP patient summary (for testing)
  app.get("/api/test/mcp-summary/:recordId", async (req, res) => {
    try {
      const recordId = parseInt(req.params.recordId);
      
      console.log(`🧪 Test: Generating MCP summary for record ID ${recordId}`);
      
      const mcpResponse = await mcpServerClient.generatePatientSummary(recordId);
      
      res.json({
        success: true,
        recordId,
        mcpResponse,
        testedAt: new Date().toISOString(),
        message: "MCP Patient_Record_Summary tool called successfully"
      });
    } catch (error) {
      console.error("Test MCP summary failed:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to test MCP summary", 
        error: error.message 
      });
    }
  });

  // Health check endpoint for MCP server
  app.get("/api/health/mcp", async (req, res) => {
    try {
      console.log('🏥 Checking MCP server health...');
      
      const isAvailable = await mcpServerClient.isServerAvailable();
      
      if (isAvailable) {
        // Try to list tools to verify full functionality
        const tools = await mcpServerClient.listTools();
        
        res.json({
          status: "healthy",
          mcpServerAvailable: true,
          toolsCount: tools.tools.length,
          tools: tools.tools.map(t => ({ name: t.name, description: t.description })),
          serverUrl: mcpServerClient.get_url(),
          checkedAt: new Date().toISOString()
        });
      } else {
        res.status(503).json({
          status: "unhealthy",
          mcpServerAvailable: false,
          error: "MCP server is not accessible",
          serverUrl: mcpServerClient.get_url(),
          troubleshooting: [
            "1. Check if MCP server is running on port 5678",
            "2. Verify the server URL is correct",
            "3. Check firewall/network settings",
            "4. Run: node dashboard/test-mcp-connection.js"
          ],
          checkedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('❌ MCP health check failed:', error);
      res.status(503).json({
        status: "error",
        mcpServerAvailable: false,
        error: error.message,
        checkedAt: new Date().toISOString()
      });
    }
  });

  // Debug endpoint to check if summary exists in database
  app.get("/api/debug/summary/:patientId", async (req, res) => {
    try {
      const patientId = req.params.patientId;
      
      // Check if patient exists
      const patient = await activeStorage.getPatient(patientId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      // Check Supabase directly for summaries
      const { data: summaries, error } = await supabaseStorage.supabase
        .from('Summaries')
        .select('*')
        .eq('individual_id', parseInt(patientId));

      res.json({
        patientId,
        patientName: patient.name,
        summariesFound: summaries?.length || 0,
        summaries: summaries || [],
        error: error?.message || null,
        debuggedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Debug summary check failed:", error);
      res.status(500).json({ 
        message: "Failed to debug summary", 
        error: error.message 
      });
    }
  });

  // Dental X-rays routes
  app.get("/api/dental-xrays", async (req, res) => {
    try {
      const xrays = await storage.getDentalXrays();
      res.json(xrays);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dental X-rays" });
    }
  });

  app.post("/api/dental-xrays", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const xrayData = {
        patientId: req.body.patientId,
        filename: req.file.originalname,
        xrayType: req.body.xrayType || "bitewing",
        fileUrl: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
        status: "processing"
      };

      const validatedData = insertDentalXraySchema.parse(xrayData);
      const xray = await storage.createDentalXray(validatedData);

      // Generate AI analysis
      try {
        const { summary, confidence, findings } = await generateDentalXraySummary(
          xrayData.xrayType,
          req.file.buffer.toString('base64')
        );
        await storage.updateDentalXrayAnalysis(xray.id, summary, confidence, findings);
      } catch (aiError) {
        console.error("AI analysis failed:", aiError);
      }

      res.json(xray);
    } catch (error) {
      res.status(400).json({ message: "Failed to upload dental X-ray" });
    }
  });

  app.get("/api/patients/:patientId/dental-xrays", async (req, res) => {
    try {
      const xrays = await storage.getDentalXraysByPatient(req.params.patientId);
      res.json(xrays);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patient X-rays" });
    }
  });

  // Appointments routes
  app.get("/api/appointments", async (req, res) => {
    try {
      const appointments = await activeStorage.getAppointments();
      res.json(appointments);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await activeStorage.createAppointment(appointmentData);
      res.json(appointment);
    } catch (error) {
      console.error("Failed to create appointment:", error);
      res.status(400).json({ message: "Invalid appointment data" });
    }
  });

  app.post("/api/appointments/:id/transcription", async (req, res) => {
    try {
      const { transcription } = req.body;
      if (!transcription) {
        return res.status(400).json({ message: "Transcription text is required" });
      }

      await activeStorage.updateAppointmentTranscription(req.params.id, transcription);
      
      // Generate treatment notes
      const treatmentNotes = await generateTreatmentNotes(transcription);
      const updatedAppointment = await activeStorage.updateAppointmentTreatmentNotes(req.params.id, treatmentNotes);
      
      res.json(updatedAppointment);
    } catch (error) {
      console.error("Failed to process transcription:", error);
      res.status(500).json({ message: "Failed to process transcription" });
    }
  });

  // Dental history routes (alias for medical history)
  app.get("/api/patients/:patientId/dental-history", async (req, res) => {
    try {
      const history = await activeStorage.getDentalHistoryByPatient(req.params.patientId);
      res.json(history);
    } catch (error) {
      console.error("Failed to fetch dental history:", error);
      res.status(500).json({ message: "Failed to fetch dental history" });
    }
  });

  // Alias route for medical history (used by client)
  app.get("/api/patients/:patientId/medical-history", async (req, res) => {
    try {
      const history = await activeStorage.getDentalHistoryByPatient(req.params.patientId);
      res.json(history);
    } catch (error) {
      console.error("Failed to fetch medical history:", error);
      res.status(500).json({ message: "Failed to fetch medical history" });
    }
  });

  app.post("/api/dental-history", async (req, res) => {
    try {
      const historyData = insertDentalHistorySchema.parse(req.body);
      const history = await activeStorage.createDentalHistory(historyData);
      res.json(history);
    } catch (error) {
      console.error("Failed to create dental history:", error);
      res.status(400).json({ message: "Invalid dental history data" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const patients = await activeStorage.getPatients();
      const appointments = await activeStorage.getAppointments();
      const xrays = await activeStorage.getDentalXrays();

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= today && aptDate < tomorrow;
      });

      const stats = {
        activePatients: patients.length,
        todayAppointments: todayAppointments.length,
        aiAnalyses: xrays.filter(xray => xray.aiAnalysis).length,
        recentSummaries: xrays
          .filter(xray => xray.aiAnalysis)
          .slice(0, 5)
          .map(xray => ({
            patientName: patients.find(p => p.id === xray.patientId)?.name || "Unknown",
            summary: xray.aiAnalysis?.substring(0, 100) + "...",
            timestamp: xray.uploadedAt
          })),
        upcomingAppointments: appointments
          .filter(apt => new Date(apt.appointmentDate) > new Date())
          .slice(0, 5)
          .map(apt => ({
            patientName: patients.find(p => p.id === apt.patientId)?.name || "Unknown",
            type: apt.type,
            time: apt.appointmentDate
          }))
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
