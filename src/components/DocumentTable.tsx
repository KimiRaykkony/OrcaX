import React, { useState } from 'react';
import { Eye, Edit, Trash2, Search, Download, FileText, Receipt, TrendingUp, TrendingDown, UserX } from 'lucide-react';
import { DocumentItem } from '../types';
import { formatCurrency, formatDate } from '../utils/formatting';
import { generatePDF } from '../utils/pdfGenerator';

interface DocumentTableProps {
  documents: DocumentItem[];
  onEdit: (document: DocumentItem) => void;
  onDelete: (id: string) => void;
  onView: (document: DocumentItem) => void;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  onEdit,
  onDelete,
  onView
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'recibo' | 'orcamento' | 'entrada' | 'saida' | 'devedor'>('all');

  // Filtra documentos baseado na busca e tipo
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.clientDocument && doc.clientDocument.includes(searchTerm));
    const matchesType = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDownloadPDF = (document: DocumentItem, e: React.MouseEvent) => {
    e.stopPropagation();
    generatePDF(document);
  };

  /**
   * Retorna informações de ícone, cor e label baseado no tipo do documento
   */
  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'recibo':
        return { icon: Receipt, color: 'bg-blue-100 text-blue-800', label: 'Recibo' };
      case 'orcamento':
        return { icon: FileText, color: 'bg-orange-100 text-orange-800', label: 'Orçamento' };
      case 'entrada':
        return { icon: TrendingUp, color: 'bg-green-100 text-green-800', label: 'Entrada' };
      case 'saida':
        return { icon: TrendingDown, color: 'bg-red-100 text-red-800', label: 'Saída' };
      case 'devedor':
        return { icon: UserX, color: 'bg-yellow-100 text-yellow-800', label: 'Devedor' };
      default:
        return { icon: FileText, color: 'bg-gray-100 text-gray-800', label: 'Documento' };
    }
  };

  // Estado vazio - nenhum documento encontrado
  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="text-gray-400 mb-4">
          <FileText className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum documento encontrado</h3>
          <p className="text-gray-500">Comece criando seu primeiro documento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Barra de busca e filtros */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente ou documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as typeof filterType)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os tipos</option>
            <option value="recibo">Recibos</option>
            <option value="orcamento">Orçamentos</option>
            <option value="entrada">Entradas</option>
            <option value="saida">Saídas</option>
            <option value="devedor">Devedores</option>
          </select>
        </div>
      </div>

      {/* Tabela de documentos */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente/Descrição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDocuments.map((document) => {
              const typeInfo = getTypeInfo(document.type);
              const TypeIcon = typeInfo.icon;
              
              return (
                <tr key={document.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${typeInfo.color}`}>
                      <TypeIcon className="w-3 h-3 mr-1" />
                      {typeInfo.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{document.clientName}</div>
                      {document.clientDocument && (
                        <div className="text-sm text-gray-500">{document.clientDocument}</div>
                      )}
                      {(document.source || document.category) && (
                        <div className="text-sm text-gray-500">
                          {document.source && `Origem: ${document.source}`}
                          {document.category && ` | ${document.category}`}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(document.value || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(document.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onView(document)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors duration-150"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {(document.type === 'recibo' || document.type === 'orcamento') && (
                        <button
                          onClick={(e) => handleDownloadPDF(document, e)}
                          className="text-green-600 hover:text-green-900 p-1 rounded transition-colors duration-150"
                          title="Baixar PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(document)}
                        className="text-orange-600 hover:text-orange-900 p-1 rounded transition-colors duration-150"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(document.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded transition-colors duration-150"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};