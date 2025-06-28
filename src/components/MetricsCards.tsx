import { TrendingUp, TrendingDown, Minus, Droplets, Gauge, Thermometer, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface HydraulicData {
  timestamp: number;
  pressure: number;
  flow_rate: number;
  temperature: number;
  vibration: number;
  oil_level: number;
  pump_speed: number;
  system_load: number;
}

interface MetricsCardsProps {
  currentData: HydraulicData | null;
  previousData: HydraulicData | null;
}

const safeNumber = (value: any, decimals = 2) =>
  typeof value === 'number' && !isNaN(value) ? value.toFixed(decimals) : '--';

export const MetricsCards = ({ currentData, previousData }: MetricsCardsProps) => {
  if (!currentData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-slate-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-slate-700 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getTrendIcon = (current: number | undefined, previous: number | undefined) => {
    if (typeof previous !== 'number') return <Minus className="w-4 h-4 text-gray-400" />;
    if (typeof current === 'number' && current > previous) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (typeof current === 'number' && current < previous) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = (current: number | undefined, previous: number | undefined) => {
    if (typeof previous !== 'number' || typeof current !== 'number') return 'text-gray-400';
    if (current > previous) return 'text-green-400';
    if (current < previous) return 'text-red-400';
    return 'text-gray-400';
  };

  const getPercentageChange = (current: number | undefined, previous: number | undefined) => {
    if (typeof previous !== 'number' || previous === 0 || typeof current !== 'number') return '0%';
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const getStatusBadge = (value: number | undefined, thresholds: { warning: number; critical: number }, invert = false) => {
    if (typeof value !== 'number') return <Badge className="bg-gray-900 text-gray-300">N/A</Badge>;
    const isAbove = invert ? value < thresholds.critical : value > thresholds.critical;
    const isWarning = invert ? value < thresholds.warning : value > thresholds.warning;
    if (isAbove) return <Badge className="bg-red-900 text-red-300">Critical</Badge>;
    if (isWarning) return <Badge className="bg-yellow-900 text-yellow-300">Warning</Badge>;
    return <Badge className="bg-green-900 text-green-300">Normal</Badge>;
  };

  const metrics = [
    {
      title: 'Pressure',
      value: safeNumber(currentData.pressure, 1),
      unit: 'PSI',
      icon: <Gauge className="w-5 h-5 text-blue-400" />,
      previous: typeof previousData?.pressure === 'number' ? previousData.pressure : undefined,
      status: getStatusBadge(currentData.pressure, { warning: 2800, critical: 3000 })
    },
    {
      title: 'Flow Rate',
      value: safeNumber(currentData.flow_rate, 2),
      unit: 'L/min',
      icon: <Droplets className="w-5 h-5 text-cyan-400" />,
      previous: typeof previousData?.flow_rate === 'number' ? previousData.flow_rate : undefined,
      status: getStatusBadge(currentData.flow_rate, { warning: 15, critical: 10 }, true)
    },
    {
      title: 'Temperature',
      value: safeNumber(currentData.temperature, 1),
      unit: '°C',
      icon: <Thermometer className="w-5 h-5 text-orange-400" />,
      previous: typeof previousData?.temperature === 'number' ? previousData.temperature : undefined,
      status: getStatusBadge(currentData.temperature, { warning: 70, critical: 80 })
    },
    {
      title: 'Vibration',
      value: safeNumber(currentData.vibration, 2),
      unit: 'mm/s',
      icon: <Zap className="w-5 h-5 text-purple-400" />,
      previous: typeof previousData?.vibration === 'number' ? previousData.vibration : undefined,
      status: getStatusBadge(currentData.vibration, { warning: 5, critical: 8 })
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.title} className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-300 text-sm font-medium flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {metric.icon}
                <span>{metric.title}</span>
              </div>
              {metric.status}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">
                  {metric.value}
                  <span className="text-sm text-slate-400 ml-1">{metric.unit}</span>
                </div>
                <div className={`flex items-center space-x-1 text-sm ${getTrendColor(
                  typeof metric.value === 'string' ? parseFloat(metric.value) : undefined,
                  metric.previous
                )}`}>
                  {getTrendIcon(
                    typeof metric.value === 'string' ? parseFloat(metric.value) : undefined,
                    metric.previous
                  )}
                  <span>{getPercentageChange(
                    typeof metric.value === 'string' ? parseFloat(metric.value) : undefined,
                    metric.previous
                  )}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
