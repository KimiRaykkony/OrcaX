/**
 * Formata um valor numérico para moeda brasileira (R$)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Formata uma data para o padrão brasileiro (dd/mm/aaaa)
 */
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('pt-BR');
};

/**
 * Formata CPF ou CNPJ com máscaras apropriadas
 */
export const formatDocument = (document: string): string => {
  const cleanDoc = document.replace(/\D/g, '');
  if (cleanDoc.length === 11) {
    // Formato CPF: 000.000.000-00
    return cleanDoc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (cleanDoc.length === 14) {
    // Formato CNPJ: 00.000.000/0000-00
    return cleanDoc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return document;
};

/**
 * Valida se um documento (CPF ou CNPJ) tem o número correto de dígitos
 */
export const validateDocument = (document: string): boolean => {
  const cleanDoc = document.replace(/\D/g, '');
  return cleanDoc.length === 11 || cleanDoc.length === 14;
};

/**
 * Converte um valor para número, tratando casos especiais
 */
export const parseNumber = (value: string | number): number => {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Trunca um texto para um tamanho máximo, adicionando reticências
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};