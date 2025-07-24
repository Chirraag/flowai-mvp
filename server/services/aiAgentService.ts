import { storage } from "../db/storage";
import { InsertAiAgent, InsertAgentInteraction, InsertWorkflowOrchestration } from "@/db/schema";
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface AgentCapability {
  name: string;
  description: string;
  enabled: boolean;
}

export interface AgentConfiguration {
  language: string;
  voice: string;
  maxRetries: number;
  timeout: number;
  capabilities: AgentCapability[];
}

// Core AI Scheduling Agent as per PRD 6.1
export class AISchedulingAgent {
  private agentId: number;
  private configuration: AgentConfiguration;

  constructor(agentId: number, configuration: AgentConfiguration) {
    this.agentId = agentId;
    this.configuration = configuration;
  }

  // 6.1.2: Collect Patient Details
  async collectPatientDetails(input: any): Promise<any> {
    const interaction = await storage.createAgentInteraction({
      agentId: this.agentId,
      patientId: input.patientId,
      interactionType: "scheduling",
      status: "in_progress",
      input,
      metadata: { step: "collect_details", language: this.configuration.language }
    });

    try {
      const prompt = `Extract and validate patient demographic information from the following input: ${JSON.stringify(input)}
      
      Required fields:
      - Patient name (first, last)
      - Contact information (phone, email)
      - Reason for appointment
      - Preferred date/time
      - Location preference
      
      Return structured JSON with extracted information and any missing fields.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      await storage.updateAgentInteraction(interaction.id, {
        status: "completed",
        output: result,
        completedAt: new Date()
      });

      return result;
    } catch (error) {
      await storage.updateAgentInteraction(interaction.id, {
        status: "failed",
        output: { error: error.message },
        completedAt: new Date()
      });
      throw error;
    }
  }

  // 6.1.3: Confirm Best/Earliest Date/Time and Location Preference
  async findOptimalSlots(patientDetails: any, providerId: number): Promise<any> {
    const interaction = await storage.createAgentInteraction({
      agentId: this.agentId,
      patientId: patientDetails.patientId,
      interactionType: "scheduling",
      status: "in_progress",
      input: { patientDetails, providerId },
      metadata: { step: "find_optimal_slots" }
    });

    try {
      // Get provider information
      const provider = await storage.getProvider(providerId);
      if (!provider) {
        throw new Error("Provider not found");
      }

      // Get available slots for the next 30 days
      const availableSlots = [];
      const today = new Date();
      
      for (let i = 1; i <= 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        
        const slots = await storage.checkAvailableSlots(providerId, dateString);
        availableSlots.push({
          date: dateString,
          slots: slots
        });
      }

      // Use AI to match patient preferences with available slots
      const prompt = `Given patient preferences: ${JSON.stringify(patientDetails)}
      And available slots: ${JSON.stringify(availableSlots)}
      
      Find the 3 best appointment options that match patient preferences for:
      - Preferred dates/times
      - Location convenience
      - Provider specialty match
      
      Return JSON with recommended appointments ranked by preference match.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      const recommendations = JSON.parse(response.choices[0].message.content || "{}");
      
      await storage.updateAgentInteraction(interaction.id, {
        status: "completed",
        output: recommendations,
        completedAt: new Date()
      });

      return recommendations;
    } catch (error) {
      await storage.updateAgentInteraction(interaction.id, {
        status: "failed",
        output: { error: error.message },
        completedAt: new Date()
      });
      throw error;
    }
  }

  // 6.1.4: Check Appointment Slots Availability in EMR
  async checkEmrAvailability(appointmentDetails: any): Promise<boolean> {
    // This would integrate with actual EMR system
    // For now, simulating EMR check
    const interaction = await storage.createAgentInteraction({
      agentId: this.agentId,
      interactionType: "scheduling",
      status: "in_progress",
      input: appointmentDetails,
      metadata: { step: "emr_availability_check" }
    });

    try {
      // Simulate EMR API call
      const isAvailable = !await this.isSlotBooked(
        appointmentDetails.providerId, 
        appointmentDetails.date, 
        appointmentDetails.time
      );

      await storage.updateAgentInteraction(interaction.id, {
        status: "completed",
        output: { available: isAvailable },
        completedAt: new Date()
      });

      return isAvailable;
    } catch (error) {
      await storage.updateAgentInteraction(interaction.id, {
        status: "failed",
        output: { error: error.message },
        completedAt: new Date()
      });
      throw error;
    }
  }

