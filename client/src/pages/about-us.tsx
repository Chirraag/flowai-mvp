import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bot, 
  Calendar, 
  ClipboardList, 
  Shield, 
  CheckCircle, 
  Clock, 
  Zap,
  Phone,
  FileText,
  LucideIcon,
  Heart,
  ArrowRight,
  BarChart3,
  Stethoscope,
  MessageCircle
} from "lucide-react";
import { Link } from "wouter";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

function FeatureCard({ title, description, icon: Icon, color }: FeatureCardProps) {
  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className={`inline-flex items-center justify-center rounded-lg p-2 ${color} mb-4`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

interface TestimonialProps {
  quote: string;
  name: string;
  title: string;
  company: string;
  avatarUrl?: string;
}

function Testimonial({ quote, name, title, company, avatarUrl }: TestimonialProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="mb-4">
        <p className="italic text-gray-700">"{quote}"</p>
      </div>
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold mr-3">
          {!avatarUrl && name.charAt(0)}
          {avatarUrl && <img src={avatarUrl} alt={name} className="h-10 w-10 rounded-full object-cover" />}
        </div>
        <div>
          <p className="font-medium text-gray-900">{name}</p>
          <p className="text-sm text-gray-600">{title}, {company}</p>
        </div>
      </div>
    </div>
  );
}

export default function AboutUs() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      {/* Hero Section */}
      <div className="text-center mb-12 sm:mb-16">
        <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100 text-sm">Agentic Automation in Healthcare</Badge>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 px-2 sm:px-0">AI-Driven Healthcare Transformation</h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 px-4 sm:px-0">
          Flow AI delivers intelligent, HIPAA-compliant voice agents that reduce administrative burden 
          while enhancing the patient experience.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4 sm:px-0">
          <Button size="lg" className="bg-primary-600 hover:bg-primary-700 w-full sm:w-auto">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Schedule Demo
          </Button>
          <Button variant="outline" size="lg" className="border-primary-600 text-primary-600 hover:bg-primary-50 w-full sm:w-auto">
            Learn More
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Key Features */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Flow AI</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our intelligent voice agents help healthcare providers reduce costs, improve efficiency, 
            and deliver exceptional patient experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            title="Multi-lingual AI Agents" 
            description="Seamlessly communicate with patients in English, Spanish, and Chinese to provide inclusive care." 
            icon={Bot} 
            color="bg-blue-600"
          />
          <FeatureCard 
            title="Intelligent Scheduling" 
            description="Reduce no-shows by 35% with AI-powered appointment booking and smart reminders." 
            icon={Calendar} 
            color="bg-green-600"
          />
          <FeatureCard 
            title="Patient Intake Automation" 
            description="Streamline collection of patient information with conversational AI forms." 
            icon={ClipboardList} 
            color="bg-purple-600"
          />
          <FeatureCard 
            title="HIPAA & SOC2 Compliant" 
            description="Enterprise-grade security and compliance built into every interaction." 
            icon={Shield} 
            color="bg-red-600"
          />
          <FeatureCard 
            title="EMR Integration" 
            description="Seamlessly connect with major electronic medical record systems." 
            icon={FileText} 
            color="bg-amber-600"
          />
          <FeatureCard 
            title="Performance Analytics" 
            description="Gain insights into operational efficiency and patient satisfaction." 
            icon={BarChart3} 
            color="bg-indigo-600"
          />
        </div>
      </section>

      {/* AI Agent Tabs */}
      <section className="mb-20 bg-gray-50 py-12 px-6 rounded-xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our AI Agents</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Purpose-built AI assistants that work together to streamline healthcare operations
          </p>
        </div>

        <Tabs defaultValue="orders" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-8">
            <TabsTrigger value="orders" className="text-xs px-2">
              <BarChart3 className="h-4 w-4 mr-1" />
              Order Ingestion
            </TabsTrigger>
            <TabsTrigger value="scheduling" className="text-xs px-2">
              <Calendar className="h-4 w-4 mr-1" />
              Scheduling
            </TabsTrigger>
            <TabsTrigger value="rcm" className="text-xs px-2">
              <Shield className="h-4 w-4 mr-1" />
              Insurance
            </TabsTrigger>
            <TabsTrigger value="intake" className="text-xs px-2">
              <ClipboardList className="h-4 w-4 mr-1" />
              Intake
            </TabsTrigger>
            <TabsTrigger value="authorization" className="text-xs px-2">
              <FileText className="h-4 w-4 mr-1" />
              Prior Auth
            </TabsTrigger>
            <TabsTrigger value="communication" className="text-xs px-2">
              <Phone className="h-4 w-4 mr-1" />
              Communication
            </TabsTrigger>
            <TabsTrigger value="checkin" className="text-xs px-2">
              <CheckCircle className="h-4 w-4 mr-1" />
              Check-in
            </TabsTrigger>
            <TabsTrigger value="ehr" className="text-xs px-2">
              <Stethoscope className="h-4 w-4 mr-1" />
              EHR Sync
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders" className="p-6 bg-white rounded-lg shadow-sm border">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2">
                <h3 className="text-xl font-semibold mb-3">Order Ingestion Agent</h3>
                <p className="text-gray-600 mb-4">
                  Processes clinical orders, lab requests, and imaging studies with intelligent routing and automated scheduling.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Automated order processing and routing</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Intelligent priority classification</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Real-time status tracking and updates</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Automated result delivery and notifications</span>
                  </li>
                </ul>
              </div>
              <div className="md:w-1/2 bg-orange-50 p-6 rounded-lg">
                <div className="mb-3 text-sm font-medium text-orange-800">Order Types</div>
                <div className="space-y-3">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <p className="text-orange-800 font-medium">Laboratory Orders</p>
                    <p className="text-orange-700 text-sm">Blood work, cultures, and diagnostic tests</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <p className="text-orange-800 font-medium">Imaging Studies</p>
                    <p className="text-orange-700 text-sm">X-rays, MRI, CT scans, and ultrasounds</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <p className="text-orange-800 font-medium">Specialty Referrals</p>
                    <p className="text-orange-700 text-sm">Automated specialist scheduling and coordination</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="scheduling" className="p-6 bg-white rounded-lg shadow-sm border">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2">
                <h3 className="text-xl font-semibold mb-3">Intelligent Scheduling Agent</h3>
                <p className="text-gray-600 mb-4">
                  Our AI scheduling agent handles appointment booking, rescheduling, and cancellations with natural conversational abilities.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Reduces scheduling staff workload by up to 40%</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Integrates with calendar systems and EMRs</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Handles insurance verification automatically</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Available 24/7 for patient convenience</span>
                  </li>
                </ul>
              </div>
              <div className="md:w-1/2 bg-blue-50 p-6 rounded-lg">
                <div className="mb-3 text-sm font-medium text-blue-800">Sample Conversation</div>
                <div className="space-y-3">
                  <div className="bg-blue-100 p-3 rounded-lg rounded-bl-none max-w-[80%]">
                    <p className="text-blue-800">Hello! I'm your scheduling assistant. How can I help you today?</p>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg rounded-br-none max-w-[80%] ml-auto">
                    <p className="text-gray-800">I need to schedule a follow-up appointment with Dr. Krishna.</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg rounded-bl-none max-w-[80%]">
                    <p className="text-blue-800">I'd be happy to help you schedule that follow-up. What day and time works best for you?</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="intake" className="p-6 bg-white rounded-lg shadow-sm border">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2">
                <h3 className="text-xl font-semibold mb-3">Intake Agent</h3>
                <p className="text-gray-600 mb-4">
                  Streamlines patient onboarding through intelligent form completion, medical history collection, and pre-visit preparation.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Reduces intake completion time by 70%</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Multi-language support for diverse patient populations</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Real-time insurance verification and eligibility checks</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>HIPAA-compliant data collection and storage</span>
                  </li>
                </ul>
              </div>
              <div className="md:w-1/2 bg-purple-50 p-6 rounded-lg">
                <div className="mb-3 text-sm font-medium text-purple-800">Key Features</div>
                <div className="space-y-3">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <p className="text-purple-800 font-medium">Smart Form Completion</p>
                    <p className="text-purple-700 text-sm">Guides patients through intake forms with contextual assistance</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <p className="text-purple-800 font-medium">Insurance Integration</p>
                    <p className="text-purple-700 text-sm">Real-time verification with major insurance providers</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <p className="text-purple-800 font-medium">Medical History</p>
                    <p className="text-purple-700 text-sm">Comprehensive health questionnaire with intelligent branching</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="communication" className="p-6 bg-white rounded-lg shadow-sm border">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2">
                <h3 className="text-xl font-semibold mb-3">Patient Communication Agent</h3>
                <p className="text-gray-600 mb-4">
                  Manages patient communications across multiple channels with multi-language support and personalized messaging.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Supports English, Spanish, and Chinese</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Automated appointment reminders and confirmations</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Post-visit follow-up and care instructions</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Emergency escalation protocols</span>
                  </li>
                </ul>
              </div>
              <div className="md:w-1/2 bg-green-50 p-6 rounded-lg">
                <div className="mb-3 text-sm font-medium text-green-800">Communication Channels</div>
                <div className="space-y-3">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <p className="text-green-800 font-medium">SMS & Voice</p>
                    <p className="text-green-700 text-sm">Automated reminders and follow-up calls</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <p className="text-green-800 font-medium">Email Integration</p>
                    <p className="text-green-700 text-sm">Personalized care instructions and updates</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <p className="text-green-800 font-medium">Portal Messaging</p>
                    <p className="text-green-700 text-sm">Secure patient portal communications</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="checkin" className="p-6 bg-white rounded-lg shadow-sm border">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2">
                <h3 className="text-xl font-semibold mb-3">Check-in Agent</h3>
                <p className="text-gray-600 mb-4">
                  Streamlines patient arrival process with automated check-in, insurance verification, and visit preparation.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Reduces front desk workload by 60%</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Real-time insurance eligibility verification</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Automated copay calculation and collection</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Provider notification and room assignment</span>
                  </li>
                </ul>
              </div>
              <div className="md:w-1/2 bg-indigo-50 p-6 rounded-lg">
                <div className="mb-3 text-sm font-medium text-indigo-800">Check-in Features</div>
                <div className="space-y-3">
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <p className="text-indigo-800 font-medium">Digital Check-in</p>
                    <p className="text-indigo-700 text-sm">QR code or mobile app-based arrival confirmation</p>
                  </div>
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <p className="text-indigo-800 font-medium">Insurance Verification</p>
                    <p className="text-indigo-700 text-sm">Real-time eligibility and benefit verification</p>
                  </div>
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <p className="text-indigo-800 font-medium">Visit Preparation</p>
                    <p className="text-indigo-700 text-sm">Provider alerts and room assignment automation</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rcm" className="p-6 bg-white rounded-lg shadow-sm border">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2">
                <h3 className="text-xl font-semibold mb-3">Insurance Verification Agent</h3>
                <p className="text-gray-600 mb-4">
                  Automates insurance verification, eligibility checks, and benefits confirmation with real-time integration to major insurance providers.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Reduces claim denials by 45%</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Real-time insurance eligibility verification</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Automated prior authorization status tracking</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Integration with major insurance providers</span>
                  </li>
                </ul>
              </div>
              <div className="md:w-1/2 bg-red-50 p-6 rounded-lg">
                <div className="mb-3 text-sm font-medium text-red-800">Insurance Capabilities</div>
                <div className="space-y-3">
                  <div className="bg-red-100 p-3 rounded-lg">
                    <p className="text-red-800 font-medium">Claims Processing</p>
                    <p className="text-red-700 text-sm">Automated claim submission and status tracking</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-lg">
                    <p className="text-red-800 font-medium">Denial Management</p>
                    <p className="text-red-700 text-sm">Intelligent denial analysis and reprocessing</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-lg">
                    <p className="text-red-800 font-medium">Payment Posting</p>
                    <p className="text-red-700 text-sm">Automated EOB processing and reconciliation</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="authorization" className="p-6 bg-white rounded-lg shadow-sm border">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2">
                <h3 className="text-xl font-semibold mb-3">Prior Authorization Agent</h3>
                <p className="text-gray-600 mb-4">
                  Streamlines prior authorization processes with automated submission, status tracking, and appeals management.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Reduces authorization time by 60%</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Automated form completion and submission</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Real-time status updates and notifications</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Appeals process automation</span>
                  </li>
                </ul>
              </div>
              <div className="md:w-1/2 bg-yellow-50 p-6 rounded-lg">
                <div className="mb-3 text-sm font-medium text-yellow-800">Authorization Workflow</div>
                <div className="space-y-3">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <p className="text-yellow-800 font-medium">Smart Forms</p>
                    <p className="text-yellow-700 text-sm">Auto-populated authorization requests</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <p className="text-yellow-800 font-medium">Status Tracking</p>
                    <p className="text-yellow-700 text-sm">Real-time updates from insurance portals</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <p className="text-yellow-800 font-medium">Appeals Support</p>
                    <p className="text-yellow-700 text-sm">Automated denial analysis and appeals preparation</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ehr" className="p-6 bg-white rounded-lg shadow-sm border">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2">
                <h3 className="text-xl font-semibold mb-3">EHR Sync Agent</h3>
                <p className="text-gray-600 mb-4">
                  Seamlessly synchronizes patient data with Epic, Cerner, and other EHR systems for real-time clinical workflow automation.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>FHIR R4 compliant integration</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Real-time patient data synchronization</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Automated clinical documentation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Bi-directional data exchange</span>
                  </li>
                </ul>
              </div>
              <div className="md:w-1/2 bg-teal-50 p-6 rounded-lg">
                <div className="mb-3 text-sm font-medium text-teal-800">EHR Integrations</div>
                <div className="space-y-3">
                  <div className="bg-teal-100 p-3 rounded-lg">
                    <p className="text-teal-800 font-medium">Epic MyChart</p>
                    <p className="text-teal-700 text-sm">Direct API integration with Epic systems</p>
                  </div>
                  <div className="bg-teal-100 p-3 rounded-lg">
                    <p className="text-teal-800 font-medium">Cerner PowerChart</p>
                    <p className="text-teal-700 text-sm">Real-time clinical data exchange</p>
                  </div>
                  <div className="bg-teal-100 p-3 rounded-lg">
                    <p className="text-teal-800 font-medium">HL7 FHIR</p>
                    <p className="text-teal-700 text-sm">Standards-based interoperability</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="p-6 bg-white rounded-lg shadow-sm border">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2">
                <h3 className="text-xl font-semibold mb-3">Order Ingestion Agent</h3>
                <p className="text-gray-600 mb-4">
                  Processes clinical orders, lab requests, and imaging studies with intelligent routing and automated scheduling.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Automated order processing and routing</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Intelligent priority classification</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Real-time status tracking and updates</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Automated result delivery and notifications</span>
                  </li>
                </ul>
              </div>
              <div className="md:w-1/2 bg-orange-50 p-6 rounded-lg">
                <div className="mb-3 text-sm font-medium text-orange-800">Order Types</div>
                <div className="space-y-3">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <p className="text-orange-800 font-medium">Laboratory Orders</p>
                    <p className="text-orange-700 text-sm">Blood work, cultures, and diagnostic tests</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <p className="text-orange-800 font-medium">Imaging Studies</p>
                    <p className="text-orange-700 text-sm">X-rays, MRI, CT scans, and ultrasounds</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <p className="text-orange-800 font-medium">Specialty Referrals</p>
                    <p className="text-orange-700 text-sm">Automated specialist scheduling and coordination</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Testimonials */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Healthcare providers across the country trust Flow AI to improve their operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Testimonial 
            quote="Flow AI reduced our scheduling staff workload by 40% while improving patient satisfaction scores. The multi-lingual capability has been a game-changer for our diverse patient population."
            name="Dr. Samantha Chen"
            title="Medical Director"
            company="Bay Area Health Partners"
          />
          <Testimonial 
            quote="The patient intake agent has streamlined our onboarding process dramatically. What used to take 20 minutes of staff time now happens automatically before the patient even arrives."
            name="Michael Rodriguez"
            title="Practice Manager"
            company="Cornerstone Family Medicine"
          />
          <Testimonial 
            quote="Implementing Flow AI was the best decision we made this year. Our no-show rate dropped from 18% to just 5%, and our staff can focus on delivering care instead of administrative tasks."
            name="Dr. Jessica Wilson"
            title="CEO"
            company="Radiant Radiology Partners"
          />
        </div>
      </section>

      {/* ROI Stats */}
      <section className="mb-20 bg-primary-50 py-12 px-8 rounded-xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">The Flow AI Impact</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Measurable results that improve your bottom line and patient experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">40%</div>
            <div className="text-gray-700">Reduction in scheduling staff workload</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">35%</div>
            <div className="text-gray-700">Decrease in appointment no-shows</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">15+</div>
            <div className="text-gray-700">Hours saved weekly on admin tasks</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">98%</div>
            <div className="text-gray-700">Patient satisfaction rate</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white rounded-xl p-10 text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Ready to transform your practice?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join leading healthcare providers who are using Flow AI to reduce costs and improve patient experiences.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" variant="secondary" className="bg-white text-primary-700 hover:bg-primary-50">
            <Calendar className="h-5 w-5 mr-2" />
            Schedule Demo
          </Button>
          <Button variant="outline" size="lg" className="border-white text-white hover:bg-primary-700">
            <Stethoscope className="h-5 w-5 mr-2" />
            Explore Solutions
          </Button>
        </div>
      </section>
      
      {/* Floating Ask Eva Chat Button */}
      <Link href="/ask-eva">
        <Button 
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 z-50"
          size="icon"
        >
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          <span className="sr-only">Ask Eva AI Assistant</span>
        </Button>
      </Link>
      
      {/* Chat tooltip - hidden on mobile */}
      <div className="hidden sm:block fixed bottom-20 right-4 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none z-40">
        Ask Eva - Your AI Assistant
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}