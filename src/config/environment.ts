export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8000',
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',
  isDevelopment: import.meta.env.VITE_ENVIRONMENT !== 'production',
  isProduction: import.meta.env.VITE_ENVIRONMENT === 'production'
};

export const endpoints = {
  health: `${config.apiBaseUrl}/health`,
  status: `${config.apiBaseUrl}/status`,
  simulation: {
    start: `${config.apiBaseUrl}/simulation/start`,
    stop: `${config.apiBaseUrl}/simulation/stop`,
    reset: `${config.apiBaseUrl}/simulation/reset`
  },
  data: {
    historical: `${config.apiBaseUrl}/data/historical`,
    current: `${config.apiBaseUrl}/data/current`
  },
  faults: {
    inject: (type: string) => `${config.apiBaseUrl}/faults/inject/${type}`
  },
  ml: {
    train: `${config.apiBaseUrl}/ml/train`,
    predict: `${config.apiBaseUrl}/ml/predict`
  },
  serviceLogs: `${config.apiBaseUrl}/service-logs`,
  maintenanceRecords: `${config.apiBaseUrl}/maintenance-records`
};
