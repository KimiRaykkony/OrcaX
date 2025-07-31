import React from 'react';
import { X, Edit, Download, FileText, Receipt, TrendingUp, TrendingDown, UserX } from 'lucide-react';
import { DocumentItem } from '../types';
import { formatCurrency, formatDate, formatDocument } from '../utils/formatting';
import { generatePDF } from '../utils/pdfGenerator';

interface DocumentViewerProps {
  document: DocumentItem;
  onClose: () => void;
  onEdit: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, onClose, onEdit }) => {
  const handleDownloadPDF = () => {
    generatePDF(document);
  };

  /**
   * Retorna informações de ícone e cor baseado no tipo do documento
   */
  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'recibo':
        return { icon: Receipt, color: 'text-blue-600', bgColor: 'bg-blue-50', label: 'Recibo' };
      case 'orcamento':
        return { icon: FileText, color: 'text-orange-500', bgColor: 'bg-orange-50', label: 'Orçamento' };
      case 'entrada':
        return { icon: TrendingUp, color: 'text-green-600', bgColor: 'bg-green-50', label: 'Entrada' };
      case 'saida':
        return { icon: TrendingDown, color: 'text-red-600', bgColor: 'bg-red-50', label: 'Saída' };
      case 'devedor':
        return { icon: UserX, color: 'text-yellow-600', bgColor: 'bg-yellow-50', label: 'Devedor' };
      default:
        return { icon: FileText, color: 'text-gray-600', bgColor: 'bg-gray-50', label: 'Documento' };
    }
  };

  const typeInfo = getTypeInfo(document.type);
  const TypeIcon = typeInfo.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${typeInfo.bgColor} mr-3`}>
              <TypeIcon className={`w-6 h-6 ${typeInfo.color}`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{typeInfo.label}</h2>
              <p className="text-sm text-gray-500">#{document.id.slice(-8).toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {(document.type === 'recibo' || document.type === 'orcamento') && (
              <button
                onClick={handleDownloadPDF}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-150"
              >
                <Download className="w-4 h-4 mr-2" />
                PDF
              </button>
            )}
            <button
              onClick={onEdit}
              className="flex items-center px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-150"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Informações básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Cliente</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">Nome:</span>
                  <p className="text-gray-900">{document.clientName}</p>
                </div>
                {document.clientDocument && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">CPF/CNPJ:</span>
                    <p className="text-gray-900">{formatDocument(document.clientDocument)}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalhes</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">Data:</span>
                  <p className="text-gray-900">{formatDate(document.date)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Valor:</span>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(document.value || 0)}</p>
                </div>
                {document.paymentMethod && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Forma de Pagamento:</span>
                    <p className="text-gray-900">{document.paymentMethod}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Campos específicos para entrada/saída */}
          {(document.type === 'entrada' || document.type === 'saida') && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informações de {document.type === 'entrada' ? 'Entrada' : 'Saída'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {document.source && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Origem:</span>
                    <p className="text-gray-900">{document.source}</p>
                  </div>
                )}
                {document.category && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Categoria:</span>
                    <p className="text-gray-900">{document.category}</p>
                  </div>
                )}
                {document.isRecurring !== undefined && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Recorrente:</span>
                    <p className="text-gray-900">{document.isRecurring ? 'Sim' : 'Não'}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Descrição */}
          {document.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Descrição</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{document.description}</p>
            </div>
          )}

          {/* Itens do orçamento */}
          {document.type === 'orcamento' && document.items && document.items.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Itens</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Item</th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">Qtd</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Valor Unit.</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {document.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-center">{item.quantity}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-sm font-medium text-gray-900 text-right">Total Geral:</td>
                      <td className="px-4 py-2 text-sm font-bold text-gray-900 text-right">
                        {formatCurrency(document.items.reduce((sum, item) => sum + item.total, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Condições de pagamento e validade (orçamento) */}
          {document.type === 'orcamento' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {document.paymentConditions && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Condições de Pagamento</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{document.paymentConditions}</p>
                </div>
              )}
              {document.validity && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Validade</h3>
                  <p className="text-gray-700">{document.validity}</p>
                </div>
              )}
            </div>
          )}

          {/* Observações */}
          {document.observations && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Observações</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{document.observations}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};