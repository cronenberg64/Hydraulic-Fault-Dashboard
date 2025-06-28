
import { Play, Pause, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface SystemStatusProps {
  health: 'healthy' | 'warning' | 'fault';
  isRunning: boolean;
  onToggleSimulation: () => void;
  uptime?: number;
  lastUpdate?: number;
}

export const SystemStatus = ({ 
  health, 
  isRunning, 
  onToggleSimulation,
  uptime = 0,
  lastUpdate = Date.now()
}: SystemStatusProps) => {
  const getHealthIcon = () => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
      case 'fault':
        return <AlertTriangle className="w-6 h-6 text-red-400" />;
      default:
        return <Shield className="w-6 h-6 text-gray-400" />;
    }
  };

  const getHealthColor = () => {
    switch (health) {
      case 'healthy':
        return 'bg-green-900/50 border-green-700 text-green-300';
      case 'warning':
        return 'bg-yellow-900/50 border-yellow-700 text-yellow-300';
      case 'fault':
        return 'bg-red-900/50 border-red-700 text-red-300';
      default:
        return 'bg-gray-900/50 border-gray-700 text-gray-300';
    }
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const timeSinceUpdate = Math.floor((Date.now() - lastUpdate) / 1000);

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>System Status</span>
          </div>
          <Badge variant="outline" className={isRunning ? 'text-green-400 border-green-400' : 'text-gray-400 border-gray-400'}>
            {isRunning ? 'ACTIVE' : 'STOPPED'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Health Status */}
          <div className={`p-4 rounded-lg border ${getHealthColor()}`}>
            <div className="flex items-center space-x-3">
              {getHealthIcon()}
              <div>
                <div className="font-medium text-lg capitalize">{health}</div>
                <div className="text-sm opacity-80">System Health</div>
              </div>
            </div>
          </div>

          {/* Simulation Control */}
          <div className="p-4 rounded-lg border bg-slate-700 border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <div className="text-white font-medium">Simulation</div>
              <Button
                onClick={onToggleSimulation}
                size="sm"
                variant={isRunning ? "destructive" : "default"}
                className="min-w-[80px]"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 mr-1" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-1" />
                    Start
                  </>
                )}
              </Button>
            </div>
            <div className="text-sm text-slate-400">
              {isRunning ? 'Real-time monitoring active' : 'System paused'}
            </div>
          </div>

          {/* Uptime */}
          <div className="p-4 rounded-lg border bg-slate-700 border-slate-600">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-blue-400" />
              <div>
                <div className="font-medium text-white">{formatUptime(uptime)}</div>
                <div className="text-sm text-slate-400">Uptime</div>
              </div>
            </div>
          </div>

          {/* Last Update */}
          <div className="p-4 rounded-lg border bg-slate-700 border-slate-600">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${timeSinceUpdate < 2 ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              <div>
                <div className="font-medium text-white">
                  {timeSinceUpdate < 60 ? `${timeSinceUpdate}s ago` : 'Stale'}
                </div>
                <div className="text-sm text-slate-400">Last Update</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
