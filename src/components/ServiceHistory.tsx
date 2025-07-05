import { useState, useEffect } from 'react';
import { History, Filter, Download, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { endpoints } from "@/config/environment";

interface ServiceLogEntry {
  id: string;
  timestamp: number;
  event_type: string;
  severity: string;
  component: string;
  message: string;
  details?: any;
  user_id?: string;
}

interface MaintenanceRecord {
  id: string;
  timestamp: number;
  maintenance_type: string;
  component: string;
  description: string;
  technician: string;
  duration_minutes: number;
  status: string;
  cost?: number;
}

export const ServiceHistory = () => {
  const [serviceLogs, setServiceLogs] = useState<ServiceLogEntry[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'logs' | 'maintenance'>('logs');
  const [logFilters, setLogFilters] = useState({
    event_type: 'all',
    severity: 'all',
    component: 'all'
  });
  const [maintenanceFilters, setMaintenanceFilters] = useState({
    maintenance_type: 'all',
    component: 'all',
    status: 'all'
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchServiceLogs = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (logFilters.event_type !== 'all') params.append('event_type', logFilters.event_type);
      if (logFilters.severity !== 'all') params.append('severity', logFilters.severity);
      if (logFilters.component !== 'all') params.append('component', logFilters.component);
      params.append('limit', '50');

      const response = await fetch(`${endpoints.serviceLogs}?${params}`);
      if (response.ok) {
        const data = await response.json();
        setServiceLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to fetch service logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMaintenanceRecords = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (maintenanceFilters.maintenance_type !== 'all') params.append('maintenance_type', maintenanceFilters.maintenance_type);
      if (maintenanceFilters.component !== 'all') params.append('component', maintenanceFilters.component);
      if (maintenanceFilters.status !== 'all') params.append('status', maintenanceFilters.status);
      params.append('limit', '50');

      const response = await fetch(`${endpoints.maintenanceRecords}?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMaintenanceRecords(data.records);
      }
    } catch (error) {
      console.error('Failed to fetch maintenance records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceLogs();
    fetchMaintenanceRecords();
  }, []);

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchServiceLogs();
    }
  }, [logFilters]);

  useEffect(() => {
    if (activeTab === 'maintenance') {
      fetchMaintenanceRecords();
    }
  }, [maintenanceFilters]);

  const getSeverityBadge = (severity: string) => {
    const colors = {
      info: 'bg-blue-900 text-blue-300',
      warning: 'bg-yellow-900 text-yellow-300',
      error: 'bg-red-900 text-red-300',
      critical: 'bg-red-950 text-red-200'
    };
    return <Badge className={colors[severity as keyof typeof colors] || 'bg-gray-900 text-gray-300'}>
      {severity.toUpperCase()}
    </Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: 'bg-green-900 text-green-300',
      in_progress: 'bg-yellow-900 text-yellow-300',
      scheduled: 'bg-blue-900 text-blue-300'
    };
    return <Badge className={colors[status as keyof typeof colors] || 'bg-gray-900 text-gray-300'}>
      {status.replace('_', ' ').toUpperCase()}
    </Badge>;
  };

  const exportData = () => {
    const data = activeTab === 'logs' ? serviceLogs : maintenanceRecords;
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${activeTab}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-4">
          <History className="w-5 h-5" />
          <span>Service History & Logs</span>
          <div className="flex space-x-2 ml-auto">
            <Button
              variant={activeTab === 'logs' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('logs')}
            >
              Service Logs
            </Button>
            <Button
              variant={activeTab === 'maintenance' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('maintenance')}
            >
              Maintenance
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex items-center space-x-4 mb-4">
          <Filter className="w-4 h-4 text-slate-400" />
          {activeTab === 'logs' ? (
            <>
              <Select value={logFilters.event_type} onValueChange={(value) => 
                setLogFilters(prev => ({ ...prev, event_type: value }))
              }>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="fault">Fault</SelectItem>
                  <SelectItem value="ml">ML</SelectItem>
                  <SelectItem value="user_action">User Action</SelectItem>
                </SelectContent>
              </Select>
              <Select value={logFilters.severity} onValueChange={(value) => 
                setLogFilters(prev => ({ ...prev, severity: value }))
              }>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Select value={logFilters.component} onValueChange={(value) => 
                setLogFilters(prev => ({ ...prev, component: value }))
              }>
                <SelectTrigger className="w-40 bg-slate-700 border-slate-600">
                  <SelectValue placeholder="Component" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Components</SelectItem>
                  <SelectItem value="hydraulic_system">Hydraulic System</SelectItem>
                  <SelectItem value="ml_model">ML Model</SelectItem>
                  <SelectItem value="simulation">Simulation</SelectItem>
                  <SelectItem value="user_interface">User Interface</SelectItem>
                </SelectContent>
              </Select>
            </>
          ) : (
            <>
              <Select value={maintenanceFilters.maintenance_type} onValueChange={(value) => 
                setMaintenanceFilters(prev => ({ ...prev, maintenance_type: value }))
              }>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="preventive">Preventive</SelectItem>
                  <SelectItem value="corrective">Corrective</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
              <Select value={maintenanceFilters.status} onValueChange={(value) => 
                setMaintenanceFilters(prev => ({ ...prev, status: value }))
              }>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={activeTab === 'logs' ? fetchServiceLogs : fetchMaintenanceRecords}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>

        {/* Table */}
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                {activeTab === 'logs' ? (
                  <>
                    <TableHead className="text-slate-300">Timestamp</TableHead>
                    <TableHead className="text-slate-300">Event Type</TableHead>
                    <TableHead className="text-slate-300">Severity</TableHead>
                    <TableHead className="text-slate-300">Component</TableHead>
                    <TableHead className="text-slate-300">Message</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead className="text-slate-300">Date</TableHead>
                    <TableHead className="text-slate-300">Type</TableHead>
                    <TableHead className="text-slate-300">Component</TableHead>
                    <TableHead className="text-slate-300">Description</TableHead>
                    <TableHead className="text-slate-300">Technician</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Duration</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeTab === 'logs' ? (
                serviceLogs.map((log) => (
                  <TableRow key={log.id} className="border-slate-700">
                    <TableCell className="text-slate-300 text-sm">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {log.event_type === 'system' ? (
                        <Badge className="bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium rounded-full px-3 py-1 text-xs border-0">
                          System
                        </Badge>
                      ) : log.event_type === 'maintenance' ? (
                        <Badge className="bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100 font-medium rounded-full px-3 py-1 text-xs border-0">
                          Maintenance
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          {log.event_type.replace('_', ' ')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {getSeverityBadge(log.severity)}
                    </TableCell>
                    <TableCell className="text-slate-300 text-sm">
                      {log.component.replace('_', ' ')}
                    </TableCell>
                    <TableCell className="text-slate-300 text-sm max-w-md truncate">
                      {log.message}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                maintenanceRecords.map((record) => (
                  <TableRow key={record.id} className="border-slate-700">
                    <TableCell className="text-slate-300 text-sm">
                      {new Date(record.timestamp).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {record.maintenance_type === 'preventive' ? (
                        <Badge className="bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100 font-medium rounded-full px-3 py-1 text-xs border-0">
                          Preventive
                        </Badge>
                      ) : record.maintenance_type === 'corrective' ? (
                        <Badge className="bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100 font-medium rounded-full px-3 py-1 text-xs border-0">
                          Corrective
                        </Badge>
                      ) : record.maintenance_type === 'emergency' ? (
                        <Badge className="bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100 font-medium rounded-full px-3 py-1 text-xs border-0">
                          Emergency
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          {record.maintenance_type}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-300 text-sm">
                      {record.component.replace('_', ' ')}
                    </TableCell>
                    <TableCell className="text-slate-300 text-sm max-w-md truncate">
                      {record.description}
                    </TableCell>
                    <TableCell className="text-slate-300 text-sm">
                      {record.technician}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(record.status)}
                    </TableCell>
                    <TableCell className="text-slate-300 text-sm">
                      {record.duration_minutes}m
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {((activeTab === 'logs' && serviceLogs.length === 0) || 
            (activeTab === 'maintenance' && maintenanceRecords.length === 0)) && (
            <div className="text-center py-8">
              <div className="text-slate-400 text-sm">
                No {activeTab === 'logs' ? 'service logs' : 'maintenance records'} found
              </div>
              <div className="text-xs text-slate-500">
                Try adjusting your filters or check back later
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
