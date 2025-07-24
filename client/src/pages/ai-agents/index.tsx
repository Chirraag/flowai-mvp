import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IOSSwitch } from "@/components/ui/ios-switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Bot, Activity, Settings, MessageSquare, Calendar, FileText, Shield, Zap, Users, BarChart3, Play, Pause, AlertTriangle, CheckCircle, Target, Brain, TestTube, Clock, TrendingUp, Eye, Rocket, StopCircle } from "lucide-react";

interface Agent {
  id: number;
  name: string;
  type: string;
  description: string;
  language: string;
  status: string;
  configuration: {
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
    tools: string[];
    integrations: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export default function AIAgents() {
  const [selectedAgentForConfig, setSelectedAgentForConfig] = useState<string>("");

  const { data: agents = [], isLoading } = useQuery<Agent[]>({
    queryKey: ["/api/v1/ai-agents"],
  });

  // Mock evaluation data - in production this would come from real analytics
  const evaluationMetrics = {
    hallucination: {
      score: 5.8,
      trend: -2.1,
      lastEvaluation: "2024-06-14T10:30:00Z",
      tests: 247,
      passed: 233
    },
    accuracy: {
      score: 96.8,
      trend: 1.5,
      lastEvaluation: "2024-06-14T10:30:00Z", 
      tests: 180,
      passed: 174
    },
    responsiveness: {
      score: 98.1,
      trend: -0.3,
      lastEvaluation: "2024-06-14T10:30:00Z",
      avgTime: "1.2s",
      p95Time: "2.8s"
    },
    contextRelevance: {
      score: 92.5,
      trend: 3.2,
      lastEvaluation: "2024-06-14T10:30:00Z",
      tests: 156,
      passed: 144
    }
  };

  const getAgentIcon = (type: string) => {
    const icons = {
      "order_intake": FileText,
      "order_ingestion": FileText, // backward compatibility
      "scheduling": Calendar,
      "insurance_verification": Shield,
      "communication": MessageSquare,
      "authorization": Zap,
      "prior_authorization": Zap,
      "integration": Settings,
      "checkin": Users,
      "orchestration": BarChart3
    };
    return icons[type as keyof typeof icons] || Bot;
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
  };

  const getLanguageFlag = (language: string) => {
    const flags = {
      "en": "🇺🇸",
      "es": "🇪🇸", 
      "zh": "🇨🇳"
    };
    return flags[language as keyof typeof flags] || "🇺🇸";
  };

  const selectedAgentData = agents.find(agent => agent.id.toString() === selectedAgentForConfig);

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">AI Agents</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Configure and manage your AI healthcare agents</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Create Agent
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 gap-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="config" className="text-xs sm:text-sm">Config</TabsTrigger>
          <TabsTrigger value="evaluation" className="text-xs sm:text-sm">Evaluation</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">

          {/* Deployed AI Agents - Only Active Ones */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Deployed AI Agents</CardTitle>
              <CardDescription className="text-sm">Healthcare-specialized AI agents currently active in your system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {agents
                  .filter(agent => 
                    agent.type === 'scheduling' || 
                    agent.type === 'digital_intake' ||
                    agent.name.toLowerCase().includes('scheduling') ||
                    agent.name.toLowerCase().includes('intake')
                  )
                  .map((agent) => {
                    const IconComponent = getAgentIcon(agent.type);
                    return (
                      <Card key={agent.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center space-x-2 min-w-0 flex-1">
                              <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                              <CardTitle className="text-sm sm:text-base truncate">{agent.name}</CardTitle>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                onClick={() => {
                                  if (agent.type === 'scheduling' || agent.name.toLowerCase().includes('scheduling')) {
                                    window.location.href = '/ai-agents/scheduling-agent-config';
                                  } else {
                                    setSelectedAgentForConfig(agent.id.toString());
                                    const configTab = document.querySelector('[data-value="config"]') as HTMLElement;
                                    configTab?.click();
                                  }
                                }}
                              >
                                <Settings className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 hover:text-blue-600" />
                              </Button>
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                                Active
                              </Badge>
                            </div>
                          </div>
                          <CardDescription className="text-xs sm:text-sm mt-2">{agent.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2 text-xs sm:text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Type:</span>
                              <span className="font-medium truncate ml-2">{agent.type.replace('_', ' ')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Model:</span>
                              <span className="font-medium truncate ml-2">{agent.configuration?.model || 'GPT-4'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Language:</span>
                              <span className="font-medium truncate ml-2">{getLanguageFlag(agent.language || 'en')} {(agent.language || 'en').toUpperCase()}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Available Agents - All Others */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Available Agents</CardTitle>
              <CardDescription className="text-sm">Additional AI agents ready for deployment and configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {agents
                  .filter(agent => {
                    const agentName = agent.name.toLowerCase();
                    return (
                      agentName.includes('order') && agentName.includes('intake') ||
                      agentName.includes('authorization') ||
                      agentName.includes('insurance') && agentName.includes('verification') ||
                      agentName.includes('faq')
                    );
                  })
                  .sort((a, b) => {
                    const getOrder = (agent: Agent) => {
                      const name = agent.name.toLowerCase();
                      if (name.includes('order') && name.includes('intake')) return 0;
                      if (name.includes('authorization')) return 1;
                      if (name.includes('insurance') && name.includes('verification')) return 2;
                      if (name.includes('faq')) return 3;
                      return 4;
                    };
                    return getOrder(a) - getOrder(b);
                  })
                  .map((agent) => {
                    const IconComponent = getAgentIcon(agent.type);
                    return (
                      <Card key={agent.id} className="hover:shadow-md transition-shadow border-dashed">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <IconComponent className="h-5 w-5 text-gray-500" />
                              <CardTitle className="text-base text-gray-700">{agent.name}</CardTitle>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  if (agent.type === 'scheduling' || agent.name.toLowerCase().includes('scheduling')) {
                                    window.location.href = '/ai-agents/scheduling-agent-config';
                                  } else {
                                    setSelectedAgentForConfig(agent.id.toString());
                                    const configTab = document.querySelector('[data-value="config"]') as HTMLElement;
                                    configTab?.click();
                                  }
                                }}
                              >
                                <Settings className="h-4 w-4 text-gray-500 hover:text-blue-600" />
                              </Button>
                              <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">
                                Available
                              </Badge>
                            </div>
                          </div>
                          <CardDescription className="text-sm">{agent.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Type:</span>
                              <span className="font-medium">{agent.type.replace('_', ' ')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Model:</span>
                              <span className="font-medium">{agent.configuration?.model || 'GPT-4'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Language:</span>
                              <span className="font-medium">{getLanguageFlag(agent.language || 'en')} {(agent.language || 'en').toUpperCase()}</span>
                            </div>
                          </div>
                          <div className="mt-4 pt-3 border-t border-gray-100">
                            <Button size="sm" variant="outline" className="w-full">
                              <Rocket className="h-4 w-4 mr-2" />
                              Deploy Agent
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agent Config Tab */}
        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Configuration</CardTitle>
              <CardDescription>Select an agent to configure its settings, prompts, and behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="agent-select">Select Agent</Label>
                  <Select value={selectedAgentForConfig} onValueChange={(value) => {
                    const selectedAgent = agents.find(agent => agent.id.toString() === value);
                    if (selectedAgent && (selectedAgent.type === 'scheduling' || selectedAgent.name.toLowerCase().includes('scheduling'))) {
                      window.location.href = '/ai-agents/scheduling-agent-config';
                      return;
                    }
                    if (selectedAgent && (selectedAgent.type === 'digital_intake' || selectedAgent.name.toLowerCase().includes('intake'))) {
                      window.location.href = '/ai-agents/patient-intake-agent-config';
                      return;
                    }
                    setSelectedAgentForConfig(value);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an agent to configure" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents
                        .filter(agent => {
                          const agentName = agent.name.toLowerCase();
                          return (
                            (agentName.includes('scheduling') && agentName.includes('agent')) ||
                            (agentName.includes('intake') && agentName.includes('agent'))
                          );
                        })
                        .map((agent) => {
                          const IconComponent = getAgentIcon(agent.type);
                          return (
                            <SelectItem key={agent.id} value={agent.id.toString()}>
                              <div className="flex items-center space-x-2">
                                <IconComponent className="h-4 w-4" />
                                <span>{agent.name}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                </div>

                {selectedAgentData && (
                  <div className="space-y-6 border-t pt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Settings className="h-5 w-5" />
                            <span>Basic Configuration</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label htmlFor="agent-name">Agent Name</Label>
                            <Input id="agent-name" value={selectedAgentData.name} />
                          </div>
                          <div>
                            <Label htmlFor="agent-description">Description</Label>
                            <Textarea id="agent-description" value={selectedAgentData.description || ""} rows={3} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="agent-model">AI Model</Label>
                              <Select value={selectedAgentData.configuration?.model || "gpt-4o"}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="agent-language">Language</Label>
                              <Select value={selectedAgentData.language || "en"}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="en">🇺🇸 English</SelectItem>
                                  <SelectItem value="es">🇪🇸 Spanish</SelectItem>
                                  <SelectItem value="zh">🇨🇳 Chinese</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="temperature">Temperature</Label>
                              <Input 
                                id="temperature" 
                                type="number" 
                                min="0" 
                                max="1" 
                                step="0.1" 
                                value={selectedAgentData.configuration?.temperature || 0.7} 
                              />
                            </div>
                            <div>
                              <Label htmlFor="max-tokens">Max Tokens</Label>
                              <Input 
                                id="max-tokens" 
                                type="number" 
                                value={selectedAgentData.configuration?.maxTokens || 1000} 
                              />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <IOSSwitch 
                              id="agent-active" 
                              checked={selectedAgentData.status === 'active'} 
                              onCheckedChange={(checked: boolean) => {
                                // Handle agent status change
                              }}
                            />
                            <Label htmlFor="agent-active">Agent Active</Label>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <MessageSquare className="h-5 w-5" />
                            <span>Prompt & Behavior</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label htmlFor="system-prompt">System Prompt</Label>
                            <Textarea 
                              id="system-prompt" 
                              placeholder="You are a helpful healthcare AI assistant..."
                              value={selectedAgentData.configuration?.systemPrompt || ""}
                              rows={6}
                            />
                          </div>
                          <div>
                            <Label htmlFor="tone">Tone & Style</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select communication tone" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="professional">Professional & Formal</SelectItem>
                                <SelectItem value="friendly">Friendly & Conversational</SelectItem>
                                <SelectItem value="empathetic">Empathetic & Caring</SelectItem>
                                <SelectItem value="clinical">Clinical & Direct</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="response-style">Response Style</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select response style" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="concise">Concise & Brief</SelectItem>
                                <SelectItem value="detailed">Detailed & Comprehensive</SelectItem>
                                <SelectItem value="structured">Structured & Organized</SelectItem>
                                <SelectItem value="conversational">Conversational & Natural</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Shield className="h-5 w-5" />
                          <span>Tools & Integrations</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <Label className="text-base font-medium">Available Tools</Label>
                            <div className="mt-3 space-y-2">
                              {(selectedAgentData.configuration?.tools || []).map((tool, index) => (
                                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span className="text-sm">{tool}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Label className="text-base font-medium">System Integrations</Label>
                            <div className="mt-3 space-y-2">
                              {(selectedAgentData.configuration?.integrations || []).map((integration, index) => (
                                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                                  <CheckCircle className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm">{integration}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-3">
                      <Button variant="outline">Reset to Defaults</Button>
                      <Button className="bg-blue-600 hover:bg-blue-700">Save Configuration</Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agent Evaluation Tab */}
        <TabsContent value="evaluation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Evaluation</CardTitle>
              <CardDescription>Select an agent to view its performance metrics and evaluation results</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="agent-eval-select">Select Agent</Label>
                <Select value={selectedAgentForConfig} onValueChange={setSelectedAgentForConfig}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an agent to evaluate" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents
                      .filter(agent => {
                        const agentName = agent.name.toLowerCase();
                        return (
                          (agentName.includes('scheduling') && agentName.includes('agent')) ||
                          (agentName.includes('intake') && agentName.includes('agent'))
                        );
                      })
                      .map((agent) => {
                        const IconComponent = getAgentIcon(agent.type);
                        return (
                          <SelectItem key={agent.id} value={agent.id.toString()}>
                            <div className="flex items-center space-x-2">
                              <IconComponent className="h-4 w-4" />
                              <span>{agent.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Brain className="h-4 w-4" />
                  <span>Hallucination Rate</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{evaluationMetrics.hallucination.score}%</div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+{evaluationMetrics.hallucination.trend}% this week</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {evaluationMetrics.hallucination.passed}/{evaluationMetrics.hallucination.tests} tests passed
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>Accuracy Score</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{evaluationMetrics.accuracy.score}%</div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-sm text-blue-600">+{evaluationMetrics.accuracy.trend}% this week</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {evaluationMetrics.accuracy.passed}/{evaluationMetrics.accuracy.tests} tests passed
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Response Time</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{evaluationMetrics.responsiveness.avgTime}</div>
                <div className="flex items-center mt-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mr-1" />
                  <span className="text-sm text-orange-600">{evaluationMetrics.responsiveness.trend}% slower</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  P95: {evaluationMetrics.responsiveness.p95Time}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>Context Relevance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{evaluationMetrics.contextRelevance.score}%</div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+{evaluationMetrics.contextRelevance.trend}% this week</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {evaluationMetrics.contextRelevance.passed}/{evaluationMetrics.contextRelevance.tests} tests passed
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TestTube className="h-5 w-5" />
                  <span>Testing Results</span>
                </CardTitle>
                <CardDescription>Recent evaluation test results across all agents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agents.slice(0, 4).map((agent) => {
                    const IconComponent = getAgentIcon(agent.type);
                    return (
                      <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <IconComponent className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-medium">{agent.name}</div>
                            <div className="text-sm text-gray-600">Last tested 2 hours ago</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-green-100 text-green-800">
                            {Math.floor(Math.random() * 5) + 95}% Pass Rate
                          </Badge>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button className="w-full mt-4" variant="outline">
                  <TestTube className="h-4 w-4 mr-2" />
                  Run Full Test Suite
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Performance Metrics</span>
                </CardTitle>
                <CardDescription>Detailed performance analysis and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Token Usage Efficiency</span>
                    <span className="text-sm text-green-600">92.3%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '92.3%' }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Error Rate</span>
                    <span className="text-sm text-red-600">2.1%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{ width: '2.1%' }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">User Satisfaction</span>
                    <span className="text-sm text-blue-600">96.7%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '96.7%' }}></div>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Detailed Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>



      </Tabs>
    </div>
  );
}