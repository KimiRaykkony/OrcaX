import { jsPDF } from 'jspdf';
import { formatCurrency, formatDate } from './formatting';

export interface PDFDocument {
  id: string;
  type: 'entrada' | 'saida' | 'orcamento' | 'recibo' | 'devedor';
  data: any;
  createdAt: Date;
}

export function generatePDF(document: PDFDocument): void {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 20;
  let yPosition = 30;

  // Header
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  
  switch (document.type) {
    case 'entrada':
      pdf.text('COMPROVANTE DE ENTRADA', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;
      generateEntradaPDF(pdf, document.data, yPosition, margin);
      break;
      
    case 'saida':
      pdf.text('COMPROVANTE DE SAÍDA', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;
      generateSaidaPDF(pdf, document.data, yPosition, margin);
      break;
      
    case 'orcamento':
      pdf.text('ORÇAMENTO', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;
      generateOrcamentoPDF(pdf, document.data, yPosition, margin);
      break;
      
    case 'recibo':
      pdf.text('RECIBO', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;
      generateReciboPDF(pdf, document.data, yPosition, margin);
      break;
      
    case 'devedor':
      pdf.text('RELATÓRIO DE DEVEDOR', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;
      generateDevedorPDF(pdf, document.data, yPosition, margin);
      break;
  }

  // Save the PDF
  const fileName = `${document.type}_${document.id}.pdf`;
  pdf.save(fileName);
}

function generateEntradaPDF(pdf: jsPDF, data: any, yPosition: number, margin: number): void {
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  pdf.text(`Data: ${formatDate(data.data)}`, margin, yPosition);
  yPosition += 10;
  pdf.text(`Descrição: ${data.descricao}`, margin, yPosition);
  yPosition += 10;
  pdf.text(`Valor: ${formatCurrency(data.valor)}`, margin, yPosition);
  yPosition += 10;
  pdf.text(`Categoria: ${data.categoria}`, margin, yPosition);
  
  if (data.observacoes) {
    yPosition += 15;
    pdf.text('Observações:', margin, yPosition);
    yPosition += 10;
    pdf.text(data.observacoes, margin, yPosition);
  }
}

function generateSaidaPDF(pdf: jsPDF, data: any, yPosition: number, margin: number): void {
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  pdf.text(`Data: ${formatDate(data.data)}`, margin, yPosition);
  yPosition += 10;
  pdf.text(`Descrição: ${data.descricao}`, margin, yPosition);
  yPosition += 10;
  pdf.text(`Valor: ${formatCurrency(data.valor)}`, margin, yPosition);
  yPosition += 10;
  pdf.text(`Categoria: ${data.categoria}`, margin, yPosition);
  
  if (data.observacoes) {
    yPosition += 15;
    pdf.text('Observações:', margin, yPosition);
    yPosition += 10;
    pdf.text(data.observacoes, margin, yPosition);
  }
}

function generateOrcamentoPDF(pdf: jsPDF, data: any, yPosition: number, margin: number): void {
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  pdf.text(`Data: ${formatDate(data.data)}`, margin, yPosition);
  yPosition += 10;
  pdf.text(`Cliente: ${data.cliente}`, margin, yPosition);
  yPosition += 10;
  pdf.text(`Descrição: ${data.descricao}`, margin, yPosition);
  yPosition += 10;
  pdf.text(`Valor: ${formatCurrency(data.valor)}`, margin, yPosition);
  yPosition += 10;
  pdf.text(`Validade: ${formatDate(data.validade)}`, margin, yPosition);
  
  if (data.observacoes) {
    yPosition += 15;
    pdf.text('Observações:', margin, yPosition);
    yPosition += 10;
    pdf.text(data.observacoes, margin, yPosition);
  }
}

function generateReciboPDF(pdf: jsPDF, data: any, yPosition: number, margin: number): void {
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  pdf.text(`Data: ${formatDate(data.data)}`, margin, yPosition);
  yPosition += 10;
  pdf.text(`Pagador: ${data.pagador}`, margin, yPosition);
  yPosition += 10;
  pdf.text(`Valor: ${formatCurrency(data.valor)}`, margin, yPosition);
  yPosition += 10;
  pdf.text(`Referente a: ${data.referente}`, margin, yPosition);
  
  if (data.observacoes) {
    yPosition += 15;
    pdf.text('Observações:', margin, yPosition);
    yPosition += 10;
    pdf.text(data.observacoes, margin, yPosition);
  }
}

function generateDevedorPDF(pdf: jsPDF, data: any, yPosition: number, margin: number): void {
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  pdf.text(`Nome: ${data.nome}`, margin, yPosition);
  yPosition += 10;
  pdf.text(`Valor da Dívida: ${formatCurrency(data.valorDivida)}`, margin, yPosition);
  yPosition += 10;
  pdf.text(`Data do Vencimento: ${formatDate(data.dataVencimento)}`, margin, yPosition);
  yPosition += 10;
  pdf.text(`Descrição: ${data.descricao}`, margin, yPosition);
  
  if (data.telefone) {
    yPosition += 10;
    pdf.text(`Telefone: ${data.telefone}`, margin, yPosition);
  }
  
  if (data.email) {
    yPosition += 10;
    pdf.text(`Email: ${data.email}`, margin, yPosition);
  }
  
  if (data.observacoes) {
    yPosition += 15;
    pdf.text('Observações:', margin, yPosition);
    yPosition += 10;
    pdf.text(data.observacoes, margin, yPosition);
  }
}