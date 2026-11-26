import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
}) => {
  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#2D6A4F] shrink-0" />,
    info: <Info className="w-5 h-5 text-[#354F52] shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0" />,
    error: <XCircle className="w-5 h-5 text-[#DC2626] shrink-0" />,
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-white border border-[#E5E2DC] shadow-lg rounded-xl p-3.5 flex items-start gap-3 transition-all duration-200"
        >
          {icons[toast.type]}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#1A241E]">
              {toast.title}
            </p>
            {toast.description && (
              <p className="text-xs text-[#526058] mt-0.5 leading-relaxed">
                {toast.description}
              </p>
            )}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-[#6B7A70] hover:text-[#1A241E] p-0.5 rounded transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
