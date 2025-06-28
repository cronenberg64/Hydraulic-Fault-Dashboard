import { useState, useEffect } from 'react';
import { Heart, Wifi, Database, Server, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './ui/tooltip';

interface HealthStatus {
  api: 'healthy' | 'degraded' | 'down';
  database: 'healthy' | 'degraded' | 'down';
  frontend: 'healthy' | 'degraded' | 'down';
  websocket: 'healthy' | 'degraded' | 'down';
  lastCheck: number;
}

export const HealthCheckMonitor = () => {
  const [health, setHealth] = useState<HealthStatus>({
    api: 'healthy',
    database: 'healthy',
    frontend: 'healthy',
    websocket: 'healthy',
    lastCheck: Date.now()
  });

  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      const newHealth: HealthStatus = {
        ...health,
        lastCheck: Date.now()
      };

      try {
        // Check API health
        const apiResponse = await fetch('http://localhost:8000/health', {
          method: 'GET',
          timeout: 5000
        } as any);
        newHealth.api = apiResponse.ok ? 'healthy' : 'degraded';
      } catch (error) {
        newHealth.api = 'down';
      }

      // Frontend is always healthy if this component renders
      newHealth.frontend = 'healthy';

      // Mock database and websocket checks (would be real in production)
      newHealth.database = 'healthy';
      newHealth.websocket = newHealth.api === 'healthy' ? 'healthy' : 'down';

      setHealth(newHealth);
    };

    if (isMonitoring) {
      checkHealth();
      const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'degraded': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'down': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-900 text-green-300 border-green-700';
      case 'degraded': return 'bg-yellow-900 text-yellow-300 border-yellow-700';
      case 'down': return 'bg-red-900 text-red-300 border-red-700';
      default: return 'bg-gray-900 text-gray-300 border-gray-700';
    }
  };

  const services = [
    { name: 'API Server', status: health.api, icon: <Server className="w-4 h-4" /> },
    { name: 'Database', status: health.database, icon: <Database className="w-4 h-4" /> },
    { name: 'Frontend', status: health.frontend, icon: <Wifi className="w-4 h-4" /> },
    { name: 'WebSocket', status: health.websocket, icon: <Heart className="w-4 h-4" /> }
  ];

  const overallHealth = services.every(s => s.status === 'healthy') ? 'healthy' :
                       services.some(s => s.status === 'down') ? 'down' : 'degraded';

  const statusDescriptions: Record<string, string> = {
    healthy: 'Service is operating normally.',
    degraded: 'Service is experiencing issues but is still running.',
    down: 'Service is not reachable or is failing.',
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5" />
            <span>System Health</span>
          </div>
          <Badge className={getStatusColor(overallHealth)}>
            {overallHealth.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {services.map((service) => (
              <div key={service.name} className="text-center p-3 bg-slate-700 rounded-lg">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  {service.icon}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>{getStatusIcon(service.status)}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>{statusDescriptions[service.status] || 'Unknown status.'}</span>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="text-sm text-white font-medium">{service.name}</div>
                <Badge 
                  className={`text-xs mt-1 ${getStatusColor(service.status)}`}
                  variant="outline"
                >
                  {service.status}
                </Badge>
              </div>
            ))}
          </div>
        </TooltipProvider>
        <div className="mt-4 text-center">
          <div className="text-xs text-slate-400">
            Last checked: {new Date(health.lastCheck).toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
