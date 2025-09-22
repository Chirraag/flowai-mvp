import React, { useImperativeHandle, forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bot } from "lucide-react";

/**
 * PatientAgentConfigTab
 * - AI agent configuration for patient intake
 * - Mirrors the launchpad tab styling and structure
 */
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

export interface PatientAgentConfigTabProps {
  initialData?: {
    agentName: string;
    language: string;
    voice: string;
    agentInstructions: string;
    humanTransferCriteria: string;
  };
}

const PatientAgentConfigTab = forwardRef<PatientAgentConfigTabHandle, PatientAgentConfigTabProps>(({ initialData }, ref) => {
  // Agent Configuration state (default values, overridden by initialData if provided)
  const [agentName, setAgentName] = React.useState("Patient Intake Agent");
  const [language, setLanguage] = React.useState("us-english");
  const [voice, setVoice] = React.useState("sofia");
  const [agentInstructions, setAgentInstructions] = React.useState("");
  const [humanTransferCriteria, setHumanTransferCriteria] = React.useState("");

  // Populate state from initialData if provided
  React.useEffect(() => {
    if (initialData) {
      setAgentName(initialData.agentName || "Patient Intake Agent");
      setLanguage(initialData.language || "us-english");
      setVoice(initialData.voice || "sofia");
      setAgentInstructions(initialData.agentInstructions || "");
      setHumanTransferCriteria(initialData.humanTransferCriteria || "");
    }
  }, [initialData]);

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
      {/* Agent Configuration Card */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="h-4 w-4" />
            <h2 className="text-xl font-semibold text-gray-900">Agent Configuration</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">Configure the basic settings and instructinos for the patient intake agent.</p>

          {/* Horizontal Input Line */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="agent-name">Agent Name</Label>
              <Input
                id="agent-name"
                placeholder="Patient Intake Agent"
                value={agentName}
                readOnly
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                placeholder="e.g., en-US"
                value={language}
                readOnly
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="voice">Voice</Label>
              <Input
                id="voice"
                placeholder="e.g., alloy"
                value={voice}
                readOnly
                className="h-11"
              />
            </div>
          </div>

          {/* Agent Instructions Text Area */}
          <div className="space-y-2 mb-6">
            <Label htmlFor="agent-instructions">Agent Instructions</Label>
            <Textarea
              id="agent-instructions"
              placeholder="Enter detailed instructions for the patient intake agent..."
              value={agentInstructions}
              readOnly
              className="min-h-[500px] resize-none"
            />
          </div>

          {/* Human Transfer Criteria Text Area */}
          <div className="space-y-2">
            <Label htmlFor="transfer-criteria">Human Transfer Criteria</Label>
            <Textarea
              id="transfer-criteria"
              placeholder="Define criteria for when calls should be transferred to human agents..."
              value={humanTransferCriteria}
              readOnly
              className="min-h-32 resize-none"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default PatientAgentConfigTab;
