import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, decimal, uuid, date, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// 1. Patients - Core demographic information
export const patients = pgTable("patients", {
  patientId: serial("patient_id").primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  dob: date("dob").notNull(),
  gender: varchar("gender", { length: 20 }),
  contactNumber: varchar("contact_number", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 2. Referring Physicians - Doctors who refer patients
export const referringPhysicians = pgTable("referring_physicians", {
  physicianId: serial("physician_id").primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  specialty: varchar("specialty", { length: 100 }),
  clinicName: varchar("clinic_name", { length: 255 }),
  contactNumber: varchar("contact_number", { length: 20 }),
  email: varchar("email", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// 3. Medical Orders - Initial patient referral/order (Step 1)
export const medicalOrders = pgTable("medical_orders", {
  orderId: serial("order_id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.patientId),
  referringPhysicianId: integer("referring_physician_id").notNull().references(() => referringPhysicians.physicianId),
  procedureType: varchar("procedure_type", { length: 255 }).notNull(),
  orderDate: timestamp("order_date").notNull().defaultNow(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  sourceSystem: varchar("source_system", { length: 100 }),
  urgency: varchar("urgency", { length: 20 }).default("routine"),
  clinicalNotes: text("clinical_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 4. Healthcare Providers - Internal providers who conduct appointments
export const healthcareProviders = pgTable("healthcare_providers", {
  providerId: serial("provider_id").primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  specialty: varchar("specialty", { length: 100 }).notNull(),
  language: varchar("language", { length: 50 }).default("English"),
  availabilityStatus: varchar("availability_status", { length: 20 }).default("available"),
  workingHours: jsonb("working_hours"),
  credentials: text("credentials"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 5. Appointments - Central table linking many entities (Step 2)
export const appointments = pgTable("appointments", {
  appointmentId: serial("appointment_id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.patientId),
  providerId: integer("provider_id").notNull().references(() => healthcareProviders.providerId),
  orderId: integer("order_id").references(() => medicalOrders.orderId),
  appointmentDatetime: timestamp("appointment_datetime").notNull(),
  location: varchar("location", { length: 255 }),
  appointmentType: varchar("appointment_type", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("scheduled"),
  duration: integer("duration").default(30), // minutes
  reasonForVisit: text("reason_for_visit"),
  notes: text("notes"),
  confirmationSent: boolean("confirmation_sent").default(false),
  reminderSent: boolean("reminder_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 6. Insurance Details - Specific insurance policy information
export const insuranceDetails = pgTable("insurance_details", {
  insuranceId: serial("insurance_id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.patientId),
  payerName: varchar("payer_name", { length: 255 }).notNull(),
  policyNumber: varchar("policy_number", { length: 100 }).notNull(),
  groupNumber: varchar("group_number", { length: 100 }),
  isPrimary: boolean("is_primary").default(true),
  effectiveDate: date("effective_date"),
  expirationDate: date("expiration_date"),
  memberName: varchar("member_name", { length: 255 }),
  relationshipToSubscriber: varchar("relationship_to_subscriber", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// 7. Insurance Verifications - Outcome of eligibility checks (Step 3)
export const insuranceVerifications = pgTable("insurance_verifications", {
  verificationId: serial("verification_id").primaryKey(),
  appointmentId: integer("appointment_id").notNull().references(() => appointments.appointmentId),
  insuranceId: integer("insurance_id").notNull().references(() => insuranceDetails.insuranceId),
  verificationDate: timestamp("verification_date").notNull().defaultNow(),
  eligibilityStatus: varchar("eligibility_status", { length: 50 }).notNull(),
  coverageDetails: jsonb("coverage_details"),
  patientPayableAmount: decimal("patient_payable_amount", { precision: 10, scale: 2 }),
  flaggedIssue: text("flagged_issue"),
  deductibleMet: boolean("deductible_met"),
  coinsurancePercentage: decimal("coinsurance_percentage", { precision: 5, scale: 2 }),
  copayAmount: decimal("copay_amount", { precision: 8, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// 8. Communications Log - Track automated reminders and confirmations (Step 4)
export const communicationsLog = pgTable("communications_log", {
  communicationId: serial("communication_id").primaryKey(),
  appointmentId: integer("appointment_id").references(() => appointments.appointmentId),
  patientId: integer("patient_id").notNull().references(() => patients.patientId),
  type: varchar("type", { length: 50 }).notNull(), // sms, email, voice_call
  messageContent: text("message_content").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  language: varchar("language", { length: 10 }).default("en"),
  deliveredAt: timestamp("delivered_at"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
});

// 9. Clinical Data Requests - Track requests for clinical info (Step 5-A)
export const clinicalDataRequests = pgTable("clinical_data_requests", {
  requestId: serial("request_id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => medicalOrders.orderId),
  referringPhysicianId: integer("referring_physician_id").notNull().references(() => referringPhysicians.physicianId),
  requestDate: timestamp("request_date").notNull().defaultNow(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  clinicalDataReceived: jsonb("clinical_data_received"),
  requestType: varchar("request_type", { length: 100 }),
  urgency: varchar("urgency", { length: 20 }).default("routine"),
  followUpDate: timestamp("follow_up_date"),
  completedAt: timestamp("completed_at"),
});

// 10. Prior Authorizations - PA requests and statuses (Step 5-B & C)
export const priorAuthorizations = pgTable("prior_authorizations", {
  paId: serial("pa_id").primaryKey(),
  appointmentId: integer("appointment_id").notNull().references(() => appointments.appointmentId),
  insuranceId: integer("insurance_id").notNull().references(() => insuranceDetails.insuranceId),
  requestDate: timestamp("request_date").notNull().defaultNow(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  approvalCode: varchar("approval_code", { length: 100 }),
  expirationDate: date("expiration_date"),
  serviceRequested: text("service_requested"),
  diagnosisCodes: jsonb("diagnosis_codes"),
  procedureCodes: jsonb("procedure_codes"),
  clinicalJustification: text("clinical_justification"),
  denialReason: text("denial_reason"),
  submittedAt: timestamp("submitted_at"),
  responseReceivedAt: timestamp("response_received_at"),
});

// 11. Patient Intake Forms - Pre-clinic intake data (Step 6)
export const patientIntakeForms = pgTable("patient_intake_forms", {
  intakeId: serial("intake_id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.patientId),
  appointmentId: integer("appointment_id").references(() => appointments.appointmentId),
  intakeDate: timestamp("intake_date").notNull().defaultNow(),
  identityVerifiedMethod: varchar("identity_verified_method", { length: 50 }),
  chiefSymptoms: text("chief_symptoms"),
  adaptiveQuestionnaireData: jsonb("adaptive_questionnaire_data"),
  consentFormsCompleted: boolean("consent_forms_completed").default(false),
  prepInstructionsSent: boolean("prep_instructions_sent").default(false),
  medicalHistory: jsonb("medical_history"),
  currentMedications: jsonb("current_medications"),
  allergies: jsonb("allergies"),
  emergencyContact: jsonb("emergency_contact"),
  completionStatus: varchar("completion_status", { length: 50 }).default("incomplete"),
});

// 12. Check-Ins - Patient's physical check-in at clinic (Step 8)
export const checkIns = pgTable("check_ins", {
  checkinId: serial("checkin_id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.patientId),
  appointmentId: integer("appointment_id").notNull().references(() => appointments.appointmentId),
  checkinDatetime: timestamp("checkin_datetime").notNull().defaultNow(),
  checkinMethod: varchar("checkin_method", { length: 50 }).notNull(), // mobile_app, kiosk, front_desk
  status: varchar("status", { length: 50 }).notNull().default("checked_in"),
  waitTime: integer("wait_time"), // minutes
  queuePosition: integer("queue_position"),
  documentsVerified: boolean("documents_verified").default(false),
  insuranceCardScanned: boolean("insurance_card_scanned").default(false),
  vitalsCompleted: boolean("vitals_completed").default(false),
});

// EMR Connections - Store external system integration details
export const emrConnections = pgTable("emr_connections", {
  connectionId: serial("connection_id").primaryKey(),
  systemName: varchar("system_name", { length: 100 }).notNull(), // 'athenahealth', 'epic', 'cerner'
  systemType: varchar("system_type", { length: 50 }).notNull(), // 'EMR', 'RIS', 'LIS'
  status: varchar("status", { length: 20 }).notNull(), // 'connected', 'connecting', 'error', 'disconnected'
  healthScore: integer("health_score").default(0), // 0-100 health percentage
  encryptedCredentials: jsonb("encrypted_credentials").notNull(), // Encrypted connection details
  endpoint: varchar("endpoint", { length: 500 }).notNull(),
  authMethod: varchar("auth_method", { length: 100 }).notNull(), // 'OAuth 2.0', 'API Key', 'HL7'
  lastSyncAt: timestamp("last_sync_at"),
  lastHealthCheckAt: timestamp("last_health_check_at"),
  connectionMetadata: jsonb("connection_metadata"), // Environment, practice ID, etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// EMR API Endpoints - Track individual API performance
export const emrApiEndpoints = pgTable("emr_api_endpoints", {
  apiId: serial("api_id").primaryKey(),
  connectionId: integer("connection_id").references(() => emrConnections.connectionId),
  apiName: varchar("api_name", { length: 200 }).notNull(),
  apiFunction: text("api_function").notNull(),
  status: varchar("status", { length: 20 }).notNull(), // 'active', 'degraded', 'error', 'inactive'
  averageLatency: integer("average_latency").default(0), // milliseconds
  errorRate: decimal("error_rate", { precision: 5, scale: 2 }).default('0.00'), // percentage
  callsLast24h: integer("calls_last_24h").default(0),
  lastCallAt: timestamp("last_call_at"),
  lastErrorAt: timestamp("last_error_at"),
  isEnabled: boolean("is_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// EMR Sync Statistics - Track data sync metrics
export const emrSyncStats = pgTable("emr_sync_stats", {
  syncId: serial("sync_id").primaryKey(),
  connectionId: integer("connection_id").references(() => emrConnections.connectionId),
  totalPatients: integer("total_patients").default(0),
  totalAppointments: integer("total_appointments").default(0),
  totalOrders: integer("total_orders").default(0),
  totalResults: integer("total_results").default(0),
  syncStartedAt: timestamp("sync_started_at").notNull(),
  syncCompletedAt: timestamp("sync_completed_at"),
  syncStatus: varchar("sync_status", { length: 20 }).notNull(), // 'in_progress', 'completed', 'failed'
  recordsProcessed: integer("records_processed").default(0),
  recordsSuccessful: integer("records_successful").default(0),
  recordsFailed: integer("records_failed").default(0),
  errorLog: text("error_log"),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Agents - 8 specialized agents as per PRD
export const aiAgents = pgTable("ai_agents", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(), // order_ingestion, scheduling, insurance_verification, patient_communication, prior_authorization, digital_intake, ehr_integration, checkin
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  configuration: jsonb("configuration"),
  capabilities: jsonb("capabilities"),
  skills: jsonb("skills"),
  metrics: jsonb("metrics"),
  version: varchar("version", { length: 50 }).default("1.0"),
  languages: jsonb("languages").default('["en", "es", "zh"]'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Agent Interactions - Track all agent interactions
export const agentInteractions = pgTable("agent_interactions", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull().references(() => aiAgents.id),
  patientId: integer("patient_id").references(() => patients.patientId),
  appointmentId: integer("appointment_id").references(() => appointments.appointmentId),
  orderId: integer("order_id").references(() => medicalOrders.orderId),
  interactionType: varchar("interaction_type", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  input: jsonb("input"),
  output: jsonb("output"),
  metadata: jsonb("metadata"),
  language: varchar("language", { length: 10 }).default("en"),
  duration: integer("duration"), // seconds
  confidence: decimal("confidence", { precision: 5, scale: 4 }),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Workflow Orchestrations - Multi-agent workflow tracking
export const workflowOrchestrations = pgTable("workflow_orchestrations", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.patientId),
  appointmentId: integer("appointment_id").references(() => appointments.appointmentId),
  orderId: integer("order_id").references(() => medicalOrders.orderId),
  workflowType: varchar("workflow_type", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("initiated"),
  currentStep: varchar("current_step", { length: 100 }),
  steps: jsonb("steps"),
  agentsInvolved: jsonb("agents_involved"),
  results: jsonb("results"),
  errorDetails: jsonb("error_details"),
  priority: varchar("priority", { length: 20 }).default("normal"),
  estimatedCompletion: timestamp("estimated_completion"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Define relationships for better ORM functionality
export const patientsRelations = relations(patients, ({ many }) => ({
  medicalOrders: many(medicalOrders),
  appointments: many(appointments),
  insuranceDetails: many(insuranceDetails),
  communicationsLog: many(communicationsLog),
  patientIntakeForms: many(patientIntakeForms),
  checkIns: many(checkIns),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.patientId],
  }),
  provider: one(healthcareProviders, {
    fields: [appointments.providerId],
    references: [healthcareProviders.providerId],
  }),
  order: one(medicalOrders, {
    fields: [appointments.orderId],
    references: [medicalOrders.orderId],
  }),
  insuranceVerifications: many(insuranceVerifications),
  priorAuthorizations: many(priorAuthorizations),
}));

export const aiAgentsRelations = relations(aiAgents, ({ many }) => ({
  interactions: many(agentInteractions),
}));

// Analytics and Cost Savings Tables
export const costSavingsMetrics = pgTable("cost_savings_metrics", {
  metricId: serial("metric_id").primaryKey(),
  metricType: varchar("metric_type", { length: 100 }).notNull(), // 'labor_cost', 'processing_time', 'error_reduction', 'automation_efficiency'
  category: varchar("category", { length: 100 }).notNull(), // 'scheduling', 'intake', 'verification', 'communication'
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  beforeAutomation: decimal("before_automation", { precision: 12, scale: 2 }).notNull(),
  afterAutomation: decimal("after_automation", { precision: 12, scale: 2 }).notNull(),
  costSavings: decimal("cost_savings", { precision: 12, scale: 2 }).notNull(),
  savingsPercentage: decimal("savings_percentage", { precision: 5, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(), // 'USD', 'minutes', 'hours', 'percentage'
  createdAt: timestamp("created_at").defaultNow()
});

export const performanceMetrics = pgTable("performance_metrics", {
  metricId: serial("metric_id").primaryKey(),
  agentId: integer("agent_id").references(() => aiAgents.id),
  metricName: varchar("metric_name", { length: 100 }).notNull(),
  metricValue: decimal("metric_value", { precision: 12, scale: 4 }).notNull(),
  targetValue: decimal("target_value", { precision: 12, scale: 4 }),
  timestamp: timestamp("timestamp").defaultNow(),
  period: varchar("period", { length: 50 }).notNull(), // 'hourly', 'daily', 'weekly', 'monthly'
  metadata: jsonb("metadata")
});

export const automationStats = pgTable("automation_stats", {
  statId: serial("stat_id").primaryKey(),
  date: date("date").notNull(),
  totalTasksProcessed: integer("total_tasks_processed").notNull(),
  automatedTasks: integer("automated_tasks").notNull(),
  manualTasks: integer("manual_tasks").notNull(),
  automationRate: decimal("automation_rate", { precision: 5, scale: 2 }).notNull(),
  avgProcessingTime: decimal("avg_processing_time", { precision: 8, scale: 2 }).notNull(), // in minutes
  errorRate: decimal("error_rate", { precision: 5, scale: 4 }).notNull(),
  patientSatisfactionScore: decimal("patient_satisfaction_score", { precision: 3, scale: 2 }),
  costPerTask: decimal("cost_per_task", { precision: 8, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const workflowEfficiency = pgTable("workflow_efficiency", {
  efficiencyId: serial("efficiency_id").primaryKey(),
  workflowType: varchar("workflow_type", { length: 100 }).notNull(),
  date: date("date").notNull(),
  totalExecutions: integer("total_executions").notNull(),
  successfulExecutions: integer("successful_executions").notNull(),
  failedExecutions: integer("failed_executions").notNull(),
  avgDurationMinutes: decimal("avg_duration_minutes", { precision: 8, scale: 2 }).notNull(),
  bottleneckStep: varchar("bottleneck_step", { length: 100 }),
  improvementSuggestions: text("improvement_suggestions"),
  createdAt: timestamp("created_at").defaultNow()
});

export const financialImpact = pgTable("financial_impact", {
  impactId: serial("impact_id").primaryKey(),
  category: varchar("category", { length: 100 }).notNull(), // 'revenue_increase', 'cost_reduction', 'efficiency_gain'
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  impactDate: date("impact_date").notNull(),
  quarterYear: varchar("quarter_year", { length: 10 }).notNull(), // 'Q1-2024'
  isRecurring: boolean("is_recurring").default(false),
  recurringPeriod: varchar("recurring_period", { length: 50 }), // 'monthly', 'quarterly', 'annually'
  sourceWorkflow: varchar("source_workflow", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow()
});

// Business Workflows - Workflow definitions for business processes
export const businessWorkflows = pgTable("business_workflows", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  configuration: jsonb("configuration").notNull(), // { nodes: [], edges: [] }
  status: varchar("status", { length: 50 }).notNull().default("draft"), // draft, active, inactive
  version: varchar("version", { length: 50 }).default("1.0"),
  edgeType: varchar("edge_type", { length: 50 }).default("default"), // default, straight, smoothstep
  isTemplate: boolean("is_template").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});



// Audit/Compliance Document Uploads
export const auditDocuments = pgTable("audit_documents", {
  id: serial("id").primaryKey(),
  framework: varchar("framework", { length: 32 }).notNull(),
  docType: varchar("doc_type", { length: 32 }).notNull(),
  description: text("description"),
  s3Key: varchar("s3_key", { length: 255 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: varchar("file_type", { length: 255 }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("uploaded"),
  uploadedBy: varchar("uploaded_by", { length: 255 }),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// Insert schemas
export const insertPatientSchema = createInsertSchema(patients).omit({
  patientId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMedicalOrderSchema = createInsertSchema(medicalOrders).omit({
  orderId: true,
  createdAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  appointmentId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiAgentSchema = createInsertSchema(aiAgents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentInteractionSchema = createInsertSchema(agentInteractions).omit({
  id: true,
  startedAt: true,
});

export const insertWorkflowOrchestrationSchema = createInsertSchema(workflowOrchestrations).omit({
  id: true,
  startedAt: true,
});

export const insertInsuranceVerificationSchema = createInsertSchema(insuranceVerifications).omit({
  verificationId: true,
  createdAt: true,
});

export const insertPatientCommunicationSchema = createInsertSchema(communicationsLog).omit({
  communicationId: true,
});

export const insertPatientIntakeFormSchema = createInsertSchema(patientIntakeForms).omit({
  intakeId: true,
});

export const insertEmrConnectionSchema = createInsertSchema(emrConnections).omit({
  connectionId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmrApiEndpointSchema = createInsertSchema(emrApiEndpoints).omit({
  apiId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmrSyncStatsSchema = createInsertSchema(emrSyncStats).omit({
  syncId: true,
  createdAt: true,
});

export const insertBusinessWorkflowSchema = createInsertSchema(businessWorkflows).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});



// Export types
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type MedicalOrder = typeof medicalOrders.$inferSelect;
export type InsertMedicalOrder = z.infer<typeof insertMedicalOrderSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type AiAgent = typeof aiAgents.$inferSelect;
export type InsertAiAgent = z.infer<typeof insertAiAgentSchema>;

export type AgentInteraction = typeof agentInteractions.$inferSelect;
export type InsertAgentInteraction = z.infer<typeof insertAgentInteractionSchema>;

export type WorkflowOrchestration = typeof workflowOrchestrations.$inferSelect;
export type InsertWorkflowOrchestration = z.infer<typeof insertWorkflowOrchestrationSchema>;

export type InsuranceVerification = typeof insuranceVerifications.$inferSelect;
export type InsertInsuranceVerification = z.infer<typeof insertInsuranceVerificationSchema>;

export type PatientCommunication = typeof communicationsLog.$inferSelect;
export type InsertPatientCommunication = z.infer<typeof insertPatientCommunicationSchema>;

export type PatientIntakeForm = typeof patientIntakeForms.$inferSelect;
export type InsertPatientIntakeForm = z.infer<typeof insertPatientIntakeFormSchema>;

export type EmrConnection = typeof emrConnections.$inferSelect;
export type InsertEmrConnection = z.infer<typeof insertEmrConnectionSchema>;

export type EmrApiEndpoint = typeof emrApiEndpoints.$inferSelect;
export type InsertEmrApiEndpoint = z.infer<typeof insertEmrApiEndpointSchema>;

export type EmrSyncStats = typeof emrSyncStats.$inferSelect;
export type InsertEmrSyncStats = z.infer<typeof insertEmrSyncStatsSchema>;

export type ReferringPhysician = typeof referringPhysicians.$inferSelect;
export type HealthcareProvider = typeof healthcareProviders.$inferSelect;
export type InsuranceDetail = typeof insuranceDetails.$inferSelect;
export type ClinicalDataRequest = typeof clinicalDataRequests.$inferSelect;
export type PriorAuthorization = typeof priorAuthorizations.$inferSelect;
export type CheckIn = typeof checkIns.$inferSelect;

// Analytics Type Definitions
export type CostSavingsMetric = typeof costSavingsMetrics.$inferSelect;
export type InsertCostSavingsMetric = typeof costSavingsMetrics.$inferInsert;

export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type InsertPerformanceMetric = typeof performanceMetrics.$inferInsert;

export type AutomationStat = typeof automationStats.$inferSelect;
export type InsertAutomationStat = typeof automationStats.$inferInsert;

export type WorkflowEfficiency = typeof workflowEfficiency.$inferSelect;
export type InsertWorkflowEfficiency = typeof workflowEfficiency.$inferInsert;

export type FinancialImpact = typeof financialImpact.$inferSelect;
export type InsertFinancialImpact = typeof financialImpact.$inferInsert;

export type BusinessWorkflow = typeof businessWorkflows.$inferSelect;
export type InsertBusinessWorkflow = z.infer<typeof insertBusinessWorkflowSchema>;

