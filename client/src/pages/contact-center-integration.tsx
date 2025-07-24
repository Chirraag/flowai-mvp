import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Phone,
  MessageCircle,
  Users,
  Clock,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertCircle,
  User,
  Send,
  ArrowUp,
} from "lucide-react";

export default function ContactCenterIntegration() {
  const [activeTab, setActiveTab] = useState("contact-center");

  const tabs = [
    { id: "contact-center", label: "Contact Center", icon: Phone },
    { id: "human-agent", label: "Human ↔ Agent", icon: Users },
  ];

  const contactCenterMetrics = [
    {
      title: "Active Agents",
      value: "24",
      change: "+2",
      icon: Users,
      color: "blue",
    },
    {
      title: "Avg Response Time",
      value: "1.2s",
      change: "-0.3s",
      icon: Clock,
      color: "green",
    },
    {
      title: "Call Volume",
      value: "342",
      change: "+15%",
      icon: Phone,
      color: "purple",
    },
    {
      title: "Success Rate",
      value: "94.5%",
      change: "+2.1%",
      icon: CheckCircle,
      color: "green",
    },
  ];

  const conversationLogs = [
    {
      id: "1",
      type: "AI Agent",
      message:
        "Good afternoon! I understand you need to verify your insurance coverage for an upcoming MRI scan. I've confirmed your identity and that you have Aetna insurance. However, I need to transfer you to a specialist to verify the specific procedure coverage.",
      timestamp: "2:01 PM",
      avatar: "AI",
    },
    {
      id: "2",
      type: "Alice Johnson",
      message:
        "I just need to know if my MRI is covered or if I'll have to pay out of pocket. This is really important because I can't afford to pay thousands of dollars.",
      timestamp: "2:01 PM",
      avatar: "AJ",
    },
    {
      id: "3",
      type: "Sarah Johnson (Agent)",
      message:
        "Hello Alice, I can see you've been speaking with our AI agent about verifying your MRI coverage. I've reviewed your conversation and I'm here to help you get the exact information you need.",
      timestamp: "2:04 PM",
      avatar: "SJ",
    },
    {
      id: "4",
      type: "Alice Johnson",
      message: "Yes, thank you!",
      timestamp: "2:05 PM",
      avatar: "AJ",
    },
  ];

  const callSummary = {
    contact: "Alice Johnson • +1-555-0123",
    patient: "Same (Alice Johnson)",
    department: "Riverside Imaging",
    urgency: "High",
    keyDetails: [
      "Aetna Member ID: A1234565789",
      "Requested exam: Brain MRI",
      "Facility: Riverside Imaging",
      "Scheduled date: Dec 14th",
      "Time: Riverside Imaging",
    ],
  };

  const aiCopilotActions = [
    { action: "Verify Riverside Imaging is in-network", status: "completed" },
    { action: "Check prior authorization requirements", status: "completed" },
    { action: "Calculate patient cost sharing amount", status: "pending" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integration</h1>
          <p className="text-gray-600 mt-2">
            AI-to-Human agent transfer management and call center operations
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "contact-center" && (
        <div className="space-y-6">
          {/* Contact Center Integrations */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Center Integrations</CardTitle>
              <CardDescription>
                Manage and configure contact center platforms for AI-to-human
                handoffs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* RingCentral */}
                <Card className="border-l-4 border-l-orange-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">RC</span>
                      </div>
                      <h3 className="font-semibold">RingCentral</h3>
                      <Badge className="bg-green-100 text-green-800">
                        Connected
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Voice API:</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex justify-between">
                        <span>SMS/MMS:</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex justify-between">
                        <span>Analytics:</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex justify-between">
                        <span>WebRTC:</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <Button className="w-full mt-4" size="sm">
                      Configure
                    </Button>
                  </CardContent>
                </Card>

                {/* Genesys Cloud */}
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">GC</span>
                      </div>
                      <h3 className="font-semibold">Genesys Cloud</h3>
                      <Badge variant="secondary">Setup Required</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Platform API:</span>
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex justify-between">
                        <span>Routing:</span>
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex justify-between">
                        <span>Analytics:</span>
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex justify-between">
                        <span>Workforce:</span>
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <Button className="w-full mt-4" size="sm">
                      Setup Integration
                    </Button>
                  </CardContent>
                </Card>

                {/* Amazon Connect */}
                <Card className="border-l-4 border-l-orange-600">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">AC</span>
                      </div>
                      <h3 className="font-semibold">Amazon Connect</h3>
                      <Badge variant="secondary">Setup Required</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Connect API:</span>
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex justify-between">
                        <span>Contact Flows:</span>
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex justify-between">
                        <span>Agent Events:</span>
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex justify-between">
                        <span>Analytics:</span>
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <Button className="w-full mt-4" size="sm">
                      Setup Integration
                    </Button>
                  </CardContent>
                </Card>

                {/* Avaya OneCloud */}
                <Card className="border-l-4 border-l-purple-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">AO</span>
                      </div>
                      <h3 className="font-semibold">Avaya OneCloud</h3>
                      <Badge variant="secondary">Setup Required</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>CPaaS API:</span>
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex justify-between">
                        <span>Contact Center:</span>
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex justify-between">
                        <span>Workforce:</span>
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex justify-between">
                        <span>Analytics:</span>
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <Button className="w-full mt-4" size="sm">
                      Setup Integration
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Human Agents Status */}
            <Card>
              <CardHeader>
                <CardTitle>Human Agents Status</CardTitle>
                <CardDescription>
                  Current agent availability and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Sarah Johnson */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          SJ
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Sarah Johnson</p>
                        <p className="text-sm text-gray-600">
                          Insurance, Billing
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-800 mb-1">
                        Available
                      </Badge>
                      <p className="text-xs text-gray-500">23 calls today</p>
                    </div>
                  </div>

                  {/* Michael Chen */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          MC
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Michael Chen</p>
                        <p className="text-sm text-gray-600">
                          Technical Support, EMR
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-yellow-100 text-yellow-800 mb-1">
                        On Call
                      </Badge>
                      <p className="text-xs text-gray-500">31 calls today</p>
                    </div>
                  </div>

                  {/* Emma Rodriguez */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          ER
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Emma Rodriguez</p>
                        <p className="text-sm text-gray-600">
                          Appointments, General
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-red-100 text-red-800 mb-1">
                        Busy
                      </Badge>
                      <p className="text-xs text-gray-500">18 calls today</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transfer Queue */}
            <Card>
              <CardHeader>
                <CardTitle>Transfer Queue</CardTitle>
                <CardDescription>Patients awaiting assignment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Alice Johnson */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Alice Johnson</p>
                      <p className="text-sm text-gray-600">
                        Insurance coverage verification needed
                      </p>
                      <p className="text-xs text-gray-500">
                        ⏱ Wait time: 0:18
                      </p>
                      <p className="text-xs text-gray-500">
                        🤖 Confidence: 23%
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant="destructive">High Priority</Badge>
                      <p className="text-xs text-gray-500">
                        Requested: Insurance specialist
                      </p>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          View Contact
                        </Button>
                        <Button size="sm">Assign</Button>
                      </div>
                    </div>
                  </div>

                  {/* Robert Davis */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Robert Davis</p>
                      <p className="text-sm text-gray-600">
                        Technical support for patient portal
                      </p>
                      <p className="text-xs text-gray-500">
                        ⏱ Wait time: 6:32
                      </p>
                      <p className="text-xs text-gray-500">
                        🤖 Confidence: 15%
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Medium Priority
                      </Badge>
                      <p className="text-xs text-gray-500">
                        Requested: Technical support
                      </p>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          View Contact
                        </Button>
                        <Button size="sm">Assign</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Human ↔ Agent Tab Content */}
      {activeTab === "human-agent" && (
        <div className="space-y-6">
          {/* Live Call Header */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-gray-700" />
                  <span className="font-semibold text-lg">
                    Live Call - Alice Johnson
                  </span>
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
              <p className="text-sm text-gray-600 mt-1">
                Agent: Sarah Johnson • Duration: 3:42 • Insurance Verification
              </p>
            </CardContent>
          </Card>

          {/* Conversation Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Conversation Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversationLogs.map((log) => (
                  <div key={log.id} className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback
                        className={
                          log.type.includes("Agent")
                            ? "bg-green-100 text-green-700"
                            : log.type === "AI Agent"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                        }
                      >
                        {log.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{log.type}</span>
                        <span className="text-xs text-gray-500">
                          {log.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{log.message}</p>
                    </div>
                  </div>
                ))}

                {/* Transfer Notice */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <ArrowUp className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">
                      Transferred to Human Agent
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Copilot for Human Agent */}
          <Card>
            <CardHeader>
              <CardTitle>AI Copilot for Human Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <h4 className="font-medium text-sm">Actions</h4>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Knowledge</h4>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Responses</h4>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-medium text-sm">🔄 Next Best Actions</h5>
                {aiCopilotActions.map((action, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm">{action.action}</span>
                    <Badge
                      variant={
                        action.status === "completed" ? "default" : "secondary"
                      }
                    >
                      {action.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
