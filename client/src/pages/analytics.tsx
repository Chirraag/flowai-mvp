import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart
} from "recharts";
import { 
  TrendingUp, TrendingDown, Clock, Users, Shield, CheckCircle2, 
  AlertTriangle, Calendar, DollarSign, Star, Activity, Target,
  Filter, Download, RefreshCw
} from "lucide-react";

export default function AnalyticsKPI() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("6months");
  const [selectedSite, setSelectedSite] = useState("all");
  const [selectedMetric, setSelectedMetric] = useState("all");

  // Fetch KPI metrics from database with filters
  const { data: kpiData, isLoading: isLoadingKPI, refetch: refetchKPI } = useQuery({
    queryKey: ["/api/v1/analytics/kpi-metrics", selectedTimeframe, selectedSite, selectedMetric],
    queryFn: async () => {
      const params = new URLSearchParams({
        timeframe: selectedTimeframe,
        site: selectedSite,
        metric: selectedMetric
      });
      const response = await fetch(`/api/v1/analytics/kpi-metrics?${params}`);
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
    retry: false,
  });

  // Fetch detailed metrics for charts with filters
  const { data: detailedMetrics, isLoading: isLoadingDetailed, refetch: refetchDetailed } = useQuery({
    queryKey: ["/api/v1/analytics/metrics", selectedTimeframe, selectedSite],
    queryFn: async () => {
      const params = new URLSearchParams({
        timeframe: selectedTimeframe,
        site: selectedSite
      });
      const response = await fetch(`/api/v1/analytics/metrics?${params}`);
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
    retry: false,
  });

  const getStatusColor = (metric: any) => {
    // Color highlighting based on week-over-week trends
    if (metric.weekOverWeekChange < 0) {
      // For metrics where lower is better (errors, check-in time)
      if (metric.name.includes('Errors') || metric.name.includes('Time')) {
        return 'text-green-600 bg-green-50 border-green-200 border-l-green-500';
      }
      // For metrics where higher is better (cost reduction, satisfaction) - declining is bad
      return 'text-red-600 bg-red-50 border-red-200 border-l-red-500';
    } else if (metric.weekOverWeekChange > 0) {
      // For metrics where higher is better (cost reduction, satisfaction)
      if (metric.name.includes('Reduction') || metric.name.includes('Satisfaction')) {
        return 'text-green-600 bg-green-50 border-green-200 border-l-green-500';
      }
      // For metrics where lower is better (errors, check-in time) - increasing is bad
      return 'text-red-600 bg-red-50 border-red-200 border-l-red-500';
    }
    // No change
    return 'text-blue-600 bg-blue-50 border-blue-200 border-l-blue-500';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoadingKPI || isLoadingDetailed) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Core KPI monitoring: Staffing Cost Reduction, Scheduling Accuracy, Operational Efficiency, and Patient Satisfaction
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Analytics Filters
          </CardTitle>
          <CardDescription>Filter and analyze performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-sm font-medium min-w-0">Timeframe:</label>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-sm font-medium min-w-0">Site:</label>
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sites</SelectItem>
                  <SelectItem value="main">Main Campus</SelectItem>
                  <SelectItem value="north">North Branch</SelectItem>
                  <SelectItem value="south">South Branch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-sm font-medium min-w-0">Metric:</label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Metrics</SelectItem>
                  <SelectItem value="staffing">Staffing Cost</SelectItem>
                  <SelectItem value="scheduling">Scheduling Accuracy</SelectItem>
                  <SelectItem value="efficiency">Operational Efficiency</SelectItem>
                  <SelectItem value="satisfaction">Patient Satisfaction</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => {
                  refetchKPI();
                  refetchDetailed();
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => {
                  const dataStr = JSON.stringify({
                    kpiData,
                    detailedMetrics,
                    filters: {
                      timeframe: selectedTimeframe,
                      site: selectedSite,
                      metric: selectedMetric
                    }
                  }, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpiData && Object.entries(kpiData.metrics).map(([key, metric]: [string, any]) => (
          <Card key={key} className={`border-l-4 ${getStatusColor(metric)}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                {getTrendIcon(metric.trend)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-xl sm:text-2xl font-bold">
                  {metric.value}{metric.unit}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs">
                  <span className="text-gray-600">Target: {metric.target}{metric.unit}</span>
                  <Badge variant={metric.weekOverWeekChange > 0 && (metric.name.includes('Reduction') || metric.name.includes('Satisfaction')) ? 'default' : 
                                 metric.weekOverWeekChange < 0 && (metric.name.includes('Errors') || metric.name.includes('Time')) ? 'default' : 'secondary'}>
                    {metric.weekOverWeekChange > 0 ? '+' : ''}{metric.weekOverWeekChange}{metric.unit}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500">
                  Week-over-week: {metric.weekOverWeekChange > 0 ? '+' : ''}{metric.weekOverWeekChange}{metric.unit}
                </div>
                <p className="text-xs text-gray-600 mt-2 line-clamp-2">{metric.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="staffing" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
          <TabsTrigger value="staffing" className="text-xs sm:text-sm">Staffing Cost</TabsTrigger>
          <TabsTrigger value="scheduling" className="text-xs sm:text-sm">Scheduling</TabsTrigger>
          <TabsTrigger value="efficiency" className="text-xs sm:text-sm">Efficiency</TabsTrigger>
          <TabsTrigger value="satisfaction" className="text-xs sm:text-sm">Satisfaction</TabsTrigger>
        </TabsList>

        <TabsContent value="staffing" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Staffing Cost Reduction</CardTitle>
                <CardDescription>6-month week-over-week trend analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={(detailedMetrics as any)?.staffingReduction || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[40, 80]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Cost Reduction']} />
                    <Legend />
                    <Line type="monotone" dataKey="staffingReduction" stroke="#22c55e" strokeWidth={3} name="Cost Reduction %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Savings Breakdown</CardTitle>
                <CardDescription>Cumulative savings by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-green-50 rounded gap-1 sm:gap-0">
                    <span className="font-medium text-sm sm:text-base">Scheduling Department</span>
                    <span className="text-green-600 font-bold text-sm sm:text-base">$27,360 (60% reduction)</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-blue-50 rounded gap-1 sm:gap-0">
                    <span className="font-medium text-sm sm:text-base">Patient Intake</span>
                    <span className="text-blue-600 font-bold text-sm sm:text-base">$22,680 (70% reduction)</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-purple-50 rounded gap-1 sm:gap-0">
                    <span className="font-medium text-sm sm:text-base">Insurance Verification</span>
                    <span className="text-purple-600 font-bold text-sm sm:text-base">$20,160 (70% reduction)</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-orange-50 rounded gap-1 sm:gap-0">
                    <span className="font-medium text-sm sm:text-base">Communication</span>
                    <span className="text-orange-600 font-bold text-sm sm:text-base">$15,120 (70% reduction)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scheduling" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Schedule Rate Errors</CardTitle>
              <CardDescription>6-month weekly error tracking (target: &lt;5%)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={(detailedMetrics as any)?.schedulingAccuracy || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[0, 8]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Error Rate']} />
                  <Legend />
                  <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={3} name="Error Rate %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Check-in Time</CardTitle>
              <CardDescription>6-month weekly check-in time tracking (target: &lt;10 minutes)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={(detailedMetrics as any)?.operationalEfficiency || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[0, 8]} />
                  <Tooltip formatter={(value) => [`${value} min`, 'Check-in Time']} />
                  <Legend />
                  <Area type="monotone" dataKey="checkInTime" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Avg Check-in Time" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="satisfaction" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Satisfaction NPS</CardTitle>
                <CardDescription>6-month weekly NPS scores (target: &gt;4.5/5)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={(detailedMetrics as any)?.patientSatisfaction || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[3.8, 5.0]} />
                    <Tooltip formatter={(value) => [`${value}/5`, 'NPS Score']} />
                    <Legend />
                    <Line type="monotone" dataKey="nps" stroke="#8b5cf6" strokeWidth={3} name="NPS Score" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Satisfaction Drivers</CardTitle>
                <CardDescription>Key factors influencing patient satisfaction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Check-in Speed</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '92%'}}></div>
                      </div>
                      <span className="text-sm">92%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Communication Quality</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '89%'}}></div>
                      </div>
                      <span className="text-sm">89%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Scheduling Accuracy</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{width: '94%'}}></div>
                      </div>
                      <span className="text-sm">94%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Wait Time</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{width: '87%'}}></div>
                      </div>
                      <span className="text-sm">87%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>Overall system performance against targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">4/4</div>
              <div className="text-sm text-gray-600">KPIs Meeting Target</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">$85.3K</div>
              <div className="text-sm text-gray-600">Total Monthly Savings</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded">
              <div className="text-2xl font-bold text-purple-600">96.8%</div>
              <div className="text-sm text-gray-600">Automation Success Rate</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded">
              <div className="text-2xl font-bold text-orange-600">6mo</div>
              <div className="text-sm text-gray-600">ROI Achieved In</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}