  // 6.1.5: Book Appointment
  async bookAppointment(appointmentDetails: any): Promise<any> {
    const interaction = await storage.createAgentInteraction({
      agentId: this.agentId,
      patientId: appointmentDetails.patientId,
      interactionType: "scheduling",
      status: "in_progress",
      input: appointmentDetails,
      metadata: { step: "book_appointment" }
    });

    try {
      const appointment = await storage.createAppointment({
        patientId: appointmentDetails.patientId,
        providerId: appointmentDetails.providerId,
        date: appointmentDetails.date,
        time: appointmentDetails.time,
        duration: appointmentDetails.duration || 30,
        type: appointmentDetails.type,
        reasonForVisit: appointmentDetails.reasonForVisit,
        status: "scheduled",
        checkInCode: this.generateCheckInCode()
      });

      await storage.updateAgentInteraction(interaction.id, {
        status: "completed",
        output: appointment,
        appointmentId: appointment.id,
        completedAt: new Date()
      });

      return appointment;
    } catch (error) {
      await storage.updateAgentInteraction(interaction.id, {
        status: "failed",
        output: { error: error.message },
        completedAt: new Date()
      });
      throw error;
    }
  }

  private async isSlotBooked(providerId: number, date: string, time: string): Promise<boolean> {
    const appointments = await storage.getAppointmentsByProvider(providerId);
    return appointments.some(apt => apt.date === date && apt.time === time);
  }

  private generateCheckInCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}

// Insurance Verification Agent as per PRD 6.1.6
export class InsuranceVerificationAgent {
  private agentId: number;

  constructor(agentId: number) {
    this.agentId = agentId;
  }

  async verifyEligibility(patientId: number, appointmentId?: number): Promise<any> {
    const interaction = await storage.createAgentInteraction({
      agentId: this.agentId,
      patientId,
      appointmentId,
      interactionType: "verification",
      status: "in_progress",
      input: { patientId, appointmentId },
      metadata: { step: "eligibility_verification" }
    });

    try {
      const patient = await storage.getPatient(patientId);
      if (!patient) {
        throw new Error("Patient not found");
      }

      // Simulate real-time eligibility check with payer
      const eligibilityResult = await this.performEligibilityCheck(patient);
      
      // Create insurance verification record
      const verification = await storage.createInsuranceVerification({
        patientId,
        appointmentId,
        verificationStatus: eligibilityResult.status,
        eligibilityStatus: eligibilityResult.eligibilityStatus,
        benefitDetails: eligibilityResult.benefitDetails,
        priorAuthDetails: eligibilityResult.priorAuthDetails,
        verifiedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });

      await storage.updateAgentInteraction(interaction.id, {
        status: "completed",
        output: verification,
        completedAt: new Date()
      });

      return verification;
    } catch (error) {
      await storage.updateAgentInteraction(interaction.id, {
        status: "failed",
        output: { error: error.message },
        completedAt: new Date()
      });
      throw error;
    }
  }

  private async performEligibilityCheck(patient: any): Promise<any> {
    // This would integrate with actual insurance payer APIs
    // Simulating NICE/real-time eligibility response
    return {
      status: "verified",
      eligibilityStatus: "active",
      benefitDetails: {
        copay: 25,
        deductible: {
          individual: 1500,
          family: 3000,
          met: 500,
          remaining: 1000
        },
        coinsurance: 0.2,
        outOfPocketMax: {
          individual: 5000,
          family: 10000,
          met: 1200
        },
        inNetwork: true
      },
      priorAuthDetails: {
        required: false,
        services: []
      }
    };
  }
}

// AI Patient Intake Agent as per PRD 6.2
export class AIPatientIntakeAgent {
  private agentId: number;
  private configuration: AgentConfiguration;

  constructor(agentId: number, configuration: AgentConfiguration) {
    this.agentId = agentId;
    this.configuration = configuration;
  }

