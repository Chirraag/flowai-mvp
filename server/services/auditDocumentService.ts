import { PutObjectCommand, S3Client, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { db } from '../db';
import { auditDocuments } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET = process.env.AWS_S3_BUCKET!;

export async function getPresignedUploadUrl({
  fileName,
  fileType,
  framework,
}: {
  fileName: string;
  fileType: string;
  framework: string;
}) {
  const s3Key = `audit-documents/${framework}/${Date.now()}_${fileName}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: s3Key,
    ContentType: fileType,
  });
  const url = await getSignedUrl(s3, command, { expiresIn: 600 });
  return { url, s3Key };
}

export async function saveAuditDocumentMetadata({
  framework,
  docType,
  description,
  s3Key,
  fileName,
  fileSize,
  fileType,
  uploadedBy,
}: {
  framework: string;
  docType: string;
  description?: string;
  s3Key: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy?: string;
}) {
  return db.insert(auditDocuments).values({
    framework,
    docType,
    description,
    s3Key,
    fileName,
    fileSize,
    fileType,
    uploadedBy,
    status: 'uploaded',
  });
}

export async function getAllAuditDocuments() {
  return db.select().from(auditDocuments).orderBy(desc(auditDocuments.uploadedAt));
}

export async function getAuditDocumentById(id: number) {
  const [doc] = await db.select().from(auditDocuments).where(eq(auditDocuments.id, id));
  return doc;
}

export async function updateAuditDocument(id: number, data: Partial<{ framework: string; docType: string; description: string; status: string; }>) {
  return db.update(auditDocuments).set(data).where(eq(auditDocuments.id, id));
}

export async function deleteAuditDocument(id: number) {
  // Get the document to find the S3 key
  const [doc] = await db.select().from(auditDocuments).where(eq(auditDocuments.id, id));
  if (doc && doc.s3Key) {
    // Delete from S3 (optional, implement error handling as needed)
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: doc.s3Key }));
  }
  // Delete from DB
  return db.delete(auditDocuments).where(eq(auditDocuments.id, id));
}

export async function getAuditDocumentDownloadUrl(id: number) {
  const doc = await getAuditDocumentById(id);
  if (!doc || !doc.s3Key) return null;
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: doc.s3Key,
  });
  const url = await getSignedUrl(s3, command, { expiresIn: 300 });
  return url;
} 