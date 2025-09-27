import React, { useImperativeHandle, forwardRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Bot, Save, Loader2 } from "lucide-react";
import type { CustomerSupportAgentConfig } from "@/lib/customer-support.types";

/**
 * CustomerSupportAgentConfigTab
 * - AI agent configuration for customer support
 * - Mirrors the scheduling agent tab styling and structure
 */
export type CustomerSupportAgentConfigTabHandle = {
  /**
   * Returns the current values held by the tab.
   */
  getValues: () => CustomerSupportAgentConfig;
  /**
   * Lightweight validation for the tab.
   */
  validate: () => { valid: boolean; errors: string[] };
};

export interface CustomerSupportAgentConfigTabProps {
  initialData?: CustomerSupportAgentConfig;
  onSave?: (values: CustomerSupportAgentConfig) => Promise<void>;
  isSaving?: boolean;
  readOnly?: boolean;
}

const CustomerSupportAgentConfigTab = forwardRef<CustomerSupportAgentConfigTabHandle, CustomerSupportAgentConfigTabProps>(({ initialData, onSave, isSaving = false, readOnly = false }, ref) => {
  // Local state synced with initialData
  const [agentName, setAgentName] = useState("");
  const [language, setLanguage] = useState("");
  const [voice, setVoice] = useState("");
  const [agentInstructions, setAgentInstructions] = useState("");
  const [humanTransferCriteria, setHumanTransferCriteria] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync local state with initialData
  useEffect(() => {
    if (initialData) {
      setAgentName(initialData.agent_name || "");
      setLanguage(initialData.language || "");
      setVoice(initialData.voice || "");
      setAgentInstructions(initialData.agent_instructions || "");
      setHumanTransferCriteria(initialData.human_transfer_criteria || "");
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

    const currentValues = {
      agent_name: agentName,
      language,
      voice,
      agent_instructions: agentInstructions,
      human_transfer_criteria: humanTransferCriteria,
    };

    try {
      await onSave(currentValues);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save agent config:', error);
    }
  };

  // Expose values and validation to parent page
  useImperativeHandle(ref, () => ({
    getValues: () => ({
      agent_name: agentName,
      language,
      voice,
      agent_instructions: agentInstructions,
      human_transfer_criteria: humanTransferCriteria,
    }),
    validate: () => {
      const errors: string[] = [];

      if (!agentName.trim()) {
        errors.push("Agent name is required");
      }

      if (!agentInstructions.trim()) {
        errors.push("Agent instructions are required");
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
                <p className="text-gray-200 text-sm mt-1">Configure the basic settings and instructions for the customer support agent</p>
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
                  {isSaving ? "Saving..." : "Save"}
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
                placeholder="Customer Support Agent"
                value={agentName}
                onChange={readOnly ? undefined : (e) => {
                  setAgentName(e.target.value);
                  handleFieldChange();
                }}
                readOnly={readOnly}
                className="h-11 border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language" className="text-sm font-semibold text-[#1c275e]">Language</Label>
              <Input
                id="language"
                placeholder="e.g., English"
                value={language}
                onChange={readOnly ? undefined : (e) => {
                  setLanguage(e.target.value);
                  handleFieldChange();
                }}
                readOnly={readOnly}
                className="h-11 border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="voice" className="text-sm font-semibold text-[#1c275e]">Voice</Label>
              <Input
                id="voice"
                placeholder="e.g., Alex"
                value={voice}
                onChange={readOnly ? undefined : (e) => {
                  setVoice(e.target.value);
                  handleFieldChange();
                }}
                readOnly={readOnly}
                className="h-11 border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
              />
            </div>
          </div>

          {/* Enhanced Agent Instructions Section */}
          <div className="space-y-3 mb-8">
            <Label htmlFor="agent-instructions" className="text-sm font-semibold text-[#1c275e]">Agent Instructions</Label>
            <Textarea
              id="agent-instructions"
              placeholder="Enter detailed instructions for the customer support agent..."
              value={agentInstructions}
              onChange={readOnly ? undefined : (e) => {
                setAgentInstructions(e.target.value);
                handleFieldChange();
              }}
              readOnly={readOnly}
              className="min-h-[400px] resize-none border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
            />
          </div>

          {/* Enhanced Human Transfer Criteria Section */}
          <div className="space-y-3">
            <Label htmlFor="human-transfer-criteria" className="text-sm font-semibold text-[#1c275e]">Human Transfer Criteria</Label>
            <Textarea
              id="human-transfer-criteria"
              placeholder="Define criteria for when calls should be transferred to human agents..."
              value={humanTransferCriteria}
              onChange={readOnly ? undefined : (e) => {
                setHumanTransferCriteria(e.target.value);
                handleFieldChange();
              }}
              readOnly={readOnly}
              className="min-h-[100px] resize-none border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
            />
          </div>

        </CardContent>
      </Card>
    </div>
  );
});

export default CustomerSupportAgentConfigTab;
