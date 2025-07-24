import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, CheckCircle, AlertTriangle, Clock, Eye, Calendar, Download, Upload, File, Archive, BarChart3, TrendingUp, Search, Filter, AlertCircle, Settings, Bell, RefreshCw, ExternalLink, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";

interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  compliant: boolean;
  status: "yes" | "no";
  lastAudit: string;
  nextAudit: string;
  controls: Control[];
}

interface Control {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "implemented" | "in-progress" | "not-implemented";
  riskLevel: "low" | "medium" | "high" | "critical";
  lastChecked: string;
  evidence: string[];
  owner: string;
}

export default function Audits() {
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesError, setFilesError] = useState("");
  const [downloading, setDownloading] = useState<{[fileId: string]: boolean}>({});
  const [deleting, setDeleting] = useState<{[fileId: string]: boolean}>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<number|null>(null);
  const [confirmDeleteFramework, setConfirmDeleteFramework] = useState<string|null>(null);
  
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [frameworks] = useState<ComplianceFramework[]>([
    {
      id: "hipaa",
      name: "HIPAA",
      description: "Health Insurance Portability and Accountability Act",
      compliant: true,
      status: "yes",
      lastAudit: "2024-05-15",
      nextAudit: "2024-11-15",
      controls: [
        {
          id: "hipaa-164.308",
          name: "Administrative Safeguards",
          description: "Assigned security responsibility, workforce training, information access management",
          category: "Administrative",
          status: "implemented",
          riskLevel: "high",
          lastChecked: "2024-06-10",
          evidence: ["Policy documents", "Training records", "Access logs"],
          owner: "Security Team"
        },
        {
          id: "hipaa-164.310",
          name: "Physical Safeguards",
          description: "Facility access controls, workstation use, device and media controls",
          category: "Physical",
          status: "implemented",
          riskLevel: "medium",
          lastChecked: "2024-06-08",
          evidence: ["Access control systems", "Security cameras", "Device inventory"],
          owner: "Facilities Team"
        },
        {
          id: "hipaa-164.312",
          name: "Technical Safeguards",
          description: "Access control, audit controls, integrity, person or entity authentication, transmission security",
          category: "Technical",
          status: "implemented",
          riskLevel: "critical",
          lastChecked: "2024-06-12",
          evidence: ["Authentication logs", "Encryption certificates", "Audit reports"],
          owner: "IT Security"
        }
      ]
    },
    {
      id: "soc2",
      name: "SOC 2 Type II",
      description: "Service Organization Control 2 Type II Audit",
      compliant: true,
      status: "yes",
      lastAudit: "2024-04-20",
      nextAudit: "2024-10-20",
      controls: [
        {
          id: "soc2-cc6.1",
          name: "Logical and Physical Access Controls",
          description: "Controls to restrict logical and physical access",
          category: "Security",
          status: "implemented",
          riskLevel: "high",
          lastChecked: "2024-06-01",
          evidence: ["Access control matrix", "Physical security assessments"],
          owner: "Security Team"
        },
        {
          id: "soc2-cc7.1",
          name: "System Operations",
          description: "System capacity, system monitoring, and data backup procedures",
          category: "Operations",
          status: "implemented",
          riskLevel: "medium",
          lastChecked: "2024-05-28",
          evidence: ["Monitoring dashboards", "Backup logs", "Capacity reports"],
          owner: "Operations Team"
        }
      ]
    },
    {
      id: "hitrust",
      name: "HITRUST CSF",
      description: "Health Information Trust Alliance Common Security Framework",
      compliant: false,
      status: "no",
      lastAudit: "2024-03-10",
      nextAudit: "2024-09-10",
      controls: [
        {
          id: "hitrust-01.a",
          name: "Information Security Management System",
          description: "Policies, procedures, and organizational structure for information security",
          category: "Management",
          status: "in-progress",
          riskLevel: "high",
          lastChecked: "2024-05-15",
          evidence: [],
          owner: "Compliance Team"
        }
      ]
    }
  ]);

  const [pendingUpload, setPendingUpload] = useState<{ [framework: string]: { file: File, docType: string, description: string } | null }>({});
  const [docTypeOptions] = useState([
    { value: "Audit Certificate", label: "Audit Certificate" },
    { value: "Policy/Procedure", label: "Policy/Procedure" },
    { value: "Audit Report/Findings", label: "Audit Report/Findings" },
    { value: "Remediation Doc", label: "Remediation Doc" },
    { value: "Supporting Evidence", label: "Supporting Evidence" },
    { value: "__other__", label: "Other (specify)" },
  ]);
  const [customDocType, setCustomDocType] = useState<{ [framework: string]: string }>({});
  const fileInputRefs = useRef<{ [framework: string]: HTMLInputElement | null }>({});
  const [uploading, setUploading] = useState<{ [framework: string]: boolean }>({});
  const [uploadError, setUploadError] = useState<{ [framework: string]: string }>({});
  const [uploadProgress, setUploadProgress] = useState<{ [framework: string]: number }>({});
  const { toast } = useToast();

  const [allFiles, setAllFiles] = useState<any[]>([]);

  // Add state to force file input reset per framework
  const [fileInputReset, setFileInputReset] = useState<{ [framework: string]: number }>({});

  // Fetch all files once on mount
  useEffect(() => {
    setFilesLoading(true);
    setFilesError("");
    fetch(`/api/v1/audit-documents`)
      .then(async res => {
        if (!res.ok) throw new Error('Failed to fetch files');
        const data = await res.json();
        setAllFiles(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        setFilesError(err.message || 'Failed to fetch files');
        setAllFiles([]);
      })
      .finally(() => {
        setFilesLoading(false);
      });
  }, []);

  const refetchFiles = () => {
    setFilesLoading(true);
    setFilesError("");
    fetch(`/api/v1/audit-documents`)
      .then(async res => {
        if (!res.ok) throw new Error('Failed to fetch files');
        const data = await res.json();
        setAllFiles(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        setFilesError(err.message || 'Failed to fetch files');
        setAllFiles([]);
      })
      .finally(() => {
        setFilesLoading(false);
      });
  };

  const handleDragOver = (e: React.DragEvent, framework: string) => {
    e.preventDefault();
    setDragOver(framework);
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, framework: string) => {
    e.preventDefault();
    setDragOver(null);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setPendingUpload(prev => ({
        ...prev,
        [framework]: { file: files[0], docType: "", description: "" }
      }));
    }
  };

  const handleDocTypeChange = (framework: string, value: string) => {
    setPendingUpload(prev => prev[framework] ? {
      ...prev,
      [framework]: { ...prev[framework]!, docType: value }
    } : prev);
    if (value !== "__other__") {
      setCustomDocType(prev => ({ ...prev, [framework]: "" }));
    }
  };

  const handleDescriptionChange = (framework: string, value: string) => {
    setPendingUpload(prev => prev[framework] ? {
      ...prev,
      [framework]: { ...prev[framework]!, description: value }
    } : prev);
  };

  const handleCustomDocTypeChange = (framework: string, value: string) => {
    setCustomDocType(prev => ({ ...prev, [framework]: value }));
  };

  const handleUpload = async (framework: string) => {
    const pending = pendingUpload[framework];
    if (!pending) return;
    setUploading(prev => ({ ...prev, [framework]: true }));
    setUploadError(prev => ({ ...prev, [framework]: "" }));
    setUploadProgress(prev => ({ ...prev, [framework]: 0 }));
    try {
      // 1. Get pre-signed URL
      const presignRes = await fetch('/api/v1/audit-documents/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: pending.file.name,
          fileType: pending.file.type,
          framework,
          docType: pending.docType === "__other__" ? (customDocType[framework] || "Other") : pending.docType,
          description: pending.description,
        }),
      });
      if (!presignRes.ok) throw new Error('Failed to get presigned URL');
      const { url, s3Key } = await presignRes.json();

      // 2. Upload file to S3
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', url);
        xhr.setRequestHeader('Content-Type', pending.file.type);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setUploadProgress(prev => ({ ...prev, [framework]: Math.round((event.loaded / event.total) * 100) }));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadProgress(prev => ({ ...prev, [framework]: 100 }));
            resolve(null);
          } else {
            reject(new Error('Failed to upload to S3'));
          }
        };
        xhr.onerror = () => reject(new Error('Failed to upload to S3'));
        xhr.send(pending.file);
      });

      // 3. Save metadata
      const metaRes = await fetch('/api/v1/audit-documents/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          framework,
          docType: pending.docType === "__other__" ? (customDocType[framework] || "Other") : pending.docType,
          description: pending.description,
          s3Key: s3Key || `mock/${pending.file.name}`,
          fileName: pending.file.name,
          fileSize: pending.file.size,
          fileType: pending.file.type,
        }),
      });
      if (!metaRes.ok) throw new Error('Failed to save metadata');

      // 4. Add to uploadedFiles and clear pending
      const docType = pending.docType === "__other__" ? (customDocType[framework] || "Other") : pending.docType;
      const newFile = {
        name: pending.file.name,
        type: pending.file.type,
        size: pending.file.size,
        uploadDate: new Date().toISOString().split('T')[0],
        category: docType || "General"
      };
      refetchFiles();
      toast({
        title: "Upload Successful",
        description: `${pending.file.name} uploaded successfully!`,
        variant: "default"
      });
      setPendingUpload(prev => ({ ...prev, [framework]: null }));
      setCustomDocType(prev => ({ ...prev, [framework]: "" }));
      setFileInputReset(prev => ({ ...prev, [framework]: (prev[framework] || 0) + 1 }));
    } catch (err: any) {
      setUploadError(prev => ({ ...prev, [framework]: err.message || 'Upload failed' }));
      toast({
        title: "Upload Failed",
        description: err.message || 'Upload failed',
        variant: "destructive"
      });
    } finally {
      setUploading(prev => ({ ...prev, [framework]: false }));
      setUploadProgress(prev => ({ ...prev, [framework]: 0 }));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <File className="h-4 w-4 text-red-500" />;
    if (type.includes('zip')) return <Archive className="h-4 w-4 text-blue-500" />;
    return <File className="h-4 w-4 text-gray-500" />;
  };

  const getStatusColor = (status: "implemented" | "in-progress" | "not-implemented") => {
    switch (status) {
      case "implemented": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-yellow-100 text-yellow-800";
      case "not-implemented": return "bg-red-100 text-red-800";
    }
  };

  const getRiskColor = (risk: "low" | "medium" | "high" | "critical") => {
    switch (risk) {
      case "low": return "bg-blue-100 text-blue-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "critical": return "bg-red-100 text-red-800";
    }
  };

  const handleFileChange = (framework: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Determine default description
      const fw = frameworks.find(fw => fw.id === framework);
      const defaultDesc = fw ? `This is a ${fw.name} compliance document.` : '';
      setPendingUpload(prev => {
        const prevDesc = prev[framework]?.description || '';
        // Only set if description is empty or matches a previous default
        const shouldSetDefault =
          prevDesc.trim() === '' ||
          prevDesc === `This is a HIPAA compliance document.` ||
          prevDesc === `This is a SOC 2 Type II compliance document.` ||
          prevDesc === `This is a HITRUST CSF compliance document.`;
        return {
          ...prev,
          [framework]: {
            file: files[0],
            docType: '',
            description: shouldSetDefault ? defaultDesc : prevDesc,
          },
        };
      });
    }
  };

  const handleRemoveFile = (framework: string) => {
    setPendingUpload(prev => ({ ...prev, [framework]: null }));
    setFileInputReset(prev => ({ ...prev, [framework]: (prev[framework] || 0) + 1 }));
  };

  // Download handler
  const handleDownload = async (fileId: number) => {
    setDownloading(prev => ({ ...prev, [fileId]: true }));
    try {
      const res = await fetch(`/api/v1/audit-documents/${fileId}/download`);
      if (!res.ok) throw new Error('Failed to get download URL');
      const { url } = await res.json();
      window.open(url, '_blank');
    } catch (err: any) {
      toast({
        title: "Download Failed",
        description: err.message || 'Download failed',
        variant: "destructive"
      });
    } finally {
      setDownloading(prev => ({ ...prev, [fileId]: false }));
    }
  };

  const handleDelete = (fileId: number, frameworkId: string) => {
    setConfirmDeleteId(fileId);
    setConfirmDeleteFramework(frameworkId);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    setDeleting(prev => ({ ...prev, [confirmDeleteId]: true }));
    try {
      const res = await fetch(`/api/v1/audit-documents/${confirmDeleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete file');
      toast({ title: 'File Deleted', description: 'The file was deleted successfully.' });
      setConfirmDeleteId(null);
      setConfirmDeleteFramework(null);
      refetchFiles();
    } catch (err: any) {
      toast({ title: 'Delete Failed', description: err.message || 'Delete failed', variant: 'destructive' });
    } finally {
      setDeleting(prev => ({ ...prev, [confirmDeleteId!]: false }));
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
    setConfirmDeleteFramework(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Management</h1>
          <p className="text-gray-600 mt-2">Manage compliance audits, evidence collection, and documentation</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Audit
          </Button>
        </div>
      </div>

      {/* Compliance Frameworks Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {frameworks.map((framework) => {
          const filteredFiles = allFiles.filter(file => file.framework === framework.id);
          return (
            <Card key={framework.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{framework.name}</CardTitle>
                  <Badge variant={framework.compliant ? "default" : "destructive"}>
                    {framework.compliant ? "Compliant" : "Non-Compliant"}
                  </Badge>
                </div>
                <CardDescription>{framework.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Audit:</span>
                    <span>{framework.lastAudit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Next Audit:</span>
                    <span>{framework.nextAudit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Controls:</span>
                    <span>{framework.controls.length} implemented</span>
                  </div>
                  <Progress 
                    value={framework.compliant ? 100 : 75} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Document Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Documentation</CardTitle>
          <CardDescription>Upload and manage audit-related documents and evidence</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {frameworks.map((framework) => {
              const filteredFiles = allFiles.filter(file => file.framework === framework.id);
              return (
                <div key={framework.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">{framework.name} Documentation</h3>
                    <Badge variant="outline">{filteredFiles.length} files</Badge>
                  </div>
                  
                  {/* Drag and Drop Zone */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragOver === framework.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={uploading[framework.id] ? undefined : (e) => handleDragOver(e, framework.id)}
                    onDragLeave={uploading[framework.id] ? undefined : handleDragLeave}
                    onDrop={uploading[framework.id] ? undefined : (e) => handleDrop(e, framework.id)}
                    onClick={uploading[framework.id] ? undefined : () => {
                      if (!pendingUpload[framework.id]) {
                        if (!fileInputRefs.current[framework.id]) return;
                        fileInputRefs.current[framework.id]?.click();
                      }
                    }}
                    style={pendingUpload[framework.id] ? { cursor: 'default', opacity: uploading[framework.id] ? 0.6 : 1, pointerEvents: uploading[framework.id] ? 'none' : undefined } : { cursor: 'pointer', opacity: uploading[framework.id] ? 0.6 : 1, pointerEvents: uploading[framework.id] ? 'none' : undefined }}
                  >
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Drag and drop files here, or <Button variant="link" className="p-0 h-auto" type="button" onClick={e => { e.stopPropagation(); fileInputRefs.current[framework.id]?.click(); }}>browse</Button>
                    </p>
                    <input
                      key={fileInputReset[framework.id] || 0}
                      type="file"
                      accept=".pdf,.doc,.docx,.zip"
                      className="hidden"
                      ref={el => fileInputRefs.current[framework.id] = el}
                      onChange={e => handleFileChange(framework.id, e)}
                      tabIndex={-1}
                    />
                    {/* Show selected file if present */}
                    {pendingUpload[framework.id]?.file && (
                      <div className="mt-4 text-left">
                        <div className="flex items-center text-sm">
                          <span className="font-semibold mr-2">Selected File:</span>
                          {getFileIcon(pendingUpload[framework.id]?.file.name || "")}
                          <span className="ml-1">{pendingUpload[framework.id]?.file.name} ({pendingUpload[framework.id]?.file.size ? (pendingUpload[framework.id]!.file.size/1024/1024).toFixed(2) : "0.00"} MB)</span>
                          <button
                            type="button"
                            className="ml-2 text-gray-400 hover:text-red-500 text-lg"
                            title="Remove file"
                            onClick={e => { e.stopPropagation(); handleRemoveFile(framework.id); }}
                            disabled={uploading[framework.id]}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    {/* Show input fields if a file is pending upload for this framework */}
                    {pendingUpload[framework.id]?.file && (
                      <div className="mt-4 text-left space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Framework</label>
                          <Input value={framework.name} disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Document Type <span className="text-red-500">*</span></label>
                          <Select value={pendingUpload[framework.id]?.docType} onValueChange={val => handleDocTypeChange(framework.id, val)} disabled={uploading[framework.id]}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Document Type" />
                            </SelectTrigger>
                            <SelectContent>
                              {docTypeOptions.map(dt => (
                                <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {pendingUpload[framework.id]?.docType === "__other__" && (
                            <Input
                              className="mt-2"
                              placeholder="Enter custom document type"
                              value={customDocType[framework.id] || ""}
                              onChange={e => handleCustomDocTypeChange(framework.id, e.target.value)}
                              disabled={uploading[framework.id]}
                            />
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Description</label>
                          <Input
                            placeholder="Add a description"
                            value={pendingUpload[framework.id]?.description}
                            onChange={e => handleDescriptionChange(framework.id, e.target.value)}
                            disabled={uploading[framework.id]}
                          />
                        </div>
                        {uploadError[framework.id] && (
                          <div className="text-red-500 text-sm mb-2">{uploadError[framework.id]}</div>
                        )}
                        {uploading[framework.id] && (
                          <div className="w-full my-2">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-2 bg-blue-500 transition-all duration-200" style={{ width: `${uploadProgress[framework.id] || 0}%` }} />
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Uploading... {uploadProgress[framework.id] || 0}%</div>
                          </div>
                        )}
                        <div>
                          <Button
                            className="w-full"
                            disabled={
                              uploading[framework.id] ||
                              !pendingUpload[framework.id]?.docType ||
                              (pendingUpload[framework.id]?.docType === "__other__" && !(customDocType[framework.id] || "").trim())
                            }
                            onClick={() => handleUpload(framework.id)}
                          >
                            {uploading[framework.id] ? 'Uploading...' : 'Upload'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Uploaded Files */}
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Uploaded Files</h4>
                    {filesLoading ? (
                      <div className="text-gray-400 text-center py-8 flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <span>Loading files...</span>
                      </div>
                    ) : filesError ? (
                      <div className="text-red-500 text-center py-8">{filesError}</div>
                    ) : filteredFiles.length > 0 ? (
                      <div className="space-y-2">
                        {filteredFiles.map((file, index) => (
                          <div key={file.id || index} className="flex flex-col p-2 bg-gray-50 rounded mb-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {getFileIcon(file.fileName || file.fileType)}
                                <span className="text-sm font-medium">
                                  {file.fileName}
                                </span>
                                {file.docType && (
                                  <Badge variant="outline">{file.docType}</Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => handleDownload(file.id)} disabled={downloading[file.id]}>
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(file.id, framework.id)} disabled={deleting[file.id]}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {(file.docType || file.fileSize || file.description || file.uploadedAt) && (
                              <div className="text-xs text-gray-500 flex items-center flex-wrap gap-x-1 gap-y-1">
                                {file.description && (
                                  <span>{file.description}</span>
                                )}
                                {file.fileSize && (
                                  <span>| {((file.fileSize) / 1024 / 1024).toFixed(2)} MB</span>
                                )}
                                {file.uploadedAt && (
                                  <span>| {new Date(file.uploadedAt).toLocaleString()}</span>
                                )}
                                
                                
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-center py-8 flex flex-col items-center justify-center">
                        <span className="flex items-center justify-center mb-2">
                          <Search className="h-6 w-6 mr-2" />
                          <span>
                            {framework.id === 'hipaa' && 'No HIPAA compliance documents found.'}
                            {framework.id === 'soc2' && 'No SOC 2 audit files found.'}
                            {framework.id === 'hitrust' && 'No HITRUST documents uploaded.'}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Audit Controls Detail */}
      <Card>
        <CardHeader>
          <CardTitle>Control Implementation Status</CardTitle>
          <CardDescription>Detailed view of security controls and their implementation status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {frameworks.map((framework) => (
              <div key={framework.id}>
                <h3 className="font-semibold mb-3">{framework.name} Controls</h3>
                <div className="space-y-3">
                  {framework.controls.map((control) => (
                    <Card key={control.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{control.name}</h4>
                              <Badge className={getStatusColor(control.status)}>
                                {control.status.replace('-', ' ')}
                              </Badge>
                              <Badge className={getRiskColor(control.riskLevel)}>
                                {control.riskLevel}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{control.description}</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Category:</span> {control.category}
                              </div>
                              <div>
                                <span className="font-medium">Owner:</span> {control.owner}
                              </div>
                              <div>
                                <span className="font-medium">Last Checked:</span> {control.lastChecked}
                              </div>
                              <div>
                                <span className="font-medium">Evidence:</span> {control.evidence.length} items
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!confirmDeleteId} onOpenChange={cancelDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this file? This action cannot be undone.</div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting[confirmDeleteId!]}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}