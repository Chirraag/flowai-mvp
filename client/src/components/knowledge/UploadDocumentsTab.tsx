import React, { useImperativeHandle, forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, FileText } from "lucide-react";

/**
 * UploadDocumentsTab
 * - Document upload and processing configuration
 * - Mirrors the launchpad tab styling with minimal content
 */
export type UploadDocumentsTabHandle = {
  getValues: () => { autoProcess: boolean; extractMetadata: boolean };
  validate: () => { valid: boolean; errors: string[] };
};

const UploadDocumentsTab = forwardRef<UploadDocumentsTabHandle>((_props, ref) => {
  const [autoProcess, setAutoProcess] = React.useState(true);
  const [extractMetadata, setExtractMetadata] = React.useState(true);

  useImperativeHandle(ref, () => ({
    getValues: () => ({ autoProcess, extractMetadata }),
    validate: () => ({ valid: true, errors: [] }),
  }));

  return (
    <div className="space-y-6">
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="h-4 w-4" />
            <h2 className="text-xl font-semibold text-gray-900">Upload Documents</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-gray-900">Upload Settings</Label>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto-process"
                  checked={autoProcess}
                  onCheckedChange={(checked) => setAutoProcess(checked === true)}
                />
                <Label htmlFor="auto-process" className="text-sm text-gray-700">
                  Auto-process uploaded documents
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="extract-metadata"
                  checked={extractMetadata}
                  onCheckedChange={(checked) => setExtractMetadata(checked === true)}
                />
                <Label htmlFor="extract-metadata" className="text-sm text-gray-700">
                  Extract metadata automatically
                </Label>
              </div>
            </div>

            <Button variant="outline" className="w-full h-12">
              <FileText className="h-4 w-4 mr-2" />
              Select Documents to Upload
            </Button>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Document upload options coming soon...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default UploadDocumentsTab;
