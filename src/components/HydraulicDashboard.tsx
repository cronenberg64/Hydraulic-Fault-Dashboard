import { useState, useEffect } from 'react';
import { SystemStatus } from './SystemStatus';
import { MetricsCards } from './MetricsCards';
import { TimeSeriesChart } from './TimeSeriesChart';
import { ControlPanel } from './ControlPanel';
import { AlertPanel } from './AlertPanel';
import { ServiceHistory } from './ServiceHistory';
import { AuthDialog } from './AuthDialog';
import { RealTimeNotifications } from './RealTimeNotifications';
import { SimulationControls } from './SimulationControls';
import { ToastContainer } from './ToastContainer';
import { DataExportPanel } from './DataExportPanel';
import { SystemConfigPanel } from './SystemConfigPanel';
import { HealthCheckMonitor } from './HealthCheckMonitor';
import { LoadingSpinner } from './LoadingSpinner';
import { useHydraulicSimulation } from '@/hooks/useHydraulicSimulation';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/useToast';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Shield, LogOut, AlertTriangle, Settings, BarChart3, Download } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export const HydraulicDashboard = () => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [previousData, setPreviousData] = useState(null);
  const [systemUptime, setSystemUptime] = useState(0);
  const [startTime] = useState(Date.now());
  const [backendError, setBackendError] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const { user, isAuthenticated, isLoading, login, register, logout, hasPermission } = useAuth();
  const { 
    notifications, 
    addNotification, 
    dismissNotification, 
    clearAllNotifications 
  } = useNotifications();
  const { toasts, addToast, removeToast } = useToast();

  const {
    currentData,
    historicalData,
    systemHealth,
    alerts,
    mlPrediction,
    injectFault,
    resetSystem,
    trainMLModel,
    isRunning,
    toggleSimulation
  } = useHydraulicSimulation();

  // Track system uptime
  useEffect(() => {
    const interval = setInterval(() => {
      if (isRunning) {
        setSystemUptime(Date.now() - startTime);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  // Track previous data for trend calculation
  useEffect(() => {
    if (currentData && historicalData.length > 1) {
      setPreviousData(historicalData[historicalData.length - 2]);
    }
  }, [currentData, historicalData]);

  // Show auth dialog if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowAuthDialog(true);
    }
  }, [isLoading, isAuthenticated]);

  // Monitor system health for notifications
  useEffect(() => {
    if (systemHealth === 'fault') {
      addNotification(
        'error',
        'Critical System Fault',
        'Immediate attention required - fault detected in hydraulic system',
        true
      );
    } else if (systemHealth === 'warning') {
      addNotification(
        'warning',
        'System Warning',
        'Anomaly detected - monitoring parameters closely',
        false
      );
    }
  }, [systemHealth, addNotification]);

  // Monitor alerts for notifications
  useEffect(() => {
    if (alerts.length > 0) {
      const latestAlert = alerts[alerts.length - 1];
      addNotification(
        latestAlert.type as any,
        'System Alert',
        latestAlert.message,
        latestAlert.type === 'error'
      );
    }
  }, [alerts, addNotification]);

  // Monitor ML predictions for critical alerts
  useEffect(() => {
    if (mlPrediction && mlPrediction.risk_level === 'high' && mlPrediction.days_to_failure && mlPrediction.days_to_failure < 7) {
      addNotification(
        'error',
        'Failure Prediction Alert',
        `ML model predicts potential failure in ${mlPrediction.days_to_failure} days`,
        true
      );
    }
  }, [mlPrediction, addNotification]);

  // Monitor for backend connection errors
  useEffect(() => {
    const hasConnectionError = alerts.some(alert => 
      alert.message.includes('Backend server may not be running')
    );
    setBackendError(hasConnectionError);
  }, [alerts]);

  // Enhanced toast notifications for system events
  useEffect(() => {
    if (systemHealth === 'fault') {
      addToast('error', 'Critical System Fault', 'Immediate attention required - fault detected in hydraulic system');
    } else if (systemHealth === 'warning') {
      addToast('warning', 'System Warning', 'Anomaly detected - monitoring parameters closely');
    }
  }, [systemHealth, addToast]);

  // Toast notifications for simulation events
  useEffect(() => {
    if (isRunning) {
      addToast('success', 'Simulation Started', 'Real-time data generation and monitoring is now active');
    } else if (!isRunning && systemUptime > 0) {
      addToast('info', 'Simulation Stopped', 'Data collection has been paused');
    }
  }, [isRunning, addToast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <div className="text-white">Loading system...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
          <div className="text-center text-white max-w-md">
            <Shield className="w-16 h-16 mx-auto mb-4 text-blue-400" />
            <h2 className="text-2xl font-bold mb-2">Secure Access Required</h2>
            <p className="text-slate-400 mb-6">
              This hydraulic fault prediction dashboard requires authentication to access sensitive system data and controls.
            </p>
            <Button 
              onClick={() => setShowAuthDialog(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Access Dashboard
            </Button>
          </div>
        </div>
        <AuthDialog
          isOpen={showAuthDialog}
          onOpenChange={setShowAuthDialog}
          onAuthenticate={login}
          onRegister={register}
        />
      </>
    );
  }

  const handleDismissAlert = (id: string) => {
    console.log('Dismissing alert:', id);
    addToast('info', 'Alert Dismissed', 'Alert has been acknowledged and dismissed');
  };

  const handleClearAllAlerts = () => {
    console.log('Clearing all alerts');
    addToast('info', 'All Alerts Cleared', 'All system alerts have been cleared');
  };

  return (
    <>
      <div className="space-y-8">
        {/* Header with user info */}
        <div className="flex justify-between items-center">
          <div className="text-white">
            <h1 className="text-3xl font-bold">Hydraulic System Dashboard</h1>
            <p className="text-slate-400 mt-1">
              Welcome, {user?.username} ({user?.role}) | {user?.email}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={logout}
            className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Backend Connection Alert */}
        {backendError && (
          <Alert className="bg-red-900/20 border-red-700 text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Backend Connection Error:</strong> The backend server is not running. 
              Please start the backend server by running <code className="bg-red-800 px-1 rounded">python run.py</code> in the backend folder.
              Some features will not work until the backend is connected.
            </AlertDescription>
          </Alert>
        )}

        {/* Health Check Monitor */}
        <HealthCheckMonitor />

        {/* Enhanced Simulation Controls */}
        <SimulationControls
          isRunning={isRunning}
          onToggleSimulation={toggleSimulation}
          systemHealth={systemHealth}
          currentData={currentData}
        />

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="dashboard" className="text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="export" className="text-white">
              <Download className="w-4 h-4 mr-2" />
              Data Export
            </TabsTrigger>
            <TabsTrigger value="config" className="text-white">
              <Settings className="w-4 h-4 mr-2" />
              Configuration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* System Status and Alerts */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <SystemStatus 
                  health={systemHealth} 
                  isRunning={isRunning}
                  onToggleSimulation={toggleSimulation}
                  uptime={systemUptime}
                  lastUpdate={currentData?.timestamp}
                />
              </div>
              <div className="xl:col-span-1">
                <AlertPanel 
                  alerts={alerts} 
                  onDismissAlert={handleDismissAlert}
                  onClearAll={handleClearAllAlerts}
                />
              </div>
            </div>

            {/* Current Metrics */}
            {isRunning && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Real-time Metrics</h2>
                <MetricsCards 
                  currentData={currentData} 
                  previousData={previousData}
                />
              </div>
            )}

            {/* Time Series Chart */}
            {isRunning && historicalData.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Historical Data</h2>
                <TimeSeriesChart data={historicalData} />
              </div>
            )}

            {/* Control Panel - Only show if user has permissions and simulation is running */}
            {hasPermission('inject_faults') && isRunning && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">System Controls</h2>
                <ControlPanel 
                  onInjectFault={injectFault}
                  onResetSystem={resetSystem}
                  onTrainML={trainMLModel}
                  mlPrediction={mlPrediction}
                  isRunning={isRunning}
                />
              </div>
            )}

            {/* Service History & Logs - Only show if user has read permissions */}
            {hasPermission('read') && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Service History</h2>
                <ServiceHistory />
              </div>
            )}
          </TabsContent>

          <TabsContent value="export">
            <DataExportPanel
              historicalData={historicalData}
              currentData={currentData}
              alerts={alerts}
            />
          </TabsContent>

          <TabsContent value="config">
            <SystemConfigPanel />
          </TabsContent>
        </Tabs>
      </div>

      {/* Real-time Notifications */}
      <RealTimeNotifications
        notifications={notifications}
        onDismiss={dismissNotification}
        onClearAll={clearAllNotifications}
      />

      {/* Toast Notifications */}
      <ToastContainer
        toasts={toasts}
        onRemoveToast={removeToast}
      />
    </>
  );
};
