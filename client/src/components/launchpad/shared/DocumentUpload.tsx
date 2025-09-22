import React, { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Trash2, Eye, Loader2, AlertCircle } from "lucide-react";
import type { UploadedDocument } from "@/lib/launchpad.types";
import DocumentTextViewer from "./DocumentTextViewer";

interface DocumentUploadProps {
  title: string;
  documents: UploadedDocument[];
  onUpload: (file: File) => Promise<any>;
  onDelete: (url: string) => Promise<any>;
  isUploading?: boolean;
  isDeleting?: boolean;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  className?: string;
}

const DEFAULT_MAX_SIZE = 10; // 10MB
const DEFAULT_ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif'
];

export default function DocumentUpload({
  title,
  documents,
  onUpload,
  onDelete,
  isUploading = false,
  isDeleting = false,
  maxFileSize = DEFAULT_MAX_SIZE,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  className = ""
}: DocumentUploadProps) {
  const { toast } = useToast();
  const [dragOver, setDragOver] = useState(false);
  const [deleteUrl, setDeleteUrl] = useState<string | null>(null);
  const [viewingDocument, setViewingDocument] = useState<UploadedDocument | null>(null);

  // File validation
  const validateFile = (file: File): string | null => {
    // Check file size
    const maxSizeBytes = maxFileSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      const allowedExtensions = allowedTypes
        .map(type => {
          switch (type) {
            case 'application/pdf': return '.pdf';
            case 'application/msword': return '.doc';
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': return '.docx';
            case 'text/plain': return '.txt';
            case 'image/jpeg': return '.jpg';
            case 'image/png': return '.png';
            case 'image/gif': return '.gif';
            default: return type;
          }
        })
        .join(', ');
      return `File type not allowed. Allowed types: ${allowedExtensions}`;
    }

    return null;
  };

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: "Upload Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    try {
      await onUpload(file);
      toast({
        title: "Success",
        description: `${file.name} uploaded successfully`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    }
  }, [onUpload, toast, validateFile]);

  // Handle file input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset input value to allow uploading the same file again
    event.target.value = '';
  };

  // Handle drag and drop
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle delete
  const handleDelete = async (url: string) => {
    try {
      await onDelete(url);
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete document",
        variant: "destructive",
      });
    } finally {
      setDeleteUrl(null);
    }
  };

  // Extract filename from URL
  const getFileName = (url: string): string => {
    try {
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      // Remove timestamp prefix if present (e.g., "1758267408582-3d5a8933-213b-4b6a-98c4-b16ef96af4e2-flowai-test-doc.txt")
      const cleanName = filename.replace(/^\d+-[a-f0-9-]+-/, '');
      return cleanName || filename;
    } catch {
      return 'Unknown file';
    }
  };

  // Document type detection functions
  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const isImageFile = (filename: string): boolean => {
    const ext = getFileExtension(filename);
    return ['jpg', 'jpeg', 'png', 'gif'].includes(ext);
  };

  const isTextFile = (filename: string): boolean => {
    const ext = getFileExtension(filename);
    return ['txt'].includes(ext);
  };

  const isPdfFile = (filename: string): boolean => {
    const ext = getFileExtension(filename);
    return ['pdf'].includes(ext);
  };

  const isDocFile = (filename: string): boolean => {
    const ext = getFileExtension(filename);
    return ['doc', 'docx'].includes(ext);
  };

  // Document Viewer Component
  const DocumentViewer = ({ document }: { document: UploadedDocument }) => {
    const filename = getFileName(document.url);
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const [pdfError, setPdfError] = useState(false);
    
    if (isImageFile(filename)) {
      return (
        <div className="flex justify-center">
          {imageLoading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">Loading image...</span>
            </div>
          )}
          {imageError ? (
            <div className="text-center p-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">Failed to load image</p>
              <Button onClick={() => window.open(document.url, '_blank')}>
                Open in New Tab
              </Button>
            </div>
          ) : (
            <img 
              src={document.url} 
              alt={filename} 
              className={`max-w-full max-h-[60vh] object-contain ${imageLoading ? 'hidden' : ''}`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
          )}
        </div>
      );
    }
    
    if (isTextFile(filename)) {
      return <DocumentTextViewer url={document.url} filename={filename} />;
    }
    
    if (isPdfFile(filename)) {
      return (
        <div className="space-y-4">
          {pdfError ? (
            <div className="text-center p-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">Failed to load PDF</p>
              <Button onClick={() => window.open(document.url, '_blank')}>
                Open in New Tab
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm text-muted-foreground">PDF Document</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(document.url, '_blank')}
                >
                  Open in New Tab
                </Button>
              </div>
              <iframe 
                src={document.url} 
                className="w-full h-[60vh] border-0"
                title={filename}
                onError={() => setPdfError(true)}
              />
            </>
          )}
        </div>
      );
    }
    
    if (isDocFile(filename)) {
      // Use Microsoft Office Online viewer for DOC/DOCX files
      const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(document.url)}`;
      
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-sm text-muted-foreground">
              {getFileExtension(filename).toUpperCase()} Document
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(officeViewerUrl, '_blank')}
              >
                View in Office Online
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(document.url, '_blank')}
              >
                Download
              </Button>
            </div>
          </div>
          <iframe 
            src={officeViewerUrl}
            className="w-full h-[60vh] border-0"
            title={filename}
            onError={() => {
              console.error('Office viewer failed to load');
            }}
          />
        </div>
      );
    }
    
    // Fallback for other files
    return (
      <div className="text-center p-8">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-2 font-medium">{filename}</p>
        <p className="text-sm text-muted-foreground mb-4">
          This file type may not display properly in the browser.
        </p>
        <Button onClick={() => window.open(document.url, '_blank')}>
          Open in New Tab
        </Button>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            {isUploading ? 'Uploading...' : 'Drag and drop a file here, or click to select'}
          </p>
          <Input
            type="file"
            onChange={handleInputChange}
            disabled={isUploading}
            accept={allowedTypes.join(',')}
            className="hidden"
            id={`file-upload-${title.replace(/\s+/g, '-').toLowerCase()}`}
          />
          <Button
            variant="outline"
            disabled={isUploading}
            onClick={() => {
              const input = document.getElementById(`file-upload-${title.replace(/\s+/g, '-').toLowerCase()}`) as HTMLInputElement;
              input?.click();
            }}
          >
            {isUploading ? 'Uploading...' : 'Select File'}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Max size: {maxFileSize}MB • Allowed: PDF, DOC, DOCX, TXT, JPG, PNG, GIF
          </p>
        </div>

        {/* Documents List */}
        {documents.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Uploaded Documents</h4>
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.url}
                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/20"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{getFileName(doc.url)}</p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingDocument(doc)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteUrl(doc.url)}
                      disabled={isDeleting}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Viewer Modal */}
        <Dialog open={!!viewingDocument} onOpenChange={() => setViewingDocument(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>{viewingDocument && getFileName(viewingDocument.url)}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-auto">
              {viewingDocument && <DocumentViewer document={viewingDocument} />}
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteUrl} onOpenChange={() => setDeleteUrl(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Document</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this document? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteUrl && handleDelete(deleteUrl)}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
