import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Settings, MessageSquare, Bot, Calendar, FileText, Globe, Database, Mic, FileDown, Phone, PhoneOff, ChevronDown } from "lucide-react";
import { useRetellAgentDetails, useUpdateRetellAgent, useRetellVoicesList, createWebCall } from "@/services/retellApi";
import { RetellWebClient } from "retell-client-js-sdk";
import { AnimatedMicrophone } from "@/components/AnimatedMicrophone";

export default function AgentDetail() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  
  const { data: agent, isLoading, error } = useRetellAgentDetails(agentId);
  const { data: voices = [], isLoading: voicesLoading } = useRetellVoicesList();
  const updateAgent = useUpdateRetellAgent();

  // No edit mode - always editable
  
  // Test Agent states
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const retellWebClient = useRef<RetellWebClient | null>(null);

  // Chat transcript state
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    role: 'user' | 'agent';
    content: string;
    timestamp: Date;
  }>>([]);

  // Ref for auto-scroll
  const chatScrollRef = useRef<HTMLDivElement>(null);
  
  // Track if user has scrolled away from bottom
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Form states for editable fields
  const [formData, setFormData] = useState({
    model: '',
    voice_id: '',
    language: '',
    global_prompt: ''
  });

  // Watch for any changes to messages and auto-scroll if user hasn't manually scrolled
  useEffect(() => {
    console.log(`🔄 Message update effect: ${chatMessages.length} messages, isUserScrolling=${isUserScrolling}`);
    if (chatMessages.length > 0 && chatScrollRef.current && !isUserScrolling) {
      console.log(`⬇️ Auto-scrolling to bottom for new messages`);
      // Single scroll attempt with requestAnimationFrame for smooth performance
      requestAnimationFrame(() => {
        const container = chatScrollRef.current;
        if (container) {
          container.scrollTop = container.scrollHeight;
          console.log(`✅ Auto-scroll completed: scrollTop=${container.scrollTop}, scrollHeight=${container.scrollHeight}`);
        }
      });
    } else if (isUserScrolling) {
      console.log(`🚫 Not auto-scrolling because user has scrolled up`);
    }
  }, [chatMessages, isUserScrolling]);


  // Update form data when agent data is loaded
  useEffect(() => {
    if (agent) {
      setFormData({
        model: agent.model || '',
        voice_id: agent.voice_id || '',
        language: agent.language || '',
        global_prompt: agent.global_prompt || ''
      });
    }
  }, [agent]);

  // Check if user is at bottom of scroll
  const isAtBottom = (element: HTMLDivElement) => {
    const threshold = 5; // Small threshold for better detection
    const isAtBottomResult = element.scrollHeight - element.scrollTop - element.clientHeight <= threshold;
    console.log(`🔍 Scroll position check: scrollHeight=${element.scrollHeight}, scrollTop=${element.scrollTop}, clientHeight=${element.clientHeight}, isAtBottom=${isAtBottomResult}`);
    return isAtBottomResult;
  };

  // Immediate scroll handler to prevent race conditions with message updates
  const handleScroll = () => {
    if (chatScrollRef.current) {
      const atBottom = isAtBottom(chatScrollRef.current);
      const newIsUserScrolling = !atBottom;
      console.log(`📜 Scroll event: atBottom=${atBottom}, setting isUserScrolling=${newIsUserScrolling}`);
      setIsUserScrolling(newIsUserScrolling);
      setShowScrollButton(newIsUserScrolling);
    }
  };

  // Scroll to bottom function
  const scrollToBottom = (smooth = false) => {
    if (chatScrollRef.current) {
      // Use requestAnimationFrame to prevent interference with WebRTC
      requestAnimationFrame(() => {
        const container = chatScrollRef.current;
        if (container) {
          // Force scroll to absolute bottom
          container.scrollTop = container.scrollHeight - container.clientHeight;
          setIsUserScrolling(false);
          setShowScrollButton(false);
        }
      });
    }
  };

  // Get agent type from agent ID or agent name
  const getAgentType = () => {
    if (!agent) return '';
    
    // Try to extract from agent_name first
    const agentName = agent.agent_name.toLowerCase();
    if (agentName.includes('customer support')) return 'customer_support';
    if (agentName.includes('patient intake')) return 'patient_intake';
    if (agentName.includes('scheduling')) return 'scheduling';
    
    // Fallback to checking agent_id patterns if needed
    return '';
  };

  // Get proper agent display info based on type
  const getAgentDisplayInfo = (type: string) => {
    const agentInfo = {
      'customer_support': {
        name: 'Customer Support Agent',
        description: 'Comprehensive customer support with automated ticket routing and resolution tracking'
      },
      'patient_intake': {
        name: 'Patient Intake Agent',
        description: 'Adaptive digital intake forms with identity verification and clinical questionnaires'
      },
      'scheduling': {
        name: 'Scheduling Agent',
        description: 'Intelligent appointment scheduling with provider matching and patient preferences'
      }
    };
    
    return agentInfo[type as keyof typeof agentInfo] || {
      name: agent?.agent_name || 'Agent',
      description: 'AI agent for healthcare operations'
    };
  };

  const getAgentIcon = (type: string) => {
    const icons = {
      'customer_support': MessageSquare,
      'patient_intake': FileText,
      'scheduling': Calendar
    };
    return icons[type as keyof typeof icons] || Bot;
  };

  const formatFileSize = (bytes: number) => {
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  // Initialize Retell Web Client
  useEffect(() => {
    console.log("Initializing Retell Web Client...");
    retellWebClient.current = new RetellWebClient();
    
    const client = retellWebClient.current;
    console.log("Retell Web Client created:", client);
    
    // Set up event listeners
    client.on("call_started", () => {
      console.log("✅ EVENT: call_started - Call has successfully started");
      setIsConnecting(false);
      setIsCallActive(true);
    });

    client.on("call_ended", () => {
      console.log("✅ EVENT: call_ended - Call has ended");
      setIsCallActive(false);
      setIsConnecting(false);
      setIsSpeaking(false);
      // Clear chat messages when call ends
      setChatMessages([]);
    });

    client.on("agent_start_talking", () => {
      console.log("🗣️ EVENT: agent_start_talking - Agent started speaking");
      setIsSpeaking(true);
    });

    client.on("agent_stop_talking", () => {
      console.log("🤐 EVENT: agent_stop_talking - Agent stopped speaking");
      setIsSpeaking(false);
    });

    client.on("update", (update) => {
      console.log("📝 EVENT: update - Received update:", update);
      
      if (update.transcript && Array.isArray(update.transcript)) {
        const validMessages = update.transcript.filter((msg: any) => msg.role && msg.content);
        
        // Wrap in requestAnimationFrame to prevent interfering with WebRTC
        requestAnimationFrame(() => {
          setChatMessages(prev => {
            const currentBubbleCount = prev.length;
            const newTranscriptCount = validMessages.length;
            
            console.log(`📊 Transcript update: ${currentBubbleCount} bubbles -> ${newTranscriptCount} transcript messages`);
            console.log(`📋 Current bubbles:`, prev.map((b, i) => `${i}: ${b.role} - "${b.content.substring(0, 30)}..."`));
            console.log(`📋 New transcript:`, validMessages.map((m, i) => `${i}: ${m.role} - "${m.content.substring(0, 30)}..."`));
            
            if (newTranscriptCount === 0) return prev;
            
            // Always rebuild the bubble array to match the transcript exactly
            const result = [];
            
            for (let i = 0; i < newTranscriptCount; i++) {
              const msg = validMessages[i];
              const existingBubble = prev[i];
              
              // If we have an existing bubble for this position, check if we need to update it
              if (existingBubble && 
                  existingBubble.role === (msg.role === 'user' ? 'user' : 'agent')) {
                // Same role, check if content changed
                if (existingBubble.content !== msg.content) {
                  console.log(`📝 Updating bubble ${i}: "${existingBubble.content.substring(0, 30)}..." -> "${msg.content.substring(0, 30)}..."`);
                  result.push({
                    ...existingBubble,
                    content: msg.content
                  });
                } else {
                  // Content is the same, keep existing bubble
                  result.push(existingBubble);
                }
              } else {
                // No existing bubble or different role, create new bubble
                console.log(`➕ Creating new bubble ${i}: ${msg.role} - "${msg.content.substring(0, 50)}..."`);
                result.push({
                  id: `bubble-${i}-${Date.now()}-${Math.random()}`,
                  role: msg.role === 'user' ? 'user' as const : 'agent' as const,
                  content: msg.content,
                  timestamp: new Date()
                });
              }
            }
            
            console.log(`✅ Final result: ${result.length} bubbles`);
            return result;
          });
        });
      }
    });

    client.on("metadata", (metadata) => {
      console.log("📊 EVENT: metadata - Received metadata:", metadata);
    });

    client.on("error", (error) => {
      console.error("❌ EVENT: error - An error occurred:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        type: error.type,
        timestamp: new Date().toISOString()
      });
      
      // Check if it's a specific scrollbar-related error
      if (error.message && error.message.includes('DOM')) {
        console.error("DOM-related error detected - this might be related to scrollbar appearance");
      }
      
      alert(`Call error: ${error.message || error}`);
      setIsCallActive(false);
      setIsConnecting(false);
      setIsSpeaking(false);
      if (client) {
        client.stopCall();
      }
    });

    console.log("Event listeners set up successfully");

    return () => {
      console.log("Cleaning up Retell Web Client...");
      if (client) {
        client.stopCall();
      }
    };
  }, []); // Only run once on mount - don't reinitialize on scroll

  const handleTestAgent = async () => {
    if (!agent || isConnecting) return;

    if (isCallActive) {
      // Stop the call
      console.log("Stopping call...");
      if (retellWebClient.current) {
        retellWebClient.current.stopCall();
      }
    } else {
      // Start the call
      try {
        setIsConnecting(true);
        // Clear previous chat messages when starting new call
        setChatMessages([]);
        // Reset scroll state
        setIsUserScrolling(false);
        setShowScrollButton(false);
        // Ensure container is scrolled to top
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = 0;
        }
        
        console.log("Requesting microphone permissions...");
        // Request microphone permissions first
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log("Microphone permission granted");
        } catch (permError) {
          console.error("Microphone permission denied:", permError);
          alert("Microphone permission is required for voice calls. Please enable microphone access and try again.");
          setIsConnecting(false);
          return;
        }
        
        console.log("Creating web call for agent:", agent.agent_id);
        const response = await createWebCall(agent.agent_id);
        console.log("Web call response:", response);
        console.log("Response type:", typeof response);
        console.log("Response keys:", Object.keys(response || {}));
        
        // Check client initialization
        console.log("retellWebClient.current:", retellWebClient.current);
        console.log("Client is initialized:", !!retellWebClient.current);
        
        // Check access token (it's nested in response.data)
        console.log("response.data.access_token:", response?.data?.access_token);
        console.log("Access token exists:", !!response?.data?.access_token);
        console.log("Access token type:", typeof response?.data?.access_token);
        
        if (!retellWebClient.current) {
          throw new Error("Retell Web Client is not initialized");
        }
        
        if (!response?.data?.access_token) {
          throw new Error("No access token received from API");
        }
        
        console.log("Starting call with access token:", response.data.access_token.substring(0, 20) + "...");
        
        // Start the call with simpler options first
        await retellWebClient.current.startCall({
          accessToken: response.data.access_token,
        });
        
        console.log("startCall method completed");
      } catch (error) {
        console.error("Failed to start call:", error);
        alert(`Failed to start call: ${error.message}`);
        setIsConnecting(false);
      }
    }
  };

  if (isLoading || voicesLoading) {
    return <div className="flex items-center justify-center h-96">Loading agent details...</div>;
  }

  if (error || !agent) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Agent Not Found</h1>
          <p className="text-gray-600 mb-6">The requested agent could not be found.</p>
          <Button onClick={() => navigate("/ai-agents")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to AI Agents
          </Button>
        </div>
      </div>
    );
  }

  const agentType = getAgentType();
  const displayInfo = getAgentDisplayInfo(agentType);
  const IconComponent = getAgentIcon(agentType);
  
  // Find the selected voice details
  const selectedVoice = voices.find(v => v.voice_id === formData.voice_id);

  // Reset form to original data
  const handleReset = () => {
    if (agent) {
      setFormData({
        model: agent.model || '',
        voice_id: agent.voice_id || '',
        language: agent.language || '',
        global_prompt: agent.global_prompt || ''
      });
    }
  };

  // Handle form field changes
  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 pt-6 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        {/* Back button */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/ai-agents")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to AI Agents</span>
          </Button>
        </div>
        
        {/* Title section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <IconComponent className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {displayInfo.name}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">{displayInfo.description}</p>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleReset}>
              Reset Configuration
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Save Configuration
            </Button>
          </div>
        </div>
      </div>

      {/* Main content grid - 70/30 split */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Left column - spans 7 columns */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          {/* Core Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Agent Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>AI Model</Label>
                  <Select value={formData.model} onValueChange={(value) => handleFieldChange('model', value)}>
                    <SelectTrigger>
                      <SelectValue>
                        <span>{formData.model}</span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                      <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
                      <SelectItem value="gpt-4.1">gpt-4.1</SelectItem>
                      <SelectItem value="gpt-4.1-mini">gpt-4.1-mini</SelectItem>
                      <SelectItem value="gpt-4.1-nano">gpt-4.1-nano</SelectItem>
                      <SelectItem value="claude-3.7-sonnet">claude-3.7-sonnet</SelectItem>
                      <SelectItem value="claude-3.5-haiku">claude-3.5-haiku</SelectItem>
                      <SelectItem value="gemini-2.0-flash">gemini-2.0-flash</SelectItem>
                      <SelectItem value="gemini-2.0-flash-lite">gemini-2.0-flash-lite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Voice</Label>
                  <Select value={formData.voice_id} onValueChange={(value) => handleFieldChange('voice_id', value)}>
                    <SelectTrigger>
                      <SelectValue>
                        <div className="flex items-center space-x-2">
                          <Mic className="h-4 w-4" />
                          <span>{selectedVoice?.voice_name || formData.voice_id}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map((voice) => (
                        <SelectItem key={voice.voice_id} value={voice.voice_id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{voice.voice_name}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              {voice.gender} • {voice.accent} • {voice.age}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Language</Label>
                  <Select value={formData.language} onValueChange={(value) => handleFieldChange('language', value)}>
                    <SelectTrigger>
                      <SelectValue>
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4" />
                          <span>{formData.language}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="en-IN">English (India)</SelectItem>
                      <SelectItem value="en-GB">English (UK)</SelectItem>
                      <SelectItem value="en-AU">English (Australia)</SelectItem>
                      <SelectItem value="en-NZ">English (New Zealand)</SelectItem>
                      <SelectItem value="de-DE">German</SelectItem>
                      <SelectItem value="es-ES">Spanish (Spain)</SelectItem>
                      <SelectItem value="es-419">Spanish (Latin America)</SelectItem>
                      <SelectItem value="hi-IN">Hindi</SelectItem>
                      <SelectItem value="fr-FR">French (France)</SelectItem>
                      <SelectItem value="fr-CA">French (Canada)</SelectItem>
                      <SelectItem value="ja-JP">Japanese</SelectItem>
                      <SelectItem value="pt-PT">Portuguese (Portugal)</SelectItem>
                      <SelectItem value="pt-BR">Portuguese (Brazil)</SelectItem>
                      <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
                      <SelectItem value="ru-RU">Russian</SelectItem>
                      <SelectItem value="it-IT">Italian</SelectItem>
                      <SelectItem value="ko-KR">Korean</SelectItem>
                      <SelectItem value="nl-NL">Dutch (Netherlands)</SelectItem>
                      <SelectItem value="nl-BE">Dutch (Belgium)</SelectItem>
                      <SelectItem value="pl-PL">Polish</SelectItem>
                      <SelectItem value="tr-TR">Turkish</SelectItem>
                      <SelectItem value="th-TH">Thai</SelectItem>
                      <SelectItem value="vi-VN">Vietnamese</SelectItem>
                      <SelectItem value="ro-RO">Romanian</SelectItem>
                      <SelectItem value="bg-BG">Bulgarian</SelectItem>
                      <SelectItem value="ca-ES">Catalan</SelectItem>
                      <SelectItem value="da-DK">Danish</SelectItem>
                      <SelectItem value="fi-FI">Finnish</SelectItem>
                      <SelectItem value="el-GR">Greek</SelectItem>
                      <SelectItem value="hu-HU">Hungarian</SelectItem>
                      <SelectItem value="id-ID">Indonesian</SelectItem>
                      <SelectItem value="no-NO">Norwegian</SelectItem>
                      <SelectItem value="sk-SK">Slovak</SelectItem>
                      <SelectItem value="sv-SE">Swedish</SelectItem>
                      <SelectItem value="multi">Multi-language</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Global Prompt */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Global Prompt</span>
              </CardTitle>
              <CardDescription>
                System instructions and agent behavior configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="h-full">
              <Textarea 
                value={formData.global_prompt} 
                onChange={(e) => handleFieldChange('global_prompt', e.target.value)}
                className="font-mono text-sm w-full h-[500px] resize-none"
                placeholder="Enter the system prompt for the agent..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Right column - Tabs for Knowledge Base and Test Agent - spans 3 columns */}
        <div className="lg:col-span-3">
          <Card className="h-full min-h-[750px]">
            <Tabs defaultValue="knowledge" className="w-full h-full flex flex-col">
              <CardHeader className="pb-3">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="knowledge" className="flex items-center justify-center space-x-2">
                    <Database className="h-4 w-4" />
                    <span>Knowledge Base</span>
                  </TabsTrigger>
                  <TabsTrigger value="test" className="flex items-center justify-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>Test Agent</span>
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="flex-1 p-0">
                <TabsContent value="knowledge" className="mt-0 h-full p-6">
                  <div className="mb-4">
                    <CardDescription>
                      Documents and resources available to the agent
                    </CardDescription>
                  </div>
                  {agent.knowledge_bases.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Database className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No knowledge bases configured</p>
                      <Button variant="outline" className="mt-4">
                        Add Knowledge Base
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {agent.knowledge_bases.map((kb) => (
                        <div key={kb.knowledge_base_id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-lg">{kb.knowledge_base_name}</h3>
                            <Badge className={kb.status === 'complete' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                              {kb.status}
                            </Badge>
                          </div>
                          
                          {kb.knowledge_base_sources.length > 0 && (
                            <div className="space-y-2">
                              <Label className="text-sm text-gray-600">Documents</Label>
                              {kb.knowledge_base_sources.map((source) => (
                                <div key={source.source_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <FileDown className="h-5 w-5 text-blue-600" />
                                    <div>
                                      <div className="font-medium text-sm">{source.filename}</div>
                                      <div className="text-xs text-gray-600">
                                        {source.type.toUpperCase()} • {formatFileSize(source.file_size)}
                                      </div>
                                    </div>
                                  </div>
                                  {source.file_url && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => window.open(source.file_url, '_blank')}
                                    >
                                      <FileDown className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="mt-3 flex justify-end">
                            <Button variant="outline" size="sm">
                              Manage Knowledge Base
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="test" className="mt-0" style={{ height: '750px', padding: '24px' }}>
                  {isCallActive || isConnecting ? (
                    <>
                      <style>{`
                        /* Force container to always have space for scrollbar */
                        #chat-scroll-container {
                          overflow-y: scroll !important; /* Always show scrollbar */
                          overflow-x: hidden !important;
                          scrollbar-width: thin;
                          scrollbar-color: #888 #f1f1f1;
                          box-sizing: border-box;
                          /* Reserve space for scrollbar to prevent layout shift */
                          padding-right: 12px;
                        }
                        
                        /* Always show scrollbar on webkit browsers */
                        #chat-scroll-container::-webkit-scrollbar {
                          width: 12px !important;
                          display: block !important;
                          visibility: visible !important;
                        }
                        
                        #chat-scroll-container::-webkit-scrollbar-track {
                          background: #f1f1f1 !important;
                          border-radius: 10px !important;
                          visibility: visible !important;
                        }
                        
                        #chat-scroll-container::-webkit-scrollbar-thumb {
                          background: #888 !important;
                          border-radius: 10px !important;
                          visibility: visible !important;
                          min-height: 30px; /* Ensure thumb is always visible */
                        }
                        
                        #chat-scroll-container::-webkit-scrollbar-thumb:hover {
                          background: #555 !important;
                        }
                        
                        /* Scroll to bottom button styles */
                        .scroll-to-bottom-btn {
                          position: absolute;
                          bottom: 90px;
                          right: 30px;
                          width: 40px;
                          height: 40px;
                          background: #3B82F6;
                          color: white;
                          border-radius: 50%;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          cursor: pointer;
                          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                          transition: all 0.2s ease;
                          z-index: 10;
                        }
                        
                        .scroll-to-bottom-btn:hover {
                          background: #2563EB;
                          transform: scale(1.05);
                        }
                        
                        /* Ensure smooth transitions and no layout shifts */
                        #chat-scroll-container * {
                          transition: none !important;
                        }
                      `}</style>
                      {/* End call button */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <Button 
                          onClick={() => {
                            // Add test messages to force scrollbar
                            const testMessages = [];
                            for (let i = 0; i < 30; i++) {
                              testMessages.push({
                                id: `test-${i}`,
                                role: i % 2 === 0 ? 'user' : 'agent',
                                content: `Test message ${i + 1}`,
                                timestamp: new Date()
                              });
                            }
                            setChatMessages(testMessages);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Add Test Messages
                        </Button>
                        <Button 
                          onClick={handleTestAgent}
                          variant="destructive"
                          size="sm"
                        >
                          <PhoneOff className="h-4 w-4 mr-2" />
                          End Call
                        </Button>
                      </div>

                      {/* Chat container with relative positioning */}
                      <div style={{ position: 'relative', height: '650px' }}>
                        {/* Hidden div to force scrollbar space */}
                        <div style={{ 
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '12px',
                          height: '100%',
                          backgroundColor: '#f1f1f1',
                          borderRadius: '0 8px 8px 0',
                          zIndex: 1
                        }} />
                        
                        {/* Scrollable chat area */}
                        <div 
                          ref={chatScrollRef}
                          id="chat-scroll-container"
                          onScroll={handleScroll}
                          style={{
                            height: '650px',
                            overflowY: 'scroll', // Always show scrollbar
                            overflowX: 'hidden',
                            backgroundColor: '#F9FAFB',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            padding: '20px',
                            paddingRight: '32px', // Extra padding for scrollbar
                            paddingBottom: '60px', // Extra bottom padding
                            position: 'relative',
                            boxSizing: 'border-box'
                          }}
                        >
                          <div style={{ minHeight: '100%', paddingBottom: '40px' }}>
                            {chatMessages.length === 0 ? (
                              <p style={{ textAlign: 'center', color: '#6B7280', paddingTop: '20px' }}>
                                {isConnecting ? "Connecting..." : "Conversation will appear here..."}
                              </p>
                            ) : (
                              <>
                                {chatMessages.map((message, index) => (
                                  <div 
                                    key={message.id} 
                                    style={{
                                      marginBottom: index === chatMessages.length - 1 ? '40px' : '16px',
                                      textAlign: message.role === 'user' ? 'right' : 'left'
                                    }}
                                  >
                                    <div 
                                      style={{
                                        display: 'inline-block',
                                        maxWidth: '70%',
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        backgroundColor: message.role === 'user' ? '#3B82F6' : '#FFFFFF',
                                        color: message.role === 'user' ? '#FFFFFF' : '#1F2937',
                                        border: message.role === 'user' ? 'none' : '1px solid #E5E7EB',
                                        textAlign: 'left'
                                      }}
                                    >
                                      <div style={{ fontSize: '14px' }}>{message.content}</div>
                                      <div style={{ 
                                        fontSize: '12px', 
                                        marginTop: '4px',
                                        opacity: 0.7
                                      }}>
                                        {message.role === 'user' ? 'You' : 'Agent'} • {message.timestamp.toLocaleTimeString()}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Scroll to bottom button */}
                        {showScrollButton && (
                          <div 
                            className="scroll-to-bottom-btn"
                            onClick={() => scrollToBottom()}
                            title="Scroll to bottom"
                          >
                            <ChevronDown className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    /* Show microphone when not in call */
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <AnimatedMicrophone
                        isActive={isCallActive}
                        isConnecting={isConnecting}
                        isSpeaking={isSpeaking}
                        onClick={handleTestAgent}
                      />
                    </div>
                  )}
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}