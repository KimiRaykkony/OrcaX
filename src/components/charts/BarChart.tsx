import React, { useEffect, useRef, useState } from 'react';
import { BarChartProps, ChartData } from '../../types/charts';
import { formatCurrency } from '../../utils/formatting';
import { validateChartData } from '../../utils/chartData';

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  height = 400,
  showValues = true,
  animated = true
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Validar dados na inicialização
  useEffect(() => {
    const validation = validateChartData(data);
    setValidationErrors(validation.errors);
  }, [data]);

  // Animação das barras
  useEffect(() => {
    if (!animated) {
      setAnimationProgress(1);
      return;
    }

    setAnimationProgress(0);
    const duration = 1500; // 1.5 segundos
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setAnimationProgress(easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [data, animated]);

  // Se há erros de validação, mostrar mensagem
  if (validationErrors.length > 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <h3 className="text-lg font-semibold text-red-600 mb-4">Erro nos Dados do Gráfico</h3>
        <ul className="text-sm text-red-500 space-y-1">
          {validationErrors.map((error, index) => (
            <li key={index}>• {error}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>Nenhum dado disponível para exibir</p>
          </div>
        </div>
      </div>
    );
  }

  // Calcular valores máximos e mínimos
  const maxValue = Math.max(...data.map(d => Math.abs(d.value)));
  const minValue = Math.min(...data.map(d => d.value));
  const hasNegativeValues = minValue < 0;

  // Configurações do gráfico
  const chartPadding = { top: 40, right: 40, bottom: 60, left: 80 };
  const chartWidth = 800;
  const chartHeight = height - chartPadding.top - chartPadding.bottom;
  const barWidth = Math.max(20, (chartWidth - 40) / data.length - 10);
  const barSpacing = 10;

  // Função para calcular a altura da barra
  const getBarHeight = (value: number): number => {
    if (maxValue === 0) return 0;
    return (Math.abs(value) / maxValue) * chartHeight * 0.8 * animationProgress;
  };

  // Função para calcular a posição Y da barra
  const getBarY = (value: number): number => {
    if (!hasNegativeValues) {
      return chartHeight - getBarHeight(value);
    }
    
    const zeroLine = chartHeight * 0.5;
    if (value >= 0) {
      return zeroLine - getBarHeight(value);
    } else {
      return zeroLine;
    }
  };

  // Agrupar dados por categoria para a legenda
  const categories = Array.from(new Set(data.map(d => d.category)));
  const categoryColors = {
    receita: '#10b981',
    despesa: '#ef4444',
    lucro: '#3b82f6'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Título */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        
        {/* Legenda */}
        <div className="flex items-center space-x-4">
          {categories.map(category => (
            <div key={category} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: categoryColors[category as keyof typeof categoryColors] }}
              />
              <span className="text-sm text-gray-600 capitalize">{category}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico */}
      <div className="overflow-x-auto">
        <div ref={chartRef} className="relative" style={{ minWidth: chartWidth + chartPadding.left + chartPadding.right }}>
          <svg
            width={chartWidth + chartPadding.left + chartPadding.right}
            height={height}
            className="overflow-visible"
          >
            {/* Eixo Y */}
            <g transform={`translate(${chartPadding.left}, ${chartPadding.top})`}>
              {/* Linha do eixo Y */}
              <line
                x1={0}
                y1={0}
                x2={0}
                y2={chartHeight}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
              
              {/* Labels do eixo Y */}
              {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
                const value = maxValue * ratio;
                const y = chartHeight - (chartHeight * ratio);
                
                return (
                  <g key={ratio}>
                    <line
                      x1={-5}
                      y1={y}
                      x2={chartWidth}
                      y2={y}
                      stroke="#f3f4f6"
                      strokeWidth={1}
                      strokeDasharray="2,2"
                    />
                    <text
                      x={-10}
                      y={y + 4}
                      textAnchor="end"
                      className="text-xs fill-gray-500"
                    >
                      {formatCurrency(value)}
                    </text>
                  </g>
                );
              })}

              {/* Linha zero para valores negativos */}
              {hasNegativeValues && (
                <line
                  x1={0}
                  y1={chartHeight * 0.5}
                  x2={chartWidth}
                  y2={chartHeight * 0.5}
                  stroke="#374151"
                  strokeWidth={2}
                />
              )}
            </g>

            {/* Barras */}
            <g transform={`translate(${chartPadding.left}, ${chartPadding.top})`}>
              {data.map((item, index) => {
                const x = index * (barWidth + barSpacing) + 20;
                const barHeight = getBarHeight(item.value);
                const y = getBarY(item.value);
                
                return (
                  <g key={item.id}>
                    {/* Barra */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill={item.color || categoryColors[item.category as keyof typeof categoryColors]}
                      className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                      rx={2}
                    />
                    
                    {/* Valor da barra */}
                    {showValues && animationProgress > 0.8 && (
                      <text
                        x={x + barWidth / 2}
                        y={item.value >= 0 ? y - 5 : y + barHeight + 15}
                        textAnchor="middle"
                        className="text-xs fill-gray-700 font-medium"
                      >
                        {formatCurrency(item.value)}
                      </text>
                    )}
                    
                    {/* Tooltip invisível para hover */}
                    <rect
                      x={x}
                      y={0}
                      width={barWidth}
                      height={chartHeight}
                      fill="transparent"
                      className="cursor-pointer"
                    >
                      <title>{`${item.label}: ${formatCurrency(item.value)}`}</title>
                    </rect>
                  </g>
                );
              })}
            </g>

            {/* Eixo X */}
            <g transform={`translate(${chartPadding.left}, ${chartPadding.top + chartHeight})`}>
              {/* Linha do eixo X */}
              <line
                x1={0}
                y1={0}
                x2={chartWidth}
                y2={0}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
              
              {/* Labels do eixo X */}
              {data.map((item, index) => {
                const x = index * (barWidth + barSpacing) + 20 + barWidth / 2;
                
                return (
                  <text
                    key={item.id}
                    x={x}
                    y={20}
                    textAnchor="middle"
                    className="text-xs fill-gray-600"
                    transform={`rotate(-45, ${x}, 20)`}
                  >
                    {item.label.split(' - ')[0]} {/* Mostrar apenas a data */}
                  </text>
                );
              })}
            </g>
          </svg>
        </div>
      </div>

      {/* Estatísticas resumidas */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-500">Maior Valor</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(Math.max(...data.map(d => d.value)))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Menor Valor</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(Math.min(...data.map(d => d.value)))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Média</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(data.reduce((sum, d) => sum + d.value, 0) / data.length)}
          </p>
        </div>
      </div>
    </div>
  );
};