  // 6.2.2: Clinical Sign Intake Prep Agent Forms
  async prepareIntakeForms(patientId: number, appointmentType: string): Promise<any> {
    const interaction = await storage.createAgentInteraction({
      agentId: this.agentId,
      patientId,
      interactionType: "intake",
      status: "in_progress",
      input: { patientId, appointmentType },
      metadata: { step: "prepare_forms" }
    });

    try {
      const patient = await storage.getPatient(patientId);
      const existingResponses = await storage.getIntakeResponsesByPatient(patientId);

      // Use AI to generate conditional forms based on appointment type and patient history
      const prompt = `Generate a dynamic intake form for:
      - Patient: ${JSON.stringify(patient)}
      - Appointment type: ${appointmentType}
      - Previous responses: ${JSON.stringify(existingResponses)}
      
      Create conditional form fields that adapt based on patient responses.
      Include pre-population from existing patient data.
      Return structured JSON form definition.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      const formDefinition = JSON.parse(response.choices[0].message.content || "{}");
      
      await storage.updateAgentInteraction(interaction.id, {
        status: "completed",
        output: formDefinition,
        completedAt: new Date()
      });

      return formDefinition;
    } catch (error) {
      await storage.updateAgentInteraction(interaction.id, {
        status: "failed",
        output: { error: error.message },
        completedAt: new Date()
      });
      throw error;
    }
  }

  // 6.2.3: Symptoms Collection
  async collectSymptoms(patientId: number, input: string): Promise<any> {
    const interaction = await storage.createAgentInteraction({
      agentId: this.agentId,
      patientId,
      interactionType: "intake",
      status: "in_progress",
      input: { symptomInput: input },
      metadata: { step: "collect_symptoms" }
    });

    try {
      const prompt = `Extract structured symptom information from patient input: "${input}"
      
      Extract:
      - Primary symptoms
      - Onset (when started)
      - Duration
      - Severity (1-10 scale)
      - Associated factors
      - Alleviating/aggravating factors
      - Previous treatments tried
      
      Map to appropriate medical codes where possible.
      Return structured JSON.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      const symptomData = JSON.parse(response.choices[0].message.content || "{}");
      
      // Update patient record with symptoms
      await storage.updatePatient(patientId, {
        symptoms: symptomData
      });

      await storage.updateAgentInteraction(interaction.id, {
        status: "completed",
        output: symptomData,
        completedAt: new Date()
      });

      return symptomData;
    } catch (error) {
      await storage.updateAgentInteraction(interaction.id, {
        status: "failed",
        output: { error: error.message },
        completedAt: new Date()
      });
      throw error;
    }
  }

