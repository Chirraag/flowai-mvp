import express from 'express';
import {
  getPresignedUploadUrl,
  saveAuditDocumentMetadata,
  getAllAuditDocuments,
  getAuditDocumentById,
  updateAuditDocument,
  deleteAuditDocument,
  getAuditDocumentDownloadUrl
} from '../../services/auditDocumentService';

const router = express.Router();

// POST /api/v1/audit-documents/presign
router.post('/presign', async (req, res) => {
  try {
    const { fileName, fileType, framework } = req.body;
    if (!fileName || !fileType || !framework) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const { url, s3Key } = await getPresignedUploadUrl({ fileName, fileType, framework });
    res.json({ url, s3Key });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate presigned URL', details: err.message });
  }
});

// POST /api/v1/audit-documents/metadata
router.post('/metadata', async (req, res) => {
  try {
    const { framework, docType, description, s3Key, fileName, fileSize, fileType, uploadedBy } = req.body;
    if (!framework || !docType || !s3Key || !fileName || !fileSize || !fileType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const result = await saveAuditDocumentMetadata({ framework, docType, description, s3Key, fileName, fileSize, fileType, uploadedBy });
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save metadata', details: err.message });
  }
});

// GET /api/v1/audit-documents
router.get('/', async (req, res) => {
  try {
    const docs = await getAllAuditDocuments();
    res.json(docs);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch documents', details: err.message });
  }
});

// GET /api/v1/audit-documents/:id
router.get('/:id', async (req, res) => {
  try {
    const doc = await getAuditDocumentById(Number(req.params.id));
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch document', details: err.message });
  }
});

// GET /api/v1/audit-documents/:id/download
router.get('/:id/download', async (req, res) => {
  try {
    const url = await getAuditDocumentDownloadUrl(Number(req.params.id));
    if (!url) return res.status(404).json({ error: 'Not found' });
    res.json({ url });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate download URL', details: err.message });
  }
});

// PUT /api/v1/audit-documents/:id
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { framework, docType, description, status } = req.body;
    const result = await updateAuditDocument(id, { framework, docType, description, status });
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update document', details: err.message });
  }
});

// DELETE /api/v1/audit-documents/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await deleteAuditDocument(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete document', details: err.message });
  }
});

export default router; 