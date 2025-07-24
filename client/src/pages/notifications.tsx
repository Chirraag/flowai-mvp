import { useState } from "react";
import { useNotifications } from "@/context/NotificationContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  Calendar,
  Shield,
  Activity,
  Settings,
  Search,
  Filter,
  MoreHorizontal,
  Archive,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'system' | 'appointment' | 'agent';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
  category: 'all' | 'system' | 'appointments' | 'agents' | 'compliance';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'error',
    title: 'EMR Integration Alert',
    message: 'Connection to Epic EMR system lost at 4:02 PM. Auto-reconnection attempts in progress. Patient data sync may be delayed.',
    timestamp: '2 min ago',
    read: false,
    priority: 'critical',
    category: 'system'
  },
  {
    id: '2',
    type: 'success',
    title: 'Patient Intake Completed',
    message: 'John Smith has successfully completed digital intake form. Insurance verification approved. Ready for appointment.',
    timestamp: '5 min ago',
    read: false,
    priority: 'medium',
    actionUrl: '/patients',
    category: 'appointments'
  },
  {
    id: '3',
    type: 'appointment',
    title: 'Upcoming Check-ins',
    message: '3 patients scheduled for check-in within the next 30 minutes: Maria Garcia (2:30 PM), David Chen (2:45 PM), Sarah Johnson (3:00 PM).',
    timestamp: '10 min ago',
    read: false,
    priority: 'high',
    actionUrl: '/appointments',
    category: 'appointments'
  },
  {
    id: '4',
    type: 'agent',
    title: 'AI Agent Performance Update',
    message: 'Scheduling Agent processed 24 appointments today with 96% accuracy. Cost savings: $340 compared to manual processing.',
    timestamp: '15 min ago',
    read: true,
    priority: 'low',
    actionUrl: '/ai-agents',
    category: 'agents'
  },
  {
    id: '5',
    type: 'warning',
    title: 'Insurance Verification Required',
    message: 'Manual verification needed for 2 patients: Jennifer Wilson and Michael Brown. Authorization pending from Aetna and Blue Cross.',
    timestamp: '20 min ago',
    read: false,
    priority: 'medium',
    actionUrl: '/patients',
    category: 'compliance'
  },
  {
    id: '6',
    type: 'info',
    title: 'Scheduled Maintenance Notice',
    message: 'System maintenance window scheduled for tonight 11:00 PM - 2:00 AM EST. All services will remain operational with possible brief interruptions.',
    timestamp: '1 hour ago',
    read: true,
    priority: 'low',
    category: 'system'
  },
  {
    id: '7',
    type: 'success',
    title: 'Monthly Cost Savings Achievement',
    message: 'Congratulations! AI automation has saved $18,450 this month, exceeding target by 23%. Breakdown: Scheduling ($8,200), Intake ($6,100), Verification ($4,150).',
    timestamp: '2 hours ago',
    read: true,
    priority: 'medium',
    actionUrl: '/analytics',
    category: 'agents'
  },
  {
    id: '8',
    type: 'system',
    title: 'Security Audit Completed',
    message: 'Monthly HIPAA compliance audit completed successfully. No violations detected. SOC2 certification maintained.',
    timestamp: '3 hours ago',
    read: true,
    priority: 'low',
    category: 'compliance'
  }
];

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotifications = notifications.filter(notification => {
    const matchesTab = activeTab === 'all' || notification.category === activeTab;
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'appointment':
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'agent':
        return <Activity className="h-5 w-5 text-purple-600" />;
      case 'system':
        return <Settings className="h-5 w-5 text-gray-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'critical':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-300 bg-gray-50';
    }
  };

  const getCategoryCount = (category: string) => {
    if (category === 'all') return notifications.length;
    return notifications.filter(n => n.category === category).length;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All notifications read'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              Mark all as read
            </Button>
          )}
          <Button variant="outline" className="gap-2">
            <Archive className="h-4 w-4" />
            Archive All
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="gap-2">
            All
            <Badge variant="secondary" className="ml-1">
              {getCategoryCount('all')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            System
            <Badge variant="secondary" className="ml-1">
              {getCategoryCount('system')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="appointments" className="gap-2">
            Appointments
            <Badge variant="secondary" className="ml-1">
              {getCategoryCount('appointments')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="agents" className="gap-2">
            AI Agents
            <Badge variant="secondary" className="ml-1">
              {getCategoryCount('agents')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="gap-2">
            Compliance
            <Badge variant="secondary" className="ml-1">
              {getCategoryCount('compliance')}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Notifications</span>
                {filteredNotifications.length > 0 && (
                  <Badge variant="outline">
                    {filteredNotifications.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No notifications found</p>
                  {searchQuery && (
                    <p className="text-sm mt-2">Try adjusting your search terms</p>
                  )}
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="divide-y">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-6 border-l-4 transition-colors hover:bg-gray-50 group",
                          getPriorityColor(notification.priority),
                          !notification.read && "bg-blue-50/30"
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-gray-900">
                                  {notification.title}
                                </h3>
                                {!notification.read && (
                                  <div className="h-2 w-2 bg-blue-600 rounded-full" />
                                )}
                                {notification.priority === 'critical' && (
                                  <Badge variant="destructive" className="text-xs">
                                    Critical
                                  </Badge>
                                )}
                                {notification.priority === 'high' && (
                                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                                    High Priority
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-700 mb-3 leading-relaxed">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {notification.timestamp}
                                </span>
                                <div className="flex items-center gap-2">
                                  {notification.actionUrl && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => window.location.href = notification.actionUrl!}
                                    >
                                      View Details
                                    </Button>
                                  )}
                                  {!notification.read && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => markAsRead(notification.id)}
                                    >
                                      Mark as read
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteNotification(notification.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}