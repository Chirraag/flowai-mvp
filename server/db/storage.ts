import {
  users,
  patients,
  referringPhysicians,
  medicalOrders,
  healthcareProviders,
  appointments,
  insuranceDetails,
  insuranceVerifications,
  communicationsLog,
  clinicalDataRequests,
  priorAuthorizations,
  patientIntakeForms,
  checkIns,
  aiAgents,
  agentInteractions,
  workflowOrchestrations,
  businessWorkflows,

  emrConnections,
  emrApiEndpoints,
  emrSyncStats,
  type User,
  type UpsertUser,
  type Patient,
  type InsertPatient,
  type Appointment,
  type InsertAppointment,
  type AiAgent,
  type InsertAiAgent,
  type AgentInteraction,
  type InsertAgentInteraction,
  type InsuranceVerification,
  type InsertInsuranceVerification,
  type WorkflowOrchestration,
  type InsertWorkflowOrchestration,
  type BusinessWorkflow,
  type InsertBusinessWorkflow,

  type PatientCommunication,
  type InsertPatientCommunication,
  type EmrConnection,
  type InsertEmrConnection,
  type EmrApiEndpoint,
  type InsertEmrApiEndpoint,
  type EmrSyncStats,
  type InsertEmrSyncStats,
} from "@/db/schema";
import { db } from "./index";
import { eq, desc, sql } from "drizzle-orm";

