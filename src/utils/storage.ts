import { DocumentItem } from '../types';

const STORAGE_KEY = 'orcax_documents';

/**
 * Serviço para gerenciar o armazenamento local dos documentos
 * Utiliza localStorage para persistir os dados
 */
export const storageService = {
  /**
   * Recupera todos os documentos do localStorage
   */
  getDocuments: (): DocumentItem[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  /**
   * Salva ou atualiza um documento no localStorage
   */
  saveDocument: (document: DocumentItem): void => {
    try {
      const documents = storageService.getDocuments();
      const existingIndex = documents.findIndex(doc => doc.id === document.id);
      
      if (existingIndex >= 0) {
        // Atualiza documento existente
        documents[existingIndex] = document;
      } else {
        // Adiciona novo documento no início da lista
        documents.unshift(document);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
    }
  },

  /**
   * Remove um documento do localStorage
   */
  deleteDocument: (id: string): void => {
    try {
      const documents = storageService.getDocuments();
      const filtered = documents.filter(doc => doc.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
    }
  },

  /**
   * Busca um documento específico pelo ID
   */
  getDocument: (id: string): DocumentItem | undefined => {
    const documents = storageService.getDocuments();
    return documents.find(doc => doc.id === id);
  },

  /**
   * Limpa todos os documentos do localStorage
   */
  clearAllDocuments: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao limpar documentos:', error);
    }
  }
};