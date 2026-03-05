import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  isDanger = false
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden pointer-events-auto border border-slate-100"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-xl ${isDanger ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                    <AlertTriangle size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                </div>
                <p className="text-slate-600 leading-relaxed mb-8">
                  {message}
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={onConfirm}
                    className={`w-full py-4 rounded-2xl font-bold transition-all active:scale-[0.98] ${
                      isDanger 
                        ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-100' 
                        : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-100'
                    }`}
                  >
                    {confirmText}
                  </button>
                  <button
                    onClick={onCancel}
                    className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-[0.98]"
                  >
                    {cancelText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
