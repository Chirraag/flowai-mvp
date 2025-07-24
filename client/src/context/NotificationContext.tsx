import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'error',
    title: 'EMR Integration Alert',
    message: 'Connection to Epic EMR system lost at 4:02 PM. Auto-reconnection attempts in progress.',
    timestamp: '2 min ago',
    read: false,
    priority: 'critical',
    category: 'system'
  },
  {
    id: '2',
    type: 'success',
    title: 'Patient Intake Completed',
    message: 'John Smith has successfully completed digital intake form. Insurance verification approved.',
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
    message: '3 patients scheduled for check-in within the next 30 minutes.',
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
    message: 'Scheduling Agent processed 24 appointments today with 96% accuracy.',
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
    message: 'Manual verification needed for 2 patients - authorization pending.',
    timestamp: '20 min ago',
    read: false,
    priority: 'medium',
    actionUrl: '/patients',
    category: 'compliance'
  },
  {
    id: '6',
    type: 'info',
    title: 'System Maintenance Notice',
    message: 'Scheduled maintenance window: Tonight 11:00 PM - 2:00 AM EST.',
    timestamp: '1 hour ago',
    read: true,
    priority: 'low',
    category: 'system'
  },
  {
    id: '7',
    type: 'success',
    title: 'Monthly Cost Savings Achievement',
    message: 'AI automation has saved $18,450 this month, exceeding target by 23%.',
    timestamp: '2 hours ago',
    read: true,
    priority: 'medium',
    actionUrl: '/analytics',
    category: 'agents'
  }
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Simulate real-time notifications for demo purposes
  useEffect(() => {
    const interval = setInterval(() => {
      const randomEvents = [
        {
          type: 'success' as const,
          title: 'Appointment Scheduled',
          message: 'New appointment scheduled for patient via AI Agent.',
          priority: 'medium' as const,
          category: 'appointments' as const
        },
        {
          type: 'info' as const,
          title: 'System Update',
          message: 'Background sync completed successfully.',
          priority: 'low' as const,
          category: 'system' as const
        },
        {
          type: 'agent' as const,
          title: 'AI Agent Activity',
          message: 'Patient Intake Agent processed 5 new forms.',
          priority: 'low' as const,
          category: 'agents' as const
        }
      ];

      // Randomly add a notification every 30-60 seconds
      if (Math.random() < 0.3) {
        const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
        addNotification(event);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
}