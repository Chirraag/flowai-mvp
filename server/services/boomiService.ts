export interface BoomiConfig {
  accountId: string;
  username: string;
  password: string;
  environment: 'test' | 'production';
  baseUrl?: string;
}

export interface BoomiProcess {
  processId: string;
  componentId: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  lastExecuted?: string;
}

export interface BoomiExecution {
  executionId: string;
  processId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  inputRecords: number;
  outputRecords: number;
  errorCount: number;
  logs?: string[];
}

export interface BoomiConnection {
  connectionId: string;
  name: string;
  connectorType: 'database' | 'http' | 'ftp' | 'sftp' | 'email' | 'salesforce' | 'workday';
  status: 'active' | 'inactive' | 'error';
  lastTested?: string;
}

export interface BoomiDataMapping {
  mappingId: string;
  sourcePath: string;
  targetPath: string;
  transformation?: string;
  required: boolean;
}

export default class BoomiService {
  private config: BoomiConfig;
  private baseUrl: string;
  private authToken?: string;

  constructor(config: BoomiConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 
      (config.environment === 'production' 
        ? 'https://api.boomi.com/api/rest/v1' 
        : 'https://api.boomi.com/api/rest/v1/test');
  }

  async authenticate(): Promise<string> {
    try {
      const credentials = Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64');
      
      const response = await fetch(`${this.baseUrl}/${this.config.accountId}/login`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Boomi authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.authToken = data.sessionId || 'boomi-session-token';
      return this.authToken;
    } catch (error) {
      console.error('Boomi authentication error:', error);
      throw error;
    }
  }

  private async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.authToken) {
      await this.authenticate();
    }

