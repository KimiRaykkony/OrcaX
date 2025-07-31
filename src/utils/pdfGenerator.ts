import { jsPDF } from 'jspdf';
import { DocumentItem } from '../types';
import { formatCurrency, formatDate, formatDocument } from './formatting';

// Paleta de cores moderna
const COLORS = {
  primary: '#2563eb',      // Azul moderno
  secondary: '#64748b',    // Cinza azulado
  accent: '#f59e0b',       // Laranja/âmbar
  success: '#10b981',      // Verde
  text: '#1f2937',         // Cinza escuro
  textLight: '#6b7280',    // Cinza médio
  background: '#f8fafc',   // Cinza muito claro
  white: '#ffffff',
  border: '#e5e7eb'        // Cinza claro para bordas
};

// Configurações de tipografia
const FONTS = {
  title: { size: 24, weight: 'bold' },
  subtitle: { size: 16, weight: 'bold' },
  heading: { size: 14, weight: 'bold' },
  body: { size: 11, weight: 'normal' },
  small: { size: 9, weight: 'normal' },
  caption: { size: 8, weight: 'normal' }
};

// Sistema de grid e espaçamento
const LAYOUT = {
  margin: 25,
  headerHeight: 80,
  footerHeight: 40,
  sectionSpacing: 20,
  itemSpacing: 12,
  lineHeight: 1.4
};

