
import { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ToastMessage } from '@/hooks/useToast';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemoveToast: (id: string) => void;
}

export const ToastContainer = ({ toasts, onRemoveToast }: ToastContainerProps) => {
  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'info': return <Info className="w-5 h-5 text-blue-400" />;
      default: return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  const getToastStyles = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-900/90 border-green-700 text-green-100';
      case 'error': return 'bg-red-900/90 border-red-700 text-red-100';
      case 'warning': return 'bg-yellow-900/90 border-yellow-700 text-yellow-100';
      case 'info': return 'bg-blue-900/90 border-blue-700 text-blue-100';
      default: return 'bg-gray-900/90 border-gray-700 text-gray-100';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <Card
          key={toast.id}
          className={`p-4 shadow-lg animate-slide-in-right ${getToastStyles(toast.type)}`}
        >
          <div className="flex items-start space-x-3">
            {getToastIcon(toast.type)}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm">{toast.title}</h4>
              <p className="text-sm opacity-90 mt-1">{toast.message}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveToast(toast.id)}
              className="p-1 h-auto opacity-70 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};
