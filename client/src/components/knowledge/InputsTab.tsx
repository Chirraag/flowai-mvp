import React, { useImperativeHandle, forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database } from "lucide-react";

/**
 * InputsTab
 * - Knowledge input configuration and sources
 * - Mirrors the launchpad tab styling with minimal content
 */
export type InputsTabHandle = {
  getValues: () => { inputType: string; sourceCount: string };
  validate: () => { valid: boolean; errors: string[] };
};

const InputsTab = forwardRef<InputsTabHandle>((_props, ref) => {
  const [inputType, setInputType] = React.useState("documents");
  const [sourceCount, setSourceCount] = React.useState("10");

  useImperativeHandle(ref, () => ({
    getValues: () => ({ inputType, sourceCount }),
    validate: () => ({ valid: true, errors: [] }),
  }));

  return (
    <div className="space-y-6">
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-4 w-4" />
            <h2 className="text-xl font-semibold text-gray-900">Inputs</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="input-type">Input Type</Label>
              <Select value={inputType} onValueChange={setInputType}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select input type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="documents">Documents</SelectItem>
                  <SelectItem value="websites">Websites</SelectItem>
                  <SelectItem value="apis">APIs</SelectItem>
                  <SelectItem value="databases">Databases</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source-count">Number of Sources</Label>
              <Input
                id="source-count"
                type="number"
                value={sourceCount}
                onChange={(e) => setSourceCount(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
              <p className="text-sm text-indigo-800">
                Input configuration options coming soon...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default InputsTab;
