import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
// HIPAA compliance utilities - audit logging handled internally

// HIPAA Compliance Middleware
export interface HIPAARequest extends Request {
  hipaaLog?: {
    accessedPHI: boolean;
    dataTypes: string[];
    purpose: string;
    userId: string;
    sessionId: string;
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
  };
}

// Data Classification for HIPAA
export enum DataClassification {
  PHI = 'PHI',           // Protected Health Information
  PII = 'PII',           // Personally Identifiable Information
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  TECHNICAL = 'TECHNICAL'
}

// Audit logging for HIPAA compliance
export function hipaaAuditLog(dataTypes: string[], purpose: string) {
  return async (req: HIPAARequest, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any)?.id || 'anonymous';
      const sessionId = (req as any).sessionID || crypto.randomUUID();
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';

      // Create HIPAA compliance log entry
      req.hipaaLog = {
        accessedPHI: dataTypes.includes(DataClassification.PHI),
        dataTypes,
        purpose,
        userId,
        sessionId,
        ipAddress,
        userAgent,
        timestamp: new Date()
      };

      // Log HIPAA access for compliance
      console.log(`[HIPAA] Data access logged: ${purpose} - ${dataTypes.join(', ')} by user ${userId} from ${ipAddress}`);

      next();
    } catch (error) {
      console.error('HIPAA audit logging error:', error);
      res.status(500).json({ message: 'Security audit failure' });
    }
  };
}

// Data encryption middleware for PHI
export function encryptPHI(req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json;
  
  res.json = function(data: any) {
    if (data && typeof data === 'object') {
      // Encrypt sensitive fields
      data = encryptSensitiveFields(data);
    }
    return originalJson.call(this, data);
  };
  
  next();
}

// SOC2 Type II compliance middleware
export function soc2Compliance(req: Request, res: Response, next: NextFunction) {
  // Add SOC2 security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  
  // Log security event for compliance
  console.log(`[SOC2] Security compliance applied to ${req.method} ${req.path}`);
  
  next();
}

// Data masking for minimum necessary access
export function maskPHI(req: Request, res: Response, next: NextFunction) {
  const userRole = (req.user as any)?.role || 'user';
  const originalJson = res.json;
  
  res.json = function(data: any) {
    if (data && typeof data === 'object') {
      if (userRole !== 'admin' && userRole !== 'clinical_staff') {
        data = maskSensitiveData(data);
      }
    }
    return originalJson.call(this, data);
  };
  
  next();
}

// Helper functions
function encryptSensitiveFields(data: any): any {
  const sensitiveFields = ['ssn', 'medicalRecordNumber', 'insuranceMemberNumber', 'phone', 'email'];
  const encryptionKey = process.env.PHI_ENCRYPTION_KEY || 'hipaa-compliant-key-2024';
  
  if (Array.isArray(data)) {
    return data.map(item => encryptSensitiveFields(item));
  }
  
  if (data && typeof data === 'object') {
    const encrypted = { ...data };
    
    for (const field of sensitiveFields) {
      if (encrypted[field] && typeof encrypted[field] === 'string') {
        encrypted[field] = encryptField(encrypted[field], encryptionKey);
      }
    }
    
    return encrypted;
  }
  
  return data;
}

function maskSensitiveData(data: any): any {
  const sensitiveFields = ['ssn', 'medicalRecordNumber', 'phone', 'email'];
  
  if (Array.isArray(data)) {
    return data.map(item => maskSensitiveData(item));
  }
  
  if (data && typeof data === 'object') {
    const masked = { ...data };
    
    for (const field of sensitiveFields) {
      if (masked[field]) {
        masked[field] = maskField(masked[field]);
      }
    }
    
    return masked;
  }
  
  return data;
}

function encryptField(value: string, key: string): string {
  try {
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `enc:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    return value;
  }
}

function maskField(value: string): string {
  if (typeof value !== 'string') return value;
  
  if (value.includes('@')) {
    const [local, domain] = value.split('@');
    return `${local.substring(0, 2)}***@${domain}`;
  } else if (value.length > 4) {
    return `${value.substring(0, 2)}***${value.substring(value.length - 2)}`;
  }
  
  return '***';
}

// Business Associate Agreement validation
export function validateBAA(req: Request, res: Response, next: NextFunction) {
  const baaHeader = req.headers['x-baa-agreement'];
  const requiredBAA = process.env.REQUIRED_BAA_VERSION || 'v2024.1';
  
  if (!baaHeader || baaHeader !== requiredBAA) {
    return res.status(403).json({
      message: 'Business Associate Agreement validation required',
      requiredVersion: requiredBAA
    });
  }
  
  next();
}