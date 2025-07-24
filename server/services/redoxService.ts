import crypto from 'crypto';

export interface RedoxConfig {
  sourceId: string;
  destinationId: string;
  environment: 'sandbox' | 'production';
  apiKey?: string;
  secret?: string;
}

export interface RedoxPatient {
  Identifiers: Array<{
    ID: string;
    IDType: 'MR' | 'SSN' | 'DL';
  }>;
  Demographics: {
    FirstName: string;
    LastName: string;
    MiddleName?: string;
    DOB: string;
    SSN?: string;
    Sex: 'Male' | 'Female' | 'Unknown';
    Race?: string;
    Ethnicity?: string;
    MaritalStatus?: string;
    Address?: {
      StreetAddress: string;
      City: string;
      State: string;
      ZIP: string;
      County?: string;
    };
    PhoneNumber?: {
      Home?: string;
      Work?: string;
      Mobile?: string;
    };
    EmailAddresses?: Array<{
      Address: string;
    }>;
  };
  Insurances?: Array<{
    Plan: {
      ID: string;
      Name: string;
      Type: string;
    };
    MemberNumber: string;
    CompanyName: string;
    GroupNumber?: string;
  }>;
}

export interface RedoxVisit {
  VisitNumber: string;
  AccountNumber?: string;
  PatientClass: 'Inpatient' | 'Outpatient' | 'Emergency' | 'Recurring';
  VisitDateTime: string;
  Status: 'Arrived' | 'InProgress' | 'Completed' | 'Cancelled';
  Location: {
    Type: string;
    Facility: string;
    Department: string;
    Room?: string;
    Bed?: string;
  };
  Providers: Array<{
    ID: string;
    FirstName: string;
    LastName: string;
    Credentials?: string[];
    Address?: {
      StreetAddress: string;
      City: string;
      State: string;
      ZIP: string;
    };
  }>;
  Diagnoses?: Array<{
    Code: string;
    Codeset: 'ICD-9' | 'ICD-10' | 'SNOMED';
    Name: string;
  }>;
}

export interface RedoxMessage {
  Meta: {
    DataModel: string;
    EventType: string;
    EventDateTime: string;
    Test: boolean;
    Source: {
      ID: string;
      Name: string;
    };
    Destinations: Array<{
      ID: string;
      Name: string;
    }>;
    Message: {
      ID: number;
    };
    Transmission: {
      ID: number;
    };
    FacilityCode?: string;
  };
  Patient?: RedoxPatient;
  Visit?: RedoxVisit;
}

export default class RedoxService {
  private config: RedoxConfig;
  private baseUrl: string;

  constructor(config: RedoxConfig) {
    this.config = config;
    this.baseUrl = config.environment === 'production' 
      ? 'https://api.redoxengine.com' 
      : 'https://api.redoxengine.com/sandbox';
  }

