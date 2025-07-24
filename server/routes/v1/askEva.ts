import express from 'express';

const router = express.Router();

// Ask Eva AI Chat Endpoint
router.post('/chat', async (req, res) => {
  try {
    const { question, context } = req.body;
    
    // Process the question to determine category and provide appropriate response
    const lowerQuestion = question.toLowerCase();
    let response = "";
    let category = "basic";
    let confidence = 95;

    // Analytics Questions
    if (lowerQuestion.includes("patient satisfaction") || lowerQuestion.includes("satisfaction")) {
      category = "analytics";
      response = "Based on our current data, patient satisfaction is trending very positively at 5.6/5 (up +0.1 from last week). Key satisfaction drivers include:\n\n• Check-in Speed: 92% satisfaction\n• Communication Quality: 89% satisfaction\n• Scheduling Accuracy: 94% satisfaction\n• Wait Time: 86% satisfaction\n\nWe've seen consistent improvement over the past 6 months, from 4.2/5 in July to 5.6/5 currently.";
    }
    else if (lowerQuestion.includes("check-in time") || lowerQuestion.includes("checkin")) {
      category = "analytics";
      response = "Patient check-in time has improved dramatically! Current metrics:\n\n• Average check-in time: 0.1 minutes (down from 7.8 minutes in July)\n• Target: Under 10 minutes ✅\n• Week-over-week change: -0.1 minutes\n• 6-month trend: 98% improvement\n\nThis improvement is driven by our AI automation achieving 92.7% automation rate in check-in processes.";
    }
    else if (lowerQuestion.includes("queue") && lowerQuestion.includes("agent")) {
      category = "operational";
      response = "Current human agent queue status:\n\n• Active Agents: 12 agents online\n• Queue Length: 3 patients waiting\n• Average Wait Time: 2.1 minutes\n• Peak Hours: 9-11 AM, 2-4 PM\n• Agent Utilization: 78%\n\nAll agents are currently handling normal call volumes. Would you like me to check specific department queues?";
    }
    else if (lowerQuestion.includes("wait time") || lowerQuestion.includes("average wait")) {
      category = "operational";
      response = "Current wait time metrics:\n\n• Appointment Scheduling: 2.1 minutes average\n• Check-in Process: 0.1 minutes average\n• Insurance Verification: 1.8 minutes average\n• Human Agent Response: 2.3 minutes average\n\nAll wait times are within target ranges. The AI automation has reduced wait times by 87% over the past 6 months.";
    }
    else if (lowerQuestion.includes("operating hours") || lowerQuestion.includes("hours")) {
      category = "basic";
      response = "Our clinic operating hours are:\n\n**Main Clinic:**\n• Monday - Friday: 7:00 AM - 6:00 PM\n• Saturday: 8:00 AM - 4:00 PM\n• Sunday: 10:00 AM - 2:00 PM\n\n**Emergency Services:**\n• Available 24/7\n\n**Phone Support:**\n• Monday - Friday: 6:00 AM - 8:00 PM\n• Weekends: 8:00 AM - 6:00 PM\n\nHoliday hours may vary. Would you like information about specific departments?";
    }
    else if (lowerQuestion.includes("schedule") && lowerQuestion.includes("appointment")) {
      category = "basic";
      response = "To schedule an appointment, you have several options:\n\n**Online:**\n• Patient portal: Available 24/7\n• Mobile app: iOS and Android\n\n**Phone:**\n• Main line: (555) 123-4567\n• Direct scheduling: (555) 123-APPT\n\n**In-Person:**\n• Front desk during operating hours\n• Self-service kiosks in lobby\n\n**AI Assistant:**\n• Our scheduling agent can handle most appointment types\n• Available through this chat or phone\n\nWould you like me to help you find available appointment slots?";
    }
    else if (lowerQuestion.includes("insurance")) {
      category = "basic";
      response = "We accept most major insurance plans:\n\n**Major Networks:**\n• Blue Cross Blue Shield\n• Aetna\n• Cigna\n• UnitedHealthcare\n• Medicare/Medicaid\n\n**Verification Process:**\n• Real-time verification (avg 1.8 minutes)\n• Pre-authorization handled automatically\n• 89.5% approval rate\n\n**Payment Options:**\n• Insurance copays\n• HSA/FSA accounts\n• Payment plans available\n• Self-pay discounts\n\nWould you like me to verify coverage for a specific plan or procedure?";
    }
    else if (lowerQuestion.includes("staffing") || lowerQuestion.includes("cost") || lowerQuestion.includes("savings")) {
      category = "analytics";
      response = "Our AI implementation has achieved significant cost savings:\n\n**Staffing Cost Reduction:**\n• Current: 67.5% reduction (exceeds 50% target)\n• Monthly savings: $195,000\n• 6-month total: $962,000\n\n**Operational Efficiency:**\n• 92.7% automation rate\n• 87% reduction in processing time\n• 94% accuracy in scheduling\n\n**ROI Breakdown:**\n• Staffing costs: $648,000 saved\n• Error reduction: $177,000 saved\n• Efficiency gains: $314,000 saved\n\nThe AI agents have exceeded all target metrics while maintaining high patient satisfaction.";
    }
    else if (lowerQuestion.includes("hello") || lowerQuestion.includes("hi") || lowerQuestion.includes("help")) {
      category = "basic";
      response = "Hello! I'm Eva, your AI healthcare assistant. I can help you with:\n\n**Analytics & Reporting:**\n• Patient satisfaction trends\n• Check-in time analysis\n• Cost savings metrics\n• Performance dashboards\n\n**Operational Questions:**\n• Current queue status\n• Wait times\n• Agent availability\n• Real-time metrics\n\n**General Information:**\n• Clinic hours and policies\n• Appointment scheduling\n• Insurance verification\n• Procedures and services\n\nWhat would you like to know about today?";
    }
    else {
      category = "basic";
      confidence = 85;
      response = "I understand you're asking about healthcare operations, but I need a bit more context to provide the most accurate information. \n\nI can help with:\n• Analytics and performance metrics\n• Queue and wait time information\n• Appointment scheduling guidance\n• Insurance and billing questions\n• Clinic policies and procedures\n\nCould you please rephrase your question or let me know which area you'd like to explore?";
    }

    res.json({
      response,
      category,
      confidence,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error processing Eva chat:", error);
    res.status(500).json({ error: "Failed to process chat request" });
  }
});

// Get Eva chat history
router.get('/history', async (req, res) => {
  try {
    // Mock chat history
    const history = [
      {
        id: 1,
        question: "What's our patient satisfaction score?",
        response: "Patient satisfaction is currently 5.6/5...",
        category: "analytics",
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 2,
        question: "How long is the check-in process?",
        response: "Average check-in time is 0.1 minutes...",
        category: "operational",
        timestamp: new Date(Date.now() - 7200000).toISOString()
      }
    ];
    
    res.json(history);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

export default router; 