export const generatePDF = (document: DocumentItem): void => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const contentWidth = pageWidth - (LAYOUT.margin * 2);
  
  let yPosition = LAYOUT.margin;

  // Configurar cores personalizadas
  const setColor = (color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    pdf.setTextColor(r, g, b);
  };

  const setFillColor = (color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    pdf.setFillColor(r, g, b);
  };

  // Header moderno com design clean
  const createHeader = () => {
    // Fundo do header
    setFillColor(COLORS.primary);
    pdf.rect(0, 0, pageWidth, LAYOUT.headerHeight, 'F');

    // Logo/Marca (simulado com texto estilizado)
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    setColor(COLORS.white);
    pdf.text('OrçaX', LAYOUT.margin, 25);
    
    // Subtítulo da empresa
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text('Sistema Profissional de Gestão', LAYOUT.margin, 35);

    // Tipo de documento (lado direito)
    const docType = getDocumentTypeInfo(document.type);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text(docType.title, pageWidth - LAYOUT.margin, 25, { align: 'right' });
    
    // Número do documento
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`Nº ${document.id.slice(-8).toUpperCase()}`, pageWidth - LAYOUT.margin, 35, { align: 'right' });

    // Data de emissão
    pdf.text(`Emitido em: ${formatDate(document.date)}`, pageWidth - LAYOUT.margin, 45, { align: 'right' });

    // Linha decorativa
    setFillColor(COLORS.accent);
    pdf.rect(0, LAYOUT.headerHeight - 3, pageWidth, 3, 'F');

    return LAYOUT.headerHeight + 15;
  };

  // Footer moderno
  const createFooter = () => {
    const footerY = pageHeight - LAYOUT.footerHeight;
    
    // Linha superior
    setFillColor(COLORS.border);
    pdf.rect(LAYOUT.margin, footerY, contentWidth, 0.5, 'F');

    // Texto do footer
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(FONTS.caption.size);
    setColor(COLORS.textLight);
    
    pdf.text('Este documento foi gerado automaticamente pelo sistema OrçaX', 
             LAYOUT.margin, footerY + 15);
    
    pdf.text(`Página 1 | Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 
             pageWidth - LAYOUT.margin, footerY + 15, { align: 'right' });

    // Assinatura (se for recibo)
    if (document.type === 'recibo') {
      const signatureY = footerY - 40;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(FONTS.small.size);
      setColor(COLORS.text);
      
      // Linha para assinatura
      pdf.line(LAYOUT.margin, signatureY, LAYOUT.margin + 120, signatureY);
      pdf.text('Assinatura do Prestador de Serviço', LAYOUT.margin, signatureY + 8);
    }
  };

  // Seção de informações do cliente
  const createClientSection = (startY: number) => {
    let currentY = startY;

    // Título da seção
    pdf.setFont('helvetica', FONTS.heading.weight);
    pdf.setFontSize(FONTS.heading.size);
    setColor(COLORS.primary);
    pdf.text('INFORMAÇÕES DO CLIENTE', LAYOUT.margin, currentY);
    currentY += LAYOUT.itemSpacing;

    // Card do cliente com fundo
    const cardHeight = 35;
    setFillColor(COLORS.background);
    pdf.roundedRect(LAYOUT.margin, currentY, contentWidth, cardHeight, 3, 3, 'F');

    // Borda do card
    setFillColor(COLORS.border);
    pdf.roundedRect(LAYOUT.margin, currentY, contentWidth, cardHeight, 3, 3, 'S');

    currentY += 12;

    // Nome do cliente
    pdf.setFont('helvetica', FONTS.body.weight);
    pdf.setFontSize(FONTS.body.size);
    setColor(COLORS.text);
    pdf.text('Nome:', LAYOUT.margin + 10, currentY);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text(document.clientName, LAYOUT.margin + 35, currentY);

    currentY += 10;

    // CPF/CNPJ
    if (document.clientDocument) {
      pdf.setFont('helvetica', FONTS.body.weight);
      setColor(COLORS.text);
      pdf.text('CPF/CNPJ:', LAYOUT.margin + 10, currentY);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(formatDocument(document.clientDocument), LAYOUT.margin + 50, currentY);
    }

    return currentY + 25;
  };

  // Seção de valor (para recibos)
  const createValueSection = (startY: number) => {
    let currentY = startY;

    // Card de valor destacado
    const cardHeight = 45;
    setFillColor(COLORS.success);
    pdf.roundedRect(LAYOUT.margin, currentY, contentWidth, cardHeight, 5, 5, 'F');

    currentY += 15;

    // Label do valor
    pdf.setFont('helvetica', FONTS.subtitle.weight);
    pdf.setFontSize(FONTS.subtitle.size);
    setColor(COLORS.white);
    pdf.text('VALOR TOTAL', LAYOUT.margin + 15, currentY);

    // Valor em destaque
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(28);
    pdf.text(formatCurrency(document.value || 0), pageWidth - LAYOUT.margin - 15, currentY + 5, { align: 'right' });

    return currentY + 35;
  };

  // Seção de itens (para orçamentos)
  const createItemsSection = (startY: number) => {
    if (!document.items || document.items.length === 0) return startY;

    let currentY = startY;

    // Título da seção
    pdf.setFont('helvetica', FONTS.heading.weight);
    pdf.setFontSize(FONTS.heading.size);
    setColor(COLORS.primary);
    pdf.text('ITENS DO ORÇAMENTO', LAYOUT.margin, currentY);
    currentY += LAYOUT.itemSpacing;

    // Cabeçalho da tabela
    const tableStartY = currentY;
    const rowHeight = 12;
    const colWidths = [100, 30, 40, 50]; // Item, Qtd, Valor Unit., Total
    const colPositions = [
      LAYOUT.margin,
      LAYOUT.margin + colWidths[0],
      LAYOUT.margin + colWidths[0] + colWidths[1],
      LAYOUT.margin + colWidths[0] + colWidths[1] + colWidths[2]
    ];

    // Fundo do cabeçalho
    setFillColor(COLORS.secondary);
    pdf.rect(LAYOUT.margin, currentY, contentWidth, rowHeight, 'F');

    // Texto do cabeçalho
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(FONTS.small.size);
    setColor(COLORS.white);
    
    pdf.text('ITEM', colPositions[0] + 5, currentY + 8);
    pdf.text('QTD', colPositions[1] + 5, currentY + 8);
    pdf.text('VALOR UNIT.', colPositions[2] + 5, currentY + 8);
    pdf.text('TOTAL', colPositions[3] + 5, currentY + 8);

    currentY += rowHeight;

    // Itens da tabela
    let totalGeral = 0;
    document.items.forEach((item, index) => {
      // Fundo alternado para as linhas
      if (index % 2 === 0) {
        setFillColor(COLORS.background);
        pdf.rect(LAYOUT.margin, currentY, contentWidth, rowHeight, 'F');
      }

      // Conteúdo da linha
      pdf.setFont('helvetica', FONTS.body.weight);
      pdf.setFontSize(FONTS.body.size);
      setColor(COLORS.text);

      // Truncar nome do item se muito longo
      const itemName = item.name.length > 35 ? item.name.substring(0, 32) + '...' : item.name;
      pdf.text(itemName, colPositions[0] + 5, currentY + 8);
      pdf.text(item.quantity.toString(), colPositions[1] + 5, currentY + 8);
      pdf.text(formatCurrency(item.unitPrice), colPositions[2] + 5, currentY + 8);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(formatCurrency(item.total), colPositions[3] + 5, currentY + 8);

      totalGeral += item.total;
      currentY += rowHeight;
    });

    // Linha de total
    setFillColor(COLORS.primary);
    pdf.rect(LAYOUT.margin, currentY, contentWidth, rowHeight + 3, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(FONTS.subtitle.size);
    setColor(COLORS.white);
    pdf.text('TOTAL GERAL', colPositions[2] + 5, currentY + 10);
    pdf.text(formatCurrency(totalGeral), colPositions[3] + 5, currentY + 10);

    return currentY + rowHeight + 15;
  };

  // Seção de descrição/observações
  const createDescriptionSection = (startY: number) => {
    let currentY = startY;

    if (document.description) {
      // Título
      pdf.setFont('helvetica', FONTS.heading.weight);
      pdf.setFontSize(FONTS.heading.size);
      setColor(COLORS.primary);
      pdf.text(document.type === 'recibo' ? 'DESCRIÇÃO DO SERVIÇO' : 'DESCRIÇÃO', LAYOUT.margin, currentY);
      currentY += LAYOUT.itemSpacing;

      // Conteúdo
      pdf.setFont('helvetica', FONTS.body.weight);
      pdf.setFontSize(FONTS.body.size);
      setColor(COLORS.text);
      
      const lines = pdf.splitTextToSize(document.description, contentWidth - 20);
      pdf.text(lines, LAYOUT.margin + 10, currentY);
      currentY += lines.length * 6 + LAYOUT.sectionSpacing;
    }

    // Condições de pagamento (orçamentos)
    if (document.type === 'orcamento' && document.paymentConditions) {
      pdf.setFont('helvetica', FONTS.heading.weight);
      pdf.setFontSize(FONTS.heading.size);
      setColor(COLORS.primary);
      pdf.text('CONDIÇÕES DE PAGAMENTO', LAYOUT.margin, currentY);
      currentY += LAYOUT.itemSpacing;

      pdf.setFont('helvetica', FONTS.body.weight);
      pdf.setFontSize(FONTS.body.size);
      setColor(COLORS.text);
      
      const lines = pdf.splitTextToSize(document.paymentConditions, contentWidth - 20);
      pdf.text(lines, LAYOUT.margin + 10, currentY);
      currentY += lines.length * 6 + LAYOUT.sectionSpacing;
    }

    // Validade (orçamentos)
    if (document.type === 'orcamento' && document.validity) {
      pdf.setFont('helvetica', FONTS.heading.weight);
      pdf.setFontSize(FONTS.heading.size);
      setColor(COLORS.primary);
      pdf.text('VALIDADE', LAYOUT.margin, currentY);
      currentY += LAYOUT.itemSpacing;

      pdf.setFont('helvetica', FONTS.body.weight);
      pdf.setFontSize(FONTS.body.size);
      setColor(COLORS.text);
      pdf.text(document.validity, LAYOUT.margin + 10, currentY);
      currentY += LAYOUT.sectionSpacing;
    }

    // Forma de pagamento (recibos)
    if (document.type === 'recibo' && document.paymentMethod) {
      pdf.setFont('helvetica', FONTS.heading.weight);
      pdf.setFontSize(FONTS.heading.size);
      setColor(COLORS.primary);
      pdf.text('FORMA DE PAGAMENTO', LAYOUT.margin, currentY);
      currentY += LAYOUT.itemSpacing;

      pdf.setFont('helvetica', FONTS.body.weight);
      pdf.setFontSize(FONTS.body.size);
      setColor(COLORS.text);
      pdf.text(document.paymentMethod, LAYOUT.margin + 10, currentY);
      currentY += LAYOUT.sectionSpacing;
    }

    // Observações
    if (document.observations) {
      pdf.setFont('helvetica', FONTS.heading.weight);
      pdf.setFontSize(FONTS.heading.size);
      setColor(COLORS.primary);
      pdf.text('OBSERVAÇÕES', LAYOUT.margin, currentY);
      currentY += LAYOUT.itemSpacing;

      pdf.setFont('helvetica', FONTS.body.weight);
      pdf.setFontSize(FONTS.body.size);
      setColor(COLORS.text);
      
      const lines = pdf.splitTextToSize(document.observations, contentWidth - 20);
      pdf.text(lines, LAYOUT.margin + 10, currentY);
      currentY += lines.length * 6;
    }

    return currentY;
  };

  // Função auxiliar para obter informações do tipo de documento
  const getDocumentTypeInfo = (type: string) => {
    switch (type) {
      case 'recibo':
        return { title: 'RECIBO', color: COLORS.primary };
      case 'orcamento':
        return { title: 'ORÇAMENTO', color: COLORS.accent };
      default:
        return { title: 'DOCUMENTO', color: COLORS.secondary };
    }
  };

  // Construir o PDF
  yPosition = createHeader();
  yPosition = createClientSection(yPosition);

  if (document.type === 'recibo') {
    yPosition = createValueSection(yPosition);
  } else if (document.type === 'orcamento') {
    yPosition = createItemsSection(yPosition);
  }

  createDescriptionSection(yPosition);
  createFooter();

  // Salvar o PDF com nome descritivo
  const fileName = `${document.type}_${document.clientName.replace(/\s+/g, '_')}_${formatDate(document.date).replace(/\//g, '-')}.pdf`;
  pdf.save(fileName);
};