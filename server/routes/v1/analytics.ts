import express from 'express';

const router = express.Router();

// Get AI agent performance metrics
router.get('/metrics', async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // Mock agent metrics
    const agentMetrics = [
      {
        agentId: 1,
        totalInteractions: 1247,
        successfulInteractions: 1189
      },
      {
        agentId: 2,
        totalInteractions: 892,
        successfulInteractions: 856
      }
    ];

    // Mock workflow metrics
    const workflowMetrics = [
      {
        workflowType: "appointment_scheduling",
        totalWorkflows: 567,
        completedWorkflows: 543
      },
      {
        workflowType: "insurance_verification",
        totalWorkflows: 234,
        completedWorkflows: 221
      }
    ];

    res.json({
      agentMetrics,
      workflowMetrics,
      lastUpdated: now.toISOString()
    });
  } catch (error) {
    console.error("Error fetching analytics metrics:", error);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

// Get cost savings metrics
router.get('/cost-savings', async (req, res) => {
  try {
    const costSavings = [
      {
        id: 1,
        category: "staffing",
        costSavings: 195000,
        savingsPercentage: 67.5,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        category: "efficiency",
        costSavings: 314000,
        savingsPercentage: 87.0,
        createdAt: new Date().toISOString()
      }
    ];
    
    const totalSavingsByCategory = [
      {
        category: "staffing",
        totalSavings: 648000,
        avgSavingsPercentage: 67.5
      },
      {
        category: "efficiency",
        totalSavings: 314000,
        avgSavingsPercentage: 87.0
      }
    ];

    res.json({
      costSavings,
      totalSavingsByCategory,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching cost savings:", error);
    res.status(500).json({ error: "Failed to fetch cost savings" });
  }
});

// Get KPI metrics
router.get('/kpi-metrics', async (req, res) => {
  try {
    const { timeframe = "6months", site = "all", metric = "all" } = req.query;
    
    const baseMetrics = {
      staffingCostReduction: {
        name: "Staffing Cost Reduction",
        value: 67.5,
        target: 50.0,
        unit: "%",
        trend: "up",
        trendValue: 17.5,
        weekOverWeekChange: 1.8,
        status: "good",
        description: "≥50% cut in scheduling and intake personnel costs within 6 months"
      },
      schedulingAccuracy: {
        name: "Order Schedule Rate Errors", 
        value: 7.3,
        target: 5.0,
        unit: "%",
        trend: "down",
        trendValue: -1.8,
        weekOverWeekChange: -0.7,
        status: "good",
        description: "Missed bookings, overbookings kept below 5%"
      },
      operationalEfficiency: {
        name: "Patient Check-in Time",
        value: 0.1,
        target: 10.0,
        unit: "min",
        trend: "down",
        trendValue: -0.1,
        weekOverWeekChange: -0.1,
        status: "good",
        description: "Patient check-in time under 10 minutes"
      },
      patientSatisfaction: {
        name: "Patient Satisfaction NPS",
        value: 5.6,
        target: 4.5,
        unit: "/5",
        trend: "up",
        trendValue: 0.1,
        weekOverWeekChange: 0.1,
        status: "good",
        description: "Post-visit NPS >4.5/5"
      }
    };

    res.json({
      metrics: baseMetrics,
      timeframe,
      site,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching KPI metrics:", error);
    res.status(500).json({ error: "Failed to fetch KPI metrics" });
  }
});

export default router; 