import React from 'react';
import { FileText, Receipt, TrendingUp, TrendingDown, UserX, LogOut, User, Users, Shield } from 'lucide-react';
import { authService } from '../utils/auth';

interface HeaderProps {
  onNewRecibo: () => void;
  onNewOrcamento: () => void;
  onNewEntrada: () => void;
  onNewSaida: () => void;
  onNewDevedor: () => void;
  onLogout: () => void;
  onUserManagement?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onNewRecibo, 
  onNewOrcamento, 
  onNewEntrada, 
  onNewSaida, 
  onNewDevedor,
  onLogout,
  onUserManagement
}) => {
  const currentUser = authService.getCurrentUser();

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      onLogout();
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-900">
              Contro<span className="text-orange-500">LeX</span>
            </h1>
            {currentUser && (
              <div className="ml-6 flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-1" />
                <span>Olá, {currentUser.name}</span>
                {currentUser.role === 'admin' && (
                  <div className="ml-2 flex items-center text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Action buttons and user menu */}
          <div className="flex items-center gap-2">
            {/* Document buttons */}
            <div className="flex flex-wrap gap-2">
            {authService.hasPermission('create') && (
              <>
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
              </>
            )}
          </div>

            {/* Admin buttons */}
            {currentUser?.role === 'admin' && onUserManagement && (
              <button
                onClick={onUserManagement}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-sm"
                title="Gerenciar Usuários"
              >
                <Users className="w-4 h-4 mr-2" />
                Usuários
              </button>
            )}

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};