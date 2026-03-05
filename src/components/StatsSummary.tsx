import React from 'react';

interface StatsSummaryProps {
  total: number;
  paid: number;
  partial: number;
  pending: number;
  totalAmountPaid: number;
  totalAmountPending: number;
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({
  total,
  paid,
  partial,
  pending,
  totalAmountPaid,
  totalAmountPending,
}) => {
  return (
    <div className="grid grid-cols-3 gap-2 sm:hidden">
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm text-center">
        <p className="text-[10px] text-slate-500 mb-0.5">Total</p>
        <p className="text-sm font-bold text-slate-900">{total}</p>
      </div>
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm text-center">
        <p className="text-[10px] text-slate-500 mb-0.5">Pagos</p>
        <p className="text-sm font-bold text-emerald-600">{paid}</p>
      </div>
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm text-center">
        <p className="text-[10px] text-slate-500 mb-0.5">Parc.</p>
        <p className="text-sm font-bold text-amber-600">{partial}</p>
      </div>
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm text-center">
        <p className="text-[10px] text-slate-500 mb-0.5">Pendentes</p>
        <p className="text-sm font-bold text-rose-600">{pending}</p>
      </div>
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm text-center">
        <p className="text-[10px] text-slate-500 mb-0.5">Total já pago</p>
        <p className="text-[10px] font-bold text-emerald-600">R$ {totalAmountPaid.toFixed(2)}</p>
      </div>
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm text-center">
        <p className="text-[10px] text-slate-500 mb-0.5">Falta</p>
        <p className="text-[10px] font-bold text-rose-600">R$ {totalAmountPending.toFixed(2)}</p>
      </div>
    </div>
  );
};
