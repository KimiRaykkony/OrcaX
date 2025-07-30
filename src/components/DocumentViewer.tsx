import React from 'react';
import { X, Download, Edit, Receipt, FileText, TrendingUp, TrendingDown, UserX } from 'lucide-react';
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

  const getTotalValue = () => {
    if (document.type === 'recibo' || document.type === 'entrada' || document.type === 'saida' || document.type === 'devedor') {
      return document.value || 0;
    }
    return document.items?.reduce((sum, item) => sum + item.total, 0) || 0;
  };

  // Função para obter informações do tipo de documento
  const getDocumentTypeInfo = () => {
    switch (document.type) {
      case 'recibo':
        return { title: 'Visualizar Recibo', icon: Receipt, label: 'RECIBO' };
      case 'orcamento':
        return { title: 'Visualizar Orçamento', icon: FileText, label: 'ORÇAMENTO' };
      case 'entrada':
        return { title: 'Visualizar Entrada', icon: TrendingUp, label: 'ENTRADA FINANCEIRA' };
      case 'saida':
        return { title: 'Visualizar Saída', icon: TrendingDown, label: 'SAÍDA FINANCEIRA' };
      case 'devedor':
        return { title: 'Visualizar Devedor', icon: UserX, label: 'REGISTRO DE DEVEDOR' };
      default:
        return { title: 'Visualizar Documento', icon: FileText, label: 'DOCUMENTO' };
    }
  };

  const docInfo = getDocumentTypeInfo();
  const DocIcon = docInfo.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {docInfo.title}
          </h2>
          <div className="flex items-center space-x-2">
            {(document.type === 'recibo' || document.type === 'orcamento') && (
              <button
                onClick={handleDownloadPDF}
                className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors duration-150"
              >
                <Download className="w-4 h-4 mr-1" />
                PDF
              </button>
            )}
            <button
              onClick={onEdit}
              className="flex items-center px-3 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors duration-150"
            >
              <Edit className="w-4 h-4 mr-1" />
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

        {/* Document Content */}
        <div className="p-8 bg-white">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-blue-900 mb-2">
                Orça<span className="text-orange-500">X</span>
              </h1>
              <h2 className="text-2xl font-semibold text-gray-800">
                <DocIcon className="w-6 h-6 mr-2 text-gray-600" />
                <h2 className="text-2xl font-semibold text-gray-800">
                  {docInfo.label}
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>Data: {formatDate(document.date)}</p>
              <p>Documento: {document.id.slice(-8).toUpperCase()}</p>
            </div>
          </div>

          {/* Client/Info Section */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {document.type === 'entrada' || document.type === 'saida' ? 'Informações' : 'Dados do Cliente'}
            </h3>
            <p className="text-gray-700"><strong>Nome:</strong> {document.clientName}</p>
            {document.clientDocument && (
              <p className="text-gray-700"><strong>CPF/CNPJ:</strong> {formatDocument(document.clientDocument)}</p>
            )}
            {document.source && (
              <p className="text-gray-700">
                <strong>{document.type === 'entrada' ? 'Origem:' : document.type === 'saida' ? 'Destino:' : 'Origem:'}</strong> {document.source}
              </p>
            )}
            {document.category && (
              <p className="text-gray-700"><strong>Categoria:</strong> {document.category}</p>
            )}
            {document.isRecurring && (
              <p className="text-gray-700"><strong>Recorrente:</strong> Sim</p>
            )}
          </div>

          {/* Content based on document type */}
          {(document.type === 'recibo' || document.type === 'entrada' || document.type === 'saida' || document.type === 'devedor') ? (
            <div className="space-y-6">
              {document.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {document.type === 'devedor' ? 'Descrição do Serviço' : 'Descrição'}
                  </h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{document.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Valor</h3>
                  <p className={`text-2xl font-bold ${
                    document.type === 'entrada' ? 'text-green-600' : 
                    document.type === 'saida' ? 'text-red-600' : 
                    document.type === 'devedor' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {formatCurrency(document.value || 0)}
                  </p>
                </div>

                {document.paymentMethod && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Forma de Pagamento</h3>
                    <p className="text-gray-700">{document.paymentMethod}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Orçamento content
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Itens do Orçamento</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left">Item</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Qtd</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Valor Unit.</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {document.items?.map((item) => (
                        <tr key={item.id}>
                          <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="border border-gray-300 px-4 py-2 text-right font-semibold">
                          Total Geral:
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-bold text-green-600">
                          {formatCurrency(getTotalValue())}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {document.paymentConditions && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Condições de Pagamento</h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{document.paymentConditions}</p>
                  </div>
                )}

                {document.validity && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Validade</h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{document.validity}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Observations */}
          {document.observations && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Observações</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{document.observations}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            Documento gerado pelo OrçaX
          </div>
        </div>
      </div>
    </div>
  );
};