/**
 * Types for Analytics API
 */

// Base response structure
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Main analytics data structure matching API response
export interface AnalyticsData {
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
  userSentiment: Record<string, number>;
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
    sentiment: Record<string, number>;
  }>;
  agentPerformance: Array<{
    agentId: string;
    agentName: string | null;
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

// Chart data types for UI components
export interface DonutData {
  name: string;
  value: number;
  color: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface StackedBarData {
  label: string;
  [key: string]: string | number;
}

export interface AgentBarData {
  name: string;
  value: number;
}
