import React from 'react';
import { Calendar, Filter, BarChart3 } from 'lucide-react';
import { ChartFilters as ChartFiltersType } from '../../types/charts';

interface ChartFiltersProps {
  filters: ChartFiltersType;
  onFiltersChange: (filters: ChartFiltersType) => void;
}

export const ChartFilters: React.FC<ChartFiltersProps> = ({ filters, onFiltersChange }) => {
  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value
      }
    });
  };

  const handleCategoryChange = (category: ChartFiltersType['category']) => {
    onFiltersChange({
      ...filters,
      category
    });
  };

  const handleGroupByChange = (groupBy: ChartFiltersType['groupBy']) => {
    onFiltersChange({
      ...filters,
      groupBy
    });
  };

  // Definir datas padrão se não estiverem definidas
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const startDate = filters.dateRange.start || thirtyDaysAgo.toISOString().split('T')[0];
  const endDate = filters.dateRange.end || today.toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center mb-4">
        <Filter className="w-5 h-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Filtros do Gráfico</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Período */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Data Inicial
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleDateRangeChange('start', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Data Final
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleDateRangeChange('end', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <BarChart3 className="w-4 h-4 inline mr-1" />
            Categoria
          </label>
          <select
            value={filters.category || 'all'}
            onChange={(e) => handleCategoryChange(e.target.value as ChartFiltersType['category'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
            <option value="lucro">Lucro</option>
          </select>
        </div>

        {/* Agrupamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Agrupar por
          </label>
          <select
            value={filters.groupBy}
            onChange={(e) => handleGroupByChange(e.target.value as ChartFiltersType['groupBy'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="day">Dia</option>
            <option value="week">Semana</option>
            <option value="month">Mês</option>
            <option value="year">Ano</option>
          </select>
        </div>
      </div>

      {/* Filtros rápidos */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-2">Períodos rápidos:</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Últimos 7 dias', days: 7 },
            { label: 'Últimos 30 dias', days: 30 },
            { label: 'Últimos 90 dias', days: 90 },
            { label: 'Este ano', days: 365 }
          ].map(period => (
            <button
              key={period.days}
              onClick={() => {
                const end = new Date();
                const start = new Date(end.getTime() - period.days * 24 * 60 * 60 * 1000);
                onFiltersChange({
                  ...filters,
                  dateRange: {
                    start: start.toISOString().split('T')[0],
                    end: end.toISOString().split('T')[0]
                  }
                });
              }}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};