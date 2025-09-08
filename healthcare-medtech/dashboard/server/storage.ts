import { 
  type Patient, 
  type InsertPatient,
  type DentalXray,
  type InsertDentalXray,
  type Appointment,
  type InsertAppointment,
  type DentalHistory,
  type InsertDentalHistory
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Patients
  getPatients(): Promise<Patient[]>;
  getPatient(id: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatientAISummary(id: string, aiSummary: string): Promise<Patient>;
  
  // Dental X-rays
  getDentalXrays(): Promise<DentalXray[]>;
  getDentalXraysByPatient(patientId: string): Promise<DentalXray[]>;
  createDentalXray(xray: InsertDentalXray): Promise<DentalXray>;
  updateDentalXrayAnalysis(id: string, aiAnalysis: string, confidence: number, findings?: string): Promise<DentalXray>;
  
  // Appointments
  getAppointments(): Promise<Appointment[]>;
  getAppointmentsByPatient(patientId: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentTranscription(id: string, transcription: string): Promise<Appointment>;
  updateAppointmentTreatmentNotes(id: string, treatmentNotes: any): Promise<Appointment>;
  
  // Dental History
  getDentalHistoryByPatient(patientId: string): Promise<DentalHistory[]>;
  createDentalHistory(history: InsertDentalHistory): Promise<DentalHistory>;
}

export class MemStorage implements IStorage {
  private patients: Map<string, Patient> = new Map();
  private dentalXrays: Map<string, DentalXray> = new Map();
  private appointments: Map<string, Appointment> = new Map();
  private dentalHistory: Map<string, DentalHistory> = new Map();

  constructor() {
    // Initialize with sample data
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Sample dental patients
    const patient1: Patient = {
      id: "patient-1",
      name: "John Smith",
      dateOfBirth: "1975-03-15",
      gender: "Male",
      insuranceProvider: "Delta Dental",
      allergies: "Latex, Penicillin",
      dentalHistory: "Regular cleanings, one root canal (tooth #14) in 2020",
      emergencyContactName: "Jane Smith",
      emergencyContactPhone: "(555) 123-4567",
      emergencyContactRelationship: "Spouse",
      aiSummary: "49-year-old male with good oral hygiene. History of periodontal disease, currently well-controlled. Regular cleanings every 6 months. No active cavities. Recommends continuation of current oral care routine.",
      lastCleaningDate: "2024-06-15",
      createdAt: new Date(),
    };

    const patient2: Patient = {
      id: "patient-2",
      name: "Maria Garcia",
      dateOfBirth: "1988-07-22",
      gender: "Female",
      insuranceProvider: "MetLife Dental",
      allergies: "None known",
      dentalHistory: "Excellent oral health, regular checkups",
      emergencyContactName: "Carlos Garcia",
      emergencyContactPhone: "(555) 987-6543",
      emergencyContactRelationship: "Brother",
      aiSummary: "36-year-old female with excellent oral health. No history of major dental procedures. Regular cleanings and checkups. Recommended for routine care.",
      lastCleaningDate: "2024-08-10",
      createdAt: new Date(),
    };

    this.patients.set(patient1.id, patient1);
    this.patients.set(patient2.id, patient2);

    // Sample dental history
    const history1: DentalHistory = {
      id: "history-1",
      patientId: "patient-1",
      title: "Routine Cleaning",
      description: "Professional dental cleaning and fluoride treatment. Good oral hygiene maintenance.",
      date: new Date("2024-06-15"),
      type: "cleaning",
      toothNumber: null,
      cost: "$120",
      createdAt: new Date(),
    };

    const history2: DentalHistory = {
      id: "history-2",
      patientId: "patient-2",
      title: "Composite Filling",
      description: "Small cavity filled with tooth-colored composite material.",
      date: new Date("2024-05-20"),
      type: "filling",
      toothNumber: "#12",
      cost: "$185",
      createdAt: new Date(),
    };

    this.dentalHistory.set(history1.id, history1);
    this.dentalHistory.set(history2.id, history2);
  }

  // Patients
  async getPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = randomUUID();
    const patient: Patient = { 
      ...insertPatient, 
      id,
      bloodType: insertPatient.bloodType || null,
      allergies: insertPatient.allergies || null,
      emergencyContactName: insertPatient.emergencyContactName || null,
      emergencyContactPhone: insertPatient.emergencyContactPhone || null,
      emergencyContactRelationship: insertPatient.emergencyContactRelationship || null,
      aiSummary: insertPatient.aiSummary || null,
      createdAt: new Date()
    };
    this.patients.set(id, patient);
    return patient;
  }

  async updatePatientAISummary(id: string, aiSummary: string): Promise<Patient> {
    const patient = this.patients.get(id);
    if (!patient) {
      throw new Error("Patient not found");
    }
    const updatedPatient = { ...patient, aiSummary };
    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }

  // Dental X-rays
  async getDentalXrays(): Promise<DentalXray[]> {
    return Array.from(this.dentalXrays.values());
  }

  async getDentalXraysByPatient(patientId: string): Promise<DentalXray[]> {
    return Array.from(this.dentalXrays.values()).filter(
      xray => xray.patientId === patientId
    );
  }

  async createDentalXray(insertXray: InsertDentalXray): Promise<DentalXray> {
    const id = randomUUID();
    const xray: DentalXray = { 
      ...insertXray, 
      id,
      patientId: insertXray.patientId || null,
      aiAnalysis: insertXray.aiAnalysis || null,
      confidence: insertXray.confidence || null,
      findings: insertXray.findings || null,
      status: insertXray.status || "processing",
      uploadedAt: new Date()
    };
    this.dentalXrays.set(id, xray);
    return xray;
  }

  async updateDentalXrayAnalysis(id: string, aiAnalysis: string, confidence: number, findings?: string): Promise<DentalXray> {
    const xray = this.dentalXrays.get(id);
    if (!xray) {
      throw new Error("Dental X-ray not found");
    }
    const updatedXray = { ...xray, aiAnalysis, confidence, findings: findings || null, status: "completed" };
    this.dentalXrays.set(id, updatedXray);
    return updatedXray;
  }

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      appointment => appointment.patientId === patientId
    );
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = randomUUID();
    const appointment: Appointment = { 
      ...insertAppointment, 
      id,
      patientId: insertAppointment.patientId || null,
      status: insertAppointment.status || "scheduled",
      isRecurring: insertAppointment.isRecurring || false,
      transcription: insertAppointment.transcription || null,
      soapNotes: insertAppointment.soapNotes || null,
      createdAt: new Date()
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointmentTranscription(id: string, transcription: string): Promise<Appointment> {
    const appointment = this.appointments.get(id);
    if (!appointment) {
      throw new Error("Appointment not found");
    }
    const updatedAppointment = { ...appointment, transcription };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async updateAppointmentTreatmentNotes(id: string, treatmentNotes: any): Promise<Appointment> {
    const appointment = this.appointments.get(id);
    if (!appointment) {
      throw new Error("Appointment not found");
    }
    const updatedAppointment = { ...appointment, treatmentNotes };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  // Dental History
  async getDentalHistoryByPatient(patientId: string): Promise<DentalHistory[]> {
    return Array.from(this.dentalHistory.values()).filter(
      history => history.patientId === patientId
    );
  }

  async createDentalHistory(insertHistory: InsertDentalHistory): Promise<DentalHistory> {
    const id = randomUUID();
    const history: DentalHistory = { 
      ...insertHistory, 
      id,
      patientId: insertHistory.patientId || null,
      createdAt: new Date()
    };
    this.dentalHistory.set(id, history);
    return history;
  }
}

export const storage = new MemStorage();
