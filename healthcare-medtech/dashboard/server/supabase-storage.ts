import { createClient } from '@supabase/supabase-js';
import type { 
  Individual, 
  InsertIndividual,
  AppointmentHistory,
  InsertAppointmentHistory,
  DentistNotes,
  InsertDentistNotes,
  Summaries,
  InsertSummaries,
  Patient,
  InsertPatient,
  DentalXray,
  InsertDentalXray,
  Appointment,
  InsertAppointment,
  DentalHistory,
  InsertDentalHistory
} from "../shared/schema";

import type { IStorage } from "./storage";
import { randomUUID } from "crypto";
import assert from 'assert';
import * as dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;

assert(supabaseUrl !== undefined, "Supabase URL must be set!");
assert(supabaseKey !== undefined, "Supabase KEY must be set!");

export class SupabaseStorage implements IStorage {
  private supabase = createClient(supabaseUrl, supabaseKey);

  // Helper method to convert Supabase Individual to legacy Patient format
  private individualToPatient(individual: Individual): Patient {
    return {
      id: individual.id.toString(),
      name: `${individual.first_name} ${individual.last_name}`,
      dateOfBirth: individual.date_of_birth,
      gender: "Not specified", // Not in Supabase schema
      insuranceProvider: null,
      allergies: null,
      dentalHistory: null,
      emergencyContactName: null,
      emergencyContactPhone: null,
      emergencyContactRelationship: null,
      aiSummary: null,
      lastCleaningDate: null,
      createdAt: new Date(individual.created_date),
    };
  }

  // Helper method to convert Supabase DentistNotes to legacy DentalHistory format
  private dentistNotesToDentalHistory(note: DentistNotes): DentalHistory {
    return {
      id: note.id.toString(),
      patientId: note.individual_id.toString(),
      title: note.title,
      description: note.text,
      date: new Date(note.created_date),
      type: "note",
      toothNumber: null,
      cost: null,
      createdAt: new Date(note.created_date),
    };
  }

  // Patients (using Supabase Individuals)
  async getPatients(): Promise<Patient[]> {
    const { data, error } = await this.supabase
      .from('Individuals')
      .select('*')
      .eq('is_employee', false);

    if (error) throw error;
    return (data || []).map(this.individualToPatient);
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    const { data, error } = await this.supabase
      .from('Individuals')
      .select('*')
      .eq('id', parseInt(id))
      .eq('is_employee', false)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
      throw error;
    }

    // Get AI summary if available
    const { data: summaryData } = await this.supabase
      .from('Summaries')
      .select('*')
      .eq('individual_id', parseInt(id))
      .order('version', { ascending: false })
      .limit(1)
      .single();

    const patient = this.individualToPatient(data);
    if (summaryData) {
      patient.aiSummary = summaryData.summary;
    }

    return patient;
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const [firstName, ...lastNameParts] = insertPatient.name.split(' ');
    const lastName = lastNameParts.join(' ') || firstName;

    const { data, error } = await this.supabase
      .from('Individuals')
      .insert({
        first_name: firstName,
        last_name: lastName,
        date_of_birth: insertPatient.dateOfBirth,
        identification_num: randomUUID().substring(0, 8), // Generate a simple ID
        email_primary: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        address_primary: "Address not provided",
        phone_number: "000-000-0000",
        is_employee: false,
      })
      .select()
      .single();

