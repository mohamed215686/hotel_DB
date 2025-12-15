import { useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

interface ToastProps {
  message: string | object;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

// Helper function to extract message from error objects
const extractMessage = (msg: string | object): string => {
  if (typeof msg === 'string') {
    return msg;
  }
  
  if (msg && typeof msg === 'object') {
    // Handle error objects like {timestamp, status, error, path}
    if ('error' in msg && typeof (msg as any).error === 'string') {
      return (msg as any).error;
    }
    if ('message' in msg && typeof (msg as any).message === 'string') {
      return (msg as any).message;
    }
    // Fallback: stringify the object
    return JSON.stringify(msg);
  }
  
  return 'An error occurred';
};

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  };

  const icons = {
    success: FaCheckCircle,
    error: FaTimesCircle,
    info: FaInfoCircle,
    warning: FaExclamationTriangle,
  };

  const Icon = icons[type];
  const displayMessage = extractMessage(message);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${bgColors[type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md`}>
        <Icon className="text-xl flex-shrink-0" />
        <p className="flex-1">{displayMessage}</p>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <FaTimesCircle />
        </button>
      </div>
    </div>
  );
}

