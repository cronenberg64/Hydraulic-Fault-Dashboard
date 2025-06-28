
import { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: number;
  persistent?: boolean;
}

interface RealTimeNotificationsProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  onClearAll: () => void;
}

export const RealTimeNotifications = ({ 
  notifications, 
  onDismiss, 
  onClearAll 
}: RealTimeNotificationsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'info': return <Info className="w-4 h-4 text-blue-400" />;
      default: return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-900/50 border-red-700';
      case 'warning': return 'bg-yellow-900/50 border-yellow-700';
      case 'success': return 'bg-green-900/50 border-green-700';
      case 'info': return 'bg-blue-900/50 border-blue-700';
      default: return 'bg-gray-900/50 border-gray-700';
    }
  };

  // Auto-dismiss non-persistent notifications after 5 seconds
  useEffect(() => {
    const timers = notifications
      .filter(n => !n.persistent)
      .map(notification => 
        setTimeout(() => onDismiss(notification.id), 5000)
      );

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [notifications, onDismiss]);

  const recentNotifications = notifications.slice(-10);

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      {/* Notification Bell */}
      <div className="mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
        >
          <Bell className="w-4 h-4 mr-1" />
          {notifications.length > 0 && (
            <Badge variant="destructive" className="ml-1 px-1 py-0 text-xs">
              {notifications.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Notifications Panel */}
      {isExpanded && (
        <Card className="bg-slate-800 border-slate-700 max-h-96 overflow-hidden">
          <div className="p-3 border-b border-slate-700 flex items-center justify-between">
            <h3 className="text-white font-medium">Notifications</h3>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="text-slate-400 hover:text-white"
              >
                Clear All
              </Button>
            )}
          </div>
          <CardContent className="p-0 max-h-80 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="p-4 text-center text-slate-400">
                No notifications
              </div>
            ) : (
              recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-slate-700 last:border-b-0 ${getNotificationColor(notification.type)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">
                          {notification.title}
                        </h4>
                        <p className="text-xs text-slate-300 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDismiss(notification.id)}
                      className="p-1 h-auto text-slate-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
