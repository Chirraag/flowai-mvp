export const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
];

export const APPOINTMENT_STATUSES = [
  { value: "checked-in", label: "Checked In" },
  { value: "arriving", label: "Arriving" },
  { value: "scheduled", label: "Scheduled" },
  { value: "rescheduled", label: "Rescheduled" },
  { value: "canceled", label: "Canceled" },
  { value: "completed", label: "Completed" },
];

export const SPECIALTIES = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Family Medicine",
  "Gastroenterology",
  "Internal Medicine",
  "Neurology",
  "Obstetrics & Gynecology",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Urology",
];

export const NAVIGATION_ITEMS = [
  {
    title: "",
    items: [
      {
        name: "Launchpad",
        path: "launchpad",
        icon: "rocket",
      },
      {
        name: "AI Agents",
        path: "ai-agents",
        icon: "bot",
        isDropdown: true,
        children: [
          {
            name: "Scheduling Agent",
            path: "ai-agents/scheduling",
            icon: "calendar",
          },
          {
            name: "Patient Intake Agent",
            path: "ai-agents/patient-intake",
            icon: "clipboard",
          },
          {
            name: "Customer Support Agent",
            path: "ai-agents/customer-support",
            icon: "users",
          },
        ],
      },
      {
        name: "Analytics",
        path: "analytics",
        icon: "bar-chart-2",
      },
    ],
  },
];

export const METRICS = [
  {
    title: "Appointments Today",
    value: "48",
    change: "+12%",
    icon: "calendar",
    color: "primary",
  },
  {
    title: "Check-in Rate",
    value: "92%",
    change: "+4%",
    icon: "check-circle",
    color: "green",
  },
  {
    title: "No-show Rate",
    value: "8%",
    change: "-3%",
    icon: "alert-circle",
    color: "red",
  },
  {
    title: "Cost Savings",
    value: "$18,450",
    secondaryText: "Since implementation",
    icon: "dollar-sign",
    color: "secondary",
  },
];

export const SUPPORTED_LANGUAGES = [
  {
    code: "EN",
    name: "English",
    status: "active",
  },
  {
    code: "ES",
    name: "Spanish",
    status: "active",
  },
  {
    code: "ZH",
    name: "Chinese",
    status: "active",
  },
  {
    code: "FR",
    name: "French",
    status: "coming-soon",
  },
];
