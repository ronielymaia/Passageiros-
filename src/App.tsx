/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  UserPlus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Pencil,
  X,
  Calendar, 
  CreditCard, 
  Users,
  Bus,
  TrendingUp,
  Search,
  Filter,
  FileText,
  Share2,
  Copy,
  HelpCircle,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import InstallGuide from './components/InstallGuide';

type Day = 'Sexta-feira' | 'Sábado' | 'Domingo';
type PaymentStatus = 'Pago' | 'Parcialmente Pago' | 'Não Pago';

interface Passenger {
  id: string;
  name: string;
  cpf: string;
  documentType?: 'CPF' | 'RG';
  congregation: string;
  days: Day[];
  paymentMethod: string;
  status: PaymentStatus;
  amount?: number;
  paidAmount?: number;
}

const DAYS: Day[] = ['Sexta-feira', 'Sábado', 'Domingo'];
const PAYMENT_METHODS = ['Pix', 'Dinheiro', 'Cartão'];

export default function App() {
  const [passengers, setPassengers] = useState<Passenger[]>(() => {
    const saved = localStorage.getItem('passengers');
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    // Migration: if old data has 'day' instead of 'days' or 'isPaid' instead of 'status'
    return parsed.map((p: any) => ({
      ...p,
      days: p.days || (p.day ? [p.day] : []),
      status: p.status || (p.isPaid ? 'Pago' : 'Não Pago'),
      congregation: p.congregation || '',
      cpf: p.cpf || '',
      documentType: p.documentType || 'CPF'
    }));
  });

  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [documentType, setDocumentType] = useState<'CPF' | 'RG'>('CPF');
  const [congregation, setCongregation] = useState('');
  const [ticketValue, setTicketValue] = useState('');
  const [paidValue, setPaidValue] = useState('');
  const [selectedDays, setSelectedDays] = useState<Day[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('Pix');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<Day | 'Todos'>('Todos');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
      setIsStandalone(!!isStandaloneMode);
    };
    
    checkStandalone();
    window.addEventListener('resize', checkStandalone);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('resize', checkStandalone);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowInstallGuide(true);
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const calculateStatus = (paid: number, total: number): PaymentStatus => {
    if (total <= 0) return 'Não Pago';
    if (paid >= total) return 'Pago';
    if (paid > 0) return 'Parcialmente Pago';
    return 'Não Pago';
  };

  useEffect(() => {
    localStorage.setItem('passengers', JSON.stringify(passengers));
  }, [passengers]);

  const toggleDaySelection = (day: Day) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedDays.length === 0) return;

    if (editingId) {
      const total = parseFloat(ticketValue) || 0;
      const paid = parseFloat(paidValue) || 0;
      
      setPassengers(passengers.map(p => 
        p.id === editingId 
          ? { 
              ...p, 
              name: name.trim(), 
              cpf: cpf.trim(),
              documentType,
              congregation: congregation.trim(),
              days: selectedDays, 
              paymentMethod, 
              amount: total,
              paidAmount: paid,
              status: calculateStatus(paid, total)
            } 
          : p
      ));
      setEditingId(null);
    } else {
      const total = parseFloat(ticketValue) || 0;
      const paid = parseFloat(paidValue) || 0;
      
      const newPassenger: Passenger = {
        id: crypto.randomUUID(),
        name: name.trim(),
        cpf: cpf.trim(),
        documentType,
        congregation: congregation.trim(),
        days: selectedDays,
        paymentMethod,
        status: calculateStatus(paid, total),
        amount: total,
        paidAmount: paid,
      };
      setPassengers([newPassenger, ...passengers]);
    }

    setName('');
    setCpf('');
    setDocumentType('CPF');
    setCongregation('');
    setTicketValue('');
    setPaidValue('');
    setSelectedDays([]);
    setPaymentMethod('Pix');
  };

  const startEditing = (passenger: Passenger) => {
    if (!passenger) return;
    
    setEditingId(passenger.id);
    setName(passenger.name);
    setCpf(passenger.cpf || '');
    setDocumentType(passenger.documentType || 'CPF');
    setCongregation(passenger.congregation || '');
    setTicketValue(passenger.amount?.toString() || '');
    setPaidValue(passenger.paidAmount?.toString() || '');
    setSelectedDays(passenger.days);
    setPaymentMethod(passenger.paymentMethod);
    
    // Improved scrolling for PWA/Mobile
    // Removed auto-focus and smooth scrolling to prevent layout glitches on Android
    setTimeout(() => {
      // Try standard scrollIntoView first
      formRef.current?.scrollIntoView({ block: 'start' });
      
      // Fallback/Reinforcement: manually scroll to top if needed (especially for mobile)
      // This helps if the sticky header is interfering or if scrollIntoView is ignored
      const yOffset = -100; // Offset for sticky header
      const element = formRef.current;
      if (element) {
        const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y });
      }
    }, 100);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setName('');
    setCpf('');
    setDocumentType('CPF');
    setCongregation('');
    setTicketValue('');
    setPaidValue('');
    setSelectedDays([]);
    setPaymentMethod('Pix');
  };

  const toggleStatus = (id: string) => {
    setPassengers(passengers.map(p => {
      if (p.id === id) {
        let nextStatus: PaymentStatus;
        let nextPaidAmount = p.paidAmount || 0;

        if (p.status === 'Não Pago') {
          nextStatus = 'Parcialmente Pago';
          // If toggling to partial, maybe set half or keep current
        } else if (p.status === 'Parcialmente Pago') {
          nextStatus = 'Pago';
          nextPaidAmount = p.amount || 0;
        } else {
          nextStatus = 'Não Pago';
          nextPaidAmount = 0;
        }

        return { ...p, status: nextStatus, paidAmount: nextPaidAmount };
      }
      return p;
    }));
  };

  const deletePassenger = (id: string) => {
    if (confirm('Tem certeza que deseja remover este passageiro?')) {
      setPassengers(passengers.filter(p => p.id !== id));
    }
  };

  const clearAll = () => {
    if (confirm('ATENÇÃO: Isso irá apagar TODOS os passageiros da lista. Deseja continuar?')) {
      setPassengers([]);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPassengers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPassengers.map(p => p.id));
    }
  };

  const deleteSelected = () => {
    if (confirm(`Deseja remover os ${selectedIds.length} passageiros selecionados?`)) {
      setPassengers(passengers.filter(p => !selectedIds.includes(p.id)));
      setSelectedIds([]);
    }
  };

  const markSelectedStatus = (status: PaymentStatus) => {
    setPassengers(passengers.map(p => {
      if (selectedIds.includes(p.id)) {
        let nextPaidAmount = p.paidAmount || 0;
        if (status === 'Pago') nextPaidAmount = p.amount || 0;
        if (status === 'Não Pago') nextPaidAmount = 0;
        return { ...p, status, paidAmount: nextPaidAmount };
      }
      return p;
    }));
    setSelectedIds([]);
  };

  const filteredPassengers = passengers.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(searchLower) || 
      p.congregation.toLowerCase().includes(searchLower) ||
      p.cpf.toLowerCase().includes(searchLower);
    const matchesTab = activeTab === 'Todos' || p.days.includes(activeTab as Day);
    return matchesSearch && matchesTab;
  });

  const generatePDF = async () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Relatório de Passageiros', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);
    
    // Prepare table data
    const tableData = filteredPassengers.map(p => [
      p.name,
      `${p.documentType || 'CPF'}: ${p.cpf || '-'}`,
      p.congregation || '-',
      p.days.join(', ')
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Nome', 'Documento', 'Congregação', 'Dias']],
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
      styles: { fontSize: 10 },
      body: tableData,
    });

    // Add summary
    const finalY = (doc as any).lastAutoTable.finalY || 40;
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.text(`Total de Passageiros: ${filteredPassengers.length}`, 14, finalY + 10);
    doc.text(`Valor Total Geral: R$ ${stats.totalAmountExpected.toFixed(2)}`, 14, finalY + 16);

    const fileName = `relatorio-passageiros-${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Try to use Web Share API for direct WhatsApp sharing
    const pdfBlob = doc.output('blob');
    const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Relatório de Passageiros',
          text: 'Segue o relatório de passageiros.',
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
        doc.save(fileName);
      }
    } else {
      // Fallback to download
      doc.save(fileName);
      alert('Relatório PDF gerado! O arquivo foi baixado. Agora você pode anexá-lo no WhatsApp.');
    }
  };

  const copyTextReport = () => {
    const reportHeader = `📋 *RELATÓRIO DE PASSAGEIROS*\n_Gerado em: ${new Date().toLocaleString('pt-BR')}_\n\n`;
    const reportBody = filteredPassengers.map((p, i) => {
      return `${i + 1}. *${p.name}*\n   ${p.documentType || 'CPF'}: ${p.cpf || 'Não informado'}\n   Dias: ${p.days.join(', ')}\n`;
    }).join('\n');
    
    const summary = `\n---\n*RESUMO*\nTotal de Passageiros: ${filteredPassengers.length}\nValor Total: R$ ${stats.totalAmountExpected.toFixed(2)}`;
    
    const fullReport = reportHeader + reportBody + summary;
    
    navigator.clipboard.writeText(fullReport).then(() => {
      alert('Relatório copiado para a área de transferência! Agora basta colar no WhatsApp.');
    }).catch(err => {
      console.error('Erro ao copiar: ', err);
    });
  };

  const formatDocument = (value: string, type: 'CPF' | 'RG') => {
    if (type === 'RG') {
      // RG format is less strict, usually just numbers, maybe dashes/dots
      // Let's just allow alphanumeric and some symbols, max 14 chars
      return value.replace(/[^a-zA-Z0-9.-]/g, '').slice(0, 14);
    }
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const stats = {
    total: passengers.length,
    paid: passengers.filter(p => p.status === 'Pago').length,
    partial: passengers.filter(p => p.status === 'Parcialmente Pago').length,
    pending: passengers.filter(p => p.status === 'Não Pago').length,
    totalAmountPaid: passengers.reduce((acc, p) => acc + (p.paidAmount || 0), 0),
    totalAmountExpected: passengers.reduce((acc, p) => acc + (p.amount || 0), 0),
    totalAmountPending: passengers.reduce((acc, p) => acc + (Math.max(0, (p.amount || 0) - (p.paidAmount || 0))), 0),
    dailyTotals: DAYS.reduce((acc, day) => {
      acc[day] = passengers
        .filter(p => p.days.includes(day))
        .reduce((sum, p) => sum + ((p.amount || 0) / (p.days.length || 1)), 0);
      return acc;
    }, {} as Record<Day, number>),
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Header */}
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
              {!isStandalone && (
                <button
                  onClick={handleInstallClick}
                  className="sm:hidden ml-2 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors animate-pulse flex items-center gap-2"
                  title="Instalar App"
                >
                  <Download size={18} />
                  <span className="text-xs font-bold">Instalar</span>
                </button>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-500">
              {!isStandalone && (
                <button
                  onClick={handleInstallClick}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100 font-bold"
                >
                  <Download size={16} />
                  Instalar App
                </button>
              )}
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Total Recebido
                </div>
                <span className="text-xs text-emerald-600 font-bold">R$ {stats.totalAmountPaid.toFixed(2)}</span>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Falta Receber
                </div>
                <span className="text-xs text-amber-600 font-bold">R$ {stats.totalAmountPending.toFixed(2)}</span>
              </div>
              <div className="flex flex-col items-end border-l border-slate-200 pl-6">
                <div className="flex items-center gap-1 text-slate-400">
                  Total Geral
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-slate-600 font-bold">R$ {stats.totalAmountExpected.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400 font-medium">3 dias: R$ {(stats.totalAmountExpected / 3).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards Mobile */}
        <div className="grid grid-cols-3 gap-2 sm:hidden">
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm text-center">
            <p className="text-[10px] text-slate-500 mb-0.5">Total</p>
            <p className="text-sm font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm text-center">
            <p className="text-[10px] text-slate-500 mb-0.5">Pagos</p>
            <p className="text-sm font-bold text-emerald-600">{stats.paid}</p>
          </div>
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm text-center">
            <p className="text-[10px] text-slate-500 mb-0.5">Parc.</p>
            <p className="text-sm font-bold text-amber-600">{stats.partial}</p>
          </div>
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm text-center">
            <p className="text-[10px] text-slate-500 mb-0.5">Pendentes</p>
            <p className="text-sm font-bold text-rose-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm text-center">
            <p className="text-[10px] text-slate-500 mb-0.5">Total já pago</p>
            <p className="text-[10px] font-bold text-emerald-600">R$ {stats.totalAmountPaid.toFixed(2)}</p>
          </div>
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm text-center">
            <p className="text-[10px] text-slate-500 mb-0.5">Falta</p>
            <p className="text-[10px] font-bold text-rose-600">R$ {stats.totalAmountPending.toFixed(2)}</p>
          </div>
        </div>

        {/* Add/Edit Passenger Form */}
        <section ref={formRef} className={`glass-card rounded-[2.5rem] overflow-hidden transition-all relative scroll-mt-32 ${editingId ? 'ring-2 ring-emerald-500' : ''}`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <div className={`flex items-center gap-2 ${editingId ? 'hidden' : 'flex'}`}>
                <UserPlus size={16} />
                <span>Novo Passageiro</span>
              </div>
              <div className={`flex items-center gap-2 ${editingId ? 'flex' : 'hidden'}`}>
                <Pencil size={16} className="text-emerald-600" />
                <span>Editar Passageiro</span>
              </div>
            </h2>
            {editingId && (
              <button 
                onClick={cancelEditing}
                className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1"
              >
                <X size={14} />
                Cancelar Edição
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            <div className="md:col-span-1 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Nome do Passageiro</label>
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="words"
                spellCheck="false"
                placeholder="Ex: João Silva"
                className="w-full px-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-2xl transition-all outline-none"
              />
            </div>

            <div className="md:col-span-1 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Documento</label>
                <div className="flex bg-slate-200 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setDocumentType('CPF');
                      setCpf('');
                    }}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                      documentType === 'CPF' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    CPF
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDocumentType('RG');
                      setCpf('');
                    }}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                      documentType === 'RG' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    RG
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(formatDocument(e.target.value, documentType))}
                placeholder={documentType === 'CPF' ? "000.000.000-00" : "RG / Identidade"}
                maxLength={14}
                className="w-full px-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-2xl transition-all outline-none"
              />
            </div>

            <div className="md:col-span-1 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Congregação</label>
              <input
                type="text"
                name="congregation_field_v2"
                id="congregation_input"
                value={congregation}
                onChange={(e) => setCongregation(e.target.value)}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                data-form-type="other"
                placeholder="Ex: Central"
                className="w-full px-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-2xl transition-all outline-none"
              />
            </div>

            <div className="md:col-span-1 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Valor Total (R$)</label>
              <input
                type="number"
                step="0.01"
                value={ticketValue}
                onChange={(e) => setTicketValue(e.target.value)}
                placeholder="0,00"
                className="w-full px-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-2xl transition-all outline-none"
              />
            </div>

            <div className="md:col-span-1 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Valor Pago (R$)</label>
              <input
                type="number"
                step="0.01"
                value={paidValue}
                onChange={(e) => setPaidValue(e.target.value)}
                placeholder="0,00"
                className="w-full px-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-2xl transition-all outline-none"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Pagamento</label>
              <div className="flex gap-2">
                {PAYMENT_METHODS.map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all border ${
                      paymentMethod === method 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                        : 'bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-4 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Dias de Viagem (Selecione um ou mais)</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDaySelection(day)}
                    className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all border flex items-center gap-2 ${
                      selectedDays.includes(day)
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                        : 'bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200'
                    }`}
                  >
                    <Calendar size={16} />
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-4 mt-2">
              <button
                type="submit"
                disabled={!name.trim() || selectedDays.length === 0}
                className={`w-full text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed ${editingId ? 'hidden' : 'flex'}`}
              >
                <UserPlus size={20} />
                <span>Adicionar Passageiro</span>
              </button>

              <button
                type="submit"
                disabled={!name.trim() || selectedDays.length === 0}
                className={`w-full text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 shadow-amber-200 disabled:opacity-50 disabled:cursor-not-allowed ${editingId ? 'flex' : 'hidden'}`}
              >
                <Pencil size={20} />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </form>
        </section>

        {/* Bulk Actions Bar */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-24 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-md z-50"
            >
              <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-2xl flex items-center justify-between gap-4 border border-slate-700">
                <div className="flex items-center gap-3 ml-2">
                  <span className="bg-emerald-600 text-[10px] font-black px-2 py-1 rounded-lg">
                    {selectedIds.length}
                  </span>
                  <span className="text-sm font-bold">Selecionados</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => markSelectedStatus('Pago')}
                    className="p-2 hover:bg-slate-800 rounded-xl text-emerald-400 transition-colors"
                    title="Marcar como pago"
                  >
                    <CheckCircle2 size={20} />
                  </button>
                  <button
                    onClick={() => markSelectedStatus('Parcialmente Pago')}
                    className="p-2 hover:bg-slate-800 rounded-xl text-amber-400 transition-colors"
                    title="Marcar como parcialmente pago"
                  >
                    <TrendingUp size={20} />
                  </button>
                  <button
                    onClick={() => markSelectedStatus('Não Pago')}
                    className="p-2 hover:bg-slate-800 rounded-xl text-amber-400 transition-colors"
                    title="Marcar como não pago"
                  >
                    <Circle size={20} />
                  </button>
                  <button
                    onClick={deleteSelected}
                    className="p-2 hover:bg-slate-800 rounded-xl text-rose-400 transition-colors"
                    title="Excluir selecionados"
                  >
                    <Trash2 size={20} />
                  </button>
                  <div className="w-px h-6 bg-slate-700 mx-1"></div>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List Controls */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex bg-white p-1 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar">
                {['Todos', ...DAYS].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                      activeTab === tab 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {filteredPassengers.length > 0 && (
                <button
                  onClick={toggleSelectAll}
                  className={`p-3 rounded-2xl border transition-all flex items-center gap-2 font-bold text-xs whitespace-nowrap ${
                    selectedIds.length === filteredPassengers.length && filteredPassengers.length > 0
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {selectedIds.length === filteredPassengers.length && filteredPassengers.length > 0 ? 'Desmarcar Tudo' : 'Selecionar Tudo'}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64 min-w-[200px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar passageiro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={generatePDF}
                  className="px-4 py-3 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl transition-all flex items-center gap-2 font-bold text-sm shadow-md shadow-slate-100"
                  title="Gerar Relatório PDF"
                >
                  <FileText size={18} />
                  <span className="hidden sm:inline">PDF</span>
                </button>
                <button
                  onClick={copyTextReport}
                  className="px-4 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl transition-all flex items-center gap-2 font-bold text-sm shadow-md shadow-emerald-100"
                  title="Copiar Relatório para WhatsApp"
                >
                  <Share2 size={18} />
                  <span className="hidden sm:inline">Copiar Texto</span>
                </button>
              </div>
              {passengers.length > 0 && (
                <div className="flex gap-2">
                  {activeTab !== 'Todos' && passengers.some(p => p.days.includes(activeTab as Day)) && (
                    <button
                      onClick={() => {
                        if (confirm(`Deseja remover TODOS os passageiros de ${activeTab}?`)) {
                          setPassengers(passengers.filter(p => !p.days.includes(activeTab as Day)));
                        }
                      }}
                      className="px-4 py-3 bg-white border border-amber-200 text-amber-600 hover:bg-amber-50 rounded-2xl transition-all flex items-center gap-2 font-bold text-sm"
                      title={`Limpar passageiros de ${activeTab}`}
                    >
                      <Trash2 size={18} />
                      <span className="hidden sm:inline">Limpar {activeTab}</span>
                    </button>
                  )}
                  <button
                    onClick={clearAll}
                    className="px-4 py-3 bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all flex items-center gap-2 font-bold text-sm"
                    title="Limpar toda a lista"
                  >
                    <Trash2 size={18} />
                    <span className="hidden sm:inline">Limpar Tudo</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Daily Revenue Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DAYS.map(day => (
              <div key={day} className={`p-4 rounded-2xl border transition-all ${activeTab === day ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{day}</span>
                  <Calendar size={14} className="text-emerald-500" />
                </div>
                <p className="text-lg font-bold text-slate-900">R$ {stats.dailyTotals[day].toFixed(2)}</p>
                <p className="text-[10px] text-slate-500 font-medium">Soma proporcional do dia</p>
              </div>
            ))}
          </div>
        </div>

        {/* Passenger List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredPassengers.length > 0 ? (
              filteredPassengers.map((passenger) => (
                <motion.div
                  key={passenger.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`group bg-white p-4 sm:p-6 rounded-3xl border shadow-sm flex items-center justify-between gap-4 transition-all hover:shadow-md ${
                    passenger.status === 'Pago' ? 'border-l-4 border-l-emerald-500' : 
                    passenger.status === 'Parcialmente Pago' ? 'border-l-4 border-l-amber-500' :
                    'border-l-4 border-l-rose-500'
                  } ${selectedIds.includes(passenger.id) ? 'ring-2 ring-slate-900 border-slate-900' : 'border-slate-200'}`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(passenger.id)}
                        onChange={() => toggleSelection(passenger.id)}
                        className="w-5 h-5 rounded-lg border-slate-300 text-slate-900 focus:ring-slate-900 transition-all cursor-pointer"
                      />
                      <button
                        onClick={() => toggleStatus(passenger.id)}
                        className={`flex-shrink-0 transition-colors ${
                          passenger.status === 'Pago' ? 'text-emerald-500' : 
                          passenger.status === 'Parcialmente Pago' ? 'text-amber-500' :
                          'text-slate-300 hover:text-slate-400'
                        }`}
                        title={`Status: ${passenger.status} (Clique para alterar)`}
                      >
                        {passenger.status === 'Pago' ? <CheckCircle2 size={32} /> : 
                         passenger.status === 'Parcialmente Pago' ? <TrendingUp size={32} /> :
                         <Circle size={32} />}
                      </button>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-lg font-bold truncate ${passenger.status === 'Pago' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                          {passenger.name}
                        </h3>
                        {passenger.congregation && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-wider" translate="no">
                            {passenger.congregation}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        <div className="flex flex-wrap gap-1">
                          {passenger.days.map(day => (
                            <span key={day} className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase">
                              <Calendar size={10} className="text-emerald-500" />
                              {day}
                            </span>
                          ))}
                        </div>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase ml-2">
                          <CreditCard size={14} className="text-emerald-500" />
                          {passenger.paymentMethod}
                        </span>
                        {passenger.cpf && (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase ml-2">
                            {passenger.documentType || 'CPF'}: {passenger.cpf}
                          </span>
                        )}
                        {passenger.amount !== undefined && (
                          <div className="flex items-center gap-2 ml-2">
                            <span className="text-xs font-bold text-slate-400 uppercase">
                              R$ {passenger.amount.toFixed(2)}
                            </span>
                            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase">
                              Pago: R$ {(passenger.paidAmount || 0).toFixed(2)}
                            </span>
                            {(passenger.amount - (passenger.paidAmount || 0)) > 0 && (
                              <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md">
                                Falta: R$ {(passenger.amount - (passenger.paidAmount || 0)).toFixed(2)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className={`hidden sm:block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      passenger.status === 'Pago' ? 'bg-emerald-100 text-emerald-700' : 
                      passenger.status === 'Parcialmente Pago' ? 'bg-amber-100 text-amber-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {passenger.status}
                    </div>
                    <button
                      onClick={() => startEditing(passenger)}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all flex items-center gap-1"
                      title="Editar passageiro"
                    >
                      <Pencil size={20} />
                      <span className="hidden lg:inline text-xs font-bold">Editar</span>
                    </button>
                    <button
                      onClick={() => deletePassenger(passenger.id)}
                      className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all flex items-center gap-1"
                      title="Remover passageiro"
                    >
                      <Trash2 size={20} />
                      <span className="hidden lg:inline text-xs font-bold">Remover</span>
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300"
              >
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-slate-300" size={32} />
                </div>
                <h3 className="text-slate-900 font-bold text-lg">Nenhum passageiro encontrado</h3>
                <p className="text-slate-500 text-sm mt-1">Comece adicionando um novo passageiro acima.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Stats Mobile Floating */}
      <div className="fixed bottom-6 left-4 right-4 sm:hidden">
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            <div className="text-center min-w-[40px]">
              <p className="text-[8px] text-slate-400 uppercase font-bold">Total</p>
              <p className="text-xs font-bold">{stats.total}</p>
            </div>
            <div className="w-px h-6 bg-slate-800"></div>
            <div className="text-center min-w-[60px]">
              <p className="text-[8px] text-emerald-400 uppercase font-bold">Recebido</p>
              <p className="text-xs font-bold">R${stats.totalAmountPaid.toFixed(0)}</p>
            </div>
            <div className="w-px h-6 bg-slate-800"></div>
            <div className="text-center min-w-[60px]">
              <p className="text-[8px] text-amber-400 uppercase font-bold">Falta</p>
              <p className="text-xs font-bold">R${stats.totalAmountPending.toFixed(0)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isInstallable && (
              <button 
                onClick={handleInstallClick}
                className="bg-emerald-600 p-2 rounded-xl flex-shrink-0 animate-pulse"
                title="Instalar App"
              >
                <Share2 size={18} />
              </button>
            )}
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-slate-800 p-2 rounded-xl flex-shrink-0"
            >
              <UserPlus size={18} />
            </button>
          </div>
        </div>
      </div>
      <InstallGuide isOpen={showInstallGuide} onClose={() => setShowInstallGuide(false)} />
    </div>
  );
}