    if (error) throw error;
    return this.individualToPatient(data);
  }

  async updatePatientAISummary(id: string, aiSummary: string, version: number = 1): Promise<Patient> {
    const individualId = parseInt(id);
    
    console.log(`💾 Saving AI summary for patient ${individualId}...`);
    console.log(`📝 Summary length: ${aiSummary.length} characters`);
    
    // First, delete any existing summaries for this patient (replace, don't increment)
    await this.supabase
      .from('Summaries')
      .delete()
      .eq('individual_id', individualId);

    // Create new summary with the version from MCP response
    const { data, error } = await this.supabase
      .from('Summaries')
      .insert({
        individual_id: individualId,
        summary: aiSummary,
        hash: Buffer.from(aiSummary).toString('base64').substring(0, 32),
        version: version,
      })
      .select();

    if (error) {
      console.error('❌ Error saving summary to database:', error);
      throw error;
    }
    
    console.log('✅ Summary saved to database:', data);

    const patient = await this.getPatient(id);
    if (!patient) throw new Error("Patient not found");
    
    return { ...patient, aiSummary };
  }

  // Dental X-rays (keeping legacy implementation for now)
  private dentalXrays: Map<string, DentalXray> = new Map();

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
    if (!xray) throw new Error("Dental X-ray not found");
    
    const updatedXray = { ...xray, aiAnalysis, confidence, findings: findings || null, status: "completed" };
    this.dentalXrays.set(id, updatedXray);
    return updatedXray;
  }

  // Appointments (using Supabase Appointment History)
  async getAppointments(): Promise<Appointment[]> {
    const { data, error } = await this.supabase
      .from('Appointment History')
      .select('*')
      .order('appointed_date', { ascending: false });

    if (error) throw error;

    return (data || []).map(apt => ({
      id: apt.id.toString(),
      patientId: apt.individual_id.toString(),
      appointmentDate: new Date(apt.appointed_date),
      type: apt.was_attended ? "completed" : "scheduled",
      procedureType: null,
      status: apt.was_attended ? "completed" : "scheduled",
      isRecurring: false,
      transcription: null,
      treatmentNotes: null,
      createdAt: new Date(apt.creation_date),
    }));
  }

  async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    const { data, error } = await this.supabase
      .from('Appointment History')
      .select('*')
      .eq('individual_id', parseInt(patientId))
      .order('appointed_date', { ascending: false });

    if (error) throw error;

    return (data || []).map(apt => ({
      id: apt.id.toString(),
      patientId: apt.individual_id.toString(),
      appointmentDate: new Date(apt.appointed_date),
      type: apt.was_attended ? "completed" : "scheduled",
      procedureType: null,
      status: apt.was_attended ? "completed" : "scheduled",
      isRecurring: false,
      transcription: null,
      treatmentNotes: null,
      createdAt: new Date(apt.creation_date),
    }));
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const { data, error } = await this.supabase
      .from('Appointment History')
      .insert({
        individual_id: parseInt(insertAppointment.patientId || "0"),
        appointed_date: insertAppointment.appointmentDate.toISOString(),
        was_attended: false,
        attendant_id: 1, // Default attendant
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id.toString(),
      patientId: data.individual_id.toString(),
      appointmentDate: new Date(data.appointed_date),
      type: insertAppointment.type,
      procedureType: insertAppointment.procedureType,
      status: "scheduled",
      isRecurring: insertAppointment.isRecurring || false,
      transcription: insertAppointment.transcription || null,
      treatmentNotes: insertAppointment.treatmentNotes || null,
      createdAt: new Date(data.creation_date),
    };
  }

  async updateAppointmentTranscription(id: string, transcription: string): Promise<Appointment> {
    // For now, we'll store this in memory since Supabase schema doesn't have transcription field
    const appointment = await this.getAppointmentById(id);
    if (!appointment) throw new Error("Appointment not found");
    
    return { ...appointment, transcription };
  }

  async updateAppointmentTreatmentNotes(id: string, treatmentNotes: any): Promise<Appointment> {
    // For now, we'll store this in memory since Supabase schema doesn't have treatment notes field
    const appointment = await this.getAppointmentById(id);
    if (!appointment) throw new Error("Appointment not found");
    
    return { ...appointment, treatmentNotes };
  }

  private async getAppointmentById(id: string): Promise<Appointment | undefined> {
    const { data, error } = await this.supabase
      .from('Appointment History')
      .select('*')
      .eq('id', parseInt(id))
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }

    return {
      id: data.id.toString(),
      patientId: data.individual_id.toString(),
      appointmentDate: new Date(data.appointed_date),
      type: data.was_attended ? "completed" : "scheduled",
      procedureType: null,
      status: data.was_attended ? "completed" : "scheduled",
      isRecurring: false,
      transcription: null,
      treatmentNotes: null,
      createdAt: new Date(data.creation_date),
    };
  }

  // Dental History (using Supabase Dentist Notes)
  async getDentalHistoryByPatient(patientId: string): Promise<DentalHistory[]> {
    const { data, error } = await this.supabase
      .from('Dentist Notes')
      .select('*')
      .eq('individual_id', parseInt(patientId))
      .order('created_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(this.dentistNotesToDentalHistory);
  }

  async createDentalHistory(insertHistory: InsertDentalHistory): Promise<DentalHistory> {
    const { data, error } = await this.supabase
      .from('Dentist Notes')
      .insert({
        individual_id: parseInt(insertHistory.patientId || "0"),
        title: insertHistory.title,
        text: insertHistory.description,
        appointment_id: null,
      })
      .select()
      .single();

    if (error) throw error;
    return this.dentistNotesToDentalHistory(data);
  }
}

export const supabaseStorage = new SupabaseStorage();