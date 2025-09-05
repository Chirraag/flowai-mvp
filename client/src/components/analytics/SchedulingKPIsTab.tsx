import React, { useImperativeHandle, forwardRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users, TrendingUp, CheckCircle, AlertCircle, BarChart3, Activity } from "lucide-react";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/**
 * SchedulingKPIsTab
 * - Scheduling analytics with 8 KPI charts
 * - Grid layout with Chart.js sparkline charts
 */
export type SchedulingKPIsTabHandle = {
  getValues: () => { kpiData: any };
  validate: () => { valid: boolean; errors: string[] };
};

const SchedulingKPIsTab = forwardRef<SchedulingKPIsTabHandle>((_props, ref) => {
  // Sample data for charts
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [12, 19, 15, 25, 22, 8, 5],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
  };

  useImperativeHandle(ref, () => ({
    getValues: () => ({ kpiData: chartData }),
    validate: () => ({ valid: true, errors: [] }),
  }));

  const kpis = [
    { title: "Total Appointments", value: "1,247", change: "+12%", icon: Calendar, color: "text-blue-600" },
    { title: "Avg Wait Time", value: "8.5m", change: "-2.1m", icon: Clock, color: "text-green-600" },
    { title: "Patient Volume", value: "892", change: "+8%", icon: Users, color: "text-purple-600" },
    { title: "No-Show Rate", value: "3.2%", change: "-0.8%", icon: TrendingUp, color: "text-red-600" },
    { title: "On-Time Starts", value: "94.3%", change: "+2.1%", icon: CheckCircle, color: "text-emerald-600" },
    { title: "Cancellation Rate", value: "5.7%", change: "-1.2%", icon: AlertCircle, color: "text-orange-600" },
    { title: "Utilization Rate", value: "87.5%", change: "+3.2%", icon: BarChart3, color: "text-indigo-600" },
    { title: "Provider Efficiency", value: "91.2%", change: "+1.8%", icon: Activity, color: "text-cyan-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index} className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mb-2">{kpi.change} from last week</p>
              <div className="h-12">
                <Line data={chartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Scheduling KPI analytics with real-time data visualization coming soon...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default SchedulingKPIsTab;
