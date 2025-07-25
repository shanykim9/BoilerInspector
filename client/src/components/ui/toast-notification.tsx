import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

interface ToastNotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

export default function ToastNotification({ 
  message, 
  type = 'success', 
  duration = 3000,
  onClose 
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      default:
        return 'bg-blue-600';
    }
  };

  return (
    <div className={`fixed top-20 left-4 right-4 ${getBackgroundColor()} text-white p-4 rounded-lg shadow-lg transform transition-all duration-300 z-50 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-[-100px] opacity-0'
    }`}>
      <div className="flex items-center justify-between space-x-3">
        <div className="flex items-center space-x-3">
          {getIcon()}
          <span className="font-medium">{message}</span>
        </div>
        <button
          onClick={handleClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
