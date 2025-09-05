import React, { useImperativeHandle, forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, Plus } from "lucide-react";

/**
 * CuratedKnowledgeTab
 * - Manual knowledge curation and quality control
 * - Mirrors the launchpad tab styling with minimal content
 */
export type CuratedKnowledgeTabHandle = {
  getValues: () => { curationLevel: string; qualityCheck: boolean };
  validate: () => { valid: boolean; errors: string[] };
};

const CuratedKnowledgeTab = forwardRef<CuratedKnowledgeTabHandle>((_props, ref) => {
  const [curationLevel, setCurationLevel] = React.useState("moderate");
  const [qualityCheck, setQualityCheck] = React.useState(true);

  useImperativeHandle(ref, () => ({
    getValues: () => ({ curationLevel, qualityCheck }),
    validate: () => ({ valid: true, errors: [] }),
  }));

  return (
    <div className="space-y-6">
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-4 w-4" />
            <h2 className="text-xl font-semibold text-gray-900">Curated Knowledge</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="curation-level">Curation Level</Label>
              <Select value={curationLevel} onValueChange={setCurationLevel}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select curation level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal Curation</SelectItem>
                  <SelectItem value="moderate">Moderate Curation</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive Curation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="quality-check"
                checked={qualityCheck}
                onCheckedChange={(checked) => setQualityCheck(checked === true)}
              />
              <Label htmlFor="quality-check" className="text-sm text-gray-700">
                Enable quality control checks
              </Label>
            </div>

            <Button variant="outline" className="w-full h-12">
              <Plus className="h-4 w-4 mr-2" />
              Add Curated Content
            </Button>

            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                Knowledge curation options coming soon...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default CuratedKnowledgeTab;
