import React from 'react';
import { Bus } from 'lucide-react';

interface HeaderProps {
  totalPaid: number;
  totalPending: number;
  totalExpected: number;
}

export const Header: React.FC<HeaderProps> = ({ totalPaid, totalPending, totalExpected }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-xl text-white shadow-lg shadow-slate-200">
              <Bus size={24} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Lista de <span className="text-emerald-600">Passageiros</span>
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-500">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Total Recebido
              </div>
              <span className="text-xs text-emerald-600 font-bold">R$ {totalPaid.toFixed(2)}</span>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Falta Receber
              </div>
              <span className="text-xs text-amber-600 font-bold">R$ {totalPending.toFixed(2)}</span>
            </div>
            <div className="flex flex-col items-end border-l border-slate-200 pl-6">
              <div className="flex items-center gap-1 text-slate-400">
                Total Geral
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-slate-600 font-bold">R$ {totalExpected.toFixed(2)}</span>
                <span className="text-[10px] text-slate-400 font-medium">3 dias: R$ {(totalExpected / 3).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
