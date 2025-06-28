
import { Shield, Settings, User, Bell, Database } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showStatus?: boolean;
  connectionStatus?: 'connected' | 'disconnected' | 'connecting';
}

export const Header = ({ 
  title = "Hydraulic Fault Prediction Dashboard",
  subtitle = "Real-time monitoring with AI-powered fault detection",
  showStatus = true,
  connectionStatus = 'connected'
}: HeaderProps) => {
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  return (
    <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-xl font-bold text-white">{title}</h1>
                <p className="text-sm text-slate-400">{subtitle}</p>
              </div>
            </div>
          </div>

          {/* Status and Actions */}
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            {showStatus && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
                  <span className="text-sm text-slate-300">{getStatusText()}</span>
                </div>
                <Badge variant="outline" className="text-slate-400 border-slate-600">
                  <Database className="w-3 h-3 mr-1" />
                  Backend API
                </Badge>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <Bell className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <User className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