    const response = await fetch(`${this.baseUrl}/${this.config.accountId}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, re-authenticate
        await this.authenticate();
        return this.makeAuthenticatedRequest(endpoint, options);
      }
      throw new Error(`Boomi API error: ${response.statusText}`);
    }

    return await response.json();
  }

  async getProcesses(): Promise<BoomiProcess[]> {
    try {
      const data = await this.makeAuthenticatedRequest('/processes');
      
      return data.processes?.map((process: any) => ({
        processId: process.id,
        componentId: process.componentId,
        name: process.name,
        description: process.description,
        status: process.deployed ? 'active' : 'inactive',
        lastExecuted: process.lastExecuted
      })) || [];
    } catch (error) {
      console.error('Error fetching Boomi processes:', error);
      return [];
    }
  }

  async executeProcess(processId: string, inputData: any): Promise<BoomiExecution> {
    try {
      const executionData = {
        processId,
        inputData: Array.isArray(inputData) ? inputData : [inputData],
        executionOptions: {
          async: true,
          trackingEnabled: true
        }
      };

      const result = await this.makeAuthenticatedRequest('/executions', {
        method: 'POST',
        body: JSON.stringify(executionData),
      });

      return {
        executionId: result.executionId || `exec-${Date.now()}`,
        processId,
        status: 'running',
        startTime: new Date().toISOString(),
        inputRecords: Array.isArray(inputData) ? inputData.length : 1,
        outputRecords: 0,
        errorCount: 0
      };
    } catch (error) {
      console.error('Error executing Boomi process:', error);
      throw error;
    }
  }

  async getExecutionStatus(executionId: string): Promise<BoomiExecution> {
    try {
      const data = await this.makeAuthenticatedRequest(`/executions/${executionId}`);
      
      return {
        executionId: data.executionId,
        processId: data.processId,
        status: data.status || 'completed',
        startTime: data.startTime,
        endTime: data.endTime,
        inputRecords: data.inputRecords || 1,
        outputRecords: data.outputRecords || 1,
        errorCount: data.errorCount || 0,
        logs: data.logs || []
      };
    } catch (error) {
      console.error('Error fetching execution status:', error);
      throw error;
    }
  }

  async getConnections(): Promise<BoomiConnection[]> {
    try {
      const data = await this.makeAuthenticatedRequest('/connections');
      
      return data.connections?.map((conn: any) => ({
        connectionId: conn.id,
        name: conn.name,
        connectorType: conn.connectorType,
        status: conn.status === 'OK' ? 'active' : 'error',
        lastTested: conn.lastTested
      })) || [];
    } catch (error) {
      console.error('Error fetching Boomi connections:', error);
      return [];
    }
  }

  async testConnection(connectionId: string): Promise<{ success: boolean; message: string; latency?: number }> {
    try {
      const startTime = Date.now();
      
      await this.makeAuthenticatedRequest(`/connections/${connectionId}/test`, {
        method: 'POST',
      });
      
      const latency = Date.now() - startTime;
      
      return {
        success: true,
        message: 'Connection test successful',
        latency
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection test failed: ${error.message}`
      };
    }
  }

  async syncPatientData(patients: any[]): Promise<BoomiExecution> {
    try {
      const patientSyncProcess = 'patient-sync-process-id';
      
      const transformedData = patients.map(patient => ({
        externalId: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        phone: patient.phone,
        email: patient.email,
        address: patient.address,
        insuranceInfo: patient.insuranceInfo,
        medicalRecordNumber: patient.medicalRecordNumber,
        syncTimestamp: new Date().toISOString()
      }));

      return await this.executeProcess(patientSyncProcess, transformedData);
    } catch (error) {
      console.error('Error syncing patient data:', error);
      throw error;
    }
  }

  async syncAppointmentData(appointments: any[]): Promise<BoomiExecution> {
    try {
      const appointmentSyncProcess = 'appointment-sync-process-id';
      
      const transformedData = appointments.map(appointment => ({
        externalId: appointment.id,
        patientId: appointment.patientId,
        providerId: appointment.providerId,
        appointmentDateTime: appointment.dateTime,
        appointmentType: appointment.type,
        status: appointment.status,
        location: appointment.location,
        notes: appointment.notes,
        syncTimestamp: new Date().toISOString()
      }));

      return await this.executeProcess(appointmentSyncProcess, transformedData);
    } catch (error) {
      console.error('Error syncing appointment data:', error);
      throw error;
    }
  }

  async syncProviderData(providers: any[]): Promise<BoomiExecution> {
    try {
      const providerSyncProcess = 'provider-sync-process-id';
      
      const transformedData = providers.map(provider => ({
        externalId: provider.id,
        firstName: provider.firstName,
        lastName: provider.lastName,
        npi: provider.npi,
        specialty: provider.specialty,
        department: provider.department,
        phone: provider.phone,
        email: provider.email,
        address: provider.address,
        credentials: provider.credentials,
        syncTimestamp: new Date().toISOString()
      }));

      return await this.executeProcess(providerSyncProcess, transformedData);
    } catch (error) {
      console.error('Error syncing provider data:', error);
      throw error;
    }
  }

  async createDataMapping(sourcePath: string, targetPath: string, transformation?: string): Promise<BoomiDataMapping> {
    try {
      const mappingData = {
        sourcePath,
        targetPath,
        transformation,
        required: true,
        createdAt: new Date().toISOString()
      };

      const result = await this.makeAuthenticatedRequest('/mappings', {
        method: 'POST',
        body: JSON.stringify(mappingData),
      });

      return {
        mappingId: result.mappingId || `mapping-${Date.now()}`,
        sourcePath,
        targetPath,
        transformation,
        required: true
      };
    } catch (error) {
      console.error('Error creating data mapping:', error);
      throw error;
    }
  }

  async getDataMappings(processId: string): Promise<BoomiDataMapping[]> {
    try {
      const data = await this.makeAuthenticatedRequest(`/processes/${processId}/mappings`);
      
      return data.mappings?.map((mapping: any) => ({
        mappingId: mapping.id,
        sourcePath: mapping.sourcePath,
        targetPath: mapping.targetPath,
        transformation: mapping.transformation,
        required: mapping.required
      })) || [];
    } catch (error) {
      console.error('Error fetching data mappings:', error);
      return [];
    }
  }

  async deployProcess(processId: string, environment: 'test' | 'production'): Promise<{ success: boolean; deploymentId: string }> {
    try {
      const deploymentData = {
        processId,
        environment,
        deploymentOptions: {
          autoStart: true,
          validateConnections: true
        }
      };

      const result = await this.makeAuthenticatedRequest('/deployments', {
        method: 'POST',
        body: JSON.stringify(deploymentData),
      });

      return {
        success: true,
        deploymentId: result.deploymentId || `deploy-${Date.now()}`
      };
    } catch (error) {
      console.error('Error deploying Boomi process:', error);
      return {
        success: false,
        deploymentId: ''
      };
    }
  }

  async getExecutionLogs(executionId: string): Promise<string[]> {
    try {
      const data = await this.makeAuthenticatedRequest(`/executions/${executionId}/logs`);
      return data.logs || [];
    } catch (error) {
      console.error('Error fetching execution logs:', error);
      return [];
    }
  }

  async scheduleProcess(processId: string, schedule: string): Promise<{ success: boolean; scheduleId: string }> {
    try {
      const scheduleData = {
        processId,
        schedule, // Cron expression
        enabled: true,
        timezone: 'UTC'
      };

      const result = await this.makeAuthenticatedRequest('/schedules', {
        method: 'POST',
        body: JSON.stringify(scheduleData),
      });

      return {
        success: true,
        scheduleId: result.scheduleId || `schedule-${Date.now()}`
      };
    } catch (error) {
      console.error('Error scheduling Boomi process:', error);
      return {
        success: false,
        scheduleId: ''
      };
    }
  }

  async getHealthStatus(): Promise<{ status: string; version: string; uptime: string }> {
    try {
      const data = await this.makeAuthenticatedRequest('/health');
      
      return {
        status: data.status || 'healthy',
        version: data.version || '1.0.0',
        uptime: data.uptime || '99.9%'
      };
    } catch (error) {
      console.error('Error fetching Boomi health status:', error);
      return {
        status: 'error',
        version: 'unknown',
        uptime: 'unknown'
      };
    }
  }

  async createWebhook(url: string, events: string[]): Promise<{ webhookId: string; secret: string }> {
    try {
      const webhookData = {
        url,
        events,
        enabled: true,
        secret: `boomi-webhook-${Date.now()}`
      };

      const result = await this.makeAuthenticatedRequest('/webhooks', {
        method: 'POST',
        body: JSON.stringify(webhookData),
      });

      return {
        webhookId: result.webhookId || `webhook-${Date.now()}`,
        secret: webhookData.secret
      };
    } catch (error) {
      console.error('Error creating Boomi webhook:', error);
      throw error;
    }
  }
}