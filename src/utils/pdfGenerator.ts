import jsPDF from 'jspdf';
import { DocumentItem } from '../types';
import { formatCurrency, formatDate } from './formatting';

export const generatePDF = (document: DocumentItem): void => {
  const pdf = new jsPDF();
  
  // Header
  pdf.setFontSize(24);
  pdf.setTextColor(30, 58, 138); // blue-900
  pdf.text('OrçaX', 20, 30);
  
  pdf.setFontSize(18);
  pdf.setTextColor(249, 115, 22); // orange-500
  pdf.text('X', 45, 30);
  
  // Document type
  pdf.setFontSize(18);
  pdf.setTextColor(0, 0, 0);
  const docType = document.type === 'recibo' ? 'RECIBO' : 'ORÇAMENTO';
  pdf.text(docType, 20, 50);
  
  // Date and document number
  pdf.setFontSize(12);
  pdf.text(`Data: ${formatDate(document.date)}`, 20, 65);
  pdf.text(`Documento: ${document.id.slice(-8).toUpperCase()}`, 120, 65);
  
  // Client info
  pdf.setFontSize(14);
  pdf.text('Cliente:', 20, 85);
  pdf.setFontSize(12);
  pdf.text(document.clientName, 20, 95);
  pdf.text(`CPF/CNPJ: ${document.clientDocument}`, 20, 105);
  
  let yPosition = 125;
  
  if (document.type === 'recibo') {
    // Recibo content
    pdf.setFontSize(14);
    pdf.text('Descrição do Serviço:', 20, yPosition);
    pdf.setFontSize(12);
    pdf.text(document.description || '', 20, yPosition + 10, { maxWidth: 170 });
    
    yPosition += 30;
    pdf.setFontSize(14);
    pdf.text(`Valor: ${formatCurrency(document.value || 0)}`, 20, yPosition);
    
    if (document.paymentMethod) {
      pdf.text(`Forma de Pagamento: ${document.paymentMethod}`, 20, yPosition + 15);
    }
  } else {
    // Orçamento content
    pdf.setFontSize(14);
    pdf.text('Itens:', 20, yPosition);
    yPosition += 15;
    
    // Table header
    pdf.setFontSize(10);
    pdf.text('Item', 20, yPosition);
    pdf.text('Qtd', 80, yPosition);
    pdf.text('Valor Unit.', 110, yPosition);
    pdf.text('Total', 150, yPosition);
    
    yPosition += 10;
    pdf.line(20, yPosition, 190, yPosition);
    yPosition += 10;
    
    let total = 0;
    document.items?.forEach((item) => {
      pdf.text(item.name, 20, yPosition, { maxWidth: 55 });
      pdf.text(item.quantity.toString(), 80, yPosition);
      pdf.text(formatCurrency(item.unitPrice), 110, yPosition);
      pdf.text(formatCurrency(item.total), 150, yPosition);
      total += item.total;
      yPosition += 10;
    });
    
    pdf.line(20, yPosition, 190, yPosition);
    yPosition += 10;
    pdf.setFontSize(12);
    pdf.text(`Total Geral: ${formatCurrency(total)}`, 120, yPosition);
    
    yPosition += 20;
    if (document.paymentConditions) {
      pdf.text('Condições de Pagamento:', 20, yPosition);
      pdf.setFontSize(10);
      pdf.text(document.paymentConditions, 20, yPosition + 10, { maxWidth: 170 });
      yPosition += 25;
    }
    
    if (document.validity) {
      pdf.setFontSize(12);
      pdf.text(`Validade: ${document.validity}`, 20, yPosition);
    }
  }
  
  // Observations
  if (document.observations) {
    yPosition += 20;
    pdf.setFontSize(12);
    pdf.text('Observações:', 20, yPosition);
    pdf.setFontSize(10);
    pdf.text(document.observations, 20, yPosition + 10, { maxWidth: 170 });
  }
  
  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Documento gerado pelo OrçaX', 20, 280);
  
  // Save
  const filename = `${docType.toLowerCase()}_${document.clientName.replace(/\s+/g, '_')}_${document.id.slice(-8)}.pdf`;
  pdf.save(filename);
};