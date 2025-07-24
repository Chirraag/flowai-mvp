import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock, Activity, ExternalLink, Zap, Database, Eye } from "lucide-react";

interface FhirApiEndpoint {
  id: number;
  name: string;
  description: string;
  endpoint: string;
  method: string;
  status: "active" | "inactive" | "testing";
  responseTime: number;
  successRate: number;
  lastTested: string;
  category: string;
}

export default function EMR() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  // FHIR API endpoints based on the screenshot
  const fhirApis: FhirApiEndpoint[] = [
    {
      id: 1,
      name: "Retrieve a patient's medication list",
      description: "Track a patient's current medications.",
      endpoint: "/Patient/{id}/MedicationStatement",
      method: "GET",
      status: "active",
      responseTime: 245,
      successRate: 98.5,
      lastTested: "2 hours ago",
      category: "patient"
    },
    {
      id: 2,
      name: "Retrieve a patient's vaccination history", 
      description: "Track a patient's vaccinations.",
      endpoint: "/Patient/{id}/Immunization",
      method: "GET",
      status: "active",
      responseTime: 180,
      successRate: 99.2,
      lastTested: "1 hour ago",
      category: "patient"
    },
    {
      id: 3,
      name: "Submit vaccination details to a state registry",
      description: "Fulfill state requirements by reporting vaccine administration details.",
      endpoint: "/Immunization",
      method: "POST",
      status: "active",
      responseTime: 320,
      successRate: 97.8,
      lastTested: "3 hours ago",
      category: "reporting"
    },
    {
      id: 4,
      name: "Retrieve a patient's diagnostic results",
      description: "Review or provide interpretation of a patient's procedure.",
      endpoint: "/Patient/{id}/DiagnosticReport",
      method: "GET",
      status: "active",
      responseTime: 210,
      successRate: 98.9,
      lastTested: "30 minutes ago",
      category: "diagnostics"
    },
    {
      id: 5,
      name: "Retrieve a patient's imaging data",
      description: "Review imaging and related metadata from a PACS server.",
      endpoint: "/ImagingStudy",
      method: "GET",
      status: "active",
      responseTime: 450,
      successRate: 96.5,
      lastTested: "2 hours ago",
      category: "imaging"
    },
    {
      id: 6,
      name: "Save diagnostic results to a patient's chart",
      description: "Write a provider interpretation of a patient's procedure back to an EHR system.",
      endpoint: "/DiagnosticReport",
      method: "POST",
      status: "active",
      responseTime: 380,
      successRate: 98.1,
      lastTested: "1 hour ago",
      category: "diagnostics"
    },
    {
      id: 7,
      name: "Save vitals to a patient's chart",
      description: "Write patient measurements or data back to an EHR system.",
      endpoint: "/Observation",
      method: "POST",
      status: "active",
      responseTime: 190,
      successRate: 99.4,
      lastTested: "45 minutes ago",
      category: "vitals"
    },
    {
      id: 8,
      name: "Retrieve a signed provider note",
      description: "Review documents authenticated by a provider for a patient after a visit.",
      endpoint: "/DocumentReference",
      method: "GET",
      status: "active",
      responseTime: 280,
      successRate: 97.6,
      lastTested: "2 hours ago",
      category: "documents"
    },
    {
      id: 9,
      name: "Launch app within an EHR system",
      description: "Authorize and authenticate SSO requests in an EHR system.",
      endpoint: "/launch",
      method: "POST",
      status: "active",
      responseTime: 150,
      successRate: 99.8,
      lastTested: "15 minutes ago",
      category: "auth"
    },
    {
      id: 10,
      name: "Listen for hospital admission updates",
      description: "Get notified when there are patient movements within a hospital.",
      endpoint: "/Subscription",
      method: "POST",
      status: "active",
      responseTime: 120,
      successRate: 99.1,
      lastTested: "1 hour ago",
      category: "notifications"
    },
    {
      id: 11,
      name: "Listen for scheduling updates",
      description: "Get notified when an appointment is booked, modified, rescheduled, or cancelled.",
      endpoint: "/Subscription/Appointment",
      method: "POST",
      status: "active",
      responseTime: 95,
      successRate: 99.6,
      lastTested: "30 minutes ago",
      category: "scheduling"
    },
    {
      id: 12,
      name: "Listen for outpatient encounters",
      description: "You may want to listen for encounter updates if you want to follow up with patients after an outpatient visit.",
      endpoint: "/Subscription/Encounter",
      method: "POST",
      status: "active",
      responseTime: 110,
      successRate: 98.8,
      lastTested: "1 hour ago",
      category: "encounters"
    },
    {
      id: 13,
      name: "Retrieve a patient's appointment schedule",
      description: "Look up appointments that a patient has scheduled with a given provider.",
      endpoint: "/Patient/{id}/Appointment",
      method: "GET",
      status: "active",
      responseTime: 160,
      successRate: 99.3,
      lastTested: "45 minutes ago",
      category: "scheduling"
    },
    {
      id: 14,
      name: "Search for a patient with demographics",
      description: "Use a patient's demographics to locate a patient record.",
      endpoint: "/Patient",
      method: "GET",
      status: "active",
      responseTime: 140,
      successRate: 99.7,
      lastTested: "20 minutes ago",
      category: "patient"
    },
    {
      id: 15,
      name: "Search for a patient with identifier",
      description: "Use a patient's identifier to locate a patient record.",
      endpoint: "/Patient?identifier={id}",
      method: "GET",
      status: "active",
      responseTime: 85,
      successRate: 99.9,
      lastTested: "10 minutes ago",
      category: "patient"
    }
  ];

  const categories = [
    { value: "all", label: "All APIs", count: fhirApis.length },
    { value: "patient", label: "Patient Data", count: fhirApis.filter(api => api.category === "patient").length },
    { value: "diagnostics", label: "Diagnostics", count: fhirApis.filter(api => api.category === "diagnostics").length },
    { value: "scheduling", label: "Scheduling", count: fhirApis.filter(api => api.category === "scheduling").length },
    { value: "imaging", label: "Imaging", count: fhirApis.filter(api => api.category === "imaging").length },
    { value: "vitals", label: "Vitals", count: fhirApis.filter(api => api.category === "vitals").length },
    { value: "notifications", label: "Notifications", count: fhirApis.filter(api => api.category === "notifications").length }
  ];

  const filteredApis = selectedCategory === "all" 
    ? fhirApis 
    : fhirApis.filter(api => api.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-red-100 text-red-800";
      case "testing": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "inactive": return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "testing": return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getResponseTimeColor = (responseTime: number) => {
    if (responseTime < 200) return "text-green-600";
    if (responseTime < 400) return "text-yellow-600";
    return "text-red-600";
  };

  const averageResponseTime = Math.round(
    fhirApis.reduce((sum, api) => sum + api.responseTime, 0) / fhirApis.length
  );

  const overallSuccessRate = (
    fhirApis.reduce((sum, api) => sum + api.successRate, 0) / fhirApis.length
  ).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-600" />
            EMR Integration
          </h1>
          <p className="text-gray-600 mt-2">FHIR API endpoints and connection status</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total APIs</p>
                <p className="text-2xl font-bold">{fhirApis.length}</p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">All Active</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className={`text-2xl font-bold ${getResponseTimeColor(averageResponseTime)}`}>
                  {averageResponseTime}ms
                </p>
              </div>
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Activity className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-gray-600">Real-time monitoring</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{overallSuccessRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600">+0.3%</span>
              <span className="text-gray-600 ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-2xl font-bold">10 min</p>
              </div>
              <Clock className="h-8 w-8 text-gray-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Activity className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-gray-600">Auto-refresh enabled</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle>FHIR API Endpoints</CardTitle>
          <CardDescription>Monitor and manage connected healthcare API endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className="flex items-center gap-2"
              >
                {category.label}
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* API Endpoints Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApis.map((api) => (
              <Card key={api.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(api.status)}
                      <Badge className={getStatusColor(api.status)}>
                        {api.status}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                    {api.name}
                  </h3>
                  
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                    {api.description}
                  </p>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Endpoint:</span>
                      <code className="bg-gray-100 px-1 rounded text-xs">
                        {api.method}
                      </code>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-500">Response Time:</span>
                      <span className={`font-medium ${getResponseTimeColor(api.responseTime)}`}>
                        {api.responseTime}ms
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-500">Success Rate:</span>
                      <span className="font-medium text-green-600">
                        {api.successRate}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Tested:</span>
                      <span className="text-gray-700">
                        {api.lastTested}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}