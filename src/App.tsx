import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  TrendingUp,
  Search,
  FileSpreadsheet,
  FileText,
  Share2,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Day, PaymentStatus, Passenger, DAYS, PAYMENT_METHODS } from './types';
import { formatDocument, calculateStatus } from './utils/formatters';
import { generateExcel, copyTextReport, generatePDF } from './utils/reports';
import { Header } from './components/Header';
import { StatsSummary } from './components/StatsSummary';
import { HelpModal } from './components/HelpModal';
import { ConfirmModal } from './components/ConfirmModal';
import { Toast, ToastType } from './components/Toast';

export default function App() {
  const [passengers, setPassengers] = useState<Passenger[]>(() => {
    try {
      const saved = localStorage.getItem('passengers');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return parsed.map((p: any) => ({
        ...p,
        days: p.days || (p.day ? [p.day] : []),
        status: p.status || (p.isPaid ? 'Pago' : 'Não Pago'),
        congregation: p.congregation || '',
        cpf: p.cpf || '',
        documentType: p.documentType || 'CPF'
      }));
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
      return [];
    }
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
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  // Custom Dialog States
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  });
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDanger?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDanger: false
  });
  
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const askConfirm = (title: string, message: string, onConfirm: () => void, isDanger = false) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      },
      isDanger
    });
  };
  
  const formRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('passengers', JSON.stringify(passengers));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        showToast('Memória cheia! Não foi possível salvar novos dados.', 'error');
      }
    }
  }, [passengers]);

  const toggleDaySelection = (day: Day) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedDays.length === 0) return;

    const total = parseFloat(ticketValue) || 0;
    const paid = parseFloat(paidValue) || 0;

    if (editingId) {
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
      showToast('Passageiro atualizado com sucesso!');
    } else {
      const newPassenger: Passenger = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
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
      showToast('Passageiro adicionado à lista!');
    }

    resetForm();
  };

  const resetForm = () => {
    setName('');
    setCpf('');
    setDocumentType('CPF');
    setCongregation('');
    setTicketValue('');
    setPaidValue('');
    setSelectedDays([]);
    setPaymentMethod('Pix');
    setEditingId(null);
  };

  const startEditing = (passenger: Passenger) => {
    setEditingId(passenger.id);
    setName(passenger.name);
    setCpf(passenger.cpf || '');
    setDocumentType(passenger.documentType || 'CPF');
    setCongregation(passenger.congregation || '');
    setTicketValue(passenger.amount?.toString() || '');
    setPaidValue(passenger.paidAmount?.toString() || '');
    setSelectedDays(passenger.days);
    setPaymentMethod(passenger.paymentMethod);
    
    setTimeout(() => {
      formRef.current?.scrollIntoView({ block: 'start' });
      const yOffset = -100;
      const element = formRef.current;
      if (element) {
        const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y });
      }
    }, 100);
  };

  const toggleStatus = (id: string) => {
    setPassengers(passengers.map(p => {
      if (p.id === id) {
        let nextStatus: PaymentStatus;
        let nextPaidAmount = p.paidAmount || 0;

        if (p.status === 'Não Pago') {
          nextStatus = 'Parcialmente Pago';
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
    askConfirm(
      'Remover Passageiro',
      'Tem certeza que deseja remover este passageiro da lista?',
      () => {
        setPassengers(passengers.filter(p => p.id !== id));
        showToast('Passageiro removido.', 'info');
      },
      true
    );
  };

  const clearAll = () => {
    askConfirm(
      'Limpar Tudo',
      'ATENÇÃO: Isso irá apagar TODOS os passageiros da lista. Esta ação não pode ser desfeita.',
      () => {
        setPassengers([]);
        showToast('Lista limpa com sucesso.', 'info');
      },
      true
    );
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
    askConfirm(
      'Remover Selecionados',
      `Deseja remover os ${selectedIds.length} passageiros selecionados?`,
      () => {
        setPassengers(passengers.filter(p => !selectedIds.includes(p.id)));
        setSelectedIds([]);
        showToast(`${selectedIds.length} passageiros removidos.`, 'info');
      },
      true
    );
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

  const filteredPassengers = useMemo(() => {
    return passengers.filter(p => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        p.name.toLowerCase().includes(searchLower) || 
        p.congregation.toLowerCase().includes(searchLower) ||
        p.cpf.toLowerCase().includes(searchLower);
      const matchesTab = activeTab === 'Todos' || p.days.includes(activeTab as Day);
      return matchesSearch && matchesTab;
    });
  }, [passengers, searchTerm, activeTab]);

  const stats = useMemo(() => ({
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
  }), [passengers]);

  const handleGenerateExcel = async () => {
    setIsGeneratingExcel(true);
    try {
      await generateExcel(filteredPassengers, stats, (msg, type) => showToast(msg, type));
    } catch (error) {
      showToast('Erro ao gerar Excel.', 'error');
    } finally {
      setIsGeneratingExcel(false);
    }
  };

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await generatePDF(filteredPassengers, stats, (msg, type) => showToast(msg, type));
    } catch (error) {
      showToast('Erro ao gerar PDF.', 'error');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-32 pt-[env(safe-area-inset-top)]">
      <Header 
        totalPaid={stats.totalAmountPaid} 
        totalPending={stats.totalAmountPending} 
        totalExpected={stats.totalAmountExpected} 
      />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <StatsSummary 
          total={stats.total}
          paid={stats.paid}
          partial={stats.partial}
          pending={stats.pending}
          totalAmountPaid={stats.totalAmountPaid}
          totalAmountPending={stats.totalAmountPending}
        />

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
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsHelpOpen(true)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"
              >
                <HelpCircle size={14} />
                Ajuda
              </button>
              {editingId && (
                <button 
                  onClick={resetForm}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1"
                >
                  <X size={14} />
                  Cancelar
                </button>
              )}
            </div>
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
                placeholder="Ex: João Silva"
                className="w-full px-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-2xl transition-all outline-none"
              />
            </div>

            <div className="md:col-span-1 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Documento</label>
                <div className="flex bg-slate-200 rounded-lg p-0.5">
                  {(['CPF', 'RG'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => { setDocumentType(type); setCpf(''); }}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                        documentType === type ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
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
                value={congregation}
                onChange={(e) => setCongregation(e.target.value)}
                placeholder="Ex: Central"
                className="w-full px-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-2xl transition-all outline-none"
              />
            </div>

            <div className="md:col-span-1 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Valor Total (R$)</label>
              <input
                type="number"
                inputMode="decimal"
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
                inputMode="decimal"
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
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Dias de Viagem</label>
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
                className={`w-full text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${editingId ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'}`}
              >
                {editingId ? <Pencil size={20} /> : <UserPlus size={20} />}
                <span>{editingId ? 'Salvar Alterações' : 'Adicionar Passageiro'}</span>
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
                  <span className="bg-emerald-600 text-[10px] font-black px-2 py-1 rounded-lg">{selectedIds.length}</span>
                  <span className="text-sm font-bold">Selecionados</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => markSelectedStatus('Pago')} className="p-2 hover:bg-slate-800 rounded-xl text-emerald-400 transition-colors"><CheckCircle2 size={20} /></button>
                  <button onClick={() => markSelectedStatus('Parcialmente Pago')} className="p-2 hover:bg-slate-800 rounded-xl text-amber-400 transition-colors"><TrendingUp size={20} /></button>
                  <button onClick={() => markSelectedStatus('Não Pago')} className="p-2 hover:bg-slate-800 rounded-xl text-amber-400 transition-colors"><Circle size={20} /></button>
                  <button onClick={deleteSelected} className="p-2 hover:bg-slate-800 rounded-xl text-rose-400 transition-colors"><Trash2 size={20} /></button>
                  <div className="w-px h-6 bg-slate-700 mx-1"></div>
                  <button onClick={() => setSelectedIds([])} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"><X size={20} /></button>
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
                      activeTab === tab ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
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
                    selectedIds.length === filteredPassengers.length ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {selectedIds.length === filteredPassengers.length ? 'Desmarcar Tudo' : 'Selecionar Tudo'}
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
                  onClick={handleGenerateExcel} 
                  disabled={isGeneratingExcel}
                  className="px-4 py-3 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl transition-all flex items-center gap-2 font-bold text-sm shadow-md shadow-slate-100 disabled:opacity-50"
                >
                  <FileSpreadsheet size={18} />
                  <span className="hidden sm:inline">{isGeneratingExcel ? 'Gerando...' : 'Excel'}</span>
                </button>
                <button 
                  onClick={handleGeneratePDF} 
                  disabled={isGeneratingPDF}
                  className="px-4 py-3 bg-rose-600 text-white hover:bg-rose-700 rounded-2xl transition-all flex items-center gap-2 font-bold text-sm shadow-md shadow-rose-100 disabled:opacity-50"
                >
                  <FileText size={18} />
                  <span className="hidden sm:inline">{isGeneratingPDF ? 'Gerando...' : 'PDF'}</span>
                </button>
                <button onClick={() => copyTextReport(filteredPassengers, stats, (msg, type) => showToast(msg, type))} className="px-4 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl transition-all flex items-center gap-2 font-bold text-sm shadow-md shadow-emerald-100"><Share2 size={18} /><span className="hidden sm:inline">Copiar Texto</span></button>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 italic">
                Dica: Se o compartilhamento direto falhar, use "Copiar Texto" e cole no WhatsApp.
              </p>
              {passengers.length > 0 && (
                <button onClick={clearAll} className="px-4 py-3 bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all flex items-center gap-2 font-bold text-sm"><Trash2 size={18} /><span className="hidden sm:inline">Limpar Tudo</span></button>
              )}
            </div>
          </div>

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
                        {passenger.amount !== undefined && (
                          <div className="flex items-center gap-2 ml-2">
                            <span className="text-xs font-bold text-slate-400 uppercase">R$ {passenger.amount.toFixed(2)}</span>
                            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase">Pago: R$ {(passenger.paidAmount || 0).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2">
                    <button onClick={() => startEditing(passenger)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all flex items-center gap-1"><Pencil size={20} /><span className="hidden lg:inline text-xs font-bold">Editar</span></button>
                    <button onClick={() => deletePassenger(passenger.id)} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all flex items-center gap-1"><Trash2 size={20} /><span className="hidden lg:inline text-xs font-bold">Remover</span></button>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Users className="text-slate-300" size={32} /></div>
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
            <div className="text-center min-w-[40px]"><p className="text-[8px] text-slate-400 uppercase font-bold">Total</p><p className="text-xs font-bold">{stats.total}</p></div>
            <div className="w-px h-6 bg-slate-800"></div>
            <div className="text-center min-w-[60px]"><p className="text-[8px] text-emerald-400 uppercase font-bold">Recebido</p><p className="text-xs font-bold">R${stats.totalAmountPaid.toFixed(0)}</p></div>
            <div className="w-px h-6 bg-slate-800"></div>
            <div className="text-center min-w-[60px]"><p className="text-[8px] text-amber-400 uppercase font-bold">Falta</p><p className="text-xs font-bold">R${stats.totalAmountPending.toFixed(0)}</p></div>
          </div>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="bg-slate-800 p-2 rounded-xl flex-shrink-0"><UserPlus size={18} /></button>
        </div>
      </div>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        isDanger={confirmModal.isDanger}
      />

      <Toast 
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />
    </div>
  );
}
