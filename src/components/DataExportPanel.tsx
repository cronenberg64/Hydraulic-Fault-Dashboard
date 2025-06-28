
import { useState } from 'react';
import { Download, FileText, Database, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { HelpTooltip } from './HelpTooltip';

interface DataExportPanelProps {
  historicalData: any[];
  currentData: any;
  alerts: any[];
}

export const DataExportPanel = ({ historicalData, currentData, alerts }: DataExportPanelProps) => {
  const [exportFormat, setExportFormat] = useState<string>('json');
  const [exportType, setExportType] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      let dataToExport: any = {};
      
      switch (exportType) {
        case 'historical':
          dataToExport = { historical_data: historicalData };
          break;
        case 'current':
          dataToExport = { current_data: currentData };
          break;
        case 'alerts':
          dataToExport = { alerts: alerts };
          break;
        case 'all':
        default:
          dataToExport = {
            historical_data: historicalData,
            current_data: currentData,
            alerts: alerts,
            export_timestamp: new Date().toISOString()
          };
      }

      let fileContent: string;
      let fileName: string;
      let mimeType: string;

      if (exportFormat === 'csv' && exportType === 'historical') {
        // Convert historical data to CSV
        const csvHeaders = 'timestamp,pressure,flow_rate,temperature,vibration,oil_level,pump_speed,system_load\n';
        const csvRows = historicalData.map(row => 
          `${row.timestamp},${row.pressure},${row.flow_rate},${row.temperature},${row.vibration},${row.oil_level},${row.pump_speed},${row.system_load}`
        ).join('\n');
        fileContent = csvHeaders + csvRows;
        fileName = `hydraulic_data_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      } else {
        // JSON export
        fileContent = JSON.stringify(dataToExport, null, 2);
        fileName = `hydraulic_data_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      }

      // Create and trigger download
      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log(`Exported ${exportType} data as ${exportFormat.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getExportIcon = () => {
    switch (exportType) {
      case 'historical': return <Database className="w-4 h-4" />;
      case 'current': return <FileText className="w-4 h-4" />;
      case 'alerts': return <Calendar className="w-4 h-4" />;
      default: return <Download className="w-4 h-4" />;
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Download className="w-5 h-5" />
          <span>Data Export</span>
          <HelpTooltip content="Export hydraulic system data for analysis, reporting, or backup purposes" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Export Type</label>
            <Select value={exportType} onValueChange={setExportType}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="all">All Data</SelectItem>
                <SelectItem value="historical">Historical Data</SelectItem>
                <SelectItem value="current">Current Readings</SelectItem>
                <SelectItem value="alerts">Alerts & Events</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-400">Format</label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv" disabled={exportType !== 'historical'}>
                  CSV {exportType !== 'historical' && '(Historical Only)'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-400">Action</label>
            <Button
              onClick={handleExport}
              disabled={isExporting || (!historicalData.length && exportType === 'historical')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {getExportIcon()}
              <span className="ml-2">
                {isExporting ? 'Exporting...' : 'Export Data'}
              </span>
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline" className="text-slate-400">
            Historical: {historicalData.length} records
          </Badge>
          <Badge variant="outline" className="text-slate-400">
            Alerts: {alerts.length} items
          </Badge>
          {currentData && (
            <Badge variant="outline" className="text-green-400 border-green-400">
              Current: Live data available
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
