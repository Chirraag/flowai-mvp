import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useCreateCuratedKB, useDeleteCuratedKB } from "@/lib/launchpad.api";
import { Download, Trash2, FileText, Loader2, Eye, AlertCircle, X } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState('');

  // Scroll-aware header state
  const [isScrolled, setIsScrolled] = useState(false);
  
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
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-red-600 mb-4">Failed to load image</p>
              <Button
                onClick={() => window.open(document.url, '_blank')}
                className="bg-[#f49024] hover:bg-[#d87f1f] text-white focus:ring-2 focus:ring-[#fef08a] focus:ring-offset-2"
              >
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
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-red-600 mb-4">Failed to load PDF</p>
              <Button
                onClick={() => window.open(document.url, '_blank')}
                className="bg-[#f49024] hover:bg-[#d87f1f] text-white focus:ring-2 focus:ring-[#fef08a] focus:ring-offset-2"
              >
                Open in New Tab
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-sm text-[#1C275E] font-medium">PDF Document</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(document.url, '_blank')}
                  className="bg-transparent text-[#1C275E] border-[#BEC4DB] hover:bg-[#1C275E]/10 focus-visible:ring-2 focus-visible:ring-[#0d9488]/20 focus-visible:outline-none"
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
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-sm text-[#1C275E] font-medium">
              {getFileExtension(filename).toUpperCase()} Document
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(officeViewerUrl, '_blank')}
                className="bg-transparent text-[#1C275E] border-[#BEC4DB] hover:bg-[#1C275E]/10 focus-visible:ring-2 focus-visible:ring-[#0d9488]/20 focus-visible:outline-none"
              >
                View in Office Online
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(document.url, '_blank')}
                className="bg-[#f49024] hover:bg-[#d87f1f] text-white focus:ring-2 focus:ring-[#fef08a] focus:ring-offset-2"
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
        <div className="w-10 h-10 bg-[#F48024]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
          <FileText className="h-5 w-5 text-[#F48024]" />
        </div>
        <p className="text-[#1C275E] mb-2 font-medium">{filename}</p>
        <p className="text-sm text-muted-foreground mb-4">
          This file type may not display properly in the browser.
        </p>
        <Button
          onClick={() => window.open(document.url, '_blank')}
          className="bg-[#f49024] hover:bg-[#d87f1f] text-white focus:ring-2 focus:ring-[#fef08a] focus:ring-offset-2"
        >
          Open in New Tab
        </Button>
      </div>
    );
  };

  // Filter documents based on search term
  const filteredDocuments = React.useMemo(() => {
    if (!curatedKb) return [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return curatedKb;
    return curatedKb.filter(doc => 
      doc.name.toLowerCase().includes(term)
    );
  }, [curatedKb, searchTerm]);

  const isGenerating = createCuratedKB.isPending;
  const isDeleting = deleteCuratedKB.isPending;

  // Scroll detection effect for header styling
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl transition-shadow duration-200 hover:shadow-md">
      <CardHeader className={`sticky top-0 z-50 bg-[#1C275E] text-white border-b border-[#1C275E]/20 shadow-sm rounded-t-2xl transition-all duration-300 ${
        isScrolled
          ? 'p-2 shadow-lg shadow-black/10'
          : 'p-3 shadow-sm'
      }`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#F48024]/20 rounded-xl flex items-center justify-center">
              <svg
                className="w-4.5 h-4.5 text-[#F48024]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
            </div>
            <CardTitle className="text-lg font-semibold tracking-tight">
              Curated Knowledge Base {curatedKbCount ? `(${curatedKbCount})` : ''}
            </CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex items-center">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search documents..."
                aria-label="Search documents"
                className="h-10 w-[160px] sm:w-[220px] md:w-[280px] bg-white text-[#1C275E] placeholder:text-[#1C275E]/60 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 pr-10 transition"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
                  aria-label="Clear documents search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Button
              variant="default"
              onClick={handleGenerate}
              disabled={isGenerating || isDeleting || !orgId}
              className="bg-[#f49024] hover:bg-[#d87f1f] text-white focus:ring-2 focus:ring-[#fef08a] focus:ring-offset-2"
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
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {curatedKb && curatedKb.length > 0 && filteredDocuments.length > 0 ? (
          filteredDocuments.map((document) => (
            <Card key={document.s3_key} className="border border-slate-200/70 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] focus-within:shadow-md focus-within:-translate-y-[1px]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 bg-[#F48024]/20 rounded-xl flex items-center justify-center">
                      <FileText className="h-4.5 w-4.5 text-[#F48024]" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-[#1C275E]">{document.name}</p>
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
                      className="bg-white text-[#1C275E] border-[#BEC4DB] hover:bg-[#1C275E]/10 focus-visible:ring-2 focus-visible:ring-[#0d9488]/20 focus-visible:outline-none"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(document.url)}
                      className="bg-transparent text-[#1C275E] border-[#BEC4DB] hover:bg-[#1C275E]/10 focus-visible:ring-2 focus-visible:ring-[#0d9488]/20 focus-visible:outline-none"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(document.url)}
                      disabled={isDeleting}
                      className="bg-transparent text-[#c0352b] border-[#c0352b]/40 hover:bg-[#c0352b] hover:text-white focus-visible:ring-2 focus-visible:ring-[#c0352b]/40 focus-visible:outline-none"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : curatedKb && curatedKb.length > 0 && filteredDocuments.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-10 h-10 bg-[#F48024]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FileText className="h-5 w-5 text-[#F48024]" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              No documents match your search "{searchTerm}". Try adjusting your search terms.
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-10 h-10 bg-[#F48024]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FileText className="h-5 w-5 text-[#F48024]" />
            </div>
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


