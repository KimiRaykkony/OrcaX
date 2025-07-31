import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';
import { DocumentItem } from '../types';
import { formatCurrency } from '../utils/formatting';

interface FinancialSummaryProps {
  documents: DocumentItem[];
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({ documents }) => {
  const financialData = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let totalReceitas = 0;
    let totalDespesas = 0;
    let pendingDebts = 0;
    const dailyData: { [key: string]: { receitas: number; despesas: number } } = {};

    // Inicializar dados dos últimos 30 dias
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      dailyData[dateKey] = { receitas: 0, despesas: 0 };
    }

    documents.forEach(doc => {
      const docDate = new Date(doc.date);
      const dateKey = doc.date;
      const value = doc.value || 0;

      // Calcular totais gerais
      if (doc.type === 'recibo' || doc.type === 'entrada') {
        totalReceitas += value;
      } else if (doc.type === 'saida') {
        totalDespesas += value;
      } else if (doc.type === 'devedor') {
        pendingDebts += value;
      }

      // Dados dos últimos 30 dias
      if (docDate >= thirtyDaysAgo && dailyData[dateKey]) {
        if (doc.type === 'recibo' || doc.type === 'entrada') {
          dailyData[dateKey].receitas += value;
        } else if (doc.type === 'saida') {
          dailyData[dateKey].despesas += value;
        }
      }
    });

    const saldo = totalReceitas - totalDespesas;
    
    // Converter dados diários para array para o gráfico
    const chartData = Object.entries(dailyData).map(([date, data]) => ({
      date,
      receitas: data.receitas,
      despesas: data.despesas,
      saldo: data.receitas - data.despesas
    }));

    return {
      totalReceitas,
      totalDespesas,
      saldo,
      pendingDebts,
      chartData
    };
  }, [documents]);

  const getMaxValue = () => {
    const values = financialData.chartData.flatMap(d => [d.receitas, d.despesas]);
    return Math.max(...values, 100);
  };

  const maxValue = getMaxValue();

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
            <div className={`p-2 rounded-lg ${financialData.saldo >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
              <DollarSign className={`w-6 h-6 ${financialData.saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Saldo</p>
              <p className={`text-2xl font-bold ${financialData.saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatCurrency(financialData.saldo)}
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
                {formatCurrency(financialData.pendingDebts)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico simples */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Movimentação dos Últimos 30 Dias
        </h3>
        
        <div className="relative h-64 overflow-x-auto">
          <div className="flex items-end justify-between h-full min-w-full space-x-1">
            {financialData.chartData.map((data, index) => {
              const receitasHeight = maxValue > 0 ? (data.receitas / maxValue) * 200 : 0;
              const despesasHeight = maxValue > 0 ? (data.despesas / maxValue) * 200 : 0;
              const day = new Date(data.date).getDate();
              
              return (
                <div key={data.date} className="flex flex-col items-center min-w-0 flex-1">
                  <div className="flex items-end space-x-1 mb-2">
                    {/* Barra de receitas */}
                    <div
                      className="bg-green-500 rounded-t w-3 transition-all duration-300 hover:bg-green-600"
                      style={{ height: `${receitasHeight}px` }}
                      title={`Receitas: ${formatCurrency(data.receitas)}`}
                    />
                    {/* Barra de despesas */}
                    <div
                      className="bg-red-500 rounded-t w-3 transition-all duration-300 hover:bg-red-600"
                      style={{ height: `${despesasHeight}px` }}
                      title={`Despesas: ${formatCurrency(data.despesas)}`}
                    />
                  </div>
                  {/* Label do dia (mostrar apenas alguns para não poluir) */}
                  {index % 5 === 0 && (
                    <span className="text-xs text-gray-500 transform -rotate-45 origin-center">
                      {day}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legenda */}
        <div className="flex justify-center space-x-6 mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Receitas</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Despesas</span>
          </div>
        </div>
      </div>
    </div>
  );
};