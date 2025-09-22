import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useCreateCuratedKB, useDeleteCuratedKB } from "@/lib/launchpad.api";
import { Download, Trash2, FileText, Loader2, Eye, AlertCircle } from "lucide-react";
import { CuratedKBEntry } from "@/lib/launchpad.types";
import DocumentTextViewer from "@/components/launchpad/shared/DocumentTextViewer";

interface KnowledgeModuleProps {
  orgId?: number;
  curatedKb?: CuratedKBEntry[];
  curatedKbCount?: number;
}

export default function KnowledgeModule({ orgId, curatedKb, curatedKbCount }: KnowledgeModuleProps) {
  const { toast } = useToast();
  const [viewingDocument, setViewingDocument] = useState<CuratedKBEntry | null>(null);
  
  const createCuratedKB = useCreateCuratedKB(orgId);
  const deleteCuratedKB = useDeleteCuratedKB(orgId);

  const handleGenerate = async () => {
    if (!orgId) {
      toast({
        title: "Error",
        description: "Organization ID is required to generate knowledge base",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await createCuratedKB.mutateAsync();
      toast({
        title: "Success",
        description: response.message || "Knowledge base generated successfully",
      });
    } catch (error) {
      console.error('Failed to generate curated KB:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate knowledge base",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (url: string) => {
    if (!orgId) {
      toast({
        title: "Error",
        description: "Organization ID is required to delete knowledge base",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await deleteCuratedKB.mutateAsync(url);
      toast({
        title: "Success",
        description: response.message || "Knowledge base deleted successfully",
      });
    } catch (error) {
      console.error('Failed to delete curated KB:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete knowledge base",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (url: string) => {
    // Open the document URL in a new tab for download
    window.open(url, '_blank');
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
  const DocumentViewer = ({ document }: { document: CuratedKBEntry }) => {
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

  const isGenerating = createCuratedKB.isPending;
  const isDeleting = deleteCuratedKB.isPending;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>
          Curated Knowledge Base {curatedKbCount ? `(${curatedKbCount})` : ''}
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="default"
            onClick={handleGenerate}
            disabled={isGenerating || isDeleting || !orgId}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Knowledge Base"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-3">
        {curatedKb && curatedKb.length > 0 ? (
          curatedKb.map((document) => (
            <div key={document.s3_key} className="border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">{document.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(document.uploaded_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewingDocument(document)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(document.url)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(document.url)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              No knowledge base generated yet. Click "Generate Knowledge Base" to create a curated document based on your organization's data.
            </p>
          </div>
        )}
      </CardContent>

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
    </Card>
  );
}


