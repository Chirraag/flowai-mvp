import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Phone, MessageCircle, Users, Clock, TrendingUp, Activity, CheckCircle, Settings, Plus, Eye, UserCheck, ArrowUp, Send } from "lucide-react";

export default function HumanAI() {
  const conversationLogs = [
    {
      id: "1",
      type: "AI Agent",
      message: "Good afternoon! I understand you need to verify your insurance coverage for an upcoming MRI scan. I've confirmed your identity and that you have Aetna insurance. However, I need to transfer you to a specialist to verify the specific procedure coverage.",
      timestamp: "2:01 PM",
      avatar: "AI"
    },
    {
      id: "2", 
      type: "Alice Johnson",
      message: "I just need to know if my MRI is covered or if I'll have to pay out of pocket. This is really important because I can't afford to pay thousands of dollars.",
      timestamp: "2:01 PM",
      avatar: "AJ"
    },
    {
      id: "3",
      type: "Sarah Johnson (Agent)",
      message: "Hello Alice, I can see you've been speaking with our AI agent about verifying your MRI coverage. I've reviewed your conversation and I'm here to help you get the exact information you need.",
      timestamp: "2:04 PM",
      avatar: "SJ"
    },
    {
      id: "4",
      type: "Alice Johnson", 
      message: "Yes, thank you!",
      timestamp: "2:05 PM",
      avatar: "AJ"
    }
  ];

  const callSummary = {
    context: "Patient wants MRI coverage verification for Aetna back at Riverside Imaging. Previously scheduled to schedule appointment. Express concerns.",
    sentiment: "Anxious",
    urgency: "High",
    keyDetails: [
      "Aetna Member ID: A1234565789",
      "Requested exam: Brain MRI",
      "Facility: Riverside Imaging",
      "Scheduled date: Dec 14th"
    ]
  };

  const aiCopilotActions = [
    { action: "Verify Riverside Imaging is in-network", status: "completed" },
    { action: "Check prior authorization requirements", status: "completed" },
    { action: "Calculate patient cost sharing amount", status: "pending" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Human agents</h1>
          <p className="text-gray-600 mt-2">Human Agents Console</p>
          <p className="text-gray-600">AI-to-Human agent transfer management and call center operations</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          {/* Live Call Header */}
          <Card className="bg-yellow-50 border-yellow-200 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-gray-700" />
                  <span className="font-semibold text-lg">Live Call - Alice Johnson</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Transfer
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    End Call
                  </Button>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                Agent: Sarah Johnson • Duration: 3:42 • Insurance Verification
              </div>
            </CardContent>
          </Card>

          {/* Conversation Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conversation Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversationLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                        {log.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{log.type}</span>
                        <span className="text-xs text-gray-500">{log.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-700">{log.message}</p>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <Button variant="outline" className="w-full text-center">
                    <ArrowUp className="h-4 w-4 mr-2" />
                    Transferred to Human Agent
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Call Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Call Summary So Far
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Context</h4>
                <p className="text-sm text-gray-600">{callSummary.context}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Patient</h4>
                <p className="text-sm text-gray-600">Alice Johnson</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Sentiment</h4>
                <p className="text-sm text-gray-600">{callSummary.sentiment}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Urgency</h4>
                <Badge variant="destructive" className="text-xs">
                  {callSummary.urgency}
                </Badge>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Key Details</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {callSummary.keyDetails.map((detail, index) => (
                    <li key={index}>• {detail}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Escalate to Supervisor
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Send className="h-4 w-4 mr-2" />
                Send Follow-up SMS
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Eye className="h-4 w-4 mr-2" />
                Generate Summary
              </Button>
            </CardContent>
          </Card>

          {/* AI Copilot */}
          <Card>
            <CardHeader>
              <CardTitle>AI Copilot for Human Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-2">Actions</h4>
                  <div className="space-y-2">
                    {aiCopilotActions.map((action, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {action.status === "completed" ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-600" />
                        )}
                        <span className="text-gray-700">{action.action}</span>
                        <Badge 
                          variant={action.status === "completed" ? "default" : "secondary"}
                          className="ml-auto text-xs"
                        >
                          {action.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Knowledge</h4>
                  <div className="space-y-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Next Best Actions
                    </Button>
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Verify Riverside Imaging is in-network
                    </Button>
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Check prior authorization requirements
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Resources</h4>
                  <div className="space-y-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Calculate patient cost sharing amount
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button className="w-full mt-4" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Generate Summary
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}