import React from 'react';
import { FileText, Receipt, TrendingUp, TrendingDown, UserX } from 'lucide-react';

interface HeaderProps {
  onNewRecibo: () => void;
  onNewOrcamento: () => void;
  onNewEntrada: () => void;
  onNewSaida: () => void;
  onNewDevedor: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onNewRecibo, 
  onNewOrcamento, 
  onNewEntrada, 
  onNewSaida, 
  onNewDevedor 
}) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-900">
              Orça<span className="text-orange-500">X</span>
            </h1>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onNewDevedor}
              className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 shadow-sm"
            >
              <UserX className="w-4 h-4 mr-2" />
              Novo Devedor
            </button>
            
            <button
              onClick={onNewEntrada}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Entrada
            </button>
            
            <button
              onClick={onNewSaida}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-sm"
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Saída
            </button>
            
            <button
              onClick={onNewRecibo}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
            >
              <Receipt className="w-4 h-4 mr-2" />
              Novo Recibo
            </button>

            <button
              onClick={onNewOrcamento}
              className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 shadow-sm"
            >
              <FileText className="w-4 h-4 mr-2" />
              Novo Orçamento
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};