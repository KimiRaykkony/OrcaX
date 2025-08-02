import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, BarChart3 } from 'lucide-react';
import { DocumentItem } from '../types';
import { formatCurrency } from '../utils/formatting';
import { BarChart } from './charts/BarChart';
import { ChartFilters } from './charts/ChartFilters';
import { convertDocumentsToChartData, calculateFinancialMetrics } from '../utils/chartData';
import { ChartFilters as ChartFiltersType } from '../types/charts';

interface FinancialSummaryProps {
  documents: DocumentItem[];
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({ documents }) => {
  const [chartFilters, setChartFilters] = React.useState<ChartFiltersType>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    category: 'all',
    groupBy: 'day'
  });

  const financialData = useMemo(() => {
    return calculateFinancialMetrics(documents);
  }, [documents]);

  const chartData = useMemo(() => {
    return convertDocumentsToChartData(documents, chartFilters);
  }, [documents, chartFilters]);

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Receitas</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(financialData.totalReceitas)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Despesas</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(financialData.totalDespesas)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${financialData.lucroLiquido >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
              <DollarSign className={`w-6 h-6 ${financialData.lucroLiquido >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Lucro Líquido</p>
              <p className={`text-2xl font-bold ${financialData.lucroLiquido >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatCurrency(financialData.lucroLiquido)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pendências</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(documents.filter(d => d.type === 'devedor').reduce((sum, d) => sum + (d.value || 0), 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros do gráfico */}
      <ChartFilters 
        filters={chartFilters}
        onFiltersChange={setChartFilters}
      />

      {/* Gráfico de barras avançado */}
      <BarChart
        data={chartData}
        title="Análise Financeira Detalhada"
        height={500}
        showValues={true}
        animated={true}
      />
    </div>
  );
};