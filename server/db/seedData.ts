import { db } from "./index";
import { 
  patients, 
  aiAgents, 
  healthcareProviders, 
  appointments,
  agentInteractions,
  workflowOrchestrations,
  costSavingsMetrics,
  performanceMetrics,
  automationStats,
  workflowEfficiency,
  financialImpact,
  referringPhysicians,
  medicalOrders,
  insuranceDetails,
  insuranceVerifications,
  communicationsLog,
  clinicalDataRequests,
  priorAuthorizations,
  patientIntakeForms,
  checkIns,
  emrConnections,
  emrApiEndpoints,
  emrSyncStats
} from "@/db/schema";

export async function initializeProductionDatabase() {
  try {
    console.log("Initializing database with sample data...");
    
    // Check if we already have data
    const existingPatients = await db.select().from(patients).limit(1);
    if (existingPatients.length > 0) {
      console.log("Database already initialized with sample data");
      return;
    }

    // 1. Create Referring Physicians
    const referringPhysiciansData = [
      {
        firstName: "Dr. Sarah",
        lastName: "Johnson",
        specialty: "Cardiology",
        clinicName: "HeartCare Medical Group",
        contactNumber: "555-0101",
        email: "sarah.johnson@heartcare.com"
      },
      {
        firstName: "Dr. Michael",
        lastName: "Chen",
        specialty: "Orthopedics",
        clinicName: "Advanced Orthopedic Center",
        contactNumber: "555-0102",
        email: "michael.chen@ortho.com"
      },
      {
        firstName: "Dr. Emily",
        lastName: "Rodriguez",
        specialty: "Neurology",
        clinicName: "NeuroCare Associates",
        contactNumber: "555-0103",
        email: "emily.rodriguez@neurocare.com"
      },
      {
        firstName: "Dr. James",
        lastName: "Williams",
        specialty: "Oncology",
        clinicName: "Cancer Treatment Center",
        contactNumber: "555-0104",
        email: "james.williams@cancercenter.com"
      },
      {
        firstName: "Dr. Lisa",
        lastName: "Thompson",
        specialty: "Dermatology",
        clinicName: "Skin Health Institute",
        contactNumber: "555-0105",
        email: "lisa.thompson@skinhealth.com"
      }
    ];

    const insertedPhysicians = await db.insert(referringPhysicians).values(referringPhysiciansData).returning();
    console.log(`Created ${insertedPhysicians.length} referring physicians`);

    // 2. Create Healthcare Providers
    const healthcareProvidersData = [
      {
        firstName: "Dr. Robert",
        lastName: "Anderson",
        specialty: "Radiology",
        language: "English",
        availabilityStatus: "available",
        workingHours: { "monday": "9:00-17:00", "tuesday": "9:00-17:00", "wednesday": "9:00-17:00", "thursday": "9:00-17:00", "friday": "9:00-17:00" },
        credentials: "MD, Board Certified Radiologist"
      },
      {
        firstName: "Dr. Maria",
        lastName: "Garcia",
        specialty: "Radiology",
        language: "Spanish",
        availabilityStatus: "available",
        workingHours: { "monday": "8:00-16:00", "tuesday": "8:00-16:00", "wednesday": "8:00-16:00", "thursday": "8:00-16:00", "friday": "8:00-16:00" },
        credentials: "MD, PhD, Board Certified Radiologist"
      },
      {
        firstName: "Dr. David",
        lastName: "Kim",
        specialty: "Cardiology",
        language: "English",
        availabilityStatus: "available",
        workingHours: { "monday": "10:00-18:00", "tuesday": "10:00-18:00", "wednesday": "10:00-18:00", "thursday": "10:00-18:00", "friday": "10:00-18:00" },
        credentials: "MD, FACC, Board Certified Cardiologist"
      },
      {
        firstName: "Dr. Jennifer",
        lastName: "Brown",
        specialty: "Neurology",
        language: "English",
        availabilityStatus: "available",
        workingHours: { "monday": "9:00-17:00", "tuesday": "9:00-17:00", "wednesday": "9:00-17:00", "thursday": "9:00-17:00", "friday": "9:00-17:00" },
        credentials: "MD, Board Certified Neurologist"
      },
      {
        firstName: "Dr. Carlos",
        lastName: "Martinez",
        specialty: "Orthopedics",
        language: "Spanish",
        availabilityStatus: "available",
        workingHours: { "monday": "8:00-16:00", "tuesday": "8:00-16:00", "wednesday": "8:00-16:00", "thursday": "8:00-16:00", "friday": "8:00-16:00" },
        credentials: "MD, Board Certified Orthopedic Surgeon"
      }
    ];

    const insertedProviders = await db.insert(healthcareProviders).values(healthcareProvidersData).returning();
    console.log(`Created ${insertedProviders.length} healthcare providers`);

    // 3. Create Patients
    const patientsData = [
      {
        firstName: "John",
        lastName: "Smith",
        dob: "1985-03-15",
        gender: "Male",
        contactNumber: "555-1001",
        email: "john.smith@email.com",
        address: "123 Main St, Anytown, CA 90210"
      },
      {
        firstName: "Mary",
        lastName: "Johnson",
        dob: "1990-07-22",
        gender: "Female",
        contactNumber: "555-1002",
        email: "mary.johnson@email.com",
        address: "456 Oak Ave, Somewhere, CA 90211"
      },
      {
        firstName: "Robert",
        lastName: "Davis",
        dob: "1978-11-08",
        gender: "Male",
        contactNumber: "555-1003",
        email: "robert.davis@email.com",
        address: "789 Pine Rd, Elsewhere, CA 90212"
      },
      {
        firstName: "Lisa",
        lastName: "Wilson",
        dob: "1992-04-30",
        gender: "Female",
        contactNumber: "555-1004",
        email: "lisa.wilson@email.com",
        address: "321 Elm St, Nowhere, CA 90213"
      },
      {
        firstName: "Michael",
        lastName: "Brown",
        dob: "1983-09-12",
        gender: "Male",
        contactNumber: "555-1005",
        email: "michael.brown@email.com",
        address: "654 Maple Dr, Anywhere, CA 90214"
      },
      {
        firstName: "Sarah",
        lastName: "Miller",
        dob: "1988-12-25",
        gender: "Female",
        contactNumber: "555-1006",
        email: "sarah.miller@email.com",
        address: "987 Cedar Ln, Someplace, CA 90215"
      },
      {
        firstName: "David",
        lastName: "Garcia",
        dob: "1975-06-18",
        gender: "Male",
        contactNumber: "555-1007",
        email: "david.garcia@email.com",
        address: "147 Birch Way, Elsewhere, CA 90216"
      },
      {
        firstName: "Jennifer",
        lastName: "Martinez",
        dob: "1995-01-03",
        gender: "Female",
        contactNumber: "555-1008",
        email: "jennifer.martinez@email.com",
        address: "258 Spruce Ct, Nowhere, CA 90217"
      },
      {
        firstName: "Christopher",
        lastName: "Anderson",
        dob: "1980-08-14",
        gender: "Male",
        contactNumber: "555-1009",
        email: "christopher.anderson@email.com",
        address: "369 Willow Pl, Anywhere, CA 90218"
      },
      {
        firstName: "Amanda",
        lastName: "Taylor",
        dob: "1987-05-20",
        gender: "Female",
        contactNumber: "555-1010",
        email: "amanda.taylor@email.com",
        address: "741 Aspen Blvd, Someplace, CA 90219"
      }
    ];

    const insertedPatients = await db.insert(patients).values(patientsData).returning();
    console.log(`Created ${insertedPatients.length} patients`);

    // 4. Create Insurance Details
    const insuranceDetailsData = [
      {
        patientId: insertedPatients[0].patientId,
        payerName: "Blue Cross Blue Shield",
        policyNumber: "BCBS123456789",
        groupNumber: "GRP001",
        isPrimary: true,
        effectiveDate: "2024-01-01",
        expirationDate: "2024-12-31",
        memberName: "John Smith",
        relationshipToSubscriber: "self"
      },
      {
        patientId: insertedPatients[1].patientId,
        payerName: "Aetna",
        policyNumber: "AET987654321",
        groupNumber: "GRP002",
        isPrimary: true,
        effectiveDate: "2024-01-01",
        expirationDate: "2024-12-31",
        memberName: "Mary Johnson",
        relationshipToSubscriber: "self"
      },
      {
        patientId: insertedPatients[2].patientId,
        payerName: "UnitedHealth",
        policyNumber: "UHC456789123",
        groupNumber: "GRP003",
        isPrimary: true,
        effectiveDate: "2024-01-01",
        expirationDate: "2024-12-31",
        memberName: "Robert Davis",
        relationshipToSubscriber: "self"
      },
      {
        patientId: insertedPatients[3].patientId,
        payerName: "Cigna",
        policyNumber: "CIG789123456",
        groupNumber: "GRP004",
        isPrimary: true,
        effectiveDate: "2024-01-01",
        expirationDate: "2024-12-31",
        memberName: "Lisa Wilson",
        relationshipToSubscriber: "self"
      },
      {
        patientId: insertedPatients[4].patientId,
        payerName: "Kaiser Permanente",
        policyNumber: "KP321654987",
        groupNumber: "GRP005",
        isPrimary: true,
        effectiveDate: "2024-01-01",
        expirationDate: "2024-12-31",
        memberName: "Michael Brown",
        relationshipToSubscriber: "self"
      }
    ];

    const insertedInsurance = await db.insert(insuranceDetails).values(insuranceDetailsData).returning();
    console.log(`Created ${insertedInsurance.length} insurance records`);

    // 5. Create Medical Orders
    const medicalOrdersData = [
      {
        patientId: insertedPatients[0].patientId,
        referringPhysicianId: insertedPhysicians[0].physicianId,
        procedureType: "Chest X-Ray",
        orderDate: new Date("2024-03-15"),
        status: "pending",
        sourceSystem: "Epic",
        urgency: "routine",
        clinicalNotes: "Patient reports chest pain, rule out pneumonia"
      },
      {
        patientId: insertedPatients[1].patientId,
        referringPhysicianId: insertedPhysicians[1].physicianId,
        procedureType: "MRI - Knee",
        orderDate: new Date("2024-03-16"),
        status: "pending",
        sourceSystem: "Cerner",
        urgency: "routine",
        clinicalNotes: "Knee pain and swelling, evaluate for meniscal tear"
      },
      {
        patientId: insertedPatients[2].patientId,
        referringPhysicianId: insertedPhysicians[2].physicianId,
        procedureType: "CT Scan - Head",
        orderDate: new Date("2024-03-17"),
        status: "pending",
        sourceSystem: "Athenahealth",
        urgency: "urgent",
        clinicalNotes: "Recent head injury, evaluate for intracranial bleeding"
      },
      {
        patientId: insertedPatients[3].patientId,
        referringPhysicianId: insertedPhysicians[3].physicianId,
        procedureType: "PET Scan",
        orderDate: new Date("2024-03-18"),
        status: "pending",
        sourceSystem: "Epic",
        urgency: "routine",
        clinicalNotes: "Cancer staging evaluation"
      },
      {
        patientId: insertedPatients[4].patientId,
        referringPhysicianId: insertedPhysicians[4].physicianId,
        procedureType: "Ultrasound - Skin",
        orderDate: new Date("2024-03-19"),
        status: "pending",
        sourceSystem: "Cerner",
        urgency: "routine",
        clinicalNotes: "Evaluate suspicious skin lesion"
      }
    ];

    const insertedOrders = await db.insert(medicalOrders).values(medicalOrdersData).returning();
    console.log(`Created ${insertedOrders.length} medical orders`);

    // 6. Create AI Agents
    const aiAgentsData = [
      {
        name: "Order Ingestion Agent",
        type: "order_ingestion",
        description: "Automatically processes and validates incoming medical orders from various EMR systems",
        status: "active",
        configuration: {
          supportedFormats: ["HL7", "FHIR", "DICOM"],
          validationRules: ["patient_verification", "insurance_check", "clinical_review"],
          autoRouting: true
        },
        capabilities: ["order_parsing", "validation", "routing", "notification"],
        skills: ["natural_language_processing", "medical_terminology", "workflow_automation"],
        metrics: {
          processingTime: "2.3 seconds",
          accuracy: "98.7%",
          throughput: "150 orders/hour"
        },
        version: "2.1",
        languages: ["en", "es"]
      },
      {
        name: "Scheduling Agent",
        type: "scheduling",
        description: "Intelligent appointment scheduling with provider matching and conflict resolution",
        status: "active",
        configuration: {
          schedulingRules: ["provider_availability", "patient_preference", "urgency_level"],
          conflictResolution: "automatic",
          notificationSystem: "multi_channel"
        },
        capabilities: ["appointment_scheduling", "conflict_detection", "rescheduling", "reminders"],
        skills: ["calendar_management", "optimization_algorithms", "patient_communication"],
        metrics: {
          schedulingTime: "45 seconds",
          accuracy: "99.2%",
          patientSatisfaction: "4.8/5"
        },
        version: "1.9",
        languages: ["en", "es", "zh"]
      },
      {
        name: "Insurance Verification Agent",
        type: "insurance_verification",
        description: "Real-time insurance eligibility verification and coverage determination",
        status: "active",
        configuration: {
          payerConnections: ["BCBS", "Aetna", "UnitedHealth", "Cigna"],
          verificationMethods: ["real_time", "batch_processing"],
          coverageAnalysis: "comprehensive"
        },
        capabilities: ["eligibility_check", "coverage_analysis", "cost_estimation", "authorization_check"],
        skills: ["insurance_terminology", "regulatory_compliance", "data_analysis"],
        metrics: {
          verificationTime: "3.1 seconds",
          accuracy: "99.5%",
          costSavings: "$45,000/month"
        },
        version: "2.0",
        languages: ["en"]
      },
      {
        name: "Patient Communication Agent",
        type: "patient_communication",
        description: "Multi-channel patient communication for appointments, reminders, and follow-ups",
        status: "active",
        configuration: {
          channels: ["sms", "email", "voice", "mobile_app"],
          personalization: "ai_driven",
          compliance: "hipaa_certified"
        },
        capabilities: ["appointment_reminders", "prep_instructions", "follow_up", "satisfaction_surveys"],
        skills: ["natural_language_generation", "sentiment_analysis", "multilingual_support"],
        metrics: {
          responseRate: "94.3%",
          satisfaction: "4.7/5",
          engagement: "87.2%"
        },
        version: "1.8",
        languages: ["en", "es", "zh", "fr"]
      },
      {
        name: "Prior Authorization Agent",
        type: "prior_authorization",
        description: "Automated prior authorization requests and tracking",
        status: "active",
        configuration: {
          payerRequirements: ["clinical_criteria", "documentation", "timelines"],
          submissionMethods: ["electronic", "fax", "portal"],
          tracking: "real_time"
        },
        capabilities: ["pa_submission", "status_tracking", "appeal_management", "documentation"],
        skills: ["regulatory_knowledge", "clinical_documentation", "workflow_management"],
        metrics: {
          approvalRate: "89.7%",
          processingTime: "2.1 days",
          costSavings: "$32,000/month"
        },
        version: "1.7",
        languages: ["en"]
      },
      {
        name: "Digital Intake Agent",
        type: "digital_intake",
        description: "Intelligent patient intake forms with adaptive questioning",
        status: "active",
        configuration: {
          formTypes: ["medical_history", "medications", "allergies", "consent"],
          adaptiveLogic: "ai_powered",
          validation: "real_time"
        },
        capabilities: ["form_generation", "data_validation", "completion_tracking", "integration"],
        skills: ["form_design", "data_validation", "user_experience"],
        metrics: {
          completionRate: "91.5%",
          accuracy: "97.3%",
          timeSavings: "15 minutes/patient"
        },
        version: "2.2",
        languages: ["en", "es", "zh"]
      },
      {
        name: "EHR Integration Agent",
        type: "ehr_integration",
        description: "Seamless integration with multiple EMR systems",
        status: "active",
        configuration: {
          supportedSystems: ["Epic", "Cerner", "Athenahealth", "Allscripts"],
          syncFrequency: "real_time",
          dataMapping: "automated"
        },
        capabilities: ["data_sync", "interoperability", "error_handling", "monitoring"],
        skills: ["hl7_fhir", "api_integration", "data_mapping"],
        metrics: {
          syncAccuracy: "99.9%",
          uptime: "99.95%",
          dataQuality: "98.7%"
        },
        version: "2.3",
        languages: ["en"]
      },
      {
        name: "Check-in Agent",
        type: "checkin",
        description: "Streamlined patient check-in process with document verification",
        status: "active",
        configuration: {
          checkinMethods: ["mobile_app", "kiosk", "voice"],
          verificationTypes: ["identity", "insurance", "consent"],
          queueManagement: "intelligent"
        },
        capabilities: ["identity_verification", "document_scanning", "queue_optimization", "notification"],
        skills: ["document_processing", "queue_management", "user_interface"],
        metrics: {
          checkinTime: "2.8 minutes",
          accuracy: "99.1%",
          patientSatisfaction: "4.9/5"
        },
        version: "1.6",
        languages: ["en", "es", "zh"]
      }
    ];

    const insertedAgents = await db.insert(aiAgents).values(aiAgentsData).returning();
    console.log(`Created ${insertedAgents.length} AI agents`);

    // 7. Create Appointments
    const appointmentsData = [
      {
        patientId: insertedPatients[0].patientId,
        providerId: insertedProviders[0].providerId,
        orderId: insertedOrders[0].orderId,
        appointmentDatetime: new Date("2024-03-25T10:00:00"),
        location: "Main Imaging Center - Room 101",
        appointmentType: "X-Ray",
        status: "scheduled",
        duration: 30,
        reasonForVisit: "Chest X-Ray for chest pain evaluation",
        notes: "Patient should arrive 15 minutes early for registration",
        confirmationSent: true,
        reminderSent: false
      },
      {
        patientId: insertedPatients[1].patientId,
        providerId: insertedProviders[1].providerId,
        orderId: insertedOrders[1].orderId,
        appointmentDatetime: new Date("2024-03-26T14:30:00"),
        location: "Advanced Imaging Center - MRI Suite",
        appointmentType: "MRI",
        status: "scheduled",
        duration: 60,
        reasonForVisit: "Knee MRI for meniscal tear evaluation",
        notes: "Patient should remove all metal objects",
        confirmationSent: true,
        reminderSent: false
      },
      {
        patientId: insertedPatients[2].patientId,
        providerId: insertedProviders[2].providerId,
        orderId: insertedOrders[2].orderId,
        appointmentDatetime: new Date("2024-03-27T09:15:00"),
        location: "Emergency Imaging Center - CT Suite",
        appointmentType: "CT Scan",
        status: "scheduled",
        duration: 45,
        reasonForVisit: "Head CT for recent head injury",
        notes: "Urgent appointment - patient should come immediately if symptoms worsen",
        confirmationSent: true,
        reminderSent: false
      },
      {
        patientId: insertedPatients[3].patientId,
        providerId: insertedProviders[3].providerId,
        orderId: insertedOrders[3].orderId,
        appointmentDatetime: new Date("2024-03-28T11:00:00"),
        location: "Nuclear Medicine Center - PET Suite",
        appointmentType: "PET Scan",
        status: "scheduled",
        duration: 90,
        reasonForVisit: "PET scan for cancer staging",
        notes: "Patient should fast for 6 hours prior to appointment",
        confirmationSent: true,
        reminderSent: false
      },
      {
        patientId: insertedPatients[4].patientId,
        providerId: insertedProviders[4].providerId,
        orderId: insertedOrders[4].orderId,
        appointmentDatetime: new Date("2024-03-29T15:45:00"),
        location: "Dermatology Imaging Center - Ultrasound Suite",
        appointmentType: "Ultrasound",
        status: "scheduled",
        duration: 30,
        reasonForVisit: "Skin ultrasound for suspicious lesion",
        notes: "Patient should not apply lotion to the area",
        confirmationSent: true,
        reminderSent: false
      }
    ];

    const insertedAppointments = await db.insert(appointments).values(appointmentsData).returning();
    console.log(`Created ${insertedAppointments.length} appointments`);

    // 8. Create Insurance Verifications
    const insuranceVerificationsData = [
      {
        appointmentId: insertedAppointments[0].appointmentId,
        insuranceId: insertedInsurance[0].insuranceId,
        verificationDate: new Date("2024-03-20"),
        eligibilityStatus: "eligible",
        coverageDetails: {
          deductible: 500,
          coinsurance: 20,
          copay: 25,
          outOfPocketMax: 5000
        },
        patientPayableAmount: "25.00",
        flaggedIssue: null,
        deductibleMet: false,
        coinsurancePercentage: "20.00",
        copayAmount: "25.00"
      },
      {
        appointmentId: insertedAppointments[1].appointmentId,
        insuranceId: insertedInsurance[1].insuranceId,
        verificationDate: new Date("2024-03-21"),
        eligibilityStatus: "eligible",
        coverageDetails: {
          deductible: 1000,
          coinsurance: 15,
          copay: 50,
          outOfPocketMax: 6000
        },
        patientPayableAmount: "50.00",
        flaggedIssue: null,
        deductibleMet: false,
        coinsurancePercentage: "15.00",
        copayAmount: "50.00"
      },
      {
        appointmentId: insertedAppointments[2].appointmentId,
        insuranceId: insertedInsurance[2].insuranceId,
        verificationDate: new Date("2024-03-22"),
        eligibilityStatus: "eligible",
        coverageDetails: {
          deductible: 750,
          coinsurance: 25,
          copay: 35,
          outOfPocketMax: 4000
        },
        patientPayableAmount: "35.00",
        flaggedIssue: null,
        deductibleMet: false,
        coinsurancePercentage: "25.00",
        copayAmount: "35.00"
      }
    ];

    const insertedVerifications = await db.insert(insuranceVerifications).values(insuranceVerificationsData).returning();
    console.log(`Created ${insertedVerifications.length} insurance verifications`);

    // 9. Create Communications Log
    const communicationsData = [
      {
        appointmentId: insertedAppointments[0].appointmentId,
        patientId: insertedPatients[0].patientId,
        type: "sms",
        messageContent: "Your chest X-ray appointment is confirmed for March 25th at 10:00 AM. Please arrive 15 minutes early.",
        timestamp: new Date("2024-03-20T14:30:00"),
        status: "delivered",
        language: "en",
        deliveredAt: new Date("2024-03-20T14:31:00")
      },
      {
        appointmentId: insertedAppointments[1].appointmentId,
        patientId: insertedPatients[1].patientId,
        type: "email",
        messageContent: "Your knee MRI appointment is scheduled for March 26th at 2:30 PM. Please remove all metal objects before arrival.",
        timestamp: new Date("2024-03-21T09:15:00"),
        status: "delivered",
        language: "en",
        deliveredAt: new Date("2024-03-21T09:16:00")
      },
      {
        appointmentId: insertedAppointments[2].appointmentId,
        patientId: insertedPatients[2].patientId,
        type: "voice_call",
        messageContent: "Urgent: Your head CT scan is scheduled for March 27th at 9:15 AM. Please come immediately if symptoms worsen.",
        timestamp: new Date("2024-03-22T16:45:00"),
        status: "delivered",
        language: "en",
        deliveredAt: new Date("2024-03-22T16:46:00")
      }
    ];

    const insertedCommunications = await db.insert(communicationsLog).values(communicationsData).returning();
    console.log(`Created ${insertedCommunications.length} communication records`);

    // 10. Create Agent Interactions
    const agentInteractionsData = [
      {
        agentId: insertedAgents[0].id,
        patientId: insertedPatients[0].patientId,
        appointmentId: insertedAppointments[0].appointmentId,
        orderId: insertedOrders[0].orderId,
        interactionType: "order_processing",
        status: "completed",
        input: { orderData: "Chest X-Ray order from Epic", patientInfo: "John Smith" },
        output: { processedOrder: "Order validated and scheduled", appointmentId: insertedAppointments[0].appointmentId },
        metadata: { processingTime: "2.3 seconds", confidence: 0.98 },
        language: "en",
        duration: 2,
        confidence: "0.98"
      },
      {
        agentId: insertedAgents[1].id,
        patientId: insertedPatients[1].patientId,
        appointmentId: insertedAppointments[1].appointmentId,
        orderId: insertedOrders[1].orderId,
        interactionType: "appointment_scheduling",
        status: "completed",
        input: { requestedTime: "March 26th afternoon", procedure: "Knee MRI" },
        output: { scheduledAppointment: "March 26th 2:30 PM", provider: "Dr. Maria Garcia" },
        metadata: { schedulingTime: "45 seconds", providerMatch: "optimal" },
        language: "en",
        duration: 45,
        confidence: "0.99"
      },
      {
        agentId: insertedAgents[2].id,
        patientId: insertedPatients[2].patientId,
        appointmentId: insertedAppointments[2].appointmentId,
        orderId: insertedOrders[2].orderId,
        interactionType: "insurance_verification",
        status: "completed",
        input: { insuranceInfo: "UnitedHealth policy", procedure: "Head CT" },
        output: { verificationResult: "Eligible", copay: "$35", coverage: "80%" },
        metadata: { verificationTime: "3.1 seconds", payerResponse: "immediate" },
        language: "en",
        duration: 3,
        confidence: "0.99"
      }
    ];

    const insertedInteractions = await db.insert(agentInteractions).values(agentInteractionsData).returning();
    console.log(`Created ${insertedInteractions.length} agent interactions`);

    // 11. Create Workflow Orchestrations
    const workflowData = [
      {
        patientId: insertedPatients[0].patientId,
        appointmentId: insertedAppointments[0].appointmentId,
        orderId: insertedOrders[0].orderId,
        workflowType: "appointment_scheduling",
        status: "completed",
        currentStep: "completed",
        steps: [
          { step: "order_ingestion", status: "completed", agent: "Order Ingestion Agent" },
          { step: "insurance_verification", status: "completed", agent: "Insurance Verification Agent" },
          { step: "appointment_scheduling", status: "completed", agent: "Scheduling Agent" },
          { step: "patient_communication", status: "completed", agent: "Patient Communication Agent" }
        ],
        agentsInvolved: ["Order Ingestion Agent", "Insurance Verification Agent", "Scheduling Agent", "Patient Communication Agent"],
        results: { appointmentScheduled: true, patientNotified: true, insuranceVerified: true },
        priority: "normal",
        estimatedCompletion: new Date("2024-03-20T15:00:00"),
        completedAt: new Date("2024-03-20T14:45:00")
      },
      {
        patientId: insertedPatients[1].patientId,
        appointmentId: insertedAppointments[1].appointmentId,
        orderId: insertedOrders[1].orderId,
        workflowType: "appointment_scheduling",
        status: "completed",
        currentStep: "completed",
        steps: [
          { step: "order_ingestion", status: "completed", agent: "Order Ingestion Agent" },
          { step: "insurance_verification", status: "completed", agent: "Insurance Verification Agent" },
          { step: "appointment_scheduling", status: "completed", agent: "Scheduling Agent" },
          { step: "patient_communication", status: "completed", agent: "Patient Communication Agent" }
        ],
        agentsInvolved: ["Order Ingestion Agent", "Insurance Verification Agent", "Scheduling Agent", "Patient Communication Agent"],
        results: { appointmentScheduled: true, patientNotified: true, insuranceVerified: true },
        priority: "normal",
        estimatedCompletion: new Date("2024-03-21T10:00:00"),
        completedAt: new Date("2024-03-21T09:55:00")
      }
    ];

    const insertedWorkflows = await db.insert(workflowOrchestrations).values(workflowData).returning();
    console.log(`Created ${insertedWorkflows.length} workflow orchestrations`);

    // 12. Create EMR Connections
    const emrConnectionsData = [
      {
        systemName: "Epic",
        systemType: "EMR",
        status: "connected",
        healthScore: 95,
        encryptedCredentials: { apiKey: "encrypted_key_1", endpoint: "https://epic.example.com/api" },
        endpoint: "https://epic.example.com/api/v1",
        authMethod: "OAuth 2.0",
        lastSyncAt: new Date("2024-03-20T12:00:00"),
        lastHealthCheckAt: new Date("2024-03-20T12:00:00"),
        connectionMetadata: { environment: "production", practiceId: "EPIC001" },
        isActive: true
      },
      {
        systemName: "Cerner",
        systemType: "EMR",
        status: "connected",
        healthScore: 92,
        encryptedCredentials: { apiKey: "encrypted_key_2", endpoint: "https://cerner.example.com/api" },
        endpoint: "https://cerner.example.com/api/v1",
        authMethod: "API Key",
        lastSyncAt: new Date("2024-03-20T12:00:00"),
        lastHealthCheckAt: new Date("2024-03-20T12:00:00"),
        connectionMetadata: { environment: "production", practiceId: "CERN001" },
        isActive: true
      },
      {
        systemName: "Athenahealth",
        systemType: "EMR",
        status: "connected",
        healthScore: 88,
        encryptedCredentials: { apiKey: "encrypted_key_3", endpoint: "https://athena.example.com/api" },
        endpoint: "https://athena.example.com/api/v1",
        authMethod: "OAuth 2.0",
        lastSyncAt: new Date("2024-03-20T12:00:00"),
        lastHealthCheckAt: new Date("2024-03-20T12:00:00"),
        connectionMetadata: { environment: "production", practiceId: "ATH001" },
        isActive: true
      }
    ];

    const insertedEmrConnections = await db.insert(emrConnections).values(emrConnectionsData).returning();
    console.log(`Created ${insertedEmrConnections.length} EMR connections`);

    // 13. Create EMR API Endpoints
    const emrApiEndpointsData = [
      {
        connectionId: insertedEmrConnections[0].connectionId,
        apiName: "Epic Orders API",
        apiFunction: "Retrieve and process medical orders",
        status: "active",
        averageLatency: 250,
        errorRate: "0.02",
        callsLast24h: 1247,
        lastCallAt: new Date("2024-03-20T12:00:00"),
        isEnabled: true
      },
      {
        connectionId: insertedEmrConnections[1].connectionId,
        apiName: "Cerner Patient API",
        apiFunction: "Retrieve patient demographic information",
        status: "active",
        averageLatency: 180,
        errorRate: "0.01",
        callsLast24h: 892,
        lastCallAt: new Date("2024-03-20T12:00:00"),
        isEnabled: true
      },
      {
        connectionId: insertedEmrConnections[2].connectionId,
        apiName: "Athenahealth Appointments API",
        apiFunction: "Schedule and manage appointments",
        status: "active",
        averageLatency: 320,
        errorRate: "0.03",
        callsLast24h: 567,
        lastCallAt: new Date("2024-03-20T12:00:00"),
        isEnabled: true
      }
    ];

    const insertedApiEndpoints = await db.insert(emrApiEndpoints).values(emrApiEndpointsData).returning();
    console.log(`Created ${insertedApiEndpoints.length} EMR API endpoints`);

    // 14. Create EMR Sync Statistics
    const emrSyncStatsData = [
      {
        connectionId: insertedEmrConnections[0].connectionId,
        totalPatients: 1247,
        totalAppointments: 892,
        totalOrders: 567,
        totalResults: 445,
        syncStartedAt: new Date("2024-03-20T06:00:00"),
        syncCompletedAt: new Date("2024-03-20T06:15:00"),
        syncStatus: "completed",
        recordsProcessed: 3151,
        recordsSuccessful: 3138,
        recordsFailed: 13
      },
      {
        connectionId: insertedEmrConnections[1].connectionId,
        totalPatients: 892,
        totalAppointments: 634,
        totalOrders: 445,
        totalResults: 378,
        syncStartedAt: new Date("2024-03-20T06:00:00"),
        syncCompletedAt: new Date("2024-03-20T06:12:00"),
        syncStatus: "completed",
        recordsProcessed: 2349,
        recordsSuccessful: 2341,
        recordsFailed: 8
      }
    ];

    const insertedSyncStats = await db.insert(emrSyncStats).values(emrSyncStatsData).returning();
    console.log(`Created ${insertedSyncStats.length} EMR sync statistics`);

    // 15. Initialize cost savings metrics (existing code)
    const costMetricsData = [
      {
        metricType: "labor_cost",
        category: "scheduling",
        periodStart: new Date("2024-01-01"),
        periodEnd: new Date("2024-03-31"),
        beforeAutomation: "45600.00",
        afterAutomation: "18240.00",
        costSavings: "27360.00",
        savingsPercentage: "60.00",
        unit: "USD"
      },
      {
        metricType: "labor_cost",
        category: "intake",
        periodStart: new Date("2024-01-01"),
        periodEnd: new Date("2024-03-31"),
        beforeAutomation: "32400.00",
        afterAutomation: "9720.00",
        costSavings: "22680.00",
        savingsPercentage: "70.00",
        unit: "USD"
      },
      {
        metricType: "processing_time",
        category: "verification",
        periodStart: new Date("2024-01-01"),
        periodEnd: new Date("2024-03-31"),
        beforeAutomation: "2400.00",
        afterAutomation: "480.00",
        costSavings: "1920.00",
        savingsPercentage: "80.00",
        unit: "hours"
      }
    ];

    await db.insert(costSavingsMetrics).values(costMetricsData);

    // 16. Initialize automation statistics (existing code)
    const autoStatsData = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const tasksProcessed = Math.floor(Math.random() * 200) + 800;
      const automatedTasks = Math.floor(tasksProcessed * (0.75 + Math.random() * 0.2));
      
      autoStatsData.push({
        date: date.toISOString().split('T')[0],
        totalTasksProcessed: tasksProcessed,
        automatedTasks: automatedTasks,
        manualTasks: tasksProcessed - automatedTasks,
        automationRate: ((automatedTasks / tasksProcessed) * 100).toFixed(2),
        avgProcessingTime: (Math.random() * 5 + 2).toFixed(2),
        errorRate: (Math.random() * 0.05).toFixed(4),
        patientSatisfactionScore: (4.2 + Math.random() * 0.6).toFixed(2),
        costPerTask: (12 + Math.random() * 8).toFixed(2)
      });
    }

    await db.insert(automationStats).values(autoStatsData);

    // 17. Initialize financial impact data (existing code)
    const financialData = [
      {
        category: "cost_reduction",
        description: "Automated scheduling reduces administrative overhead",
        amount: "85320.00",
        currency: "USD",
        impactDate: "2024-03-31",
        quarterYear: "Q1-2024",
        isRecurring: true,
        recurringPeriod: "quarterly",
        sourceWorkflow: "scheduling"
      },
      {
        category: "revenue_increase",
        description: "Improved patient satisfaction increases retention",
        amount: "124800.00",
        currency: "USD",
        impactDate: "2024-03-31",
        quarterYear: "Q1-2024",
        isRecurring: true,
        recurringPeriod: "quarterly",
        sourceWorkflow: "communication"
      }
    ];

    await db.insert(financialImpact).values(financialData);
    
    console.log("Production database initialization complete with comprehensive sample data!");
    console.log("Summary:");
    console.log(`- ${insertedPhysicians.length} referring physicians`);
    console.log(`- ${insertedProviders.length} healthcare providers`);
    console.log(`- ${insertedPatients.length} patients`);
    console.log(`- ${insertedInsurance.length} insurance records`);
    console.log(`- ${insertedOrders.length} medical orders`);
    console.log(`- ${insertedAgents.length} AI agents`);
    console.log(`- ${insertedAppointments.length} appointments`);
    console.log(`- ${insertedVerifications.length} insurance verifications`);
    console.log(`- ${insertedCommunications.length} communication records`);
    console.log(`- ${insertedInteractions.length} agent interactions`);
    console.log(`- ${insertedWorkflows.length} workflow orchestrations`);
    console.log(`- ${insertedEmrConnections.length} EMR connections`);
    console.log(`- ${insertedApiEndpoints.length} EMR API endpoints`);
    console.log(`- ${insertedSyncStats.length} EMR sync statistics`);
    console.log(`- 30 days of automation statistics`);
    console.log(`- Cost savings and financial impact metrics`);
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Manual trigger function for development/testing
export async function populateDatabase() {
  console.log("Starting manual database population...");
  await initializeProductionDatabase();
  console.log("Manual database population complete!");
}