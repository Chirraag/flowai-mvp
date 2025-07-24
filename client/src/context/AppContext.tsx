import { createContext, ReactNode, useContext, useState } from "react";
import { Appointment, Patient, Provider, IntakeForm } from "@shared/schema";

interface AppContextType {
  language: "en" | "es" | "zh";
  setLanguage: (lang: "en" | "es" | "zh") => void;
  appointments: Appointment[];
  patients: Patient[];
  providers: Provider[];
  intakeForms: IntakeForm[];
  ehrConnections: {
    system: string;
    status: "connected" | "connecting" | "ready";
    progress?: number;
    lastSync?: string;
    stats?: {
      appointments: number;
      patients: number;
    };
  }[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<"en" | "es" | "zh">("en");
  
  // Sample data for the app
  const [appointments] = useState<Appointment[]>([
    {
      id: 1,
      patientId: 1,
      providerId: 1,
      date: new Date().toISOString(),
      time: "10:00 AM",
      duration: 45,
      status: "checked-in",
      type: "consultation",
    },
    {
      id: 2,
      patientId: 2,
      providerId: 2,
      date: new Date().toISOString(),
      time: "11:15 AM",
      duration: 30,
      status: "arriving",
      type: "consultation",
    },
    {
      id: 3,
      patientId: 3,
      providerId: 3,
      date: new Date().toISOString(),
      time: "12:30 PM",
      duration: 60,
      status: "scheduled",
      type: "consultation",
    },
    {
      id: 4,
      patientId: 4,
      providerId: 4,
      date: new Date().toISOString(),
      time: "2:00 PM",
      duration: 30,
      status: "rescheduled",
      type: "follow-up",
    },
  ]);

  const [patients] = useState<Patient[]>([
    {
      id: 1,
      patientNumber: "PAT-1234",
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: "1980-05-15",
      phoneNumber: "123-456-7890",
      email: "john.doe@example.com",
      address: "123 Main St, Anytown, US",
      insuranceProvider: "BlueShield",
      insurancePolicyNumber: "BS123456789",
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      patientNumber: "PAT-5678",
      firstName: "Maria",
      lastName: "Wilson",
      dateOfBirth: "1992-09-23",
      phoneNumber: "987-654-3210",
      email: "maria.wilson@example.com",
      address: "456 Oak St, Somewhere, US",
      insuranceProvider: "Medicare",
      insurancePolicyNumber: "MC987654321",
      createdAt: new Date().toISOString(),
    },
    {
      id: 3,
      patientNumber: "PAT-9012",
      firstName: "Alex",
      lastName: "Rodriguez",
      dateOfBirth: "1975-11-30",
      phoneNumber: "555-123-4567",
      email: "alex.rodriguez@example.com",
      address: "789 Pine St, Nowhere, US",
      insuranceProvider: "Aetna",
      insurancePolicyNumber: "AE456789123",
      createdAt: new Date().toISOString(),
    },
    {
      id: 4,
      patientNumber: "PAT-3456",
      firstName: "Kelly",
      lastName: "Nguyen",
      dateOfBirth: "1988-03-12",
      phoneNumber: "555-987-6543",
      email: "kelly.nguyen@example.com",
      address: "321 Elm St, Anywhere, US",
      insuranceProvider: "UnitedHealth",
      insurancePolicyNumber: "UH789123456",
      createdAt: new Date().toISOString(),
    },
  ]);

  const [providers] = useState<Provider[]>([
    {
      id: 1,
      firstName: "Robert",
      lastName: "Chen",
      specialty: "Cardiology",
      email: "robert.chen@example.com",
      phoneNumber: "123-456-7890",
    },
    {
      id: 2,
      firstName: "Lisa",
      lastName: "Wong",
      specialty: "Pediatrics",
      email: "lisa.wong@example.com",
      phoneNumber: "987-654-3210",
    },
    {
      id: 3,
      firstName: "James",
      lastName: "Miller",
      specialty: "Orthopedics",
      email: "james.miller@example.com",
      phoneNumber: "555-123-4567",
    },
    {
      id: 4,
      firstName: "Sarah",
      lastName: "Johnson",
      specialty: "Dermatology",
      email: "sarah.johnson@example.com",
      phoneNumber: "555-987-6543",
    },
  ]);

  const [intakeForms] = useState<IntakeForm[]>([
    {
      id: 1,
      name: "General Medical Intake",
      description: "Used for all new patients",
      isDefault: true,
    },
    {
      id: 2,
      name: "Cardiology Intake",
      description: "Specialized for cardiology department",
      isDefault: false,
    },
    {
      id: 3,
      name: "Pediatric Intake",
      description: "For patients under 18 years",
      isDefault: false,
    },
  ]);

  const [ehrConnections] = useState([
    {
      system: "Epic",
      status: "connected" as const,
      lastSync: "Today at 9:32 AM",
      stats: {
        appointments: 128,
        patients: 1450,
      },
    },
    {
      system: "Cerner",
      status: "ready" as const,
    },
    {
      system: "Athena",
      status: "connecting" as const,
      progress: 45,
    },
    {
      system: "eClinicalWorks",
      status: "ready" as const,
    },
  ]);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        appointments,
        patients,
        providers,
        intakeForms,
        ehrConnections,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
