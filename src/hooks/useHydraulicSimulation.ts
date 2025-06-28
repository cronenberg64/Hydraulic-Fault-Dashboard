import { useState, useEffect, useCallback, useRef } from 'react';
import { config, endpoints } from '@/config/environment';

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

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: number;
}

interface MLPrediction {
  days_to_failure: number | null;
  confidence: number;
  risk_level: string;
  trend_analysis: string;
}

type SystemHealth = 'healthy' | 'warning' | 'fault';

export const useHydraulicSimulation = () => {
  const [currentData, setCurrentData] = useState<HydraulicData | null>(null);
  const [historicalData, setHistoricalData] = useState<HydraulicData[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>('healthy');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [mlPrediction, setMlPrediction] = useState<MLPrediction | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch current status from backend
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(endpoints.status);
      if (response.ok) {
        const status = await response.json();
        setSystemHealth(status.health);
        setIsRunning(status.is_running);
        if (status.current_data) {
          setCurrentData(status.current_data);
        }
        setAlerts(status.alerts || []);
        if (status.ml_prediction) {
          setMlPrediction(status.ml_prediction);
        }
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
      console.error(`Backend server may not be running at ${config.apiBaseUrl}`);
      
      // Add connection error alert
      const connectionAlert = {
        id: `connection-error-${Date.now()}`,
        type: 'error' as const,
        message: `Backend server may not be running at ${config.apiBaseUrl}. Please check your connection.`,
        timestamp: Date.now()
      };
      setAlerts(prev => [...prev.filter(a => !a.id.includes('connection-error')), connectionAlert]);
    }
  }, []);

  // Fetch historical data from backend
  const fetchHistoricalData = useCallback(async () => {
    try {
      const response = await fetch(endpoints.data.historical);
      if (response.ok) {
        const data = await response.json();
        setHistoricalData(data);
      }
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
      console.error(`Backend server may not be running at ${config.apiBaseUrl}`);
    }
  }, []);

  // Toggle simulation
  const toggleSimulation = useCallback(async () => {
    try {
      const endpoint = isRunning ? endpoints.simulation.stop : endpoints.simulation.start;
      const response = await fetch(endpoint, {
        method: 'POST',
      });
      
      if (response.ok) {
        setIsRunning(!isRunning);
        // Refresh status after toggling
        setTimeout(fetchStatus, 100);
        console.log(`Simulation ${isRunning ? 'stopped' : 'started'} successfully`);
      } else {
        console.error(`Failed to ${isRunning ? 'stop' : 'start'} simulation:`, response.statusText);
      }
    } catch (error) {
      console.error('Failed to toggle simulation:', error);
      console.error(`Backend server may not be running at ${config.apiBaseUrl}`);
      
      // Add user-friendly error notification
      const errorMessage = config.isDevelopment 
        ? `Cannot connect to backend server at ${config.apiBaseUrl}. Please ensure the backend is running.`
        : 'Unable to connect to the system. Please check your connection and try again.';
      
      alert(errorMessage);
    }
  }, [isRunning, fetchStatus]);

  // Inject fault
  const injectFault = useCallback(async (faultType: string) => {
    try {
      const response = await fetch(endpoints.faults.inject(faultType), {
        method: 'POST',
      });
      
      if (response.ok) {
        // Refresh status after injecting fault
        setTimeout(fetchStatus, 100);
        console.log(`Fault ${faultType} injected successfully`);
      } else {
        console.error('Failed to inject fault:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to inject fault:', error);
      console.error(`Backend server may not be running at ${config.apiBaseUrl}`);
      
      const errorMessage = config.isDevelopment 
        ? `Cannot connect to backend server at ${config.apiBaseUrl}. Please ensure the backend is running.`
        : 'Unable to inject fault. Please check your connection and try again.';
      
      alert(errorMessage);
    }
  }, [fetchStatus]);

  // Reset system
  const resetSystem = useCallback(async () => {
    try {
      const response = await fetch(endpoints.simulation.reset, {
        method: 'POST',
      });
      
      if (response.ok) {
        setHistoricalData([]);
        setAlerts([]);
        setMlPrediction(null);
        // Refresh status after reset
        setTimeout(fetchStatus, 100);
        console.log('System reset successfully');
      } else {
        console.error('Failed to reset system:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to reset system:', error);
      console.error(`Backend server may not be running at ${config.apiBaseUrl}`);
      
      const errorMessage = config.isDevelopment 
        ? `Cannot connect to backend server at ${config.apiBaseUrl}. Please ensure the backend is running.`
        : 'Unable to reset system. Please check your connection and try again.';
      
      alert(errorMessage);
    }
  }, [fetchStatus]);

  // Train ML model
  const trainMLModel = useCallback(async () => {
    try {
      const response = await fetch(endpoints.ml.train, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Refresh status after training
        setTimeout(fetchStatus, 100);
        console.log('ML model training initiated successfully');
      } else {
        console.error('Failed to train ML model:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to train ML model:', error);
      console.error(`Backend server may not be running at ${config.apiBaseUrl}`);
      
      const errorMessage = config.isDevelopment 
        ? `Cannot connect to backend server at ${config.apiBaseUrl}. Please ensure the backend is running.`
        : 'Unable to train ML model. Please check your connection and try again.';
      
      alert(errorMessage);
    }
  }, [fetchStatus]);

  // Set up polling for real-time updates
  useEffect(() => {
    // Initial fetch
    fetchStatus();
    fetchHistoricalData();

    // Set up polling every second
    pollingIntervalRef.current = setInterval(() => {
      fetchStatus();
      if (isRunning) {
        fetchHistoricalData();
      }
    }, 1000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchStatus, fetchHistoricalData, isRunning]);

  return {
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
  };
};
