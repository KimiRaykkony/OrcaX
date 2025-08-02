import { ChartData, FinancialMetrics, ChartFilters } from '../types/charts';
import { DocumentItem } from '../types';

/**
 * Utilitários para processamento de dados dos gráficos financeiros
 */

// Cores padrão para os gráficos
export const CHART_COLORS = {
  receita: '#10b981', // Verde
  despesa: '#ef4444',  // Vermelho
  lucro: '#3b82f6',    // Azul
  neutral: '#6b7280'   // Cinza
};

/**
 * Converte documentos em dados para gráfico
 */
export const convertDocumentsToChartData = (
  documents: DocumentItem[],
  filters: ChartFilters
): ChartData[] => {
  const { dateRange, category, groupBy } = filters;
  
  // Filtrar documentos por data
  const filteredDocs = documents.filter(doc => {
    const docDate = new Date(doc.date);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    return docDate >= startDate && docDate <= endDate;
  });

  // Agrupar dados por período
  const groupedData: { [key: string]: { receitas: number; despesas: number } } = {};

  filteredDocs.forEach(doc => {
    const date = new Date(doc.date);
    let groupKey = '';

    switch (groupBy) {
      case 'day':
        groupKey = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        groupKey = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'year':
        groupKey = date.getFullYear().toString();
        break;
    }

    if (!groupedData[groupKey]) {
      groupedData[groupKey] = { receitas: 0, despesas: 0 };
    }

    const value = doc.value || 0;
    if (doc.type === 'recibo' || doc.type === 'entrada') {
      groupedData[groupKey].receitas += value;
    } else if (doc.type === 'saida') {
      groupedData[groupKey].despesas += value;
    }
  });

  // Converter para array de ChartData
  const chartData: ChartData[] = [];

  Object.entries(groupedData).forEach(([key, data]) => {
    const label = formatGroupLabel(key, groupBy);

    if (category === 'all' || category === 'receita') {
      chartData.push({
        id: `receita-${key}`,
        label: `${label} - Receitas`,
        value: data.receitas,
        date: key,
        category: 'receita',
        color: CHART_COLORS.receita
      });
    }

    if (category === 'all' || category === 'despesa') {
      chartData.push({
        id: `despesa-${key}`,
        label: `${label} - Despesas`,
        value: data.despesas,
        date: key,
        category: 'despesa',
        color: CHART_COLORS.despesa
      });
    }

    if (category === 'all' || category === 'lucro') {
      const lucro = data.receitas - data.despesas;
      chartData.push({
        id: `lucro-${key}`,
        label: `${label} - Lucro`,
        value: lucro,
        date: key,
        category: 'lucro',
        color: lucro >= 0 ? CHART_COLORS.lucro : CHART_COLORS.despesa
      });
    }
  });

  return chartData.sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Formata o label do grupo baseado no tipo de agrupamento
 */
const formatGroupLabel = (key: string, groupBy: string): string => {
  switch (groupBy) {
    case 'day':
      return new Date(key).toLocaleDateString('pt-BR');
    case 'week':
      const weekDate = new Date(key);
      return `Semana de ${weekDate.toLocaleDateString('pt-BR')}`;
    case 'month':
      const [year, month] = key.split('-');
      const monthNames = [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
      ];
      return `${monthNames[parseInt(month) - 1]}/${year}`;
    case 'year':
      return key;
    default:
      return key;
  }
};

/**
 * Calcula métricas financeiras
 */
export const calculateFinancialMetrics = (documents: DocumentItem[]): FinancialMetrics => {
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Documentos do mês atual
  const currentMonthDocs = documents.filter(doc => {
    const docDate = new Date(doc.date);
    return docDate >= currentMonth && docDate < nextMonth;
  });

  // Documentos do mês anterior
  const lastMonthDocs = documents.filter(doc => {
    const docDate = new Date(doc.date);
    return docDate >= lastMonth && docDate < currentMonth;
  });

  // Calcular totais
  const totalReceitas = documents
    .filter(doc => doc.type === 'recibo' || doc.type === 'entrada')
    .reduce((sum, doc) => sum + (doc.value || 0), 0);

  const totalDespesas = documents
    .filter(doc => doc.type === 'saida')
    .reduce((sum, doc) => sum + (doc.value || 0), 0);

  const lucroLiquido = totalReceitas - totalDespesas;
  const margemLucro = totalReceitas > 0 ? (lucroLiquido / totalReceitas) * 100 : 0;

  // Crescimento mensal
  const currentMonthReceitas = currentMonthDocs
    .filter(doc => doc.type === 'recibo' || doc.type === 'entrada')
    .reduce((sum, doc) => sum + (doc.value || 0), 0);

  const lastMonthReceitas = lastMonthDocs
    .filter(doc => doc.type === 'recibo' || doc.type === 'entrada')
    .reduce((sum, doc) => sum + (doc.value || 0), 0);

  const crescimentoMensal = lastMonthReceitas > 0 
    ? ((currentMonthReceitas - lastMonthReceitas) / lastMonthReceitas) * 100 
    : 0;

  // Ticket médio
  const recibos = documents.filter(doc => doc.type === 'recibo');
  const ticketMedio = recibos.length > 0 
    ? recibos.reduce((sum, doc) => sum + (doc.value || 0), 0) / recibos.length 
    : 0;

  return {
    totalReceitas,
    totalDespesas,
    lucroLiquido,
    margemLucro,
    crescimentoMensal,
    ticketMedio
  };
};

/**
 * Gera dados de exemplo para demonstração
 */
export const generateSampleChartData = (): ChartData[] => {
  const data: ChartData[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Gerar valores aleatórios mas realistas
    const receitas = Math.random() * 5000 + 1000;
    const despesas = Math.random() * 3000 + 500;
    const lucro = receitas - despesas;
    
    data.push(
      {
        id: `receita-${dateStr}`,
        label: `${date.toLocaleDateString('pt-BR')} - Receitas`,
        value: receitas,
        date: dateStr,
        category: 'receita',
        color: CHART_COLORS.receita
      },
      {
        id: `despesa-${dateStr}`,
        label: `${date.toLocaleDateString('pt-BR')} - Despesas`,
        value: despesas,
        date: dateStr,
        category: 'despesa',
        color: CHART_COLORS.despesa
      },
      {
        id: `lucro-${dateStr}`,
        label: `${date.toLocaleDateString('pt-BR')} - Lucro`,
        value: lucro,
        date: dateStr,
        category: 'lucro',
        color: lucro >= 0 ? CHART_COLORS.lucro : CHART_COLORS.despesa
      }
    );
  }
  
  return data;
};

/**
 * Valida dados do gráfico
 */
export const validateChartData = (data: ChartData[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!Array.isArray(data)) {
    errors.push('Dados devem ser um array');
    return { isValid: false, errors };
  }
  
  if (data.length === 0) {
    errors.push('Array de dados não pode estar vazio');
    return { isValid: false, errors };
  }
  
  data.forEach((item, index) => {
    if (!item.id) errors.push(`Item ${index}: ID é obrigatório`);
    if (!item.label) errors.push(`Item ${index}: Label é obrigatório`);
    if (typeof item.value !== 'number') errors.push(`Item ${index}: Valor deve ser um número`);
    if (isNaN(item.value)) errors.push(`Item ${index}: Valor não pode ser NaN`);
    if (!item.date) errors.push(`Item ${index}: Data é obrigatória`);
    if (!['receita', 'despesa', 'lucro'].includes(item.category)) {
      errors.push(`Item ${index}: Categoria inválida`);
    }
  });
  
  return { isValid: errors.length === 0, errors };
};