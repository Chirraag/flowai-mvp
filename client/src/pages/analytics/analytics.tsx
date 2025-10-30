import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
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
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { analyticsApi } from '@/api/analytics';
import type { AnalyticsData } from '@/types/analytics';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import DateFilterControls from '@/components/analytics/DateFilterControls';

// Analytics data types are imported from '@/types/analytics'

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

const trimYAxisLabel = (label: string): string => {
  const parts = label.split('|');
  return parts.length > 2 ? parts.slice(0, 2).join('|').trim() : label.trim();
};

// Colors
const COLORS = {
  blue: '#3b82f6',
  blueLight: 'rgba(59, 130, 246, 0.1)',
  cyan: '#06b6d4',
  cyanLight: 'rgba(6, 182, 212, 0.1)',
  emerald: '#10b981',
  emeraldLight: 'rgba(16, 185, 129, 0.1)',
  indigo: '#6366f1',
  violet: '#8b5cf6',
  violetLight: 'rgba(139, 92, 246, 0.1)',
  amber: '#f59e0b',
  amberLight: 'rgba(245, 158, 11, 0.1)',
  orange: '#f97316',
  rose: '#f43f5e',
  slate: '#64748b',
  sky: '#5DADE2',
  green: '#58D68D',
  purple: '#BB8FCE',
  gold: '#F5B041',
  red: '#EC7063',
};

// Array of colors for dynamic chart segments
const colorsArray = [
  COLORS.blue,
  COLORS.cyan,
  COLORS.emerald,
  COLORS.violet,
  COLORS.amber,
  COLORS.orange,
  COLORS.rose,
  COLORS.indigo,
  COLORS.slate,
  COLORS.sky,
  COLORS.green,
  COLORS.purple,
  COLORS.gold,
  COLORS.red,
];