// Storage interface for core healthcare workflow operations
export interface IStorage {
  // User methods for authentication
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Patient management
  getPatient(id: number): Promise<Patient | undefined>;
  getAllPatients(): Promise<Patient[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  
  // Appointment management
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAllAppointments(): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  
  // AI Agent management
  getAiAgent(id: number): Promise<AiAgent | undefined>;
  getAllAiAgents(): Promise<AiAgent[]>;
  createAiAgent(agent: InsertAiAgent): Promise<AiAgent>;
  
  // Agent Interaction tracking
  createAgentInteraction(interaction: InsertAgentInteraction): Promise<AgentInteraction>;
  getAgentInteractionsByPatient(patientId: number): Promise<AgentInteraction[]>;
  
  // Insurance verification
  createInsuranceVerification(verification: InsertInsuranceVerification): Promise<InsuranceVerification>;
  getInsuranceVerificationByPatient(patientId: number): Promise<InsuranceVerification | undefined>;
  
  // Workflow orchestration
  createWorkflowOrchestration(workflow: InsertWorkflowOrchestration): Promise<WorkflowOrchestration>;
  getWorkflowOrchestrationsByPatient(patientId: number): Promise<WorkflowOrchestration[]>;
  
  // Business Workflow management
  getBusinessWorkflow(id: number): Promise<BusinessWorkflow | undefined>;
  getAllBusinessWorkflows(): Promise<BusinessWorkflow[]>;
  createBusinessWorkflow(workflow: InsertBusinessWorkflow): Promise<BusinessWorkflow>;
  updateBusinessWorkflow(id: number, updates: Partial<BusinessWorkflow>): Promise<BusinessWorkflow>;
  deleteBusinessWorkflow(id: number): Promise<void>;
  

  
  // Patient communication
  createPatientCommunication(communication: InsertPatientCommunication): Promise<PatientCommunication>;
  getPatientCommunications(patientId: number): Promise<PatientCommunication[]>;
  
  // EMR Connections
  getEmrConnections(): Promise<EmrConnection[]>;
  getActiveEmrConnection(): Promise<EmrConnection | undefined>;
  createEmrConnection(connection: InsertEmrConnection): Promise<EmrConnection>;
  updateEmrConnection(connectionId: number, updates: Partial<EmrConnection>): Promise<EmrConnection>;
  deleteEmrConnection(connectionId: number): Promise<void>;
  
  // EMR API Endpoints
  getEmrApiEndpoints(connectionId: number): Promise<EmrApiEndpoint[]>;
  createEmrApiEndpoint(endpoint: InsertEmrApiEndpoint): Promise<EmrApiEndpoint>;
  updateEmrApiEndpoint(apiId: number, updates: Partial<EmrApiEndpoint>): Promise<EmrApiEndpoint>;
  
  // EMR Sync Statistics
  getLatestSyncStats(connectionId: number): Promise<EmrSyncStats | undefined>;
  createSyncStats(stats: InsertEmrSyncStats): Promise<EmrSyncStats>;
}

export class DatabaseStorage implements IStorage {
  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Patient operations
  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.patientId, id));
    return patient || undefined;
  }

  async getAllPatients(): Promise<Patient[]> {
    return db.select().from(patients).orderBy(desc(patients.createdAt));
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const [newPatient] = await db.insert(patients).values(patient).returning();
    return newPatient;
  }

  // Appointment operations
  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.appointmentId, id));
    return appointment || undefined;
  }

  async getAllAppointments(): Promise<Appointment[]> {
    return db.select().from(appointments).orderBy(desc(appointments.createdAt));
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db.insert(appointments).values(appointment).returning();
    return newAppointment;
  }

  // AI Agent operations
  async getAiAgent(id: number): Promise<AiAgent | undefined> {
    const [agent] = await db.select().from(aiAgents).where(eq(aiAgents.id, id));
    return agent || undefined;
  }

  async getAllAiAgents(): Promise<AiAgent[]> {
    return db.select().from(aiAgents).orderBy(aiAgents.name);
  }

  async createAiAgent(agent: InsertAiAgent): Promise<AiAgent> {
    const [newAgent] = await db.insert(aiAgents).values(agent).returning();
    return newAgent;
  }

  // Agent Interaction operations
  async createAgentInteraction(interaction: InsertAgentInteraction): Promise<AgentInteraction> {
    const [newInteraction] = await db.insert(agentInteractions).values(interaction).returning();
    return newInteraction;
  }

  async getAgentInteractionsByPatient(patientId: number): Promise<AgentInteraction[]> {
    return db.select().from(agentInteractions)
      .where(eq(agentInteractions.patientId, patientId))
      .orderBy(desc(agentInteractions.startedAt));
  }

  // Insurance verification operations
  async createInsuranceVerification(verification: InsertInsuranceVerification): Promise<InsuranceVerification> {
    const [newVerification] = await db.insert(insuranceVerifications).values(verification).returning();
    return newVerification;
  }

  async getInsuranceVerificationByPatient(patientId: number): Promise<InsuranceVerification | undefined> {
    const [verification] = await db.select()
      .from(insuranceVerifications)
      .innerJoin(appointments, eq(insuranceVerifications.appointmentId, appointments.appointmentId))
      .where(eq(appointments.patientId, patientId))
      .orderBy(desc(insuranceVerifications.verificationDate))
      .limit(1);
    return verification?.insurance_verifications || undefined;
  }

  // Workflow orchestration operations
  async createWorkflowOrchestration(workflow: InsertWorkflowOrchestration): Promise<WorkflowOrchestration> {
    const [newWorkflow] = await db.insert(workflowOrchestrations).values(workflow).returning();
    return newWorkflow;
  }

  async getWorkflowOrchestrationsByPatient(patientId: number): Promise<WorkflowOrchestration[]> {
    return db.select().from(workflowOrchestrations)
      .where(eq(workflowOrchestrations.patientId, patientId))
      .orderBy(desc(workflowOrchestrations.startedAt));
  }

  // Business Workflow operations
  async getBusinessWorkflow(id: number): Promise<BusinessWorkflow | undefined> {
    const [workflow] = await db.select().from(businessWorkflows).where(eq(businessWorkflows.id, id));
    return workflow || undefined;
  }

  async getAllBusinessWorkflows(): Promise<BusinessWorkflow[]> {
    return db.select().from(businessWorkflows).orderBy(desc(businessWorkflows.updatedAt));
  }

  async createBusinessWorkflow(workflow: InsertBusinessWorkflow): Promise<BusinessWorkflow> {
    const [newWorkflow] = await db.insert(businessWorkflows).values(workflow).returning();
    return newWorkflow;
  }

  async updateBusinessWorkflow(id: number, updates: Partial<BusinessWorkflow>): Promise<BusinessWorkflow> {
    const [updatedWorkflow] = await db
      .update(businessWorkflows)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(businessWorkflows.id, id))
      .returning();
    return updatedWorkflow;
  }

    async deleteBusinessWorkflow(id: number): Promise<void> {
    await db.delete(businessWorkflows).where(eq(businessWorkflows.id, id));
  }


  
  // Patient communication operations
  async createPatientCommunication(communication: InsertPatientCommunication): Promise<PatientCommunication> {
    const [newCommunication] = await db.insert(communicationsLog).values(communication).returning();
    return newCommunication;
  }

  async getPatientCommunications(patientId: number): Promise<PatientCommunication[]> {
    return db.select().from(communicationsLog)
      .where(eq(communicationsLog.patientId, patientId))
      .orderBy(desc(communicationsLog.timestamp));
  }

  // EMR Connection operations
  async getEmrConnections(): Promise<EmrConnection[]> {
    return db.select().from(emrConnections).orderBy(desc(emrConnections.createdAt));
  }

  async getActiveEmrConnection(): Promise<EmrConnection | undefined> {
    const [connection] = await db.select()
      .from(emrConnections)
      .where(eq(emrConnections.isActive, true))
      .limit(1);
    return connection || undefined;
  }

  async createEmrConnection(connection: InsertEmrConnection): Promise<EmrConnection> {
    const [newConnection] = await db.insert(emrConnections).values(connection).returning();
    return newConnection;
  }

  async updateEmrConnection(connectionId: number, updates: Partial<EmrConnection>): Promise<EmrConnection> {
    const [updatedConnection] = await db
      .update(emrConnections)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(emrConnections.connectionId, connectionId))
      .returning();
    return updatedConnection;
  }

  async deleteEmrConnection(connectionId: number): Promise<void> {
    await db.delete(emrConnections).where(eq(emrConnections.connectionId, connectionId));
  }

  // EMR API Endpoint operations
  async getEmrApiEndpoints(connectionId: number): Promise<EmrApiEndpoint[]> {
    return db.select()
      .from(emrApiEndpoints)
      .where(eq(emrApiEndpoints.connectionId, connectionId))
      .orderBy(emrApiEndpoints.apiName);
  }

  async createEmrApiEndpoint(endpoint: InsertEmrApiEndpoint): Promise<EmrApiEndpoint> {
    const [newEndpoint] = await db.insert(emrApiEndpoints).values(endpoint).returning();
    return newEndpoint;
  }

  async updateEmrApiEndpoint(apiId: number, updates: Partial<EmrApiEndpoint>): Promise<EmrApiEndpoint> {
    const [updatedEndpoint] = await db
      .update(emrApiEndpoints)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(emrApiEndpoints.apiId, apiId))
      .returning();
    return updatedEndpoint;
  }

  // EMR Sync Statistics operations
  async getLatestSyncStats(connectionId: number): Promise<EmrSyncStats | undefined> {
    const [stats] = await db.select()
      .from(emrSyncStats)
      .where(eq(emrSyncStats.connectionId, connectionId))
      .orderBy(desc(emrSyncStats.syncStartedAt))
      .limit(1);
    return stats || undefined;
  }

  async createSyncStats(stats: InsertEmrSyncStats): Promise<EmrSyncStats> {
    const [newStats] = await db.insert(emrSyncStats).values(stats).returning();
    return newStats;
  }
}

export const storage = new DatabaseStorage();