  // 6.2.4: Medical History Collection
  async collectMedicalHistory(patientId: number, input: any): Promise<any> {
    const interaction = await storage.createAgentInteraction({
      agentId: this.agentId,
      patientId,
      interactionType: "intake",
      status: "in_progress",
      input,
      metadata: { step: "collect_medical_history" }
    });

    try {
      const prompt = `Structure the following medical history information: ${JSON.stringify(input)}
      
      Categorize into:
      - Past medical history
      - Surgical history
      - Family history
      - Social history
      - Current medications
      - Allergies
      
      Identify potential drug-allergy interactions.
      Return structured JSON with flagged concerns.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      const medicalHistory = JSON.parse(response.choices[0].message.content || "{}");
      
      // Update patient record
      await storage.updatePatient(patientId, {
        medicalHistory: medicalHistory.pastMedicalHistory,
        surgicalHistory: medicalHistory.surgicalHistory,
        familyHistory: medicalHistory.familyHistory,
        socialHistory: medicalHistory.socialHistory,
        currentMedications: medicalHistory.currentMedications,
        allergies: medicalHistory.allergies
      });

      await storage.updateAgentInteraction(interaction.id, {
        status: "completed",
        output: medicalHistory,
        completedAt: new Date()
      });

      return medicalHistory;
    } catch (error) {
      await storage.updateAgentInteraction(interaction.id, {
        status: "failed",
        output: { error: error.message },
        completedAt: new Date()
      });
      throw error;
    }
  }

  // 6.2.5: Triage
  async performTriage(patientId: number): Promise<any> {
    const interaction = await storage.createAgentInteraction({
      agentId: this.agentId,
      patientId,
      interactionType: "intake",
      status: "in_progress",
      input: { patientId },
      metadata: { step: "triage" }
    });

    try {
      const patient = await storage.getPatient(patientId);
      
      const prompt = `Perform clinical triage assessment for patient:
      - Demographics: ${JSON.stringify({
        age: patient?.dateOfBirth,
        gender: patient?.gender
      })}
      - Symptoms: ${JSON.stringify(patient?.symptoms)}
      - Medical History: ${JSON.stringify(patient?.medicalHistory)}
      - Current Medications: ${JSON.stringify(patient?.currentMedications)}
      - Allergies: ${JSON.stringify(patient?.allergies)}
      
      Assess:
      - Urgency level (emergency, urgent, routine)
      - Risk factors
      - Recommended care pathway
      - Any red flags requiring immediate attention
      
      Return structured triage assessment with recommendations.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      const triageAssessment = JSON.parse(response.choices[0].message.content || "{}");
      
      await storage.updateAgentInteraction(interaction.id, {
        status: "completed",
        output: triageAssessment,
        completedAt: new Date()
      });

      return triageAssessment;
    } catch (error) {
      await storage.updateAgentInteraction(interaction.id, {
        status: "failed",
        output: { error: error.message },
        completedAt: new Date()
      });
      throw error;
    }
  }

