import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IOSSwitch } from "@/components/ui/ios-switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@radix-ui/react-collapsible";
import { 
  ChevronDown, ChevronRight, Bot, Globe, Brain, BookOpen, 
  FileText, Settings, Save, TestTube, Calendar, Languages
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SchedulingAgentConfig() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("global");
  const [isAgentSettingsOpen, setIsAgentSettingsOpen] = useState(true);
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState(true);

  // Configuration state
  const [config, setConfig] = useState({
    // Agent Settings
    language: "English",
    voice: "Jenny",
    agentVersion: "1.0",
    model: "GPT 4.1",
    globalPrompt: `# AGENT OPERATIONAL INSTRUCTIONS
## Agent Identity & Mission
You are Anna, a specialized Healthcare Scheduling Agent designed to provide concierge-level appointment scheduling services.

**Primary Mission**: Efficiently schedule, reschedule, and manage patient appointments while maintaining HIPAA compliance and delivering exceptional patient experience.

## Core Operational Framework

### 1. GREETING & IDENTIFICATION
- Always greet patients warmly using their preferred name
- Verify patient identity using at least 2 identifiers (DOB, phone number, or address)
- Confirm you're speaking with the patient or authorized representative
- Example: "Hello {{customer_name}}, this is Anna from [Healthcare Facility]. To ensure privacy, may I please verify your date of birth?"

### 2. APPOINTMENT SCHEDULING WORKFLOW
**When scheduling new appointments:**
1. Determine appointment type and specialty needed
2. Check provider availability and patient preferences
3. Verify insurance coverage for the appointment type
4. Offer 2-3 available time slots
5. Collect any pre-visit requirements
6. Send confirmation via patient's preferred method

**When rescheduling:**
1. Locate existing appointment
2. Understand reason for change (optional)
3. Apply same scheduling logic as new appointments
4. Update all related systems and notifications

### 3. PATIENT COMMUNICATION STANDARDS
- Use clear, professional, and empathetic language
- Speak at an appropriate pace for the patient's comprehension
- Repeat important information (date, time, location)
- Ask open-ended questions to understand patient needs
- Example: "I understand you need to reschedule. What timeframe works best for you?"

### 4. INFORMATION COLLECTION
**Required Information for All Appointments:**
- Patient demographics (if new patient)
- Insurance information
- Appointment type/reason for visit
- Preferred date/time
- Special accommodations needed
- Emergency contact information (for new patients)

### 5. SYSTEM INTEGRATION PROTOCOLS
- Always update the EMR system in real-time
- Sync with provider calendars immediately
- Generate automated reminders per patient preference
- Document all interactions for continuity of care

### 6. COMPLIANCE & PRIVACY GUARDRAILS
- Never discuss medical information unless explicitly authorized
- Maintain HIPAA compliance at all times
- Use secure communication channels only
- Log all interactions for audit purposes
- Immediately escalate any security concerns

### 7. ESCALATION PROCEDURES
**Transfer to human agent when:**
- Patient requests to speak with a person
- Complex scheduling requiring special approval
- Insurance verification issues
- Emergency or urgent medical situations
- Technical system failures
- Patient expresses dissatisfaction

### 8. DYNAMIC CONTEXT VARIABLES
- Current time: {{current_time}}
- Patient name: {{customer_name}}
- Date of birth: {{dob}}
- ZIP code: {{customer_zip}}
- Preferred language: {{preferred_language}}
- Insurance plan: {{insurance_plan}}

### 9. QUALITY ASSURANCE STANDARDS
- Confirm all appointment details before ending call
- Provide clear next steps to the patient
- Ensure patient has all necessary information
- Ask if there are any other questions
- End calls professionally with appropriate follow-up information

### 10. CONTINUOUS IMPROVEMENT
- Learn from each interaction to improve responses
- Adapt communication style to individual patient preferences
- Maintain consistency while personalizing the experience
- Report patterns or issues to improve overall service quality

## Success Metrics
- Patient satisfaction scores above 95%
- First-call resolution rate above 90%
- Appointment confirmation accuracy of 99%+
- Average call duration under 8 minutes
- Zero HIPAA violations`,

    // Knowledge Base
    knowledgeBase: {
      enabled: true,
      documents: [],
      searchThreshold: 0.8
    },


  });

  const handleSave = () => {
    toast({
      title: "Configuration Saved",
      description: "Scheduling Agent configuration has been updated successfully.",
    });
  };

  const handleTest = () => {
    toast({
      title: "Test Started",
      description: "Running configuration test for Scheduling Agent...",
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            Scheduling Agent Configuration
          </h1>
          <p className="text-gray-600 mt-1">
            Configure settings for the AI-powered appointment scheduling agent
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTest} className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Test
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </div>

      {/* Main Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Agent Settings and Instructions (2/3 width) */}
        <div className="lg:col-span-2 space-y-3">
          {/* Agent Settings - Expanded by default */}
          <Collapsible open={isAgentSettingsOpen} onOpenChange={setIsAgentSettingsOpen}>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">Agent Settings</CardTitle>
                    </div>
                    {isAgentSettingsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4 pt-0">
                  {/* Voice & Language */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-gray-700">Voice & Language</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language" className="text-sm">Language</Label>
                        <Select value={config.language} onValueChange={(value) => setConfig({...config, language: value})}>
                          <SelectTrigger className="w-full">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🇺🇸</span>
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="English">🇺🇸 English</SelectItem>
                            <SelectItem value="Spanish">🇪🇸 Spanish</SelectItem>
                            <SelectItem value="Chinese">🇨🇳 Chinese</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="voice" className="text-sm">Voice</Label>
                        <Select value={config.voice} onValueChange={(value) => setConfig({...config, voice: value})}>
                          <SelectTrigger className="w-full">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-xs">👩</span>
                              </div>
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Jenny">👩 Jenny</SelectItem>
                            <SelectItem value="Sarah">👩 Sarah</SelectItem>
                            <SelectItem value="Michael">👨 Michael</SelectItem>
                            <SelectItem value="David">👨 David</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="agentVersion" className="text-sm">Agent Version</Label>
                        <Select value={config.agentVersion || "1.0"} onValueChange={(value) => setConfig({...config, agentVersion: value})}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1.0">1.0</SelectItem>
                            <SelectItem value="1.1">1.1</SelectItem>
                            <SelectItem value="1.2">1.2</SelectItem>
                            <SelectItem value="1.3">1.3</SelectItem>
                            <SelectItem value="2.0">2.0</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Agent Operational Instructions */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-700">Agent Operational Instructions</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">GPT 4.1</Badge>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      value={config.globalPrompt}
                      onChange={(e) => setConfig({...config, globalPrompt: e.target.value})}
                      className="min-h-[500px] font-mono text-sm resize-y"
                      placeholder="Enter Agent Operational Instructions - structured guidelines combining natural language with operational precision..."
                    />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        {/* Right Column - Knowledge Base (1/3 width) */}
        <div className="lg:col-span-1">
          <Collapsible open={isKnowledgeBaseOpen} onOpenChange={setIsKnowledgeBaseOpen}>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                      <CardTitle>Knowledge Base</CardTitle>
                    </div>
                    {isKnowledgeBaseOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4 pt-0">
                  <div className="flex items-center justify-between">
                    <Label>Enable Knowledge Base</Label>
                    <IOSSwitch
                      checked={config.knowledgeBase.enabled}
                      onCheckedChange={(checked: boolean) => 
                        setConfig({...config, knowledgeBase: {...config.knowledgeBase, enabled: checked}})
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Documents</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <FileText className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Upload training documents</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Browse Files
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}