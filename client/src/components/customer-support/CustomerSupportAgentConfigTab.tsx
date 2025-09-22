import React, { useImperativeHandle, forwardRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Bot } from "lucide-react";

/**
 * CustomerSupportAgentConfigTab
 * - AI agent configuration for customer support
 * - Mirrors the launchpad tab styling and structure
 */
export type CustomerSupportAgentConfigTabHandle = {
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

export interface CustomerSupportAgentConfigTabProps {
  initialData?: {
    agentName: string;
    language: string;
    voice: string;
    agentInstructions: string;
    humanTransferCriteria: string;
  };
}

const CustomerSupportAgentConfigTab = forwardRef<CustomerSupportAgentConfigTabHandle, CustomerSupportAgentConfigTabProps>(({ initialData }, ref) => {
  // Local state synced with initialData
  const [agentName, setAgentName] = React.useState("");
  const [language, setLanguage] = React.useState("");
  const [voice, setVoice] = React.useState("");
  const [agentInstructions, setAgentInstructions] = React.useState("");
  const [humanTransferCriteria, setHumanTransferCriteria] = React.useState("");

  // Sync local state with initialData
  React.useEffect(() => {
    if (initialData) {
      setAgentName(initialData.agentName || "");
      setLanguage(initialData.language || "");
      setVoice(initialData.voice || "");
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

      if (!agentInstructions.trim()) {
        errors.push("Agent instructions are required");
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
          <p className="text-sm text-gray-600 mb-6">Configure the basic settings and instructions for the customer support agent.</p>

          {/* Horizontal Input Line */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="agent-name">Agent Name</Label>
              <Input
                id="agent-name"
                placeholder="Customer Support Agent"
                value={agentName}
                readOnly
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                placeholder="e.g., English"
                value={language}
                readOnly
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="voice">Voice</Label>
              <Input
                id="voice"
                placeholder="e.g., Alex"
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
              placeholder="Enter detailed instructions for the customer support agent..."
              value={agentInstructions}
              readOnly
              className="min-h-[400px] resize-none"
            />
          </div>

          {/* Human Transfer Criteria Text Area */}
          <div className="space-y-2">
            <Label htmlFor="human-transfer-criteria">Human Transfer Criteria</Label>
            <Textarea
              id="human-transfer-criteria"
              placeholder="Define criteria for when calls should be transferred to human agents..."
              value={humanTransferCriteria}
              readOnly
              className="min-h-[100px] resize-none"
            />
          </div>

        </CardContent>
      </Card>
    </div>
  );
});

export default CustomerSupportAgentConfigTab;
