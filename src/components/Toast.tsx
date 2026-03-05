import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const icons = {
    success: <CheckCircle2 className="text-emerald-500" size={20} />,
    error: <AlertCircle className="text-rose-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />
  };

  const bgColors = {
    success: 'bg-emerald-50 border-emerald-100',
    error: 'bg-rose-50 border-rose-100',
    info: 'bg-blue-50 border-blue-100'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, scale: 0.9, x: '-50%' }}
          className={`fixed top-6 left-1/2 z-[200] flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg min-w-[280px] max-w-[90vw] ${bgColors[type]}`}
        >
          <div className="flex-shrink-0">{icons[type]}</div>
          <p className="text-sm font-bold text-slate-800 flex-1">{message}</p>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
