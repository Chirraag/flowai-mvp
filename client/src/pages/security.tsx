import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IOSSwitch } from "@/components/ui/ios-switch";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Globe, Database, CheckCircle, Upload, AlertCircle } from "lucide-react";

export default function Security() {
  const [securityControls, setSecurityControls] = useState({
    e2eEncryption: true,
    secureProtocols: true,
    secureApis: true,
    tokenization: true
  });

  const securityMetrics = [
    {
      title: "E2E Encryption",
      status: "Active",
      description: "AES-256 + TLS 1.3",
      detail: "100% coverage",
      icon: Lock,
      color: "green"
    },
    {
      title: "Secure Protocols", 
      status: "mTLS",
      description: "Mutual authentication",
      detail: "All agents secured",
      icon: Shield,
      color: "blue"
    },
    {
      title: "Secure APIs",
      status: "24",
      description: "Protected endpoints", 
      detail: "Zero data retention",
      icon: Globe,
      color: "purple"
    },
    {
      title: "Tokenization",
      status: "Active",
      description: "Sensitive data tokenized",
      detail: "Risk reduced",
      icon: Database,
      color: "orange"
    }
  ];

  const securityImplementations = [
    {
      id: "e2e-encryption",
      title: "End-to-End Encryption (E2EE)",
      status: "Active",
      description: "All data in transit (between agents, systems, and databases) and at rest (in storage) are encrypted using industry leading algorithms like TLS 1.2+, AES-256).",
      icon: Lock,
      implementation: [
        "AES-256 encryption for data at rest",
        "TLS 1.3 for data in transit", 
        "HSM-managed encryption keys",
        "Automatic key rotation (quarterly)"
      ],
      evidenceDocuments: [
        { name: "Encryption_Standards_Policy.pdf", status: "Current" },
        { name: "Key_Management_Audit_Q2.pdf", status: "Q2 2024" }
      ]
    },
    {
      id: "secure-protocols",
      title: "Secure Communication Protocols",
      status: "Implemented", 
      description: "We use secure protocols for inter-agent communication (e.g., mTLS for mutual authentication). Emerging agent communication protocols are being developed with built-in security features.",
      icon: Shield,
      implementation: [
        "mTLS for mutual authentication",
        "Certificate-based agent identity",
        "Secure message queuing (TLS)",
        "Protocol-level encryption"
      ],
      evidenceDocuments: [
        { name: "mTLS_Implementation_Guide.pdf", status: "Current" },
        { name: "Certificate_Management_Policy.pdf", status: "Updated" }
      ]
    }
  ];

  const toggleSecurityControl = (control: keyof typeof securityControls) => {
    setSecurityControls(prev => ({
      ...prev,
      [control]: !prev[control]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-green-100 text-green-800";
      case "implemented": return "bg-blue-100 text-blue-800";
      case "current": return "bg-green-100 text-green-800";
      case "updated": return "bg-blue-100 text-blue-800";
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
          <h1 className="text-2xl font-bold text-gray-900">Security & Encryption</h1>
          <p className="text-gray-600 mt-2">Manage security controls, encryption settings, and threat protection</p>
        </div>
      </div>

      {/* Security Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {securityMetrics.map((metric, index) => {
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
                
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gray-900">{metric.status}</div>
                  <div className="text-sm text-gray-600">{metric.description}</div>
                  
                  <div className="flex items-center gap-1 text-sm">
                    <CheckCircle className={`h-4 w-4 ${getIconColor(metric.color)}`} />
                    <span className={getIconColor(metric.color)}>{metric.detail}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Security Implementation Details */}
      <Card>
        <CardHeader>
          <CardTitle>Security & Encryption Implementation</CardTitle>
          <CardDescription>Comprehensive security controls protecting PHI and system communications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {securityImplementations.map((implementation) => {
            const IconComponent = implementation.icon;
            return (
              <div key={implementation.id} className="border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <IconComponent className="h-5 w-5 text-green-600" />
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

      {/* Security Controls Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Security Controls</CardTitle>
          <CardDescription>Configure and monitor essential security features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="e2e-encryption" className="text-sm font-medium">
                    End-to-End Encryption
                  </Label>
                  <p className="text-xs text-gray-500">Encrypt all data in transit and at rest</p>
                </div>
                <IOSSwitch
                  id="e2e-encryption"
                  checked={securityControls.e2eEncryption}
                  onCheckedChange={() => toggleSecurityControl('e2eEncryption')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="secure-protocols" className="text-sm font-medium">
                    Secure Protocols
                  </Label>
                  <p className="text-xs text-gray-500">Use mTLS for agent communication</p>
                </div>
                <IOSSwitch
                  id="secure-protocols"
                  checked={securityControls.secureProtocols}
                  onCheckedChange={() => toggleSecurityControl('secureProtocols')}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="secure-apis" className="text-sm font-medium">
                    Secure APIs
                  </Label>
                  <p className="text-xs text-gray-500">Protect all API endpoints</p>
                </div>
                <IOSSwitch
                  id="secure-apis"
                  checked={securityControls.secureApis}
                  onCheckedChange={() => toggleSecurityControl('secureApis')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="tokenization" className="text-sm font-medium">
                    Data Tokenization
                  </Label>
                  <p className="text-xs text-gray-500">Tokenize sensitive data elements</p>
                </div>
                <IOSSwitch
                  id="tokenization"
                  checked={securityControls.tokenization}
                  onCheckedChange={() => toggleSecurityControl('tokenization')}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}