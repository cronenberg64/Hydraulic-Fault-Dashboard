
import { AlertTriangle, Info, CheckCircle, X, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { useState } from 'react';

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: number;
}

interface AlertPanelProps {
  alerts: Alert[];
  onDismissAlert?: (id: string) => void;
  onClearAll?: () => void;
}

export const AlertPanel = ({ alerts, onDismissAlert, onClearAll }: AlertPanelProps) => {
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all');

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-400" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-900/20 border-l-red-500 text-red-300';
      case 'warning':
        return 'bg-yellow-900/20 border-l-yellow-500 text-yellow-300';
      case 'info':
        return 'bg-blue-900/20 border-l-blue-500 text-blue-300';
      default:
        return 'bg-gray-900/20 border-l-gray-500 text-gray-300';
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) { // Less than 1 minute
      return `${Math.floor(diff / 1000)}s ago`;
    } else if (diff < 3600000) { // Less than 1 hour
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) { // Less than 1 day
      return `${Math.floor(diff / 3600000)}h ago`;
    } else {
      return new Date(timestamp).toLocaleDateString();
    }
  };

  const filteredAlerts = alerts.filter(alert => 
    filter === 'all' || alert.type === filter
  ).sort((a, b) => b.timestamp - a.timestamp);

  const alertCounts = {
    error: alerts.filter(a => a.type === 'error').length,
    warning: alerts.filter(a => a.type === 'warning').length,
    info: alerts.filter(a => a.type === 'info').length
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>System Alerts</span>
            <Badge variant="outline" className="text-slate-400 border-slate-600">
              {filteredAlerts.length}
            </Badge>
          </CardTitle>
          
          {alerts.length > 0 && onClearAll && (
            <Button
              onClick={onClearAll}
              size="sm"
              variant="outline"
              className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-2 mt-2">
          <Button
            size="sm"
            variant={filter === 'all' ? "default" : "outline"}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 
              "bg-blue-600 text-white" : 
              "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
            }
          >
            All ({alerts.length})
          </Button>
          <Button
            size="sm"
            variant={filter === 'error' ? "destructive" : "outline"}
            onClick={() => setFilter('error')}
            className={filter === 'error' ? 
              "" : 
              "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
            }
          >
            Errors ({alertCounts.error})
          </Button>
          <Button
            size="sm"
            variant={filter === 'warning' ? "default" : "outline"}
            onClick={() => setFilter('warning')}
            className={filter === 'warning' ? 
              "bg-yellow-600 text-white" : 
              "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
            }
          >
            Warnings ({alertCounts.warning})
          </Button>
          <Button
            size="sm"
            variant={filter === 'info' ? "default" : "outline"}
            onClick={() => setFilter('info')}
            className={filter === 'info' ? 
              "bg-blue-600 text-white" : 
              "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
            }
          >
            Info ({alertCounts.info})
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {filteredAlerts.length === 0 ? (
          <div className="p-6 text-center text-slate-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No alerts to display</p>
            <p className="text-sm">System is operating normally</p>
          </div>
        ) : (
          <ScrollArea className="max-h-96">
            <div className="space-y-2 p-4">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 ${getAlertColor(alert.type)} bg-slate-700/50`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium break-words">
                          {alert.message}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span className="text-xs text-slate-500">
                            {formatTime(alert.timestamp)}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              alert.type === 'error' ? 'border-red-500 text-red-400' :
                              alert.type === 'warning' ? 'border-yellow-500 text-yellow-400' :
                              'border-blue-500 text-blue-400'
                            }`}
                          >
                            {alert.type.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {onDismissAlert && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDismissAlert(alert.id)}
                        className="p-1 h-auto text-slate-400 hover:text-white ml-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
