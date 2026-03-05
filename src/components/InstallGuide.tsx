import React from 'react';
import { X, Share, PlusSquare, MoreVertical, Download, AlertTriangle, Chrome } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InstallGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstallGuide({ isOpen, onClose }: InstallGuideProps) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Download size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Instalar Aplicativo</h2>
              <p className="text-slate-500 text-sm mt-2">
                Adicione à sua tela inicial para usar offline e em tela cheia.
              </p>
            </div>

            <div className="space-y-4">
              {isIOS ? (
                // iOS Instructions
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-blue-500">
                      <Share size={20} />
                    </div>
                    <div className="text-sm text-slate-600">
                      1. Toque no botão <span className="font-bold text-slate-900">Compartilhar</span> na barra inferior do Safari.
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-slate-900">
                      <PlusSquare size={20} />
                    </div>
                    <div className="text-sm text-slate-600">
                      2. Role para baixo e selecione <span className="font-bold text-slate-900">Adicionar à Tela de Início</span>.
                    </div>
                  </div>
                </div>
              ) : (
                // Android/Chrome Instructions
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-800 flex gap-3 items-start">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <span>
                      Se abriu pelo <strong>WhatsApp</strong> ou <strong>Instagram</strong>, toque nos 3 pontinhos e escolha <strong>"Abrir no Chrome"</strong> (ou navegador padrão) primeiro.
                    </span>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-slate-600">
                      <MoreVertical size={20} />
                    </div>
                    <div className="text-sm text-slate-600">
                      1. Toque no menu de <span className="font-bold text-slate-900">três pontos</span> no canto superior direito do Chrome.
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-emerald-600">
                      <Download size={20} />
                    </div>
                    <div className="text-sm text-slate-600">
                      2. Selecione <span className="font-bold text-slate-900">Instalar aplicativo</span> ou <span className="font-bold text-slate-900">Adicionar à tela inicial</span>.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full mt-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Entendi
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
