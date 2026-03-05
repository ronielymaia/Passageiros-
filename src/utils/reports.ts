import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Passenger } from '../types';

export const generatePDF = async (
  filteredPassengers: Passenger[], 
  stats: any, 
  notify?: (msg: string, type: 'success' | 'error' | 'info') => void
) => {
  try {
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

    // Try both ways to call autoTable as versions vary
    if (typeof autoTable === 'function') {
      autoTable(doc, {
        startY: 35,
        head: [['Nome', 'Documento', 'Congregação', 'Dias']],
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
        styles: { fontSize: 10 },
        body: tableData,
      });
    } else if ((doc as any).autoTable) {
      (doc as any).autoTable({
        startY: 35,
        head: [['Nome', 'Documento', 'Congregação', 'Dias']],
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
        styles: { fontSize: 10 },
        body: tableData,
      });
    }

    // Add summary
    let finalY = 40;
    try {
      finalY = (doc as any).lastAutoTable?.finalY || 40;
    } catch (e) {
      console.warn('Could not get lastAutoTable Y position', e);
    }
    
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.text(`Total de Passageiros: ${filteredPassengers.length}`, 14, finalY + 10);
    doc.text(`Valor Total Geral: R$ ${stats.totalAmountExpected.toFixed(2)}`, 14, finalY + 16);

    const fileName = `relatorio-passageiros-${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Try to use Web Share API for direct WhatsApp sharing
    const pdfBlob = doc.output('blob');
    const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

    // More robust share check
    const canShareFiles = navigator.canShare && navigator.canShare({ files: [file] });

    if (navigator.share && canShareFiles) {
      try {
        await navigator.share({
          files: [file],
          title: 'Relatório de Passageiros',
          text: 'Segue o relatório de passageiros.',
        });
        return; // Success
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Erro ao compartilhar arquivo:', error);
        } else {
          return; // User cancelled
        }
      }
    }

    // Fallback to download using Blob URL (more stable in WebViews)
    try {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      if (notify) {
        notify('PDF gerado! Verifique seus arquivos ou use "Copiar Texto" se o download falhar.', 'success');
      }
    } catch (error) {
      console.error('Erro no fallback de download:', error);
      // Last resort: simple save
      doc.save(fileName);
    }
  } catch (error) {
    console.error('Erro fatal na geração do PDF:', error);
    if (notify) {
      notify('Não foi possível gerar o PDF. Use a opção "Copiar Texto".', 'error');
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
  
  const summary = `\n---\n*RESUMO*\nTotal de Passageiros: ${filteredPassengers.length}\nValor Total: R$ ${stats.totalAmountExpected.toFixed(2)}`;
  
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