// Custom Legend Component for Disconnection Reasons Bar Chart
const DisconnectionBarLegend: React.FC<{
  payload: any[];
  onShowMore: () => void;
}> = ({ payload, onShowMore }) => {
  // Always show first 2 items + "Show more" button
  const visibleItems = payload.slice(0, 2);

  return (
    <div>
      {/* Primary legend items */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {visibleItems.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm">
              {entry.name}: {entry.value.toLocaleString()}
            </span>
          </div>
        ))}

        {/* Show more button (opens modal) */}
        {payload.length > 2 && (
          <button
            className="flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            onClick={onShowMore}
          >
            <span className="text-sm">
              +{payload.length - 2} more
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

// Card component
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg p-6 ${className}`}>{children}</div>
);

// Expanded Legend Modal Component
const ExpandedLegendModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  legendData: any[];
  title?: string;
  description?: string;
}> = ({ isOpen, onClose, legendData, title = "Additional Disconnection Reasons", description = "Complete list of disconnection reasons with their call counts" }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {legendData.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {entry.name}
                </span>
                <span className="text-xs text-gray-500">
                  {entry.value.toLocaleString()} calls
                </span>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Agent Performance Modal Component
const AgentPerformanceModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  title: string;
  color: string;
  valueName: string;
}> = ({ isOpen, onClose, data, title, color, valueName }) => {
  // Calculate dynamic height based on number of agents (minimum 400px, maximum 800px)
  const chartHeight = Math.min(Math.max(data.length * 40 + 100, 400), 800);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Complete agent performance data - {data.length} agents total
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto min-h-0">
          <div style={{ height: chartHeight, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, bottom: 10, left: 160 }}>
                <CartesianGrid stroke="rgba(0,0,0,0.05)" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="name" width={150} fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name={valueName} fill={color} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Custom Legend Component for Disconnection Reasons
const DisconnectionLegend: React.FC<{
  payload: any[];
  onShowMore: () => void;
}> = ({ payload, onShowMore }) => {
  // Always show first 5 items + "Show more" button
  const visibleItems = payload.slice(0, 5);

  return (
    <div>
      {/* Primary legend items */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {visibleItems.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm">
              {entry.name}: {entry.value.toLocaleString()}
            </span>
          </div>
        ))}

        {/* Show more button (opens modal) */}
        {payload.length > 5 && (
          <button
            className="flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            onClick={onShowMore}
          >
            <span className="text-sm">
              +{payload.length - 5} more
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default function Analytics() {
  const { hasWriteAccess, user } = useAuth();
  const canWriteAnalytics = hasWriteAccess('analytics');

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDisconnectionBarModalOpen, setIsDisconnectionBarModalOpen] = useState(false);
  const [agentModalType, setAgentModalType] = useState<'success' | 'pickup' | 'transfer' | null>(null);

  // Date filter state
  const [dateFilters, setDateFilters] = useState<{from?: string, to?: string, agentName?: string} | null>(null);
  const [debouncedDateFilters, setDebouncedDateFilters] = useState<{from?: string, to?: string, agentName?: string} | null>(null);
  const [filterLoading, setFilterLoading] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);

  // Debounce date filter changes (500ms delay)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce date filter changes to prevent rapid API calls
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedDateFilters(dateFilters);
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [dateFilters]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.org_id) {
        setError('Organization ID not found. Please log in again.');
        setLoading(false);
        setFilterLoading(false);
        setFilterError(null);
        return;
      }

      try {
        setFilterLoading(true);
        setFilterError(null);

        const analyticsData = await analyticsApi.getAnalytics(user.org_id, debouncedDateFilters || undefined);
        setData(analyticsData);
        setError(null); // Clear any previous errors on successful fetch

        // Clear filter-specific errors on success
        setFilterError(null);

      } catch (err: any) {
        console.error('Error loading analytics data:', err);

        // Handle filter-specific errors
        const errorMessage = err.message || 'Failed to load analytics data';

        if (debouncedDateFilters) {
          // If we have filters applied, show filter-specific error
          setFilterError(errorMessage);
          // Keep existing data if available, don't overwrite with error
          if (!data) {
            setError('Unable to load filtered data. Please try clearing filters or refreshing the page.');
          }
        } else {
          // Initial load error
          setError(errorMessage);
        }

        // Handle specific error types
        if (errorMessage.includes('Invalid date range') || errorMessage.includes('date')) {
          setFilterError('The selected date range is invalid. Please check your dates and try again.');
        } else if (errorMessage.includes('permission') || errorMessage.includes('403')) {
          setFilterError('You do not have permission to view data for the selected date range.');
        } else if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
          setFilterError('Network error. Please check your connection and try again.');
        }
      } finally {
        setLoading(false);
        setFilterLoading(false);
      }
    };

    fetchData();
  }, [user?.org_id, debouncedDateFilters]);

  // ALL useMemo hooks must be declared BEFORE any conditional returns
  // Memoized transforms for Recharts
  const timeSeriesLabels = useMemo(() => {
    if (!data) return [];
    return data.timeSeriesData.callCounts.map((it) => formatDate(it.date));
  }, [data]);

  const timeSeriesBreakdown = useMemo(() => {
    if (!data) return [];
    const callCounts = data.timeSeriesData.callCounts;
    const totalSuccessful = data.callSuccessRate.successful;
    const totalUnsuccessful = data.callSuccessRate.unsuccessful;
    const total = Math.max(1, totalSuccessful + totalUnsuccessful);
    return callCounts.map((item) => {
      const successfulRatio = totalSuccessful / total;
      const unsuccessfulRatio = totalUnsuccessful / total;
      return {
        date: item.date,
        successful: Math.round(item.value * successfulRatio),
        unsuccessful: Math.round(item.value * unsuccessfulRatio),
      };
    });
  }, [data]);

  const callSuccessfulStacked = useMemo(() => {
    if (!timeSeriesBreakdown.length) return [];
    return timeSeriesBreakdown.map((it) => ({
      label: formatDate(it.date),
      successful: it.successful,
      unsuccessful: it.unsuccessful,
    }));
  }, [timeSeriesBreakdown]);

  // Disconnection reasons stacked bar chart data
  const disconnectionReasonsStacked = useMemo(() => {
    if (!data?.dailyBreakdown?.length) return [];

    // Get all unique disconnection reasons across all dates
    const allReasons = new Set<string>();
    data.dailyBreakdown.forEach(day => {
      Object.keys(day.disconnectionReasons).forEach(reason => {
        allReasons.add(reason);
      });
    });

    return data.dailyBreakdown.map((day) => {
      const result: any = { label: formatDate(day.date) };
      // Add all disconnection reasons, defaulting to 0 if not present
      allReasons.forEach(reason => {
        result[camelToTitle(reason)] = day.disconnectionReasons[reason] || 0;
      });
      return result;
    });
  }, [data]);

  // User sentiment stacked bar chart data
  const sentimentStacked = useMemo(() => {
    if (!data?.dailyBreakdown?.length) return [];

    // Get all unique sentiment types across all dates
    const allSentiments = new Set<string>();
    data.dailyBreakdown.forEach(day => {
      Object.keys(day.sentiment).forEach(sentiment => {
        allSentiments.add(sentiment);
      });
    });

    return data.dailyBreakdown.map((day) => {
      const result: any = { label: formatDate(day.date) };
      // Add all sentiment types, defaulting to 0 if not present
      allSentiments.forEach(sentiment => {
        result[camelToTitle(sentiment)] = day.sentiment[sentiment] || 0;
      });
      return result;
    });
  }, [data]);

  // Legend data for disconnection reasons bar chart
  const disconnectionBarLegendData = useMemo(() => {
    if (!disconnectionReasonsStacked.length) return [];

    // Get all disconnection reason keys (excluding 'label')
    const reasonKeys = Object.keys(disconnectionReasonsStacked[0]).filter(key => key !== 'label');

    // Calculate total for each reason across all dates
    const reasonTotals: { [key: string]: number } = {};
    disconnectionReasonsStacked.forEach(dateEntry => {
      reasonKeys.forEach(reason => {
        reasonTotals[reason] = (reasonTotals[reason] || 0) + (dateEntry[reason] || 0);
      });
    });

    // Sort to prioritize User_hangup and Agent_hangup first, then by total count descending
    const priorityReasons = ['User_hangup', 'Agent_hangup'];
    const sortedReasons = reasonKeys
      .map(reason => ({ name: reason, value: reasonTotals[reason] }))
      .sort((a, b) => {
        const aPriority = priorityReasons.indexOf(a.name);
        const bPriority = priorityReasons.indexOf(b.name);

        // If both are priority reasons, sort by priority order
        if (aPriority >= 0 && bPriority >= 0) {
          return aPriority - bPriority;
        }
        // If only one is priority, put it first
        if (aPriority >= 0) return -1;
        if (bPriority >= 0) return 1;
        // Otherwise sort by value descending
        return b.value - a.value;
      });

    // Assign colors to each reason
    return sortedReasons.map((reason, idx) => ({
      name: reason.name,
      value: reason.value,
      color: colorsArray[idx % colorsArray.length],
    }));
  }, [disconnectionReasonsStacked]);

  // Area/Line chart series
  const callCountsSeries = useMemo(() => {
    if (!data) return [];
    return data.timeSeriesData.callCounts.map((it) => ({ date: formatDate(it.date), value: it.value }));
  }, [data]);

  const pickupRateSeries = useMemo(() => {
    if (!data) return [];
    return data.timeSeriesData.callPickupRate.map((it) => ({ date: formatDate(it.date), value: it.value }));
  }, [data]);

  const successRateSeries = useMemo(() => {
    if (!data) return [];
    return data.timeSeriesData.callSuccessfulRate.map((it) => ({ date: formatDate(it.date), value: it.value }));
  }, [data]);

  const transferRateSeries = useMemo(() => {
    if (!data) return [];
    return data.timeSeriesData.callTransferRate.map((it) => ({ date: formatDate(it.date), value: it.value }));
  }, [data]);

  const voicemailRateSeries = useMemo(() => {
    if (!data) return [];
    return data.timeSeriesData.voicemailRate.map((it) => ({ date: formatDate(it.date), value: it.value }));
  }, [data]);

  const durationSeries = useMemo(() => {
    if (!data) return [];
    return data.timeSeriesData.averageCallDuration.map((it) => ({ date: formatDate(it.date), value: it.value }));
  }, [data]);

  const latencySeries = useMemo(() => {
    if (!data) return [];
    return data.timeSeriesData.averageLatency.map((it) => ({ date: formatDate(it.date), value: it.value }));
  }, [data]);

  // Donut data - Call Successful donut now only has 2 segments (successful/unsuccessful)
  const successRateDonut = useMemo(() => {
    if (!data) return [];
    return [
      { name: 'Successful', value: data.callSuccessRate.successful, color: COLORS.cyan },
      { name: 'Unsuccessful', value: data.callSuccessRate.unsuccessful, color: COLORS.orange },
    ];
  }, [data]);

  const disconnectionsSorted = useMemo(() => {
    if (!data) return { top: [], rest: [], others: 0, totalUnique: 0 };
    const arr = Object.entries(data.disconnectionReasons)
      .map(([key, value]) => ({ name: camelToTitle(key), value }))
      .sort((a, b) => b.value - a.value);
    const top = arr.slice(0, 5);
    const rest = arr.slice(5);
    const others = rest.reduce((sum, it) => sum + it.value, 0);
    return { top, rest, others, totalUnique: arr.length };
  }, [data]);

  // Chart data - always shows all disconnection reasons
  const disconnectionDonut = useMemo(() => {
    if (!disconnectionsSorted.top.length) return [];

    // Always show all disconnection reasons in the chart with distinct colors
    const allReasons = [...disconnectionsSorted.top, ...disconnectionsSorted.rest];
    return allReasons.map((d, idx) => ({
      name: d.name,
      value: d.value,
      color: [
        COLORS.violet,
        COLORS.orange,
        COLORS.cyan,
        COLORS.amber,
        COLORS.rose,
        COLORS.blue,
        COLORS.emerald,
        COLORS.indigo,
        COLORS.slate,
        COLORS.blueLight,
        COLORS.cyanLight,
        COLORS.emeraldLight,
        COLORS.violetLight
      ][idx % 13],
    }));
  }, [disconnectionsSorted]);

  // Legend data - can be expanded/collapsed
  const disconnectionLegendData = useMemo(() => {
    const allReasons = [...disconnectionsSorted.top, ...disconnectionsSorted.rest];
    return allReasons.map((d, idx) => ({
      name: d.name,
      value: d.value,
      color: [
        COLORS.violet,
        COLORS.orange,
        COLORS.cyan,
        COLORS.amber,
        COLORS.rose,
        COLORS.blue,
        COLORS.emerald,
        COLORS.indigo,
        COLORS.slate,
        COLORS.blueLight,
        COLORS.cyanLight,
        COLORS.emeraldLight,
        COLORS.violetLight
      ][idx % 13],
    }));
  }, [disconnectionsSorted]);

  const sentimentDonut = useMemo(() => {
    if (!data) return [];
    return [
      { name: 'Neutral', value: data.userSentiment.Neutral || 0, color: COLORS.violet },
      { name: 'Positive', value: data.userSentiment.Positive || 0, color: COLORS.cyan },
      { name: 'positive', value: data.userSentiment.positive || 0, color: COLORS.emerald },
      { name: 'Unknown', value: data.userSentiment.Unknown || 0, color: COLORS.slate },
      { name: 'Negative', value: data.userSentiment.Negative || 0, color: COLORS.orange },
    ];
  }, [data]);

  const phoneDirectionDonut = useMemo(() => {
    if (!data) return [];
    return [
      { name: 'Inbound', value: data.phoneDirection.inbound, color: COLORS.blue },
      { name: 'Outbound', value: data.phoneDirection.outbound, color: COLORS.orange },
    ];
  }, [data]);

  // Agent performance (horizontal bars) - Top 5 agents only
  const agentSuccessBars = useMemo(() => {
    if (!data) return [];
    return data.agentPerformance
      .map((a) => ({
        name: trimYAxisLabel(a.agentName || a.agentId),
        value: a.callSuccessful.percentage
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [data]);

  const agentPickupBars = useMemo(() => {
    if (!data) return [];
    return data.agentPerformance
      .map((a) => ({
        name: trimYAxisLabel(a.agentName || a.agentId),
        value: a.callPickupRate.percentage
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [data]);

  const agentTransferBars = useMemo(() => {
    if (!data) return [];
    return data.agentPerformance
      .map((a) => ({
        name: trimYAxisLabel(a.agentName || a.agentId),
        value: a.callTransferRate.percentage
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [data]);

  // Full agent performance data for modal
  const agentSuccessBarsFull = useMemo(() => {
    if (!data) return [];
    return data.agentPerformance
      .map((a) => ({
        name: trimYAxisLabel(a.agentName || a.agentId),
        value: a.callSuccessful.percentage
      }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const agentPickupBarsFull = useMemo(() => {
    if (!data) return [];
    return data.agentPerformance
      .map((a) => ({
        name: trimYAxisLabel(a.agentName || a.agentId),
        value: a.callPickupRate.percentage
      }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const agentTransferBarsFull = useMemo(() => {
    if (!data) return [];
    return data.agentPerformance
      .map((a) => ({
        name: trimYAxisLabel(a.agentName || a.agentId),
        value: a.callTransferRate.percentage
      }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  // CONDITIONAL RETURNS COME AFTER ALL HOOKS
  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
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
        <div className="text-center p-8">
          <div className="max-w-md mx-auto">
            <div className="text-red-600 mb-4">
              <p className="font-medium">Failed to load analytics data</p>
              <p className="text-sm text-gray-600 mt-1">{error}</p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="bg-[#1c275e] hover:bg-[#233072] text-white px-4 py-2 rounded-lg mr-2"
              >
                Retry
              </button>
              <button
                onClick={() => window.location.href = '/login'}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <div className="container mx-auto space-y-6">
        {/* Sticky Header with Filters */}
        <div className="sticky top-0 z-50 bg-[#1C275E] text-white border-b border-[#1C275E]/20 rounded-t-2xl shadow-sm">
          <div className="p-2">
            <DateFilterControls
              onFiltersChange={setDateFilters}
              isLoading={filterLoading}
              filterError={filterError}
              className="w-full"
              orgId={user?.org_id}
            />
          </div>
        </div>

        {/* Filter Error Alert - Show when data loading failed due to filters */}
        {filterError && data && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-orange-800">
                  Unable to load filtered data
                </h3>
                <p className="text-sm text-orange-700 mt-1">
                  {filterError}
                </p>
                <div className="mt-3">
                  <button
                    onClick={() => setDateFilters(null)}
                    className="text-sm font-medium text-orange-800 hover:text-orange-900 underline"
                  >
                    Clear filters to view all data →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Row - KPI Cards and Call Successful Chart */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Top KPI Cards - Left side, stacked vertically and compact */}
          <div className="xl:col-span-2 flex flex-col gap-2">
    <Card className="bg-white border-0 shadow-md rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus-within:shadow-xl focus-within:-translate-y-1 h-32">
      <div className="p-4">
        <h3 className="text-sm font-bold text-slate-500 tracking-wider uppercase mb-1">
          Call Counts
        </h3>
        <p className="text-4xl font-bold text-[#f48024] tracking-tight">
          {formatNumber(data.summary.totalCalls)}
        </p>
      </div>
    </Card>

    <Card className="bg-white border-0 shadow-md rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus-within:shadow-xl focus-within:-translate-y-1 h-32">
      <div className="p-4">
        <h3 className="text-sm font-bold text-slate-500 tracking-wider uppercase mb-1">
          Avg. Call Duration
        </h3>
        <p className="text-4xl font-bold text-[#f48024] tracking-tight">
          {formatDuration(data.summary.averageCallDuration)}
        </p>
      </div>
    </Card>

    <Card className="bg-white border-0 shadow-md rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus-within:shadow-xl focus-within:-translate-y-1 h-32">
      <div className="p-4">
        <h3 className="text-sm font-bold text-slate-500 tracking-wider uppercase mb-1">
          Avg. Call Latency
        </h3>
        <p className="text-4xl font-bold text-[#f48024] tracking-tight">
          {data.summary.averageLatency}ms
        </p>
      </div>
    </Card>
  </div>


          {/* Call Successful Chart - Right side, wider */}
          <div className="xl:col-span-3">
            <Card className="border border-slate-200/70 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] focus-within:shadow-md focus-within:-translate-y-[1px]">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <h3 className="text-gray-900 font-semibold text-lg">Call Successful</h3>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={callSuccessfulStacked} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                    <CartesianGrid stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend verticalAlign="bottom" />
                    <Bar dataKey="successful" name="Call counts: successful" stackId="a" fill={COLORS.sky} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="unsuccessful" name="Call counts: unsuccessful" stackId="a" fill={COLORS.green} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>

        {/* Charts Section - Full width below */}

        {/* Call Counts and Success Rate */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="xl:col-span-2">
            <Card className="border border-slate-200/70 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] focus-within:shadow-md focus-within:-translate-y-[1px]">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-5 w-5 text-green-600" />
                <h3 className="text-gray-900 font-semibold text-lg">Call Successful</h3>
              </div>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Legend verticalAlign="bottom" />
                  <Pie
                    data={successRateDonut}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="70%"
                    outerRadius="90%"
                    strokeWidth={0}
                  >
                    {successRateDonut.map((entry, idx) => (
                      <Cell key={`sr-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            </Card>
          </div>

          <div className="xl:col-span-3">
            <Card className="border border-slate-200/70 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] focus-within:shadow-md focus-within:-translate-y-[1px]">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h3 className="text-gray-900 font-semibold text-lg">Call Counts</h3>
              </div>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={callCountsSeries} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="colorCallCounts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="value" name="Call Counts" stroke={COLORS.blue} fillOpacity={1} fill="url(#colorCallCounts)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            </Card>
          </div>
        </div>

        {/* Donut Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-slate-200/70 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] focus-within:shadow-md focus-within:-translate-y-[1px]">
            <div className="flex items-center gap-2 mb-2">
              <PhoneOff className="h-5 w-5 text-orange-600" />
              <h3 className="text-gray-900 font-semibold text-lg">Disconnection Reason</h3>
            </div>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  {/* Custom Legend Component */}
                  <Legend
                    verticalAlign="bottom"
                    content={<DisconnectionLegend
                      payload={disconnectionLegendData}
                      onShowMore={() => setIsModalOpen(true)}
                    />}
                  />
                  <Pie data={disconnectionDonut} dataKey="value" nameKey="name" innerRadius="70%" outerRadius="90%" strokeWidth={0}>
                    {disconnectionDonut.map((entry, idx) => (
                      <Cell key={`disc-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

          </Card>

          {/* Expanded Legend Modal */}
          <ExpandedLegendModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            legendData={disconnectionLegendData.slice(5)}
          />

          {/* Expanded Legend Modal for Disconnection Reasons Bar Chart */}
          <ExpandedLegendModal
            isOpen={isDisconnectionBarModalOpen}
            onClose={() => setIsDisconnectionBarModalOpen(false)}
            legendData={disconnectionBarLegendData.slice(2)}
            title="Additional Disconnection Reasons by Date"
            description="Complete list of disconnection reasons with their total counts across all dates"
          />

          {/* Agent Performance Modals */}
          <AgentPerformanceModal
            isOpen={agentModalType === 'success'}
            onClose={() => setAgentModalType(null)}
            data={agentSuccessBarsFull}
            title="Call Successful Rate - All Agents"
            color={COLORS.blue}
            valueName="Success Rate (%)"
          />

          <AgentPerformanceModal
            isOpen={agentModalType === 'pickup'}
            onClose={() => setAgentModalType(null)}
            data={agentPickupBarsFull}
            title="Call Picked Up Rate - All Agents"
            color={COLORS.emerald}
            valueName="Pickup Rate (%)"
          />

          <AgentPerformanceModal
            isOpen={agentModalType === 'transfer'}
            onClose={() => setAgentModalType(null)}
            data={agentTransferBarsFull}
            title="Call Transfer Rate - All Agents"
            color={COLORS.violet}
            valueName="Transfer Rate (%)"
          />

          <Card className="border border-slate-200/70 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] focus-within:shadow-md focus-within:-translate-y-[1px]">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              <h3 className="text-gray-900 font-semibold text-lg">User Sentiment</h3>
            </div>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Legend verticalAlign="bottom" />
                  <Pie data={sentimentDonut} dataKey="value" nameKey="name" innerRadius="70%" outerRadius="90%" strokeWidth={0}>
                    {sentimentDonut.map((entry, idx) => (
                      <Cell key={`sent-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="border border-slate-200/70 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] focus-within:shadow-md focus-within:-translate-y-[1px]">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="h-5 w-5 text-indigo-600" />
              <h3 className="text-gray-900 font-semibold text-lg">Phone inbound/outbound</h3>
            </div>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Legend verticalAlign="bottom" />
                  <Pie data={phoneDirectionDonut} dataKey="value" nameKey="name" innerRadius="70%" outerRadius="90%" strokeWidth={0}>
                    {phoneDirectionDonut.map((entry, idx) => (
                      <Cell key={`pd-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Rate Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-slate-200/70 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] focus-within:shadow-md focus-within:-translate-y-[1px]">
            <div className="flex items-center gap-2 mb-2">
              <PhoneIncoming className="h-5 w-5 text-green-600" />
              <h3 className="text-gray-900 font-semibold text-lg">Call Picked Up Rate</h3>
            </div>
            
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pickupRateSeries} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="colorPickup" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="value" name="Pickup Rate (%)" stroke={COLORS.emerald} fill="url(#colorPickup)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="border border-slate-200/70 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] focus-within:shadow-md focus-within:-translate-y-[1px]">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h3 className="text-gray-900 font-semibold text-lg">Call Successful Rate</h3>
            </div>
            
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={successRateSeries} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="colorSuccessRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="value" name="Success Rate (%)" stroke={COLORS.blue} fill="url(#colorSuccessRate)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="border border-slate-200/70 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] focus-within:shadow-md focus-within:-translate-y-[1px]">
            <div className="flex items-center gap-2 mb-2">
              <PhoneOutgoing className="h-5 w-5 text-purple-600" />
              <h3 className="text-gray-900 font-semibold text-lg">Call Transfer Rate</h3>
            </div>
            
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={transferRateSeries} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="colorTransfer" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.violet} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={COLORS.violet} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="value" name="Transfer Rate (%)" stroke={COLORS.violet} fill="url(#colorTransfer)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Additional Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-slate-200/70 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] focus-within:shadow-md focus-within:-translate-y-[1px]">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="h-5 w-5 text-amber-600" />
              <h3 className="text-gray-900 font-semibold text-lg">Voicemail Rate</h3>
            </div>
            
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={voicemailRateSeries} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="colorVoicemail" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.amber} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={COLORS.amber} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="value" name="Voicemail Rate (%)" stroke={COLORS.amber} fill="url(#colorVoicemail)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="border border-slate-200/70 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] focus-within:shadow-md focus-within:-translate-y-[1px]">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-cyan-600" />
              <h3 className="text-gray-900 font-semibold text-lg">Average call duration</h3>
            </div>
            
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={durationSeries} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.cyan} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={COLORS.cyan} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="value" name="Duration (seconds)" stroke={COLORS.cyan} fill="url(#colorDuration)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="border border-slate-200/70 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] focus-within:shadow-md focus-within:-translate-y-[1px]">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-rose-600" />
              <h3 className="text-gray-900 font-semibold text-lg">Average Latency</h3>
            </div>
            
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={latencySeries} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.rose} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={COLORS.rose} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="value" name="Latency (ms)" stroke={COLORS.rose} fill="url(#colorLatency)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Stacked Bar Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border border-slate-200/70 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] focus-within:shadow-md focus-within:-translate-y-[1px]">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="h-5 w-5 text-red-600" />
              <h3 className="text-gray-900 font-semibold text-lg">Disconnection Reasons by Date</h3>
            </div>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={disconnectionReasonsStacked} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    content={<DisconnectionBarLegend
                      payload={disconnectionBarLegendData}
                      onShowMore={() => setIsDisconnectionBarModalOpen(true)}
                    />}
                  />
                  {Object.keys(disconnectionReasonsStacked[0] || {}).filter(key => key !== 'label').map((reason, idx) => (
                    <Bar
                      key={reason}
                      dataKey={reason}
                      name={`Disconnection: ${reason}`}
                      stackId="a"
                      fill={colorsArray[idx % colorsArray.length]}
                      radius={idx === Object.keys(disconnectionReasonsStacked[0] || {}).filter(key => key !== 'label').length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="border border-slate-200/70 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] focus-within:shadow-md focus-within:-translate-y-[1px]">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-5 w-5 text-yellow-600" />
              <h3 className="text-gray-900 font-semibold text-lg">User Sentiment by Date</h3>
            </div>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sentimentStacked} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend verticalAlign="bottom" />
                  {Object.keys(sentimentStacked[0] || {}).filter(key => key !== 'label').map((sentiment, idx) => (
                    <Bar
                      key={sentiment}
                      dataKey={sentiment}
                      name={`Sentiment: ${sentiment}`}
                      stackId="a"
                      fill={colorsArray[(idx + 5) % colorsArray.length]} // Offset colors to avoid overlap with disconnection reasons
                      radius={idx === Object.keys(sentimentStacked[0] || {}).filter(key => key !== 'label').length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

        </div>

        {/* Agent Performance Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-slate-200/70 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] focus-within:shadow-md focus-within:-translate-y-[1px]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <h3 className="text-gray-900 font-semibold text-lg">Call Successful by Agent</h3>
              </div>
              <button
                onClick={() => setAgentModalType('success')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
              >
                View All Agents
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-4">Top 5 agents</p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentSuccessBars} layout="vertical" margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                  <CartesianGrid stroke="rgba(0,0,0,0.05)" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" width={120} fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Success Rate (%)" fill={COLORS.blue} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="border border-slate-200/70 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] focus-within:shadow-md focus-within:-translate-y-[1px]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                <h3 className="text-gray-900 font-semibold text-lg">Call Picked Up Rate by Agent</h3>
              </div>
              <button
                onClick={() => setAgentModalType('pickup')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
              >
                View All Agents
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-4">Top 5 agents</p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentPickupBars} layout="vertical" margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                  <CartesianGrid stroke="rgba(0,0,0,0.05)" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" width={120} fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Pickup Rate (%)" fill={COLORS.emerald} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="border border-slate-200/70 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] focus-within:shadow-md focus-within:-translate-y-[1px]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-violet-600" />
                <h3 className="text-gray-900 font-semibold text-lg">Call Transfer Rate by Agent</h3>
              </div>
              <button
                onClick={() => setAgentModalType('transfer')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
              >
                View All Agents
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-4">Top 5 agents</p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentTransferBars} layout="vertical" margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                  <CartesianGrid stroke="rgba(0,0,0,0.05)" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" width={120} fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Transfer Rate (%)" fill={COLORS.violet} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
