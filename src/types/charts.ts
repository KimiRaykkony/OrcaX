export interface ChartData {
  id: string;
  label: string;
  value: number;
  date: string;
  category: 'receita' | 'despesa' | 'lucro';
  color?: string;
}

export interface BarChartProps {
  data: ChartData[];
  title: string;
  height?: number;
  showValues?: boolean;
  animated?: boolean;
}

export interface FinancialMetrics {
  totalReceitas: number;
  totalDespesas: number;
  lucroLiquido: number;
  margemLucro: number;
  crescimentoMensal: number;
  ticketMedio: number;
}

export interface ChartFilters {
  dateRange: {
    start: string;
    end: string;
  };
  category?: 'receita' | 'despesa' | 'lucro' | 'all';
  groupBy: 'day' | 'week' | 'month' | 'year';
}