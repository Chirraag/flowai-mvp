import React, { useImperativeHandle, forwardRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Bot, Save, Loader2 } from "lucide-react";

/**
 * PatientAgentConfigTab
 * - AI agent configuration for patient intake
 * - Enhanced with brand styling and sophisticated save system
 */
export type PatientAgentConfigTabProps = {
  initialData?: {
    agentName: string;
    language: string;
    voice: string;
    agentInstructions: string;
    humanTransferCriteria: string;
  };
  onSave?: (values: any) => Promise<void>;
  isSaving?: boolean;
};

export type PatientAgentConfigTabHandle = {
  /**
   * Returns the current values held by the tab.
   */
  getValues: () => {
    agentName: string;
    language: string;
    voice: string;
    agentInstructions: string;
    humanTransferCriteria: string;
  };
  /**
   * Lightweight validation for the tab.
   */
  validate: () => { valid: boolean; errors: string[] };
};

const PatientAgentConfigTab = forwardRef<PatientAgentConfigTabHandle, PatientAgentConfigTabProps>(({ initialData, onSave, isSaving = false }, ref) => {
  // Agent Configuration state (default values, overridden by initialData if provided)
  const [agentName, setAgentName] = useState("Patient Intake Agent");
  const [language, setLanguage] = useState("en-US");
  const [voice, setVoice] = useState("alloy");
  const [agentInstructions, setAgentInstructions] = useState("");
  const [humanTransferCriteria, setHumanTransferCriteria] = useState("");

  // Change tracking
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Populate state from initialData if provided
  useEffect(() => {
    if (initialData) {
      setAgentName(initialData.agentName || "Patient Intake Agent");
      setLanguage(initialData.language || "en-US");
      setVoice(initialData.voice || "alloy");
      setAgentInstructions(initialData.agentInstructions || "");
      setHumanTransferCriteria(initialData.humanTransferCriteria || "");
      setHasUnsavedChanges(false);
    }
  }, [initialData]);

  // Track changes
  const handleFieldChange = () => {
    setHasUnsavedChanges(true);
  };

  // Save handler
  const handleSave = async () => {
    if (!onSave) return;

    const currentRef = (ref as React.MutableRefObject<PatientAgentConfigTabHandle | null>).current;
    const validation = currentRef?.validate();
    if (validation && !validation.valid) {
      // Validation errors will be handled by the parent
      return;
    }

    const currentValues = currentRef?.getValues();
    if (currentValues) {
      await onSave(currentValues);
      setHasUnsavedChanges(false);
    }
  };

  // Expose values and validation to parent page
  useImperativeHandle(ref, () => ({
    getValues: () => ({
      agentName,
      language,
      voice,
      agentInstructions,
      humanTransferCriteria,
    }),
    validate: () => {
      const errors: string[] = [];

      if (!agentName.trim()) {
        errors.push("Agent name is required");
      }

      return { valid: errors.length === 0, errors };
    },
  }));

  return (
    <div className="space-y-6">
      {/* Enhanced Agent Configuration Card */}
      <Card className="border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#1c275e] to-[#2a3570] text-white p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
                <Bot className="h-5 w-5 text-[#f48024]" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-white">Agent Configuration</CardTitle>
                <p className="text-gray-200 text-sm mt-1">Configure the basic settings and instructions for the patient intake agent</p>
              </div>
            </div>
            {onSave && (
              <div className="flex items-center gap-3">
                {hasUnsavedChanges && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-[#f48024] rounded-full animate-pulse"></div>
                    <span className="text-gray-200">Unsaved changes</span>
                  </div>
                )}
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !hasUnsavedChanges}
                  className="bg-white hover:bg-slate-400 active:bg-slate-500 text-[#1c275e] border-[#1c275e] px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Enhanced Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="space-y-2">
              <Label htmlFor="agent-name" className="text-sm font-semibold text-[#1c275e]">Agent Name</Label>
              <Input
                id="agent-name"
                placeholder="Patient Intake Agent"
                value={agentName}
                onChange={(e) => {
                  setAgentName(e.target.value);
                  handleFieldChange();
                }}
                className="h-11 border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language" className="text-sm font-semibold text-[#1c275e]">Language</Label>
              <Input
                id="language"
                placeholder="e.g., en-US"
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  handleFieldChange();
                }}
                className="h-11 border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="voice" className="text-sm font-semibold text-[#1c275e]">Voice</Label>
              <Input
                id="voice"
                placeholder="e.g., alloy"
                value={voice}
                onChange={(e) => {
                  setVoice(e.target.value);
                  handleFieldChange();
                }}
                className="h-11 border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
              />
            </div>
          </div>

          {/* Enhanced Agent Instructions Section */}
          <div className="space-y-3 mb-8">
            <Label htmlFor="agent-instructions" className="text-sm font-semibold text-[#1c275e]">Agent Instructions</Label>
            <Textarea
              id="agent-instructions"
              placeholder="Enter detailed instructions for the patient intake agent..."
              value={agentInstructions}
              onChange={(e) => {
                setAgentInstructions(e.target.value);
                handleFieldChange();
              }}
              className="min-h-[400px] resize-none border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
            />
          </div>

          {/* Enhanced Human Transfer Criteria Section */}
          <div className="space-y-3 mb-8">
            <Label htmlFor="transfer-criteria" className="text-sm font-semibold text-[#1c275e]">Human Transfer Criteria</Label>
            <Textarea
              id="transfer-criteria"
              placeholder="Define criteria for when calls should be transferred to human agents..."
              value={humanTransferCriteria}
              onChange={(e) => {
                setHumanTransferCriteria(e.target.value);
                handleFieldChange();
              }}
              className="min-h-32 resize-none border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default PatientAgentConfigTab;
