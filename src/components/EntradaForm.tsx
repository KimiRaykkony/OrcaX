import React, { useState, useEffect, useCallback } from 'react';
import { Save, X, DollarSign, Calendar, CreditCard } from 'lucide-react';
import { DocumentItem, FormData } from '../types';

type PaymentMethod = 'Dinheiro' | 'PIX' | 'Cartão de Débito' | 'Cartão de Crédito' | 'Transferência Bancária' | 'Boleto' | 'Depósito';
type EntryCategory = 'Salário' | 'Freelance' | 'Investimentos' | 'Vendas' | 'Reembolso' | 'Presente' | 'Outros';

interface EntradaFormProps {
  document?: DocumentItem;
  onSave: (data: FormData) => void;
  onCancel: () => void;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  'Dinheiro',
  'PIX',
  'Cartão de Débito',
  'Cartão de Crédito',
  'Transferência Bancária',
  'Boleto',
  'Depósito'
];

const CATEGORIES: EntryCategory[] = [
  'Salário',
  'Freelance',
  'Investimentos',
  'Vendas',
  'Reembolso',
  'Presente',
  'Outros'
];

export const EntradaForm: React.FC<EntradaFormProps> = ({ document, onSave, onCancel }) => {
  const [formData, setFormData] = useState<FormData>({
    clientName: '',
    clientDocument: '',
    date: new Date().toISOString().split('T')[0],
    value: 0,
    source: '',
    paymentMethod: 'Dinheiro',
    category: 'Outros',
    description: '',
    isRecurring: false,
    observations: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preenche o formulário quando uma entrada existente é fornecida
  useEffect(() => {
    if (document) {
      setFormData({
        clientName: document.clientName,
        clientDocument: document.clientDocument,
        date: document.date,
        value: document.value,
        source: document.source || '',
        paymentMethod: document.paymentMethod || 'Dinheiro',
        category: document.category || 'Outros',
        description: document.description || '',
        isRecurring: document.isRecurring || false,
        observations: document.observations || ''
      });
    }
  }, [document]);

  // Validação do formulário
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientName?.trim()) {
      newErrors.clientName = 'Nome é obrigatório';
    }

    if (!formData.value || formData.value <= 0) {
      newErrors.value = 'Valor deve ser maior que zero';
    }

    if (!formData.source?.trim()) {
      newErrors.source = 'Origem é obrigatória';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Forma de pagamento é obrigatória';
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Estilos reutilizáveis
  const inputClasses = (field: string) => 
    `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
      errors[field] ? 'border-red-300' : 'border-gray-300 hover:border-gray-400'
    }`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center">
            <DollarSign className="w-6 h-6 text-green-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              {document ? 'Editar Entrada' : 'Nova Entrada Financeira'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
            aria-label="Fechar formulário"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div>
              <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">
                Nome/Descrição *
              </label>
              <input
                id="clientName"
                type="text"
                value={formData.clientName || ''}
                onChange={(e) => handleChange('clientName', e.target.value)}
                className={inputClasses('clientName')}
                placeholder="Nome ou descrição da entrada"
              />
              {errors.clientName && (
                <p className="text-red-500 text-sm mt-1">{errors.clientName}</p>
              )}
            </div>

            {/* Valor */}
            <div>
              <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <DollarSign className="w-4 h-4 mr-1 text-green-500" />
                Valor (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">R$</span>
                <input
                  id="value"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.value || ''}
                  onChange={(e) => handleChange('value', parseFloat(e.target.value) || 0)}
                  className={`${inputClasses('value')} pl-8`}
                  placeholder="0.00"
                />
              </div>
              {errors.value && (
                <p className="text-red-500 text-sm mt-1">{errors.value}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-blue-500" />
                Data *
              </label>
              <input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className={inputClasses('date')}
              />
            </div>

            {/* Origem */}
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
                Origem *
              </label>
              <input
                id="source"
                type="text"
                value={formData.source || ''}
                onChange={(e) => handleChange('source', e.target.value)}
                className={inputClasses('source')}
                placeholder="Ex: Empresa X, Cliente Y"
              />
              {errors.source && (
                <p className="text-red-500 text-sm mt-1">{errors.source}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Categoria */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Categoria *
              </label>
              <select
                id="category"
                value={formData.category || 'Outros'}
                onChange={(e) => handleChange('category', e.target.value)}
                className={inputClasses('category')}
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            {/* Forma de Pagamento */}
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <CreditCard className="w-4 h-4 mr-1 text-purple-500" />
                Forma de Pagamento *
              </label>
              <select
                id="paymentMethod"
                value={formData.paymentMethod || 'Dinheiro'}
                onChange={(e) => handleChange('paymentMethod', e.target.value)}
                className={inputClasses('paymentMethod')}
              >
                {PAYMENT_METHODS.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
              {errors.paymentMethod && (
                <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição (Opcional)
            </label>
            <textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={2}
              className={inputClasses('description')}
              placeholder="Detalhes adicionais sobre esta entrada..."
            />
          </div>

          {/* Observações */}
          <div>
            <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              id="observations"
              value={formData.observations || ''}
              onChange={(e) => handleChange('observations', e.target.value)}
              rows={2}
              className={inputClasses('observations')}
              placeholder="Observações adicionais (opcional)..."
            />
          </div>

          {/* Recorrente */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring || false}
              onChange={(e) => handleChange('isRecurring', e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700">
              Esta é uma entrada recorrente?
            </label>
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
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-150"
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
  date: new Date().toISOString().split('T')[0],
  source: '',
  paymentMethod: 'Dinheiro',
  category: 'Outros',
  description: '',
  isRecurring: false
};

export const EntradaForm: React.FC<FinancialEntryFormProps> = ({ 
  entry, 
  onSave, 
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<FinancialEntry>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Preenche o formulário quando uma entrada existente é fornecida
  useEffect(() => {
    if (entry) {
      setFormData(entry);
    } else {
      setFormData(INITIAL_FORM_DATA);
    }
  }, [entry]);

  // Validação do formulário
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }

    if (!formData.source.trim()) {
      newErrors.source = 'Origem é obrigatória';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Forma de pagamento é obrigatória';
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Validação em tempo real para campos tocados
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validateForm();
    }
  }, [formData, touched, validateForm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      amount: true,
      source: true,
      paymentMethod: true,
      category: true
    });
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = <K extends FinancialEntryField>(field: K, value: FinancialEntry[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Estilos reutilizáveis
  const inputClasses = (field: string) => 
    `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
      errors[field] ? 'border-red-300' : 'border-gray-300 hover:border-gray-400'
    } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center">
            <DollarSign className="w-6 h-6 text-green-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              {entry ? 'Editar Entrada' : 'Nova Entrada Financeira'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
            disabled={isLoading}
            aria-label="Fechar formulário"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Valor */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <DollarSign className="w-4 h-4 mr-1 text-green-500" />
                Valor (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">R$</span>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount || ''}
                  onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                  className={`${inputClasses('amount')} pl-8`}
                  placeholder="0.00"
                  disabled={isLoading}
                />
              </div>
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
              )}
            </div>

            {/* Data */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-blue-500" />
                Data *
              </label>
              <input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className={inputClasses('date')}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Origem */}
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
                Origem *
              </label>
              <input
                id="source"
                type="text"
                value={formData.source}
                onChange={(e) => handleChange('source', e.target.value)}
                className={inputClasses('source')}
                placeholder="Ex: Empresa X, Cliente Y"
                disabled={isLoading}
              />
              {errors.source && (
                <p className="text-red-500 text-sm mt-1">{errors.source}</p>
              )}
            </div>

            {/* Categoria */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Categoria *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value as EntryCategory)}
                className={inputClasses('category')}
                disabled={isLoading}
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <CreditCard className="w-4 h-4 mr-1 text-purple-500" />
              Forma de Pagamento *
            </label>
            <select
              id="paymentMethod"
              value={formData.paymentMethod}
              onChange={(e) => handleChange('paymentMethod', e.target.value as PaymentMethod)}
              className={inputClasses('paymentMethod')}
              disabled={isLoading}
            >
              {PAYMENT_METHODS.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
            {errors.paymentMethod && (
              <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição (Opcional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={2}
              className={`${inputClasses('description')}`}
              placeholder="Detalhes adicionais sobre esta entrada..."
              disabled={isLoading}
            />
          </div>

          {/* Recorrente */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={(e) => handleChange('isRecurring', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700">
              Esta é uma entrada recorrente?
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-150 disabled:opacity-50"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-150 disabled:bg-green-400 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                </span>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {entry ? 'Atualizar' : 'Salvar'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};