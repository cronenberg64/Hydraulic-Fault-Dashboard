import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useHydraulicSimulation } from '@/hooks/useHydraulicSimulation';
import { SystemStatus } from '@/components/SystemStatus';
import { MetricsCards } from '@/components/MetricsCards';
import { TimeSeriesChart } from '@/components/TimeSeriesChart';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const SimulationPage = () => {
  const navigate = useNavigate();
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    isRunning,
    currentData,
    historicalData,
    systemHealth,
    toggleSimulation
  } = useHydraulicSimulation();

  // Add loading state and error handling
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Error boundary for the entire page
  if (hasError) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-400">Something went wrong</h1>
          <p className="text-slate-400">There was an error loading the simulation page.</p>
          <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-slate-400">Loading simulation...</p>
        </div>
      </div>
    );
  }

  // Safe render with error boundary
  try {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-4xl space-y-8">
          <h1 className="text-3xl font-bold text-center">Simulation Mode</h1>
          {isRunning ? (
            <>
              <SystemStatus 
                health={systemHealth || 'healthy'} 
                isRunning={isRunning}
                onToggleSimulation={toggleSimulation}
              />
              <MetricsCards currentData={currentData} previousData={null} />
              {historicalData && Array.isArray(historicalData) && historicalData.length > 0 && (
                <TimeSeriesChart data={historicalData} />
              )}
              <div className="flex justify-center mt-8">
                <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-lg">Simulation is not running.</p>
              <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering SimulationPage:', error);
    setHasError(true);
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-400">Something went wrong</h1>
          <p className="text-slate-400">There was an error loading the simulation page.</p>
          <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }
};

export default SimulationPage; 