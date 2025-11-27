import { useEffect, useState } from 'react';
import { checkHealth, ApiError } from '../lib/api';

type BackendStatus = {
  status: 'checking' | 'online' | 'offline' | 'error';
  message: string;
  lastChecked: Date | null;
};

export function BackendStatus() {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    status: 'checking',
    message: 'Checking backend...',
    lastChecked: null,
  });

  const checkBackend = async () => {
    try {
      const health = await checkHealth();
      setBackendStatus({
        status: 'online',
        message: `Backend online (${health.service}) - ${new Date(health.time).toLocaleTimeString()}`,
        lastChecked: new Date(),
      });
    } catch (err) {
      const error = err as ApiError;
      setBackendStatus({
        status: error.status === 0 ? 'offline' : 'error',
        message: error.message || 'Backend unavailable',
        lastChecked: new Date(),
      });
    }
  };

  useEffect(() => {
    checkBackend();
    const interval = setInterval(checkBackend, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (backendStatus.status) {
      case 'online': return 'text-green-600 bg-green-50 border-green-200';
      case 'offline': return 'text-red-600 bg-red-50 border-red-200';
      case 'error': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (backendStatus.status) {
      case 'online': return '🟢';
      case 'offline': return '🔴';
      case 'error': return '🟡';
      default: return '⏳';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getStatusIcon()}</span>
          <div>
            <h3 className="font-semibold">Backend Status</h3>
            <p className="text-sm">{backendStatus.message}</p>
          </div>
        </div>
        <button
          onClick={checkBackend}
          disabled={backendStatus.status === 'checking'}
          className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300 disabled:opacity-50"
        >
          {backendStatus.status === 'checking' ? 'Checking...' : 'Refresh'}
        </button>
      </div>
      {backendStatus.lastChecked && (
        <p className="mt-2 text-xs opacity-75">
          Last checked: {backendStatus.lastChecked.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
