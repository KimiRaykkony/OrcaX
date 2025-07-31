import { jsPDF } from 'jspdf';
import { DocumentItem } from '../types';
import { formatCurrency, formatDate, formatDocument } from './formatting';

export const generatePDF = (document: DocumentItem): void => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 20;
  let yPosition = 30;

  // Configurações de fonte
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);

  // Cabeçalho baseado no tipo de documento
  let title = '';
  switch (document.type) {
    case 'recibo':
      title = 'RECIBO';
      break;
    case 'orcamento':
      title = 'ORÇAMENTO';
      break;
    default:
      title = 'DOCUMENTO';
  }

  pdf.text(title, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Linha separadora
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;

  // Informações do documento
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);

  // ID do documento
  pdf.setFont('helvetica', 'bold');
  pdf.text('Documento:', margin, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`#${document.id.slice(-8).toUpperCase()}`, margin + 30, yPosition);
  yPosition += 10;

  // Data
  pdf.setFont('helvetica', 'bold');
  pdf.text('Data:', margin, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(formatDate(document.date), margin + 30, yPosition);
  yPosition += 15;

  // Informações do cliente
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('DADOS DO CLIENTE', margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  pdf.text(`Nome: ${document.clientName}`, margin, yPosition);
  yPosition += 8;
  
  if (document.clientDocument) {
    pdf.text(`CPF/CNPJ: ${formatDocument(document.clientDocument)}`, margin, yPosition);
    yPosition += 15;
  } else {
    yPosition += 10;
  }

  // Conteúdo específico por tipo
  if (document.type === 'orcamento' && document.items && document.items.length > 0) {
    generateOrcamentoContent(pdf, document, yPosition, margin, pageWidth);
  } else {
    generateReciboContent(pdf, document, yPosition, margin);
  }

  // Salvar o PDF
  const fileName = `${document.type}_${document.clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};

const generateOrcamentoContent = (pdf: jsPDF, document: DocumentItem, yPosition: number, margin: number, pageWidth: number): void => {
  // Título da seção de itens
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('ITENS DO ORÇAMENTO', margin, yPosition);
  yPosition += 15;

  // Cabeçalho da tabela
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  
  const colWidths = {
    item: 80,
    qty: 25,
    unit: 30,
    total: 35
  };

  let xPos = margin;
  pdf.text('ITEM', xPos, yPosition);
  xPos += colWidths.item;
  pdf.text('QTD', xPos, yPosition);
  xPos += colWidths.qty;
  pdf.text('VALOR UNIT.', xPos, yPosition);
  xPos += colWidths.unit;
  pdf.text('TOTAL', xPos, yPosition);

  yPosition += 5;
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Itens
  pdf.setFont('helvetica', 'normal');
  let totalGeral = 0;

  document.items?.forEach((item) => {
    if (yPosition > 250) { // Nova página se necessário
      pdf.addPage();
      yPosition = 30;
    }

    xPos = margin;
    pdf.text(item.name.substring(0, 35), xPos, yPosition);
    xPos += colWidths.item;
    pdf.text(item.quantity.toString(), xPos, yPosition);
    xPos += colWidths.qty;
    pdf.text(formatCurrency(item.unitPrice), xPos, yPosition);
    xPos += colWidths.unit;
    pdf.text(formatCurrency(item.total), xPos, yPosition);

    totalGeral += item.total;
    yPosition += 8;
  });

  // Linha separadora e total
  yPosition += 5;
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text(`TOTAL GERAL: ${formatCurrency(totalGeral)}`, pageWidth - margin - 60, yPosition);
  yPosition += 20;

  // Condições de pagamento
  if (document.paymentConditions) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('CONDIÇÕES DE PAGAMENTO:', margin, yPosition);
    yPosition += 8;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    const lines = pdf.splitTextToSize(document.paymentConditions, pageWidth - 2 * margin);
    pdf.text(lines, margin, yPosition);
    yPosition += lines.length * 5 + 10;
  }

  // Validade
  if (document.validity) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('VALIDADE:', margin, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(document.validity, margin + 25, yPosition);
    yPosition += 15;
  }

  // Observações
  if (document.observations) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('OBSERVAÇÕES:', margin, yPosition);
    yPosition += 8;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    const lines = pdf.splitTextToSize(document.observations, pageWidth - 2 * margin);
    pdf.text(lines, margin, yPosition);
  }
};

const generateReciboContent = (pdf: jsPDF, document: DocumentItem, yPosition: number, margin: number): void => {
  // Valor
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('VALOR', margin, yPosition);
  yPosition += 10;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(16);
  pdf.text(formatCurrency(document.value || 0), margin, yPosition);
  yPosition += 20;

  // Descrição
  if (document.description) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('DESCRIÇÃO DO SERVIÇO:', margin, yPosition);
    yPosition += 10;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    const lines = pdf.splitTextToSize(document.description, 170);
    pdf.text(lines, margin, yPosition);
    yPosition += lines.length * 6 + 15;
  }

  // Forma de pagamento
  if (document.paymentMethod) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('FORMA DE PAGAMENTO:', margin, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(document.paymentMethod, margin + 55, yPosition);
    yPosition += 20;
  }

  // Observações
  if (document.observations) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('OBSERVAÇÕES:', margin, yPosition);
    yPosition += 10;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    const lines = pdf.splitTextToSize(document.observations, 170);
    pdf.text(lines, margin, yPosition);
    yPosition += lines.length * 6 + 20;
  }

  // Assinatura
  yPosition += 30;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.line(margin, yPosition, margin + 80, yPosition);
  yPosition += 8;
  pdf.text('Assinatura do Prestador', margin, yPosition);
};