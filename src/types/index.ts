export interface DocumentItem {
  id: string;
  type: 'recibo' | 'orcamento';
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
}