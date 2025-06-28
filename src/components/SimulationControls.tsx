import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Play, Square, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SimulationControlsProps {
  isRunning: boolean;
  onToggleSimulation: () => void;
  systemHealth: 'healthy' | 'warning' | 'fault';
  currentData: any;
}

export const SimulationControls = ({ 
  isRunning, 
  onToggleSimulation, 
  systemHealth,
  currentData 
}: SimulationControlsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      await onToggleSimulation();
      // Poll for simulation status before redirecting
      let attempts = 0;
      let running = isRunning;
      while (!running && attempts < 10) {
        await new Promise(res => setTimeout(res, 200));
        // Fetch status from backend
        const resp = await fetch(import.meta.env.VITE_API_BASE_URL + '/status');
        if (resp.ok) {
          const status = await resp.json();
          running = status.is_running;
        }
        attempts++;
      }
      if (running) {
        navigate('/simulation');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (isLoading) return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />;
    if (!isRunning) return <Play className="w-4 h-4" />;
    return <Square className="w-4 h-4" />;
  };

  const getHealthIcon = () => {
    switch (systemHealth) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'fault': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getHealthColor = () => {
    switch (systemHealth) {
      case 'healthy': return 'bg-green-900 text-green-300 border-green-700';
      case 'warning': return 'bg-yellow-900 text-yellow-300 border-yellow-700';
      case 'fault': return 'bg-red-900 text-red-300 border-red-700';
      default: return 'bg-gray-900 text-gray-300 border-gray-700';
    }
  };

  const safeNumber = (value: any, decimals = 1) =>
    typeof value === 'number' && !isNaN(value) ? value.toFixed(decimals) : '--';

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>Simulation Controls</span>
          <div className="flex items-center space-x-2">
            {getHealthIcon()}
            <Badge className={getHealthColor()}>
              {systemHealth.toUpperCase()}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">
                {isRunning ? 'Simulation Running' : 'Simulation Stopped'}
              </h3>
              <p className="text-slate-400 text-sm">
                {isRunning 
                  ? 'Real-time data generation and monitoring active'
                  : 'Click start to begin hydraulic system simulation'
                }
              </p>
            </div>
            <Button
              onClick={handleToggle}
              disabled={isLoading}
              variant={isRunning ? "destructive" : "default"}
              size="lg"
              className={isRunning ? "" : "bg-green-600 hover:bg-green-700"}
            >
              {getStatusIcon()}
              <span className="ml-2">
                {isLoading ? 'Processing...' : (isRunning ? 'Stop' : 'Start')} Simulation
              </span>
            </Button>
          </div>

          {isRunning && currentData && (
            <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-slate-700 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-white">
                  {safeNumber(currentData.pressure, 1)}
                </div>
                <div className="text-xs text-slate-400">Pressure (PSI)</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">
                  {safeNumber(currentData.temperature, 1)}
                </div>
                <div className="text-xs text-slate-400">Temperature (°C)</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">
                  {safeNumber(currentData.flow_rate, 1)}
                </div>
                <div className="text-xs text-slate-400">Flow (L/min)</div>
              </div>
            </div>
          )}

          {!isRunning && (
            <div className="p-4 bg-slate-700 rounded-lg">
              <p className="text-slate-300 text-sm text-center">
                💡 Start the simulation to see real-time hydraulic system data, ML predictions, and fault detection
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