  async authenticate(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: this.config.apiKey || 'sandbox-api-key',
          secret: this.config.secret || 'sandbox-secret',
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.accessToken;
    } catch (error) {
      console.error('Redox authentication error:', error);
      throw error;
    }
  }

  async sendMessage(message: RedoxMessage): Promise<any> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(`${this.baseUrl}/endpoint`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`Message send failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Redox message send error:', error);
      throw error;
    }
  }

  async queryPatient(patientId: string): Promise<RedoxPatient | null> {
    try {
      const token = await this.authenticate();
      
      const queryMessage: RedoxMessage = {
        Meta: {
          DataModel: 'PatientSearch',
          EventType: 'Query',
          EventDateTime: new Date().toISOString(),
          Test: this.config.environment === 'sandbox',
          Source: {
            ID: this.config.sourceId,
            Name: 'Flow AI',
          },
          Destinations: [{
            ID: this.config.destinationId,
            Name: 'EMR System',
          }],
          Message: {
            ID: Date.now(),
          },
          Transmission: {
            ID: Date.now(),
          },
        },
        Patient: {
          Identifiers: [{
            ID: patientId,
            IDType: 'MR',
          }],
          Demographics: {
            FirstName: '',
            LastName: '',
            DOB: '',
            Sex: 'Unknown',
          },
        },
      };

      const response = await this.sendMessage(queryMessage);
      return response.Patient || null;
    } catch (error) {
      console.error('Patient query error:', error);
      return null;
    }
  }

  async createAppointment(patient: RedoxPatient, visit: RedoxVisit): Promise<any> {
    try {
      const message: RedoxMessage = {
        Meta: {
          DataModel: 'Scheduling',
          EventType: 'New',
          EventDateTime: new Date().toISOString(),
          Test: this.config.environment === 'sandbox',
          Source: {
            ID: this.config.sourceId,
            Name: 'Flow AI',
          },
          Destinations: [{
            ID: this.config.destinationId,
            Name: 'EMR System',
          }],
          Message: {
            ID: Date.now(),
          },
          Transmission: {
            ID: Date.now(),
          },
        },
        Patient: patient,
        Visit: visit,
      };

      return await this.sendMessage(message);
    } catch (error) {
      console.error('Appointment creation error:', error);
      throw error;
    }
  }

  async updateAppointment(patient: RedoxPatient, visit: RedoxVisit): Promise<any> {
    try {
      const message: RedoxMessage = {
        Meta: {
          DataModel: 'Scheduling',
          EventType: 'Reschedule',
          EventDateTime: new Date().toISOString(),
          Test: this.config.environment === 'sandbox',
          Source: {
            ID: this.config.sourceId,
            Name: 'Flow AI',
          },
          Destinations: [{
            ID: this.config.destinationId,
            Name: 'EMR System',
          }],
          Message: {
            ID: Date.now(),
          },
          Transmission: {
            ID: Date.now(),
          },
        },
        Patient: patient,
        Visit: visit,
      };

      return await this.sendMessage(message);
    } catch (error) {
      console.error('Appointment update error:', error);
      throw error;
    }
  }

  async cancelAppointment(patient: RedoxPatient, visit: RedoxVisit): Promise<any> {
    try {
      const message: RedoxMessage = {
        Meta: {
          DataModel: 'Scheduling',
          EventType: 'Cancel',
          EventDateTime: new Date().toISOString(),
          Test: this.config.environment === 'sandbox',
          Source: {
            ID: this.config.sourceId,
            Name: 'Flow AI',
          },
          Destinations: [{
            ID: this.config.destinationId,
            Name: 'EMR System',
          }],
          Message: {
            ID: Date.now(),
          },
          Transmission: {
            ID: Date.now(),
          },
        },
        Patient: patient,
        Visit: visit,
      };

      return await this.sendMessage(message);
    } catch (error) {
      console.error('Appointment cancellation error:', error);
      throw error;
    }
  }

  async syncPatientData(patientId: string): Promise<RedoxPatient | null> {
    try {
      const patient = await this.queryPatient(patientId);
      if (patient) {
        // Store patient data in local database
        console.log('Patient data synced:', patient);
      }
      return patient;
    } catch (error) {
      console.error('Patient sync error:', error);
      return null;
    }
  }

  validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      console.error('Webhook signature validation error:', error);
      return false;
    }
  }

  processWebhookEvent(event: RedoxMessage): void {
    try {
      const { Meta, Patient, Visit } = event;
      
      console.log(`Processing Redox event: ${Meta.DataModel}.${Meta.EventType}`);
      
      switch (Meta.DataModel) {
        case 'PatientAdmin':
          this.processPatientAdminEvent(Meta.EventType, Patient, Visit);
          break;
        case 'Scheduling':
          this.processSchedulingEvent(Meta.EventType, Patient, Visit);
          break;
        case 'Clinical':
          this.processClinicalEvent(Meta.EventType, Patient, Visit);
          break;
        default:
          console.log(`Unhandled data model: ${Meta.DataModel}`);
      }
    } catch (error) {
      console.error('Webhook event processing error:', error);
    }
  }

  private processPatientAdminEvent(eventType: string, patient?: RedoxPatient, visit?: RedoxVisit): void {
    switch (eventType) {
      case 'Admission':
        console.log('Processing patient admission');
        break;
      case 'Discharge':
        console.log('Processing patient discharge');
        break;
      case 'Transfer':
        console.log('Processing patient transfer');
        break;
      default:
        console.log(`Unhandled patient admin event: ${eventType}`);
    }
  }

  private processSchedulingEvent(eventType: string, patient?: RedoxPatient, visit?: RedoxVisit): void {
    switch (eventType) {
      case 'New':
        console.log('Processing new appointment');
        break;
      case 'Reschedule':
        console.log('Processing appointment reschedule');
        break;
      case 'Cancel':
        console.log('Processing appointment cancellation');
        break;
      default:
        console.log(`Unhandled scheduling event: ${eventType}`);
    }
  }

  private processClinicalEvent(eventType: string, patient?: RedoxPatient, visit?: RedoxVisit): void {
    switch (eventType) {
      case 'New':
        console.log('Processing new clinical data');
        break;
      case 'Update':
        console.log('Processing clinical data update');
        break;
      default:
        console.log(`Unhandled clinical event: ${eventType}`);
    }
  }
}