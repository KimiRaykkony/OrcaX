import { DocumentItem } from '../types';

const STORAGE_KEY = 'orcax_documents';

export const storageService = {
  getDocuments: (): DocumentItem[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveDocument: (document: DocumentItem): void => {
    try {
      const documents = storageService.getDocuments();
      const existingIndex = documents.findIndex(doc => doc.id === document.id);
      
      if (existingIndex >= 0) {
        documents[existingIndex] = document;
      } else {
        documents.unshift(document);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
    }
  },

  deleteDocument: (id: string): void => {
    try {
      const documents = storageService.getDocuments();
      const filtered = documents.filter(doc => doc.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
    }
  },

  getDocument: (id: string): DocumentItem | undefined => {
    const documents = storageService.getDocuments();
    return documents.find(doc => doc.id === id);
  }
};