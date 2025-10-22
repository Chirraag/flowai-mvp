import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { 
  Sparkles, 
  Clock, 
  Activity,
  TrendingUp,
  Phone,
  PhoneOff,
  Users,
  MessageSquare,
  PhoneIncoming,
  PhoneOutgoing,
  FileText,
  BarChart3
} from 'lucide-react';
import { useAuth } from "@/context/AuthContext";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Types
interface AnalyticsData {
  summary: {
    totalCalls: number;
    averageCallDuration: number;
    averageLatency: number;
    dateRange: {
      start: string;
      end: string;
    };
  };
  callSuccessRate: {
    successful: number;
    unsuccessful: number;
  };
  disconnectionReasons: Record<string, number>;
  userSentiment: {
    negative: number;
    positive: number;
    neutral: number;
    unknown: number;
  };
  phoneDirection: {
    inbound: number;
    outbound: number;
  };
  timeSeriesData: {
    callCounts: Array<{ date: string; value: number }>;
    callPickupRate: Array<{ date: string; value: number }>;
    callSuccessfulRate: Array<{ date: string; value: number }>;
    callTransferRate: Array<{ date: string; value: number }>;
    voicemailRate: Array<{ date: string; value: number }>;
    averageCallDuration: Array<{ date: string; value: number }>;
    averageLatency: Array<{ date: string; value: number }>;
  };
  dailyBreakdown: Array<{
    date: string;
    successful: number;
    unsuccessful: number;
    disconnectionReasons: Record<string, number>;
    sentiment: {
      negative: number;
      positive: number;
      neutral: number;
      unknown: number;
    };
  }>;
  agentPerformance: Array<{
    agentId: string;
    agentName: string;
    callSuccessful: {
      successful: number;
      unsuccessful: number;
      percentage: number;
    };
    callPickupRate: {
      pickedUp: number;
      total: number;
      percentage: number;
    };
    callTransferRate: {
      transferred: number;
      total: number;
      percentage: number;
    };
  }>;
}

// Utility functions
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const camelToTitle = (str: string): string => {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
};

