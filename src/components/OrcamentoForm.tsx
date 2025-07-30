import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, FileText } from 'lucide-react';
import { DocumentItem, FormData, OrçamentoItem } from '../types';
import { validateDocument, formatDocument } from '../utils/formatting';
import { v4 as uuidv4 } from 'uuid';

interface OrcamentoFormProps {
  document?: DocumentItem;
  onSave: (data: FormData) => void;
  onCancel: () => void;
}

export const OrcamentoForm: React.FC<OrcamentoFormProps> = ({ document, onSave, onCancel }) => {
  const [formData, setFormData] = useState<FormData>({
    clientName: '',
    clientDocument: '',
    date: new Date().toISOString().split('T')[0],
    items: [{ id: uuidv4(), name: '', quantity: 1, unitPrice: 0, total: 0 }],
    paymentConditions: '',
    validity: '',
    observations: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (document) {
      setFormData({
        clientName: document.clientName,
        clientDocument: document.clientDocument,
        date: document.date,
        items: document.items || [{ id: uuidv4(), name: '', quantity: 1, unitPrice: 0, total: 0 }],
        paymentConditions: document.paymentConditions || '',
        validity: document.validity || '',
        observations: document.observations || ''
      });
    }
  }, [document]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Nome do cliente é obrigatório';
    }

    if (!formData.clientDocument.trim()) {
      newErrors.clientDocument = 'CPF/CNPJ é obrigatório';
    } else if (!validateDocument(formData.clientDocument)) {
      newErrors.clientDocument = 'CPF/CNPJ inválido';
    }

    if (!formData.items || formData.items.length === 0) {
      newErrors.items = 'Adicione pelo menos um item';
    } else {
      const hasInvalidItem = formData.items.some(item => 
        !item.name.trim() || item.quantity <= 0 || item.unitPrice <= 0
      );
      if (hasInvalidItem) {
        newErrors.items = 'Todos os itens devem ter nome, quantidade e valor válidos';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const totalValue = formData.items?.reduce((sum, item) => sum + item.total, 0) || 0;
      onSave({ ...formData, value: totalValue });
    }
  };

  const formatDocumentInput = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, clientDocument: cleanValue }));
  };

  const addItem = () => {
    const newItem: OrçamentoItem = {
      id: uuidv4(),
      name: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
  };

  const removeItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      items: (prev.items || []).filter(item => item.id !== id)
    }));
  };

  const updateItem = (id: string, field: keyof OrçamentoItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: (prev.items || []).map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const getTotalValue = () => {
    return formData.items?.reduce((sum, item) => sum + item.total, 0) || 0;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-orange-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              {document ? 'Editar Orçamento' : 'Novo Orçamento'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Cliente *
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.clientName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Nome completo do cliente"
              />
              {errors.clientName && (
                <p className="text-red-500 text-sm mt-1">{errors.clientName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF/CNPJ *
              </label>
              <input
                type="text"
                value={formatDocument(formData.clientDocument)}
                onChange={(e) => formatDocumentInput(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.clientDocument ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
              />
              {errors.clientDocument && (
                <p className="text-red-500 text-sm mt-1">{errors.clientDocument}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Items Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Itens do Orçamento *
              </label>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center px-3 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors duration-150"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Item
              </button>
            </div>

            {errors.items && (
              <p className="text-red-500 text-sm mb-4">{errors.items}</p>
            )}

            <div className="space-y-4">
              {formData.items?.map((item, index) => (
                <div key={item.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-5">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome do Item
                      </label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Descrição do item"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantidade
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor Unit.
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total
                      </label>
                      <input
                        type="text"
                        value={`R$ ${item.total.toFixed(2)}`}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      />
                    </div>
                    <div className="md:col-span-1">
                      {formData.items && formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="w-full p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-150"
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-right">
              <span className="text-lg font-semibold text-gray-900">
                Total Geral: R$ {getTotalValue().toFixed(2)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condições de Pagamento
              </label>
              <textarea
                value={formData.paymentConditions || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentConditions: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Ex: 50% à vista, 50% em 30 dias..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Validade do Orçamento
              </label>
              <input
                type="text"
                value={formData.validity || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, validity: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Ex: 30 dias, Até 31/12/2024..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              value={formData.observations || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Observações adicionais (opcional)..."
            />
          </div>

          {/* Actions */}
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
              className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-150"
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