  // 6.2.6: Patient Intake Instructions
  async generateInstructions(patientId: number, appointmentId: number): Promise<any> {
    const interaction = await storage.createAgentInteraction({
      agentId: this.agentId,
      patientId,
      appointmentId,
      interactionType: "intake",
      status: "in_progress",
      input: { patientId, appointmentId },
      metadata: { step: "generate_instructions" }
    });

    try {
      const patient = await storage.getPatient(patientId);
      const appointment = await storage.getAppointment(appointmentId);
      const provider = await storage.getProvider(appointment?.providerId || 0);

      const prompt = `Generate personalized pre-appointment instructions for:
      - Patient: ${JSON.stringify(patient)}
      - Appointment: ${JSON.stringify(appointment)}
      - Provider: ${JSON.stringify(provider)}
      
      Include:
      - Arrival time and location
      - Documents to bring
      - Preparation requirements (fasting, medications, etc.)
      - What to expect during visit
      - Contact information
      
      Personalize based on patient language preference: ${patient?.preferredLanguage || 'en'}
      Return structured instructions.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      const instructions = JSON.parse(response.choices[0].message.content || "{}");
      
      await storage.updateAgentInteraction(interaction.id, {
        status: "completed",
        output: instructions,
        completedAt: new Date()
      });

      return instructions;
    } catch (error) {
      await storage.updateAgentInteraction(interaction.id, {
        status: "failed",
        output: { error: error.message },
        completedAt: new Date()
      });
      throw error;
    }
  }
}

// Workflow Orchestration Service
export class WorkflowOrchestrationService {
  async initiateSchedulingWorkflow(patientData: any): Promise<any> {
    const workflow = await storage.createWorkflowOrchestration({
      patientId: patientData.patientId,
      workflowType: "scheduling",
      status: "initiated",
      currentStep: "collect_details",
      steps: [
        { name: "collect_details", status: "pending" },
        { name: "find_optimal_slots", status: "pending" },
        { name: "verify_insurance", status: "pending" },
        { name: "book_appointment", status: "pending" },
        { name: "send_confirmation", status: "pending" }
      ],
      agentsInvolved: ["scheduling_agent", "insurance_agent"]
    });

    // Initialize agents
    const schedulingAgent = new AISchedulingAgent(1, {
      language: patientData.preferredLanguage || "en",
      voice: "neural",
      maxRetries: 3,
      timeout: 30000,
      capabilities: []
    });

    const insuranceAgent = new InsuranceVerificationAgent(2);

    try {
      // Execute workflow steps
      const patientDetails = await schedulingAgent.collectPatientDetails(patientData);
      await this.updateWorkflowStep(workflow.id, "collect_details", "completed");

      const optimalSlots = await schedulingAgent.findOptimalSlots(patientDetails, patientData.providerId);
      await this.updateWorkflowStep(workflow.id, "find_optimal_slots", "completed");

      const insuranceVerification = await insuranceAgent.verifyEligibility(patientData.patientId);
      await this.updateWorkflowStep(workflow.id, "verify_insurance", "completed");

      const appointment = await schedulingAgent.bookAppointment({
        ...patientDetails,
        ...optimalSlots.recommendations[0],
        providerId: patientData.providerId
      });
      await this.updateWorkflowStep(workflow.id, "book_appointment", "completed");

      await storage.updateWorkflowOrchestration(workflow.id, {
        status: "completed",
        completedAt: new Date(),
        results: {
          appointment,
          insuranceVerification,
          patientDetails
        }
      });

      return {
        workflowId: workflow.id,
        appointment,
        insuranceVerification,
        status: "completed"
      };

    } catch (error) {
      await storage.updateWorkflowOrchestration(workflow.id, {
        status: "failed",
        completedAt: new Date(),
        errorDetails: { error: error.message }
      });
      throw error;
    }
  }

  async initiateIntakeWorkflow(patientId: number, appointmentId: number): Promise<any> {
    const workflow = await storage.createWorkflowOrchestration({
      patientId,
      appointmentId,
      workflowType: "intake",
      status: "initiated",
      currentStep: "prepare_forms",
      steps: [
        { name: "prepare_forms", status: "pending" },
        { name: "collect_symptoms", status: "pending" },
        { name: "collect_medical_history", status: "pending" },
        { name: "perform_triage", status: "pending" },
        { name: "generate_instructions", status: "pending" }
      ],
      agentsInvolved: ["intake_agent"]
    });

    const intakeAgent = new AIPatientIntakeAgent(3, {
      language: "en",
      voice: "neural",
      maxRetries: 3,
      timeout: 30000,
      capabilities: []
    });

    try {
      const appointment = await storage.getAppointment(appointmentId);
      
      const forms = await intakeAgent.prepareIntakeForms(patientId, appointment?.type || "general");
      await this.updateWorkflowStep(workflow.id, "prepare_forms", "completed");

      const triage = await intakeAgent.performTriage(patientId);
      await this.updateWorkflowStep(workflow.id, "perform_triage", "completed");

      const instructions = await intakeAgent.generateInstructions(patientId, appointmentId);
      await this.updateWorkflowStep(workflow.id, "generate_instructions", "completed");

      await storage.updateWorkflowOrchestration(workflow.id, {
        status: "completed",
        completedAt: new Date(),
        results: {
          forms,
          triage,
          instructions
        }
      });

      return {
        workflowId: workflow.id,
        forms,
        triage,
        instructions,
        status: "completed"
      };

    } catch (error) {
      await storage.updateWorkflowOrchestration(workflow.id, {
        status: "failed",
        completedAt: new Date(),
        errorDetails: { error: error.message }
      });
      throw error;
    }
  }

  private async updateWorkflowStep(workflowId: number, stepName: string, status: string): Promise<void> {
    const workflow = await storage.getWorkflowOrchestrationsByPatient(0);
    const currentWorkflow = workflow.find(w => w.id === workflowId);
    
    if (currentWorkflow && currentWorkflow.steps) {
      const steps = currentWorkflow.steps as any[];
      const stepIndex = steps.findIndex(s => s.name === stepName);
      if (stepIndex !== -1) {
        steps[stepIndex].status = status;
        steps[stepIndex].completedAt = new Date();
        
        await storage.updateWorkflowOrchestration(workflowId, {
          steps,
          currentStep: status === "completed" ? this.getNextStep(steps, stepName) : stepName
        });
      }
    }
  }

  private getNextStep(steps: any[], currentStep: string): string {
    const currentIndex = steps.findIndex(s => s.name === currentStep);
    const nextStep = steps[currentIndex + 1];
    return nextStep ? nextStep.name : "completed";
  }
}

export const workflowOrchestrationService = new WorkflowOrchestrationService();