// Card component
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg p-6 ${className}`}>
    {children}
  </div>
);

export default function Analytics() {
  const { hasWriteAccess } = useAuth();
  const canWriteAnalytics = hasWriteAccess("analytics");

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/analyticsdata.json');
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Error loading analytics data:', error);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate flex items-center gap-3">
              <FileText className="h-8 w-8 text-[#1c275e]" />
              Analytics
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              Healthcare analytics and insights dashboard
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1c275e] mx-auto"></div>
            <p className="text-[#1c275e] mt-2">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate flex items-center gap-3">
              <FileText className="h-8 w-8 text-[#1c275e]" />
              Analytics
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              Healthcare analytics and insights dashboard
            </p>
          </div>
        </div>
        <div className="text-center p-8">
          <p className="text-red-600">{error || 'Failed to load analytics data'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-[#1c275e] hover:bg-[#233072] text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Chart Options
  const lineChartOptions = (title: string) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  });

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
    },
    cutout: '70%',
  };

  const stackedBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          padding: 15,
          font: {
            size: 11,
          },
          usePointStyle: true,
          pointStyle: 'rect',
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
  };

  const barChartOptions = (title: string) => ({
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  });

  // Process time series data from callCounts for stacked bar charts
  const timeSeriesLabels = data.timeSeriesData.callCounts.map(item => formatDate(item.date));
  
  // Create time series breakdown data by distributing totals based on overall ratios
  const createTimeSeriesBreakdown = () => {
    const callCounts = data.timeSeriesData.callCounts;
    const totalSuccessful = data.callSuccessRate.successful;
    const totalUnsuccessful = data.callSuccessRate.unsuccessful;
    const total = totalSuccessful + totalUnsuccessful;
    
    return callCounts.map(item => {
      const successfulRatio = totalSuccessful / total;
      const unsuccessfulRatio = totalUnsuccessful / total;
      
      return {
        date: item.date,
        successful: Math.round(item.value * successfulRatio),
        unsuccessful: Math.round(item.value * unsuccessfulRatio),
      };
    });
  };

  const timeSeriesBreakdown = createTimeSeriesBreakdown();

  // Stacked Bar Chart 1: Call Successful
  const callSuccessfulStackedData = {
    labels: timeSeriesLabels,
    datasets: [
      {
        label: 'Call counts: successful',
        data: timeSeriesBreakdown.map(item => item.successful),
        backgroundColor: '#5DADE2',
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Call counts: unsuccessful',
        data: timeSeriesBreakdown.map(item => item.unsuccessful),
        backgroundColor: '#58D68D',
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  // Process disconnection reasons for stacked bar chart
  const createDisconnectionTimeSeries = () => {
    const callCounts = data.timeSeriesData.callCounts;
    const disconnectionEntries = Object.entries(data.disconnectionReasons)
      .sort((a, b) => b[1] - a[1]);
    
    const top2 = disconnectionEntries.slice(0, 2);
    const othersTotal = disconnectionEntries.slice(2).reduce((sum, [, value]) => sum + value, 0);
    const grandTotal = disconnectionEntries.reduce((sum, [, value]) => sum + value, 0);
    
    return {
      labels: timeSeriesLabels,
      categories: [
        ...top2.map(([key]) => key),
        'others'
      ],
      data: callCounts.map(item => {
        const ratios = [
          ...top2.map(([, value]) => value / grandTotal),
          othersTotal / grandTotal
        ];
        
        return ratios.map(ratio => Math.round(item.value * ratio * 0.3)); // 30% of calls have disconnection
      }),
    };
  };

  const disconnectionTimeSeries = createDisconnectionTimeSeries();

  // Stacked Bar Chart 2: Disconnection Reason
  const disconnectionStackedData = {
    labels: disconnectionTimeSeries.labels,
    datasets: [
      {
        label: `Call counts: ${camelToTitle(disconnectionTimeSeries.categories[0])}`,
        data: disconnectionTimeSeries.data.map(d => d[0]),
        backgroundColor: '#5DADE2',
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: `Call counts: ${camelToTitle(disconnectionTimeSeries.categories[1])}`,
        data: disconnectionTimeSeries.data.map(d => d[1]),
        backgroundColor: '#F5B041',
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: `+${Object.keys(data.disconnectionReasons).length - 2} more`,
        data: disconnectionTimeSeries.data.map(d => d[2]),
        backgroundColor: '#EC7063',
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  // Process sentiment for stacked bar chart
  const createSentimentTimeSeries = () => {
    const callCounts = data.timeSeriesData.callCounts;
    const sentimentTotal = 
      data.userSentiment.negative + 
      data.userSentiment.positive + 
      data.userSentiment.neutral + 
      data.userSentiment.unknown;
    
    const sentimentRatios = {
      negative: data.userSentiment.negative / sentimentTotal,
      neutral: data.userSentiment.neutral / sentimentTotal,
      positive: data.userSentiment.positive / sentimentTotal,
      unknown: data.userSentiment.unknown / sentimentTotal,
    };
    
    return {
      labels: timeSeriesLabels,
      data: callCounts.map(item => ({
        negative: Math.round(item.value * sentimentRatios.negative),
        neutral: Math.round(item.value * sentimentRatios.neutral),
        positive: Math.round(item.value * sentimentRatios.positive),
        unknown: Math.round(item.value * sentimentRatios.unknown),
      })),
    };
  };

  const sentimentTimeSeries = createSentimentTimeSeries();

  // Stacked Bar Chart 3: User Sentiment
  const sentimentStackedData = {
    labels: sentimentTimeSeries.labels,
    datasets: [
      {
        label: 'Call counts: negative',
        data: sentimentTimeSeries.data.map(d => d.negative),
        backgroundColor: '#5DADE2',
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Call counts: neutral',
        data: sentimentTimeSeries.data.map(d => d.neutral),
        backgroundColor: '#F5B041',
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: '+2 more',
        data: sentimentTimeSeries.data.map(d => d.positive + d.unknown),
        backgroundColor: '#BB8FCE',
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  // Transform data for other charts
  const disconnectionData = Object.entries(data.disconnectionReasons)
    .map(([key, value]) => ({
      name: camelToTitle(key),
      value: value,
    }))
    .sort((a, b) => b.value - a.value);

  const topDisconnections = disconnectionData.slice(0, 5);
  const otherDisconnections = disconnectionData.slice(5).reduce((sum, item) => sum + item.value, 0);

  // Call Counts Area Chart
  const callCountsData = {
    labels: data.timeSeriesData.callCounts.map(item => formatDate(item.date)),
    datasets: [
      {
        label: 'Call Counts',
        data: data.timeSeriesData.callCounts.map(item => item.value),
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  // Success Rate Donut
  const successRateData = {
    labels: ['Successful', 'Unsuccessful'],
    datasets: [
      {
        data: [data.callSuccessRate.successful, data.callSuccessRate.unsuccessful],
        backgroundColor: ['#06b6d4', '#f97316'],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  // Disconnection Reason Donut
  const disconnectionChartData = {
    labels: [
      ...topDisconnections.map(d => d.name),
      ...(otherDisconnections > 0 ? [`+${disconnectionData.length - 5} more`] : [])
    ],
    datasets: [
      {
        data: [
          ...topDisconnections.map(d => d.value),
          ...(otherDisconnections > 0 ? [otherDisconnections] : [])
        ],
        backgroundColor: ['#8b5cf6', '#f97316', '#06b6d4', '#f59e0b', '#f43f5e', '#64748b'],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  // User Sentiment Donut
  const sentimentData = {
    labels: ['Unknown', 'Negative', 'Neutral', 'Positive'],
    datasets: [
      {
        data: [
          data.userSentiment.unknown,
          data.userSentiment.negative,
          data.userSentiment.neutral,
          data.userSentiment.positive,
        ],
        backgroundColor: ['#3b82f6', '#f97316', '#8b5cf6', '#06b6d4'],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  // Phone Direction Donut
  const phoneDirectionData = {
    labels: ['Inbound', 'Outbound'],
    datasets: [
      {
        data: [data.phoneDirection.inbound, data.phoneDirection.outbound],
        backgroundColor: ['#3b82f6', '#f97316'],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  // Pickup Rate Area Chart
  const pickupRateData = {
    labels: data.timeSeriesData.callPickupRate.map(item => formatDate(item.date)),
    datasets: [
      {
        label: 'Pickup Rate (%)',
        data: data.timeSeriesData.callPickupRate.map(item => item.value),
        fill: true,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  // Success Rate Area Chart
  const successRateChartData = {
    labels: data.timeSeriesData.callSuccessfulRate.map(item => formatDate(item.date)),
    datasets: [
      {
        label: 'Success Rate (%)',
        data: data.timeSeriesData.callSuccessfulRate.map(item => item.value),
        fill: true,
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderColor: 'rgb(37, 99, 235)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  // Transfer Rate Area Chart
  const transferRateData = {
    labels: data.timeSeriesData.callTransferRate.map(item => formatDate(item.date)),
    datasets: [
      {
        label: 'Transfer Rate (%)',
        data: data.timeSeriesData.callTransferRate.map(item => item.value),
        fill: true,
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderColor: 'rgb(139, 92, 246)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  // Voicemail Rate Area Chart
  const voicemailRateData = {
    labels: data.timeSeriesData.voicemailRate.map(item => formatDate(item.date)),
    datasets: [
      {
        label: 'Voicemail Rate (%)',
        data: data.timeSeriesData.voicemailRate.map(item => item.value),
        fill: true,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  // Duration Area Chart
  const durationData = {
    labels: data.timeSeriesData.averageCallDuration.map(item => formatDate(item.date)),
    datasets: [
      {
        label: 'Duration (seconds)',
        data: data.timeSeriesData.averageCallDuration.map(item => item.value),
        fill: true,
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        borderColor: 'rgb(6, 182, 212)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  // Latency Area Chart
  const latencyData = {
    labels: data.timeSeriesData.averageLatency.map(item => formatDate(item.date)),
    datasets: [
      {
        label: 'Latency (ms)',
        data: data.timeSeriesData.averageLatency.map(item => item.value),
        fill: true,
        backgroundColor: 'rgba(244, 63, 94, 0.1)',
        borderColor: 'rgb(244, 63, 94)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  // Agent Performance Bar Charts
  const agentSuccessData = {
    labels: data.agentPerformance.map(agent => agent.agentName),
    datasets: [
      {
        label: 'Success Rate (%)',
        data: data.agentPerformance.map(agent => agent.callSuccessful.percentage),
        backgroundColor: 'rgb(37, 99, 235)',
        borderRadius: 4,
      },
    ],
  };

  const agentPickupData = {
    labels: data.agentPerformance.map(agent => agent.agentName),
    datasets: [
      {
        label: 'Pickup Rate (%)',
        data: data.agentPerformance.map(agent => agent.callPickupRate.percentage),
        backgroundColor: 'rgb(16, 185, 129)',
        borderRadius: 4,
      },
    ],
  };

  const agentTransferData = {
    labels: data.agentPerformance.map(agent => agent.agentName),
    datasets: [
      {
        label: 'Transfer Rate (%)',
        data: data.agentPerformance.map(agent => agent.callTransferRate.percentage),
        backgroundColor: 'rgb(139, 92, 246)',
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <div className="container mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="min-w-0 flex-1">
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-white flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg">Call Counts</h3>
                <p className="text-blue-100 text-sm mt-1">All agents</p>
                <p className="text-white mt-4 text-3xl font-bold">
                  {formatNumber(data.summary.totalCalls)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-lg">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-white flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg">Call Duration</h3>
                <p className="text-purple-100 text-sm mt-1">All agents</p>
                <p className="text-white mt-4 text-3xl font-bold">
                  {formatDuration(data.summary.averageCallDuration)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500 to-rose-600 border-0 shadow-lg">
            <div className="flex items-start gap-3">
              <Activity className="h-5 w-5 text-white flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg">Call Latency</h3>
                <p className="text-pink-100 text-sm mt-1">All agents</p>
                <p className="text-white mt-4 text-3xl font-bold">
                  {data.summary.averageLatency}ms
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Call Counts and Success Rate */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h3 className="text-gray-900 font-semibold text-lg">Call Counts</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">All agents</p>
            <div className="h-72">
              <Line data={callCountsData} options={lineChartOptions('Call Counts')} />
            </div>
          </Card>

          <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="h-5 w-5 text-green-600" />
              <h3 className="text-gray-900 font-semibold text-lg">Call Successful</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">All agents</p>
            <div className="h-72">
              <Doughnut data={successRateData} options={doughnutOptions} />
            </div>
          </Card>
        </div>

        {/* Donut Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <PhoneOff className="h-5 w-5 text-orange-600" />
              <h3 className="text-gray-900 font-semibold text-lg">Disconnection Reason</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">All agents</p>
            <div className="h-72">
              <Doughnut data={disconnectionChartData} options={doughnutOptions} />
            </div>
          </Card>

          <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              <h3 className="text-gray-900 font-semibold text-lg">User Sentiment</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">All agents</p>
            <div className="h-72">
              <Doughnut data={sentimentData} options={doughnutOptions} />
            </div>
          </Card>

          <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="h-5 w-5 text-indigo-600" />
              <h3 className="text-gray-900 font-semibold text-lg">Phone inbound/outbound</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">All agents</p>
            <div className="h-72">
              <Doughnut data={phoneDirectionData} options={doughnutOptions} />
            </div>
          </Card>
        </div>

        {/* Rate Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <PhoneIncoming className="h-5 w-5 text-green-600" />
              <h3 className="text-gray-900 font-semibold text-lg">Call Picked Up Rate</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">All agents</p>
            <div className="h-60">
              <Line data={pickupRateData} options={lineChartOptions('Pickup Rate')} />
            </div>
          </Card>

          <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h3 className="text-gray-900 font-semibold text-lg">Call Successful Rate</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">All agents</p>
            <div className="h-60">
              <Line data={successRateChartData} options={lineChartOptions('Success Rate')} />
            </div>
          </Card>

          <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <PhoneOutgoing className="h-5 w-5 text-purple-600" />
              <h3 className="text-gray-900 font-semibold text-lg">Call Transfer Rate</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">All agents</p>
            <div className="h-60">
              <Line data={transferRateData} options={lineChartOptions('Transfer Rate')} />
            </div>
          </Card>
        </div>

        {/* Additional Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="h-5 w-5 text-amber-600" />
              <h3 className="text-gray-900 font-semibold text-lg">Voicemail Rate</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">All agents</p>
            <div className="h-60">
              <Line data={voicemailRateData} options={lineChartOptions('Voicemail Rate')} />
            </div>
          </Card>

          <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-cyan-600" />
              <h3 className="text-gray-900 font-semibold text-lg">Average call duration</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">All agents</p>
            <div className="h-60">
              <Line data={durationData} options={lineChartOptions('Duration')} />
            </div>
          </Card>

          <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-rose-600" />
              <h3 className="text-gray-900 font-semibold text-lg">Average Latency</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">All agents</p>
            <div className="h-60">
              <Line data={latencyData} options={lineChartOptions('Latency')} />
            </div>
          </Card>
        </div>

        {/* NEW: Stacked Bar Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <h3 className="text-gray-900 font-semibold text-lg">Call Successful</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">All agents</p>
            <div className="h-72">
              <Bar data={callSuccessfulStackedData} options={stackedBarOptions} />
            </div>
          </Card>

          <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <h3 className="text-gray-900 font-semibold text-lg">Disconnection Reason</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">All agents</p>
            <div className="h-72">
              <Bar data={disconnectionStackedData} options={stackedBarOptions} />
            </div>
          </Card>

          <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <h3 className="text-gray-900 font-semibold text-lg">User Sentiment</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">All agents</p>
            <div className="h-72">
              <Bar data={sentimentStackedData} options={stackedBarOptions} />
            </div>
          </Card>
        </div>

        {/* Agent Performance Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="text-gray-900 font-semibold text-lg">Call Successful by Agent</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">All agents</p>
            <div className="h-60">
              <Bar data={agentSuccessData} options={barChartOptions('Agent Success')} />
            </div>
          </Card>

          <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-emerald-600" />
              <h3 className="text-gray-900 font-semibold text-lg">Call Picked Up Rate by Agent</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">All agents</p>
            <div className="h-60">
              <Bar data={agentPickupData} options={barChartOptions('Agent Pickup')} />
            </div>
          </Card>

          <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-violet-600" />
              <h3 className="text-gray-900 font-semibold text-lg">Call Transfer Rate by Agent</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">All agents</p>
            <div className="h-60">
              <Bar data={agentTransferData} options={barChartOptions('Agent Transfer')} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
