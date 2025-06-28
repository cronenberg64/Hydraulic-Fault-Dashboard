import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import { TrendingUp, Download, Maximize2 } from 'lucide-react';

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

interface TimeSeriesChartProps {
  data: HydraulicData[];
  title?: string;
  height?: number;
}

const safeNumber = (value: any, decimals = 2) =>
  typeof value === 'number' && !isNaN(value) ? value.toFixed(decimals) : '--';

export const TimeSeriesChart = ({ 
  data, 
  title = "Real-Time System Metrics",
  height = 400 
}: TimeSeriesChartProps) => {
  const [selectedMetrics, setSelectedMetrics] = useState({
    pressure: true,
    temperature: true,
    flow_rate: true
  });
  const [timeRange, setTimeRange] = useState<'5m' | '15m' | '1h' | 'all'>('15m');

  const toggleMetric = (metric: keyof typeof selectedMetrics) => {
    setSelectedMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  const getFilteredData = () => {
    if (timeRange === 'all') return data;
    
    const now = Date.now();
    const ranges = {
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000
    };
    
    const cutoff = now - ranges[timeRange];
    return data.filter(point => point.timestamp >= cutoff);
  };

  const chartData = Array.isArray(data)
    ? getFilteredData().map(point => ({
        ...point,
        time: point.timestamp ? new Date(point.timestamp).toLocaleTimeString() : '',
        fullTime: point.timestamp ? new Date(point.timestamp).toLocaleString() : ''
      }))
    : [];

  const exportData = () => {
    const csvContent = [
      ['Timestamp', 'Pressure (PSI)', 'Temperature (°C)', 'Flow Rate (L/min)'],
      ...chartData.map(row => [
        row.fullTime,
        row.pressure.toFixed(2),
        row.temperature.toFixed(2),
        row.flow_rate.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hydraulic-data-${new Date().toISOString().slice(0, 19)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 p-3 rounded-lg shadow-lg">
          <p className="text-white font-medium">{label}</p>
          {payload.map((entry: any) => (
            <p key={entry.dataKey} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${safeNumber(entry.value, 2)} ${
                entry.dataKey === 'pressure' ? 'PSI' :
                entry.dataKey === 'temperature' ? '°C' : 'L/min'
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>{title}</span>
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              {chartData.length} points
            </Badge>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={exportData}
              size="sm"
              variant="outline"
              className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 mt-4">
          {/* Time Range Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-400">Time Range:</span>
            {(['5m', '15m', '1h', 'all'] as const).map((range) => (
              <Button
                key={range}
                size="sm"
                variant={timeRange === range ? "default" : "outline"}
                onClick={() => setTimeRange(range)}
                className={timeRange === range ? 
                  "bg-blue-600 text-white" : 
                  "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                }
              >
                {range === 'all' ? 'All' : range.toUpperCase()}
              </Button>
            ))}
          </div>

          {/* Metric Toggles */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-400">Metrics:</span>
            {Object.entries(selectedMetrics).map(([metric, isSelected]) => (
              <Button
                key={metric}
                size="sm"
                variant="outline"
                onClick={() => toggleMetric(metric as keyof typeof selectedMetrics)}
                className={`${
                  isSelected ? 
                    'bg-slate-600 border-slate-500 text-white' : 
                    'bg-slate-700 border-slate-600 text-slate-400'
                } hover:bg-slate-600 capitalize`}
              >
                {metric === 'flow_rate' ? 'Flow Rate' : metric}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-400">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No data available for the selected time range</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="time" 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
              />
              <YAxis 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ color: '#94a3b8' }}
              />
              
              {selectedMetrics.pressure && (
                <Line
                  type="monotone"
                  dataKey="pressure"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="Pressure (PSI)"
                />
              )}
              
              {selectedMetrics.temperature && (
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  name="Temperature (°C)"
                />
              )}
              
              {selectedMetrics.flow_rate && (
                <Line
                  type="monotone"
                  dataKey="flow_rate"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name="Flow Rate (L/min)"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
