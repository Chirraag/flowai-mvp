import React, { useImperativeHandle, forwardRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, Users, AlertCircle, TrendingUp, BarChart3, Activity } from "lucide-react";
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
 * CheckInKPIsTab
 * - Check-in process analytics with 7 KPI charts
 * - Grid layout with Chart.js sparkline charts
 */
export type CheckInKPIsTabHandle = {
  getValues: () => { kpiData: any };
  validate: () => { valid: boolean; errors: string[] };
};

const CheckInKPIsTab = forwardRef<CheckInKPIsTabHandle>((_props, ref) => {
  // Sample data for charts
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [6, 12, 10, 18, 16, 4, 2],
      borderColor: 'rgb(245, 101, 101)',
      backgroundColor: 'rgba(245, 101, 101, 0.1)',
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
    { title: "Avg Check-in Time", value: "2.8m", change: "-0.5m", icon: Clock, color: "text-blue-600" },
    { title: "Successful Check-ins", value: "94.7%", change: "+1.8%", icon: CheckCircle, color: "text-green-600" },
    { title: "Patient Wait Time", value: "4.1m", change: "-1.2m", icon: Users, color: "text-purple-600" },
    { title: "Check-in Failures", value: "5.3%", change: "-1.1%", icon: AlertCircle, color: "text-red-600" },
    { title: "Staff Efficiency", value: "87.2%", change: "+2.5%", icon: TrendingUp, color: "text-cyan-600" },
    { title: "Digital Check-ins", value: "72.8%", change: "+5.3%", icon: BarChart3, color: "text-indigo-600" },
    { title: "Process Completion", value: "91.5%", change: "+1.2%", icon: Activity, color: "text-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
          <div className="mt-4 p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-red-800">
              Check-in process KPI analytics with real-time patient flow metrics coming soon...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default CheckInKPIsTab;
