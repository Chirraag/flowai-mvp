import React, { useImperativeHandle, forwardRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book, Calendar, Clock, Users, CheckCircle, AlertCircle, TrendingUp, BarChart3, Activity, FileText } from "lucide-react";

/**
 * MetricDefinitionsTab
 * - Definitions and explanations for all analytics metrics
 * - Bullet point format with clear descriptions
 */
export type MetricDefinitionsTabHandle = {
  getValues: () => { definitions: any };
  validate: () => { valid: boolean; errors: string[] };
};

const MetricDefinitionsTab = forwardRef<MetricDefinitionsTabHandle>((_props, ref) => {
  useImperativeHandle(ref, () => ({
    getValues: () => ({ definitions: definitions }),
    validate: () => ({ valid: true, errors: [] }),
  }));

  const definitions = [
    {
      category: "Scheduling Metrics",
      icon: Calendar,
      color: "text-blue-600",
      metrics: [
        {
          name: "Total Appointments",
          definition: "The total number of appointments scheduled within a given time period",
          calculation: "Sum of all confirmed appointments in the selected timeframe",
          importance: "High"
        },
        {
          name: "Avg Wait Time",
          definition: "Average time patients wait from check-in to being seen by provider",
          calculation: "Total wait time ÷ Number of patients seen",
          importance: "Critical"
        },
        {
          name: "Patient Volume",
          definition: "Total number of unique patients served in a time period",
          calculation: "Count of distinct patient IDs with completed visits",
          importance: "High"
        },
        {
          name: "No-Show Rate",
          definition: "Percentage of scheduled appointments where patients did not arrive",
          calculation: "(No-show appointments ÷ Total scheduled appointments) × 100",
          importance: "High"
        },
        {
          name: "On-Time Starts",
          definition: "Percentage of appointments that begin within 5 minutes of scheduled time",
          calculation: "(On-time appointments ÷ Total appointments) × 100",
          importance: "Medium"
        },
        {
          name: "Cancellation Rate",
          definition: "Percentage of scheduled appointments that were cancelled before visit",
          calculation: "(Cancelled appointments ÷ Total scheduled appointments) × 100",
          importance: "Medium"
        },
        {
          name: "Utilization Rate",
          definition: "Percentage of available provider time that is actually used for patient care",
          calculation: "(Time spent with patients ÷ Total available time) × 100",
          importance: "High"
        },
        {
          name: "Provider Efficiency",
          definition: "Measure of how effectively providers use their time with patients",
          calculation: "Average patients per hour × Average visit quality score",
          importance: "High"
        }
      ]
    },
    {
      category: "Intake Metrics",
      icon: FileText,
      color: "text-emerald-600",
      metrics: [
        {
          name: "Forms Completed",
          definition: "Number of patient intake forms successfully completed and submitted",
          calculation: "Count of forms with 100% completion status",
          importance: "High"
        },
        {
          name: "Avg Completion Time",
          definition: "Average time taken by patients to complete intake forms",
          calculation: "Total time spent ÷ Number of completed forms",
          importance: "Medium"
        },
        {
          name: "Completion Rate",
          definition: "Percentage of started intake forms that reach completion",
          calculation: "(Completed forms ÷ Started forms) × 100",
          importance: "Critical"
        },
        {
          name: "Pending Reviews",
          definition: "Number of completed forms awaiting manual review by staff",
          calculation: "Count of forms in 'pending review' status",
          importance: "Medium"
        },
        {
          name: "Patient Registrations",
          definition: "Number of new patient registrations completed through intake process",
          calculation: "Count of new patient records created",
          importance: "High"
        },
        {
          name: "Insurance Verifications",
          definition: "Percentage of patient insurance information successfully verified",
          calculation: "(Verified insurance records ÷ Total submissions) × 100",
          importance: "Critical"
        },
        {
          name: "Data Accuracy",
          definition: "Percentage of intake data that passes validation checks",
          calculation: "(Valid data fields ÷ Total data fields) × 100",
          importance: "Critical"
        }
      ]
    },
    {
      category: "Check-in Metrics",
      icon: Clock,
      color: "text-red-600",
      metrics: [
        {
          name: "Avg Check-in Time",
          definition: "Average time required to complete the patient check-in process",
          calculation: "Total check-in time ÷ Number of patients checked in",
          importance: "High"
        },
        {
          name: "Successful Check-ins",
          definition: "Percentage of attempted check-ins that complete successfully",
          calculation: "(Successful check-ins ÷ Total attempts) × 100",
          importance: "Critical"
        },
        {
          name: "Patient Wait Time",
          definition: "Average time patients wait in reception area before being called",
          calculation: "Total wait time ÷ Number of patients",
          importance: "Critical"
        },
        {
          name: "Check-in Failures",
          definition: "Percentage of check-in attempts that fail due to technical issues",
          calculation: "(Failed check-ins ÷ Total attempts) × 100",
          importance: "Medium"
        },
        {
          name: "Staff Efficiency",
          definition: "Measure of check-in staff performance and speed",
          calculation: "Patients processed per hour × Satisfaction score",
          importance: "High"
        },
        {
          name: "Digital Check-ins",
          definition: "Percentage of patients who complete check-in using digital methods",
          calculation: "(Digital check-ins ÷ Total check-ins) × 100",
          importance: "Medium"
        },
        {
          name: "Process Completion",
          definition: "Percentage of started check-in processes that reach completion",
          calculation: "(Completed check-ins ÷ Started check-ins) × 100",
          importance: "High"
        }
      ]
    }
  ];

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {definitions.map((category, categoryIndex) => (
        <Card key={categoryIndex} className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <category.icon className={`h-5 w-5 ${category.color}`} />
              {category.category}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {category.metrics.map((metric, metricIndex) => (
              <div key={metricIndex} className="border-l-4 border-gray-200 pl-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{metric.name}</h3>
                  <Badge className={getImportanceColor(metric.importance)} variant="secondary">
                    {metric.importance}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Definition:</strong> {metric.definition}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Calculation:</strong> {metric.calculation}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
            <p className="text-sm text-indigo-800">
              Comprehensive metric definitions and calculation methodologies. These definitions ensure
              consistent measurement and interpretation across all analytics dashboards.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default MetricDefinitionsTab;
