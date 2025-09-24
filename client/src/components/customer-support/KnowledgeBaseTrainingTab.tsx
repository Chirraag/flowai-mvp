import React, { useImperativeHandle, forwardRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Upload, Eye, Download, Trash2 } from "lucide-react";

/**
 * KnowledgeBaseTrainingTab
 * - Knowledge base and training document management interface
 * - Provides file upload and curated knowledge management
 */
export type KnowledgeBaseTrainingTabHandle = {
  getValues: () => { uploadedFiles: string[]; curatedDocuments: CuratedDocument[] };
  validate: () => { valid: boolean; errors: string[] };
};

interface CuratedDocument {
  id: string;
  title: string;
  fileSize?: string;
  uploadedAt?: string;
  tags?: string[];
}

const KnowledgeBaseTrainingTab = forwardRef<KnowledgeBaseTrainingTabHandle>((_props, ref) => {
  // File upload state
  const [uploadedFiles, setUploadedFiles] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Curated documents data
  const [curatedDocuments] = React.useState<CuratedDocument[]>([
    {
      id: "1",
      title: "Healthcare Practice Policies",
      fileSize: "2.4 MB",
      uploadedAt: "2024-08-12",
      tags: ["Healthcare", "Policies", "Practice"]
    },
    {
      id: "2",
      title: "Insurance Verification Guide",
      fileSize: "1.8 MB",
      uploadedAt: "2024-07-03",
      tags: ["Insurance", "Verification", "Coverage"]
    },
    {
      id: "3",
      title: "Patient Intake Procedures",
      fileSize: "3.1 MB",
      uploadedAt: "2024-09-21",
      tags: ["Patient", "Intake", "Procedures"]
    },
    {
      id: "4",
      title: "Appointment Scheduling Guidelines",
      fileSize: "156 KB",
      uploadedAt: "2024-10-05",
      tags: ["Appointment", "Scheduling", "Guidelines"]
    },
    {
      id: "5",
      title: "Emergency Protocols Manual",
      fileSize: "2.9 MB",
      uploadedAt: "2024-06-18",
      tags: ["Emergency", "Protocols", "Safety"]
    }
  ]);

  // File upload handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileNames = Array.from(files).map(file => file.name);
      setUploadedFiles(prev => [...prev, ...fileNames]);
    }
  };

  const handleChooseFiles = () => {
    fileInputRef.current?.click();
  };

  // Document action handlers (placeholders)
  const handleViewDocument = (id: string) => {
    console.log("View document:", id);
  };

  const handleDownloadDocument = (id: string) => {
    console.log("Download document:", id);
  };

  const handleDeleteDocument = (id: string) => {
    console.log("Delete document:", id);
  };

  // Category mapping based on document order
  const categoriesByIndex = [
    'policies',
    'Insurance',
    'Procedures',
    'Scheduling',
    'Emergency',
  ];

  useImperativeHandle(ref, () => ({
    getValues: () => ({ uploadedFiles, curatedDocuments }),
    validate: () => ({ valid: true, errors: [] }),
  }));

  return (
    <div className="space-y-6">
      {/* Enhanced Header Section */}
      <Card className="border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#1c275e] to-[#2a3570] text-white p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-[#f48024]" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-white">Knowledge Base & Training</CardTitle>
              <p className="text-gray-200 text-sm mt-1">Manage training documents and resources for the customer support agent</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">

          {/* File Upload Section */}
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center">
              <h3 className="text-lg font-medium text-[#1c275e]">Upload Documents</h3>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Choose Files Button */}
            <Button
              onClick={handleChooseFiles}
              className="flex items-center gap-2 bg-[#f48024] hover:bg-[#e66f20] text-white px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 mx-auto"
            >
              <Upload className="h-5 w-5" />
              Choose Files
            </Button>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-[#1c275e] mb-2">Selected Files:</h4>
                <ul className="space-y-1">
                  {uploadedFiles.map((fileName, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#f48024] rounded-full"></span>
                      {fileName}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              Supported formats: PDF, DOC, DOCX, TXT
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Curated Knowledge Section */}
      <Card className="border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#2a3570] to-[#1c275e] text-white p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-[#f48024]" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-white">Curated Knowledge</CardTitle>
              <p className="text-gray-200 text-sm mt-1">Pre-loaded training documents and resources</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Document Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {curatedDocuments.map((doc, index) => (
              <Card
                key={doc.id}
                className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300"
              >
                <CardContent className="p-5">
                  <div className="space-y-3 text-sm">
                    {/* Document Header */}
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-base font-semibold text-[#1c275e] leading-tight flex-1">
                        {doc.title}
                      </h4>
                    </div>

                    {/* File Size directly under title */}
                    {doc.fileSize && (
                      <p className="text-xs text-gray-500">Size: {doc.fileSize}</p>
                    )}

                    {/* Uploaded date */}
                    <p className="text-xs text-gray-500">
                      Uploaded: {doc.uploadedAt || '2024-01-01'}
                    </p>

                    {/* Category */}
                    <p className="text-xs text-gray-600">
                      Category: {categoriesByIndex[index] || 'General'}
                    </p>

                    {/* Tags / Badges */}
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {doc.tags.map((tag, i) => (
                          <Badge key={i} className="text-[10px] font-medium px-2 py-0.5 bg-[#f48024]/10 text-[#f48024] hover:bg-[#f48024]/20">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDocument(doc.id)}
                        className="flex-1 flex items-center justify-center gap-1 hover:bg-[#f48024]/5 hover:border-[#f48024]"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocument(doc.id)}
                        className="flex-1 flex items-center justify-center gap-1 hover:bg-green-50 hover:border-green-300"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="flex-1 flex items-center justify-center gap-1 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default KnowledgeBaseTrainingTab;
