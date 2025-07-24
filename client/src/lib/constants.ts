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
    title: "MAIN",
    items: [
      {
        name: "Workflows",
        path: "/business-workflows",
        icon: "workflow",
      },
      {
        name: "AI Agents",
        path: "/ai-agents",
        icon: "brain",
      },
      {
        name: "Analytics",
        path: "/analytics",
        icon: "bar-chart-2",
      },
    ],
  },
  {
    title: "HEALTH SYSTEMS",
    items: [
      {
        name: "EMR",
        path: "/emr",
        icon: "database",
      },
      {
        name: "RIS",
        path: "/ris",
        icon: "database",
      },
    ],
  },
  {
    title: "COMPLIANCE",
    items: [
      {
        name: "Audits",
        path: "/audits",
        icon: "shield",
      },
      {
        name: "Privacy",
        path: "/privacy",
        icon: "users",
      },
      {
        name: "Security",
        path: "/security",
        icon: "shield",
      },
    ],
  },
  {
    title: "CONTACT CENTER",
    items: [
      {
        name: "Integration",
        path: "/contact-center-integration",
        icon: "sliders",
      },
      {
        name: "Human <-> AI",
        path: "/human-ai",
        icon: "user-check",
      },
    ],
  },
  {
    title: "ABOUT US",
    items: [
      {
        name: "About Us",
        path: "/",
        icon: "info",
      },
      {
        name: "Ask Eva",
        path: "/ask-eva",
        icon: "bot",
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
