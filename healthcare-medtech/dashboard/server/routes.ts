import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateDentalXraySummary, generatePatientSummary, generateTreatmentNotes } from "./services/openai";
import { 
  insertPatientSchema,
  insertDentalXraySchema,
  insertAppointmentSchema,
  insertDentalHistorySchema
} from "@shared/schema";
import multer from "multer";
import { z } from "zod";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Patients routes
  app.get("/api/patients", async (req, res) => {
    try {
      const patients = await storage.getPatients();
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.get("/api/patients/:id", async (req, res) => {
    try {
      const patient = await storage.getPatient(req.params.id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  app.post("/api/patients", async (req, res) => {
    try {
      const patientData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(patientData);
      res.json(patient);
    } catch (error) {
      res.status(400).json({ message: "Invalid patient data" });
    }
  });

  app.post("/api/patients/:id/ai-summary", async (req, res) => {
    try {
      const patient = await storage.getPatient(req.params.id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const dentalHistory = await storage.getDentalHistoryByPatient(req.params.id);
      
      const aiSummary = await generatePatientSummary({
        name: patient.name,
        dentalHistory: dentalHistory.map(h => `${h.title}: ${h.description}`),
        lastCleaning: patient.lastCleaningDate,
      });

      const updatedPatient = await storage.updatePatientAISummary(req.params.id, aiSummary);
      res.json(updatedPatient);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate AI summary" });
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
      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.json(appointment);
    } catch (error) {
      res.status(400).json({ message: "Invalid appointment data" });
    }
  });

  app.post("/api/appointments/:id/transcription", async (req, res) => {
    try {
      const { transcription } = req.body;
      if (!transcription) {
        return res.status(400).json({ message: "Transcription text is required" });
      }

      await storage.updateAppointmentTranscription(req.params.id, transcription);
      
      // Generate treatment notes
      const treatmentNotes = await generateTreatmentNotes(transcription);
      const updatedAppointment = await storage.updateAppointmentTreatmentNotes(req.params.id, treatmentNotes);
      
      res.json(updatedAppointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to process transcription" });
    }
  });

  // Dental history routes
  app.get("/api/patients/:patientId/dental-history", async (req, res) => {
    try {
      const history = await storage.getDentalHistoryByPatient(req.params.patientId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dental history" });
    }
  });

  app.post("/api/dental-history", async (req, res) => {
    try {
      const historyData = insertDentalHistorySchema.parse(req.body);
      const history = await storage.createDentalHistory(historyData);
      res.json(history);
    } catch (error) {
      res.status(400).json({ message: "Invalid dental history data" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const patients = await storage.getPatients();
      const appointments = await storage.getAppointments();
      const xrays = await storage.getDentalXrays();

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
