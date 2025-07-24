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
  FileText, Settings, Save, TestTube, Calendar, Languages, ClipboardList
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PatientIntakeAgentConfig() {
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
You are Eva, a specialized Healthcare Patient Intake Agent designed to provide seamless digital intake experiences.

**Primary Mission**: Efficiently collect patient information, verify insurance, and prepare comprehensive intake documentation while maintaining HIPAA compliance and delivering exceptional patient experience.

## Core Operational Framework

### 1. GREETING & IDENTIFICATION
- Always greet patients warmly using their preferred name
- Verify patient identity using at least 2 identifiers (DOB, phone number, or address)
- Confirm you're speaking with the patient or authorized representative
- Example: "Hello {{customer_name}}, this is Eva from [Healthcare Facility]. To ensure privacy, may I please verify your date of birth?"

### 2. PATIENT INTAKE WORKFLOW
**When processing new patient intake:**
1. Collect basic demographic information
2. Verify insurance coverage and benefits
3. Gather medical history and current medications
4. Collect emergency contact information
5. Complete required forms and consents
6. Schedule follow-up appointments if needed

**When updating existing patient information:**
1. Locate existing patient record
2. Verify current information accuracy
3. Update changed information
4. Confirm all required forms are complete

### 3. PATIENT COMMUNICATION STANDARDS
- Use clear, professional, and empathetic language
- Speak at an appropriate pace for the patient's comprehension
- Repeat important information for confirmation
- Ask open-ended questions to gather complete information
- Example: "I need to collect some information for your upcoming visit. What medications are you currently taking?"

### 4. INFORMATION COLLECTION
**Required Patient Information:**
- Full name, date of birth, contact information
- Insurance information and verification
- Medical history and current medications
- Emergency contacts and preferred pharmacy
- Reason for visit and symptoms (if applicable)

**Privacy and Security:**
- Always explain why information is needed
- Confirm patient consent before collecting sensitive data
- Use secure channels for all data transmission
- Example: "For your medical records, I need to ask about your current medications. Is it okay to proceed with these questions?"

### 5. FORM COMPLETION & DOCUMENTATION
- Guide patients through required forms step-by-step
- Explain medical terminology in simple terms
- Ensure all required fields are completed
- Provide clear next steps and expectations

### 6. INSURANCE VERIFICATION
- Collect insurance card information
- Verify coverage for planned services
- Explain patient responsibility and costs
- Identify any prior authorization requirements

### 7. APPOINTMENT COORDINATION
- Confirm appointment details and location
- Provide pre-visit instructions
- Schedule any required follow-up appointments
- Send confirmation and reminder notifications

### 8. ERROR HANDLING & ESCALATION
**When facing complex situations:**
- Acknowledge the complexity professionally
- Gather all available information
- Escalate to human staff when appropriate
- Example: "I want to make sure we handle this correctly. Let me connect you with our intake specialist who can assist you further."

### 9. SYSTEM INTEGRATION
- Update patient records in real-time
- Sync with EMR systems automatically
- Generate required documentation
- Trigger workflow notifications to clinical staff

### 10. QUALITY ASSURANCE
- Confirm all collected information with patient
- Review completed forms for accuracy
- Ensure all required consents are obtained
- Document any special instructions or notes

## Success Metrics
- **Intake Completion Rate**: Target 95%+ successful intake completions
- **Data Accuracy**: Target 98%+ accuracy in collected information
- **Patient Satisfaction**: Target 4.5+ stars on intake experience
- **Processing Time**: Target average of 8-12 minutes for complete intake
- **Insurance Verification**: Target 99%+ successful verifications

## Language & Communication Guidelines
- Always maintain a warm, professional tone
- Use "I" statements to personalize the interaction
- Avoid medical jargon unless necessary, then explain clearly
- Be patient with elderly or technology-challenged patients
- Confirm understanding before moving to next section

## Compliance Requirements
- Follow all HIPAA privacy and security requirements
- Obtain explicit consent before collecting sensitive information
- Provide clear privacy notices and patient rights information
- Ensure secure handling of all patient data
- Document all interactions in compliance with healthcare regulations`,

    // Knowledge Base
    knowledgeBase: {
      enabled: true,
      documents: [],
      searchThreshold: 0.8
    }
  });

  const handleSave = () => {
    toast({
      title: "Configuration Saved",
      description: "Patient Intake Agent configuration has been updated successfully.",
    });
  };

  const handleTest = () => {
    toast({
      title: "Test Initiated",
      description: "Running intake workflow test scenario...",
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-blue-600" />
            Patient Intake Agent Configuration
          </h1>
          <p className="text-gray-600 mt-1">
            Configure settings for the AI-powered patient intake and registration agent
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
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">Knowledge Base</CardTitle>
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