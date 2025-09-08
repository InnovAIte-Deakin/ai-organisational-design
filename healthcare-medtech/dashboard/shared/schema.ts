import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  gender: text("gender").notNull(),
  insuranceProvider: text("insurance_provider"),
  allergies: text("allergies"),
  dentalHistory: text("dental_history"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  emergencyContactRelationship: text("emergency_contact_relationship"),
  aiSummary: text("ai_summary"),
  lastCleaningDate: text("last_cleaning_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dentalXrays = pgTable("dental_xrays", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id),
  filename: text("filename").notNull(),
  xrayType: text("xray_type").notNull(), // "bitewing", "panoramic", "periapical", "occlusal"
  fileUrl: text("file_url").notNull(),
  aiAnalysis: text("ai_analysis"),
  confidence: integer("confidence"),
  findings: text("findings"), // "cavities", "periodontal disease", "impacted teeth", etc.
  status: text("status").default("processing"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id),
  appointmentDate: timestamp("appointment_date").notNull(),
  type: text("type").notNull(), // "consultation", "cleaning", "procedure", "followup"
  procedureType: text("procedure_type"), // "cleaning", "filling", "crown", "extraction", "root canal"
  status: text("status").default("scheduled"), // "scheduled", "completed", "cancelled"
  isRecurring: boolean("is_recurring").default(false),
  transcription: text("transcription"),
  treatmentNotes: json("treatment_notes").$type<{
    chief_complaint: string;
    examination: string;
    diagnosis: string;
    treatment_plan: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dentalHistory = pgTable("dental_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  type: text("type").notNull(), // "cleaning", "filling", "crown", "extraction", "root_canal", "checkup"
  toothNumber: text("tooth_number"), // Dental numbering system
  cost: text("cost"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
});

export const insertDentalXraySchema = createInsertSchema(dentalXrays).omit({
  id: true,
  uploadedAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

export const insertDentalHistorySchema = createInsertSchema(dentalHistory).omit({
  id: true,
  createdAt: true,
});

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type DentalXray = typeof dentalXrays.$inferSelect;
export type InsertDentalXray = z.infer<typeof insertDentalXraySchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type DentalHistory = typeof dentalHistory.$inferSelect;
export type InsertDentalHistory = z.infer<typeof insertDentalHistorySchema>;
