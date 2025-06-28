
import { useState } from 'react';
import { Settings, Save, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { HelpTooltip } from './HelpTooltip';

interface SystemConfig {
  alertThresholds: {
    pressure: { min: number; max: number };
    temperature: { min: number; max: number };
    flowRate: { min: number; max: number };
  };
  notifications: {
    enabled: boolean;
    soundEnabled: boolean;
    emailEnabled: boolean;
  };
  monitoring: {
    dataRetentionDays: number;
    samplingRate: number;
    autoBackup: boolean;
  };
}

export const SystemConfigPanel = () => {
  const [config, setConfig] = useState<SystemConfig>({
    alertThresholds: {
      pressure: { min: 50, max: 200 },
      temperature: { min: 20, max: 80 },
      flowRate: { min: 10, max: 50 }
    },
    notifications: {
      enabled: true,
      soundEnabled: true,
      emailEnabled: false
    },
    monitoring: {
      dataRetentionDays: 30,
      samplingRate: 1,
      autoBackup: false
    }
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    // Save configuration to localStorage or backend
    localStorage.setItem('hydraulic_system_config', JSON.stringify(config));
    setHasChanges(false);
    console.log('Configuration saved:', config);
  };

  const handleReset = () => {
    // Reset to default values
    const defaultConfig: SystemConfig = {
      alertThresholds: {
        pressure: { min: 50, max: 200 },
        temperature: { min: 20, max: 80 },
        flowRate: { min: 10, max: 50 }
      },
      notifications: {
        enabled: true,
        soundEnabled: true,
        emailEnabled: false
      },
      monitoring: {
        dataRetentionDays: 30,
        samplingRate: 1,
        autoBackup: false
      }
    };
    setConfig(defaultConfig);
    setHasChanges(true);
  };

  const updateConfig = (path: string, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current: any = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      setHasChanges(true);
      return newConfig;
    });
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>System Configuration</span>
            <HelpTooltip content="Configure system thresholds, notifications, and monitoring settings" />
          </div>
          {hasChanges && (
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-400">Unsaved Changes</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alert Thresholds */}
        <div>
          <h3 className="text-white font-medium mb-4">Alert Thresholds</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-400">Pressure (PSI)</Label>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={config.alertThresholds.pressure.min}
                  onChange={(e) => updateConfig('alertThresholds.pressure.min', Number(e.target.value))}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={config.alertThresholds.pressure.max}
                  onChange={(e) => updateConfig('alertThresholds.pressure.max', Number(e.target.value))}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-400">Temperature (°C)</Label>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={config.alertThresholds.temperature.min}
                  onChange={(e) => updateConfig('alertThresholds.temperature.min', Number(e.target.value))}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={config.alertThresholds.temperature.max}
                  onChange={(e) => updateConfig('alertThresholds.temperature.max', Number(e.target.value))}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-400">Flow Rate (L/min)</Label>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={config.alertThresholds.flowRate.min}
                  onChange={(e) => updateConfig('alertThresholds.flowRate.min', Number(e.target.value))}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={config.alertThresholds.flowRate.max}
                  onChange={(e) => updateConfig('alertThresholds.flowRate.max', Number(e.target.value))}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <h3 className="text-white font-medium mb-4">Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-slate-400">Enable Notifications</Label>
              <Switch
                checked={config.notifications.enabled}
                onCheckedChange={(checked) => updateConfig('notifications.enabled', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-400">Sound Alerts</Label>
              <Switch
                checked={config.notifications.soundEnabled}
                onCheckedChange={(checked) => updateConfig('notifications.soundEnabled', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-400">Email Notifications</Label>
              <Switch
                checked={config.notifications.emailEnabled}
                onCheckedChange={(checked) => updateConfig('notifications.emailEnabled', checked)}
              />
            </div>
          </div>
        </div>

        {/* Monitoring */}
        <div>
          <h3 className="text-white font-medium mb-4">Monitoring</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-400">Data Retention (Days): {config.monitoring.dataRetentionDays}</Label>
              <Slider
                value={[config.monitoring.dataRetentionDays]}
                onValueChange={([value]) => updateConfig('monitoring.dataRetentionDays', value)}
                max={365}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-slate-400">Sampling Rate (seconds): {config.monitoring.samplingRate}</Label>
              <Slider
                value={[config.monitoring.samplingRate]}
                onValueChange={([value]) => updateConfig('monitoring.samplingRate', value)}
                max={60}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-400">Auto Backup</Label>
              <Switch
                checked={config.monitoring.autoBackup}
                onCheckedChange={(checked) => updateConfig('monitoring.autoBackup', checked)}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 pt-4 border-t border-slate-700">
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
