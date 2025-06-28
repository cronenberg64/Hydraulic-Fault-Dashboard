
import { AlertTriangle, RotateCcw, Settings, Brain } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useState } from 'react';

interface MLPrediction {
  days_to_failure: number | null;
  confidence: number;
  risk_level: string;
  trend_analysis: string;
}

interface ControlPanelProps {
  onInjectFault: (faultType: string) => void;
  onResetSystem: () => void;
  onTrainML: () => void;
  mlPrediction: MLPrediction | null;
  isRunning: boolean;
}

export const ControlPanel = ({ onInjectFault, onResetSystem, onTrainML, mlPrediction, isRunning }: ControlPanelProps) => {
  const [selectedFault, setSelectedFault] = useState<string>('');

  const faultTypes = [
    { value: 'pressure_drop', label: 'Pressure Drop (Leak)' },
    { value: 'temperature_spike', label: 'Temperature Spike (Overheating)' },
    { value: 'flow_disruption', label: 'Flow Disruption (Cavitation)' },
    { value: 'random_noise', label: 'Sensor Noise' }
  ];

  const handleInjectFault = () => {
    if (selectedFault && isRunning) {
      onInjectFault(selectedFault);
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-900 text-red-300 border-red-700';
      case 'medium': return 'bg-yellow-900 text-yellow-300 border-yellow-700';
      case 'low': return 'bg-green-900 text-green-300 border-green-700';
      default: return 'bg-gray-900 text-gray-300 border-gray-700';
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>System Control Panel</span>
          <Badge variant="outline" className="ml-auto text-blue-400 border-blue-400">
            ML Enhanced
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Fault Type</label>
            <Select value={selectedFault} onValueChange={setSelectedFault}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Select fault type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {faultTypes.map((fault) => (
                  <SelectItem key={fault.value} value={fault.value} className="text-white">
                    {fault.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-400">Actions</label>
            <Button
              onClick={handleInjectFault}
              disabled={!selectedFault || !isRunning}
              variant="destructive"
              className="w-full"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Inject Fault
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-400">System Reset</label>
            <Button
              onClick={onResetSystem}
              variant="outline"
              className="w-full bg-black border-slate-600 text-white hover:bg-slate-800"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset System
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-400">ML Training</label>
            <Button
              onClick={onTrainML}
              variant="outline"
              className="w-full bg-blue-700 border-blue-600 text-white hover:bg-blue-600"
            >
              <Brain className="w-4 h-4 mr-2" />
              Train Model
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-400">ML Prediction</label>
            <div className="bg-slate-700 rounded-md p-3 text-center">
              {mlPrediction ? (
                <>
                  <div className="text-lg font-bold text-white">
                    {mlPrediction.days_to_failure ? `${mlPrediction.days_to_failure}` : 'N/A'}
                  </div>
                  <div className="text-xs text-slate-400 mb-2">Days to Failure</div>
                  <Badge 
                    className={`text-xs ${getRiskLevelColor(mlPrediction.risk_level)}`}
                  >
                    {mlPrediction.risk_level.toUpperCase()}
                  </Badge>
                  <div className="text-xs text-slate-400 mt-1">
                    Confidence: {(mlPrediction.confidence * 100).toFixed(0)}%
                  </div>
                </>
              ) : (
                <>
                  <div className="text-lg font-bold text-gray-400">--</div>
                  <div className="text-xs text-slate-400">Calculating...</div>
                </>
              )}
            </div>
          </div>
        </div>

        {mlPrediction?.trend_analysis && (
          <div className="mt-4 p-3 bg-slate-700 rounded-lg">
            <div className="text-sm text-slate-300">
              <strong>ML Analysis:</strong> {mlPrediction.trend_analysis}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
