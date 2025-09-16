import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, integer, boolean, bigint, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Supabase schema tables
export const individuals = pgTable("Individuals", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  created_date: timestamp("created_date", { withTimezone: true }).defaultNow().notNull(),
  first_name: varchar("first_name").notNull(),
  last_name: varchar("last_name").notNull(),
  date_of_birth: date("date_of_birth").notNull(),
  identification_num: varchar("identification_num").notNull(),
  email_primary: varchar("email_primary").notNull(),
  address_primary: varchar("address_primary").notNull(),
  address_secondary: varchar("address_secondary"),
  phone_number: varchar("phone_number").notNull(),
  is_employee: boolean("is_employee").default(false).notNull(),
});

export const staff = pgTable("Staff", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  individual_id: bigint("individual_id", { mode: "number" }).references(() => individuals.id).notNull(),
  background_id: varchar("background_id").notNull(),
});

export const appointmentHistory = pgTable("Appointment History", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  individual_id: bigint("individual_id", { mode: "number" }).references(() => individuals.id).notNull(),
  creation_date: timestamp("creation_date", { withTimezone: true }).defaultNow().notNull(),
  appointed_date: timestamp("appointed_date", { withTimezone: false }).notNull(),
  was_attended: boolean("was_attended").default(false).notNull(),
  attendant_id: bigint("attendant_id", { mode: "number" }).notNull(),
  assistant_1_id: bigint("assistant_1_id", { mode: "number" }),
  assistant_2_id: bigint("assistant_2_id", { mode: "number" }),
});

export const dentistNotes = pgTable("Dentist Notes", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  individual_id: bigint("individual_id", { mode: "number" }).references(() => individuals.id).notNull(),
  created_date: timestamp("created_date", { withTimezone: true }).defaultNow().notNull(),
  title: varchar("title").notNull(),
  text: text("text").notNull(),
  appointment_id: bigint("appointment_id", { mode: "number" }),
});

export const summaries = pgTable("Summaries", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  individual_id: bigint("individual_id", { mode: "number" }).references(() => individuals.id).notNull(),
  hash: varchar("hash").notNull(),
  summary: text("summary").notNull(),
  version: bigint("version", { mode: "number" }).notNull(),
  created_date: timestamp("created_date", { withTimezone: true }).defaultNow().notNull(),
});

// Legacy schema for compatibility (keeping existing structure for other parts of the app)
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

// Supabase schema types
export const insertIndividualSchema = createInsertSchema(individuals).omit({
  id: true,
  created_date: true,
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
});

export const insertAppointmentHistorySchema = createInsertSchema(appointmentHistory).omit({
  id: true,
  creation_date: true,
});

export const insertDentistNotesSchema = createInsertSchema(dentistNotes).omit({
  id: true,
  created_date: true,
});

export const insertSummariesSchema = createInsertSchema(summaries).omit({
  id: true,
  created_date: true,
});

// Legacy schema types for compatibility
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

// Supabase types
export type Individual = typeof individuals.$inferSelect;
export type InsertIndividual = z.infer<typeof insertIndividualSchema>;
export type Staff = typeof staff.$inferSelect;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type AppointmentHistory = typeof appointmentHistory.$inferSelect;
export type InsertAppointmentHistory = z.infer<typeof insertAppointmentHistorySchema>;
export type DentistNotes = typeof dentistNotes.$inferSelect;
export type InsertDentistNotes = z.infer<typeof insertDentistNotesSchema>;
export type Summaries = typeof summaries.$inferSelect;
export type InsertSummaries = z.infer<typeof insertSummariesSchema>;

// Legacy types for compatibility
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type DentalXray = typeof dentalXrays.$inferSelect;
export type InsertDentalXray = z.infer<typeof insertDentalXraySchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type DentalHistory = typeof dentalHistory.$inferSelect;
export type InsertDentalHistory = z.infer<typeof insertDentalHistorySchema>;

// Alias for medical history to match client expectations
export type MedicalHistory = DentalHistory;
