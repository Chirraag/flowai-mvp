import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { IOSSwitch } from "@/components/ui/ios-switch";
import { Label } from "@/components/ui/label";
import { Shield, CheckCircle, Upload, Database, Users, Eye } from "lucide-react";

export default function Privacy() {
  const [privacyControls, setPrivacyControls] = useState({
    dataMasking: true,
    accessControls: true,
    differentialPrivacy: true
  });

  const privacyMetrics = [
    {
      title: "Data Masking Active",
      status: "Active",
      description: "PHI identifiers protected",
      progress: 100,
      icon: Database,
      color: "blue"
    },
    {
      title: "Access Controls",
      status: "RBAC",
      description: "Role-based permissions",
      detail: "All agents configured",
      icon: Users,
      color: "green"
    },
    {
      title: "Differential Privacy",
      status: "Active",
      description: "Noise injection enabled",
      detail: "ε = 0.1 privacy budget",
      icon: Eye,
      color: "purple"
    }
  ];

  const privacyImplementations = [
    {
      id: "data-masking",
      title: "Data Masking/Anonymization/De-identification",
      status: "Implemented",
      description: "We implement techniques to remove or encrypt identifiers when PHI is not strictly needed for AI processing or training. This is crucial for training AI models without directly exposing PHI.",
      icon: Database,
      implementation: [
        "Dynamic data masking for real-time queries",
        "Static anonymization for AI training datasets",
        "Tokenization of sensitive identifiers",
        "Format-preserving encryption (FPE)"
      ],
      evidenceDocuments: [
        { name: "Data_Masking_Policy_2024.pdf", status: "Current" },
        { name: "Anonymization_Test_Results.pdf", status: "Q2 2024" }
      ]
    },
    {
      id: "differential-privacy",
      title: "Differential Privacy",
      status: "Implemented",
      description: "Techniques we follow that add noise to data to protect individual privacy while still allowing for statistical analysis and BI reporting.",
      icon: Eye,
      implementation: [
        "ε-differential privacy (ε = 0.1)",
        "Laplace noise mechanism for numerical data",
        "Exponential mechanism for categorical data",
        "Privacy budget allocation and tracking"
      ],
      evidenceDocuments: [
        { name: "Differential_Privacy_Implementation.pdf", status: "Current" },
        { name: "Privacy_Budget_Analysis_Q2.pdf", status: "Q2 2024" }
      ]
    }
  ];

  const togglePrivacyControl = (control: keyof typeof privacyControls) => {
    setPrivacyControls(prev => ({
      ...prev,
      [control]: !prev[control]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-green-100 text-green-800";
      case "implemented": return "bg-blue-100 text-blue-800";
      case "current": return "bg-green-100 text-green-800";
      case "q2 2024": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getMetricColor = (color: string) => {
    const colors = {
      green: "border-green-200 bg-green-50",
      blue: "border-blue-200 bg-blue-50", 
      purple: "border-purple-200 bg-purple-50",
      orange: "border-orange-200 bg-orange-50"
    };
    return colors[color as keyof typeof colors] || "border-gray-200 bg-gray-50";
  };

  const getIconColor = (color: string) => {
    const colors = {
      green: "text-green-600",
      blue: "text-blue-600",
      purple: "text-purple-600", 
      orange: "text-orange-600"
    };
    return colors[color as keyof typeof colors] || "text-gray-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Privacy Management</h1>
          <p className="text-gray-600 mt-2">Manage data privacy controls, consent, and compliance</p>
        </div>
      </div>

      {/* Privacy Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {privacyMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index} className={`border-2 ${getMetricColor(metric.color)}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <IconComponent className={`h-5 w-5 ${getIconColor(metric.color)}`} />
                    <span className="text-sm font-medium text-gray-700">{metric.title}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-gray-900">{metric.status}</div>
                  <div className="text-sm text-gray-600">{metric.description}</div>
                  
                  {metric.progress && (
                    <div className="space-y-2">
                      <Progress value={metric.progress} className={`h-2 bg-${metric.color}-100`} />
                    </div>
                  )}
                  
                  {metric.detail && (
                    <div className="flex items-center gap-1 text-sm">
                      <CheckCircle className={`h-4 w-4 ${getIconColor(metric.color)}`} />
                      <span className={getIconColor(metric.color)}>{metric.detail}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Privacy Implementation Details */}
      <Card>
        <CardHeader>
          <CardTitle>Data Privacy Implementation Controls</CardTitle>
          <CardDescription>Comprehensive privacy protection measures for PHI and AI processing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {privacyImplementations.map((implementation) => {
            const IconComponent = implementation.icon;
            return (
              <div key={implementation.id} className="border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{implementation.title}</h3>
                      <Badge className={getStatusColor(implementation.status)}>
                        {implementation.status}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Evidence
                  </Button>
                </div>

                <p className="text-gray-700 mb-6">{implementation.description}</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Current Implementation</h4>
                    <ul className="space-y-2">
                      {implementation.implementation.map((item, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Evidence Documents</h4>
                    <div className="space-y-2">
                      {implementation.evidenceDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">{doc.name}</span>
                          </div>
                          <Badge variant="outline" className={getStatusColor(doc.status)}>
                            {doc.status}
                          </Badge>
                        </div>
                      ))}
                      <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-700">
                        + Add Document
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Privacy Controls Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Controls</CardTitle>
          <CardDescription>Configure and monitor essential privacy protection features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="data-masking" className="text-sm font-medium">
                    Data Masking & Anonymization
                  </Label>
                  <p className="text-xs text-gray-500">Remove or encrypt PHI identifiers</p>
                </div>
                <IOSSwitch
                  id="data-masking"
                  checked={privacyControls.dataMasking}
                  onCheckedChange={() => togglePrivacyControl('dataMasking')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="access-controls" className="text-sm font-medium">
                    Role-Based Access Controls
                  </Label>
                  <p className="text-xs text-gray-500">Restrict data access by user role</p>
                </div>
                <IOSSwitch
                  id="access-controls"
                  checked={privacyControls.accessControls}
                  onCheckedChange={() => togglePrivacyControl('accessControls')}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="differential-privacy" className="text-sm font-medium">
                    Differential Privacy
                  </Label>
                  <p className="text-xs text-gray-500">Add statistical noise for privacy protection</p>
                </div>
                <IOSSwitch
                  id="differential-privacy"
                  checked={privacyControls.differentialPrivacy}
                  onCheckedChange={() => togglePrivacyControl('differentialPrivacy')}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}