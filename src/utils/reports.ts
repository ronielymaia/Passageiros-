import * as XLSX from 'xlsx';
import { Passenger } from '../types';

export const generateExcel = (
  filteredPassengers: Passenger[], 
  stats: any, 
  notify?: (msg: string, type: 'success' | 'error' | 'info') => void
) => {
  try {
    // Prepare data for Excel
    const header = ['Nome', 'Documento', 'Congregação', 'Dias'];
    
    const data = filteredPassengers.map(p => [
      p.name,
      `${p.documentType || 'CPF'}: ${p.cpf || '-'}`,
      p.congregation || '-',
      p.days.join(', ')
    ]);

    // Add summary rows
    const emptyRow = ['', '', '', ''];
    const summaryHeader = ['', '', 'RESUMO', ''];
    const summaryCount = ['', '', 'Passageiros', filteredPassengers.length];

    const wsData = [
      [`Relatório de Passageiros - ${new Date().toLocaleString('pt-BR')}`],
      [],
      header,
      ...data,
      emptyRow,
      summaryHeader,
      summaryCount
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    const wscols = [
      { wch: 30 }, // Nome
      { wch: 25 }, // Documento
      { wch: 25 }, // Congregação
      { wch: 40 }, // Dias
    ];
    ws['!cols'] = wscols;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Passageiros");

    // Generate Excel file
    const fileName = `relatorio-passageiros-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

    if (notify) {
      notify('Excel gerado com sucesso!', 'success');
    }

  } catch (error) {
    console.error('Erro ao gerar Excel:', error);
    if (notify) {
      notify('Erro ao gerar o arquivo Excel.', 'error');
    }
  }
};

export const copyTextReport = (
  filteredPassengers: Passenger[], 
  stats: any,
  notify?: (msg: string, type: 'success' | 'error' | 'info') => void
) => {
  const reportHeader = `📋 *RELATÓRIO DE PASSAGEIROS*\n_Gerado em: ${new Date().toLocaleString('pt-BR')}_\n\n`;
  const reportBody = filteredPassengers.map((p, i) => {
    return `${i + 1}. *${p.name}*\n   ${p.documentType || 'CPF'}: ${p.cpf || 'Não informado'}\n   Dias: ${p.days.join(', ')}\n`;
  }).join('\n');
  
  const summary = `\n---\n*RESUMO*\nTotal de Passageiros: ${filteredPassengers.length}`;
  
  const fullReport = reportHeader + reportBody + summary;
  
  // Try to share via Web Share API first
  if (navigator.share) {
    navigator.share({
      title: 'Relatório de Passageiros',
      text: fullReport
    }).catch(err => {
      console.error('Erro ao compartilhar texto:', err);
      // Fallback to clipboard
      copyToClipboard(fullReport, notify);
    });
  } else {
    copyToClipboard(fullReport, notify);
  }
};

const copyToClipboard = (text: string, notify?: (msg: string, type: 'success' | 'error' | 'info') => void) => {
  navigator.clipboard.writeText(text).then(() => {
    if (notify) {
      notify('Relatório copiado! Agora cole no WhatsApp.', 'success');
    } else {
      alert('Relatório copiado para a área de transferência! Agora basta colar no WhatsApp.');
    }
  }).catch(err => {
    console.error('Erro ao copiar: ', err);
    if (notify) {
      notify('Erro ao copiar. Tente selecionar o texto manualmente.', 'error');
    } else {
      alert('Não foi possível copiar automaticamente. Por favor, selecione o texto e copie manualmente.');
    }
  });
};

