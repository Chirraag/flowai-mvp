import React, { useImperativeHandle, forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

const CustomerSupportAgentConfigTab = forwardRef<CustomerSupportAgentConfigTabHandle>((_props, ref) => {
  // Agent Configuration state
  const [agentName, setAgentName] = React.useState("Customer Support Agent");
  const [language, setLanguage] = React.useState("us-english");
  const [voice, setVoice] = React.useState("alex");
  const [agentInstructions, setAgentInstructions] = React.useState("");
  const [humanTransferCriteria, setHumanTransferCriteria] = React.useState("");

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
          <p className="text-sm text-gray-600 mb-6">Configure the basic settings and instrucitons for the customer support agent.</p>

          {/* Horizontal Input Line */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="agent-name">Agent Name</Label>
              <Input
                id="agent-name"
                placeholder="Customer Support Agent"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us-english">US English</SelectItem>
                  <SelectItem value="es-spanish">ES Spanish</SelectItem>
                  <SelectItem value="cn-chinese">CN Chinese</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="voice">Voice</Label>
              <Select value={voice} onValueChange={setVoice}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alex">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">A</AvatarFallback>
                      </Avatar>
                      <span>Alex</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="jordan">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-pink-100 text-pink-600 text-xs">J</AvatarFallback>
                      </Avatar>
                      <span>Jordan</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="taylor">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-green-100 text-green-600 text-xs">T</AvatarFallback>
                      </Avatar>
                      <span>Taylor</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Agent Instructions Text Area */}
          <div className="space-y-2 mb-6">
            <Label htmlFor="agent-instructions">Agent Instructions</Label>
            <Textarea
              id="agent-instructions"
              placeholder="Enter detailed instructions for the customer support agent..."
              value={agentInstructions}
              onChange={(e) => setAgentInstructions(e.target.value)}
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
              onChange={(e) => setHumanTransferCriteria(e.target.value)}
              className="min-h-32 resize-none"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default CustomerSupportAgentConfigTab;
