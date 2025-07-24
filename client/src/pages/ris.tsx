import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock, Activity, ExternalLink, Zap, Database, Eye, Camera } from "lucide-react";

interface RisApiEndpoint {
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

export default function RIS() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  // RIS/PACS API endpoints for imaging systems
  const risApis: RisApiEndpoint[] = [
    {
      id: 1,
      name: "Retrieve imaging study metadata",
      description: "Get comprehensive metadata for imaging studies including series and instance information.",
      endpoint: "/studies/{studyUID}",
      method: "GET",
      status: "active",
      responseTime: 180,
      successRate: 99.1,
      lastTested: "15 minutes ago",
      category: "studies"
    },
    {
      id: 2,
      name: "Search imaging studies by patient",
      description: "Find all imaging studies associated with a specific patient ID.",
      endpoint: "/studies?PatientID={id}",
      method: "GET",
      status: "active",
      responseTime: 220,
      successRate: 98.7,
      lastTested: "30 minutes ago",
      category: "search"
    },
    {
      id: 3,
      name: "Retrieve DICOM image instances",
      description: "Download specific DICOM image instances from studies.",
      endpoint: "/studies/{studyUID}/series/{seriesUID}/instances/{instanceUID}",
      method: "GET",
      status: "active",
      responseTime: 850,
      successRate: 97.3,
      lastTested: "1 hour ago",
      category: "images"
    },
    {
      id: 4,
      name: "Store new imaging study",
      description: "Upload and store new DICOM imaging studies to the PACS system.",
      endpoint: "/studies",
      method: "POST",
      status: "active",
      responseTime: 1200,
      successRate: 98.9,
      lastTested: "45 minutes ago",
      category: "storage"
    },
    {
      id: 5,
      name: "Query worklist items",
      description: "Retrieve scheduled imaging procedures from the RIS worklist.",
      endpoint: "/worklist",
      method: "GET",
      status: "active",
      responseTime: 150,
      successRate: 99.4,
      lastTested: "20 minutes ago",
      category: "worklist"
    },
    {
      id: 6,
      name: "Update study status",
      description: "Modify the status of imaging studies (scheduled, in-progress, completed).",
      endpoint: "/studies/{studyUID}/status",
      method: "PUT",
      status: "active",
      responseTime: 95,
      successRate: 99.8,
      lastTested: "10 minutes ago",
      category: "workflow"
    },
    {
      id: 7,
      name: "Retrieve structured reports",
      description: "Access radiology reports and structured findings associated with studies.",
      endpoint: "/studies/{studyUID}/reports",
      method: "GET",
      status: "active",
      responseTime: 190,
      successRate: 98.5,
      lastTested: "25 minutes ago",
      category: "reports"
    },
    {
      id: 8,
      name: "Search by imaging modality",
      description: "Find studies filtered by imaging modality (CT, MRI, X-Ray, Ultrasound).",
      endpoint: "/studies?Modality={modality}",
      method: "GET",
      status: "active",
      responseTime: 200,
      successRate: 99.0,
      lastTested: "40 minutes ago",
      category: "search"
    },
    {
      id: 9,
      name: "Generate study thumbnails",
      description: "Create and retrieve thumbnail images for quick study preview.",
      endpoint: "/studies/{studyUID}/thumbnail",
      method: "GET",
      status: "active",
      responseTime: 320,
      successRate: 96.8,
      lastTested: "35 minutes ago",
      category: "thumbnails"
    },
    {
      id: 10,
      name: "Archive completed studies",
      description: "Move completed imaging studies to long-term archive storage.",
      endpoint: "/studies/{studyUID}/archive",
      method: "POST",
      status: "active",
      responseTime: 450,
      successRate: 99.2,
      lastTested: "2 hours ago",
      category: "archive"
    },
    {
      id: 11,
      name: "Retrieve patient demographics",
      description: "Get patient information associated with imaging studies.",
      endpoint: "/patients/{patientID}",
      method: "GET",
      status: "active",
      responseTime: 110,
      successRate: 99.6,
      lastTested: "15 minutes ago",
      category: "patient"
    },
    {
      id: 12,
      name: "Monitor system performance",
      description: "Real-time monitoring of PACS system performance and storage metrics.",
      endpoint: "/system/status",
      method: "GET",
      status: "active",
      responseTime: 75,
      successRate: 99.9,
      lastTested: "5 minutes ago",
      category: "monitoring"
    }
  ];

  const categories = [
    { value: "all", label: "All APIs", count: risApis.length },
    { value: "studies", label: "Studies", count: risApis.filter(api => api.category === "studies").length },
    { value: "search", label: "Search", count: risApis.filter(api => api.category === "search").length },
    { value: "images", label: "Images", count: risApis.filter(api => api.category === "images").length },
    { value: "worklist", label: "Worklist", count: risApis.filter(api => api.category === "worklist").length },
    { value: "reports", label: "Reports", count: risApis.filter(api => api.category === "reports").length },
    { value: "storage", label: "Storage", count: risApis.filter(api => api.category === "storage").length }
  ];

  const filteredApis = selectedCategory === "all" 
    ? risApis 
    : risApis.filter(api => api.category === selectedCategory);

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
    if (responseTime < 300) return "text-green-600";
    if (responseTime < 600) return "text-yellow-600";
    return "text-red-600";
  };

  const averageResponseTime = Math.round(
    risApis.reduce((sum, api) => sum + api.responseTime, 0) / risApis.length
  );

  const overallSuccessRate = (
    risApis.reduce((sum, api) => sum + api.successRate, 0) / risApis.length
  ).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Camera className="h-6 w-6 text-purple-600" />
            RIS Integration
          </h1>
          <p className="text-gray-600 mt-2">Radiology Information System and PACS API endpoints</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total APIs</p>
                <p className="text-2xl font-bold">{risApis.length}</p>
              </div>
              <Camera className="h-8 w-8 text-purple-600" />
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
              <span className="text-green-600">+0.2%</span>
              <span className="text-gray-600 ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Storage Used</p>
                <p className="text-2xl font-bold">2.4TB</p>
              </div>
              <Database className="h-8 w-8 text-gray-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Activity className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-gray-600">68% capacity</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle>RIS/PACS API Endpoints</CardTitle>
          <CardDescription>Monitor and manage radiology imaging system integrations</CardDescription>
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
                      <span className="text-gray-500">Method:</span>
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