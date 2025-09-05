import React, { useImperativeHandle, forwardRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, CheckCircle, AlertCircle, Users, TrendingUp, BarChart3 } from "lucide-react";
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
 * IntakeKPIsTab
 * - Patient intake analytics with 7 KPI charts
 * - Grid layout with Chart.js sparkline charts
 */
export type IntakeKPIsTabHandle = {
  getValues: () => { kpiData: any };
  validate: () => { valid: boolean; errors: string[] };
};

const IntakeKPIsTab = forwardRef<IntakeKPIsTabHandle>((_props, ref) => {
  // Sample data for charts
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [8, 15, 12, 20, 18, 6, 3],
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
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
    { title: "Forms Completed", value: "423", change: "+15%", icon: FileText, color: "text-emerald-600" },
    { title: "Avg Completion Time", value: "4.2m", change: "-0.8m", icon: Clock, color: "text-blue-600" },
    { title: "Completion Rate", value: "94.3%", change: "+2.1%", icon: CheckCircle, color: "text-green-600" },
    { title: "Pending Reviews", value: "12", change: "-3", icon: AlertCircle, color: "text-orange-600" },
    { title: "Patient Registrations", value: "156", change: "+8%", icon: Users, color: "text-purple-600" },
    { title: "Insurance Verifications", value: "89.7%", change: "+3.2%", icon: TrendingUp, color: "text-cyan-600" },
    { title: "Data Accuracy", value: "96.8%", change: "+1.5%", icon: BarChart3, color: "text-indigo-600" },
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
          <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
            <p className="text-sm text-emerald-800">
              Patient intake KPI analytics with automated form processing metrics coming soon...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default IntakeKPIsTab;
