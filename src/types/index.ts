export * from './auth';

export interface DocumentItem {
  id: string;
  type: 'recibo' | 'orcamento' | 'entrada' | 'saida' | 'devedor';
  clientName: string;
  clientDocument: string;
  date: string;
  value: number;
  description?: string;
  paymentMethod?: string;
  items?: OrçamentoItem[];
  observations?: string;
  paymentConditions?: string;
  validity?: string;
  createdAt: string;
  // Campos específicos para entrada/saída
  source?: string;
  category?: string;
  isRecurring?: boolean;
}

export interface OrçamentoItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface FormData {
  clientName: string;
  clientDocument: string;
  date: string;
  value?: number;
  description?: string;
  paymentMethod?: string;
  items?: OrçamentoItem[];
  observations?: string;
  paymentConditions?: string;
  validity?: string;
  // Campos específicos para entrada/saída
  source?: string;
  category?: string;
  isRecurring?: boolean;
}