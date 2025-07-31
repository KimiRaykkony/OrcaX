import React, { useState, useEffect } from 'react';
import { Save, X, TrendingDown } from 'lucide-react';
import { DocumentItem, FormData } from '../types';
import { validateDocument, formatDocument } from '../utils/formatting';

interface SaidaFormProps {
  document?: DocumentItem;
  onSave: (data: FormData) => void;
  onCancel: () => void;
}

export const SaidaForm: React.FC<SaidaFormProps> = ({ document, onSave, onCancel }) => {
  const [formData, setFormData] = useState<FormData>({
    clientName: '',
    clientDocument: '',
    date: new Date().toISOString().split('T')[0],
    value: 0,
    description: '',
    source: '',
    category: '',
    isRecurring: false,
    observations: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (document) {
      setFormData({
        clientName: document.clientName,
        clientDocument: document.clientDocument,
        date: document.date,
        value: document.value,
        description: document.description || '',
        source: document.source || '',
        category: document.category || '',
        isRecurring: document.isRecurring || false,
        observations: document.observations || ''
      });
    }
  }, [document]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Nome/descrição é obrigatório';
    }

    if (!formData.value || formData.value <= 0) {
      newErrors.value = 'Valor deve ser maior que zero';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Detalhamento é obrigatório';
    }

    if (formData.clientDocument && !validateDocument(formData.clientDocument)) {
      newErrors.clientDocument = 'CPF/CNPJ inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const formatDocumentInput = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, clientDocument: cleanValue }));
  };

  const categories = [
    'Fornecedores',
    'Funcionários',
    'Impostos',
    'Aluguel',
    'Energia',
    'Telefone/Internet',
    'Marketing',
    'Equipamentos',
    'Manutenção',
    'Combustível',
    'Outros'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <TrendingDown className="w-6 h-6 text-red-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              {document ? 'Editar Saída' : 'Nova Saída'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome/Descrição da Despesa *
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.clientName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: Pagamento fornecedor, Aluguel, Conta de luz..."
              />
              {errors.clientName && (
                <p className="text-red-500 text-sm mt-1">{errors.clientName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF/CNPJ do Fornecedor (opcional)
              </label>
              <input
                type="text"
                value={formatDocument(formData.clientDocument)}
                onChange={(e) => formatDocumentInput(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.clientDocument ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
              />
              {errors.clientDocument && (
                <p className="text-red-500 text-sm mt-1">{errors.clientDocument}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data da Saída *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.value || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.value ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.value && (
                <p className="text-red-500 text-sm mt-1">{errors.value}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Origem dos Recursos
              </label>
              <input
                type="text"
                value={formData.source || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Ex: Conta bancária, Caixa, Cartão"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria da Despesa
              </label>
              <select
                value={formData.category || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Detalhamento da Saída *
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Descreva a natureza da saída..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring || false}
              onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-900">
              Saída recorrente (mensal)
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              value={formData.observations || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Informações adicionais (opcional)"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-150"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-150"
            >
              <Save className="w-4 h-4 mr-2" />
              {document ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
