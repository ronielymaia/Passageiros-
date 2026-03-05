import React from 'react';
import { X, HelpCircle, Smartphone, Download, Share2, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <HelpCircle size={20} className="text-emerald-500" />
                <span>Como usar o Aplicativo</span>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <section className="space-y-3">
                <h3 className="text-sm font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                  <Smartphone size={16} />
                  Instalar no Celular
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Este é um <strong>PWA (Progressive Web App)</strong>. Você pode instalá-lo para usar como um aplicativo nativo:
                </p>
                <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
                  <li><strong>Android (Chrome):</strong> Clique nos três pontinhos e selecione "Instalar aplicativo" ou "Adicionar à tela inicial".</li>
                  <li><strong>iPhone (Safari):</strong> Clique no botão de compartilhar (quadrado com seta) e selecione "Adicionar à Tela de Início".</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                  <FileText size={16} />
                  Relatórios e WhatsApp
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Você pode gerar relatórios de duas formas:
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex gap-3 p-3 bg-slate-50 rounded-2xl">
                    <div className="bg-slate-900 p-2 rounded-xl text-white h-fit">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Gerar PDF</p>
                      <p className="text-[11px] text-slate-500">Cria um arquivo profissional que pode ser compartilhado ou impresso.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 bg-slate-50 rounded-2xl">
                    <div className="bg-emerald-600 p-2 rounded-xl text-white h-fit">
                      <Share2 size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Copiar Texto</p>
                      <p className="text-[11px] text-slate-500">Copia uma lista formatada pronta para colar diretamente no WhatsApp.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                  <Download size={16} />
                  Dados Offline
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Seus dados são salvos automaticamente no seu navegador. Você pode usar o aplicativo mesmo sem internet após o primeiro acesso.
                </p>
              </section>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button
                onClick={onClose}
                className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-lg hover:bg-slate-800 transition-all"
              >
                Entendi
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
