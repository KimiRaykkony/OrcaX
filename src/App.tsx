import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Header } from './components/Header';
import { DocumentTable } from './components/DocumentTable';
import { ReciboForm } from './components/ReciboForm';
import { OrcamentoForm } from './components/OrcamentoForm';
import { EntradaForm } from './components/EntradaForm';
import { SaidaForm } from './components/SaidaForm';
import { DevedorForm } from './components/DevedorForm';
import { DocumentViewer } from './components/DocumentViewer';
import { DocumentItem, FormData } from './types';
import { storageService } from './utils/storage';

type ActiveView = 'dashboard' | 'recibo-form' | 'orcamento-form' | 'entrada-form' | 'saida-form' | 'devedor-form' | 'viewer';

function App() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [editingDocument, setEditingDocument] = useState<DocumentItem | undefined>();
  const [viewingDocument, setViewingDocument] = useState<DocumentItem | undefined>();

  useEffect(() => {
    const storedDocuments = storageService.getDocuments();
    setDocuments(storedDocuments);
  }, []);

  // Handlers para criar novos documentos
  const handleNewRecibo = () => {
    setEditingDocument(undefined);
    setActiveView('recibo-form');
  };

  const handleNewOrcamento = () => {
    setEditingDocument(undefined);
    setActiveView('orcamento-form');
  };

  const handleNewEntrada = () => {
    setEditingDocument(undefined);
    setActiveView('entrada-form');
  };

  const handleNewSaida = () => {
    setEditingDocument(undefined);
    setActiveView('saida-form');
  };

  const handleNewDevedor = () => {
    setEditingDocument(undefined);
    setActiveView('devedor-form');
  };

  // Handler para editar documentos existentes
  const handleEditDocument = (document: DocumentItem) => {
    setEditingDocument(document);
    switch (document.type) {
      case 'recibo':
        setActiveView('recibo-form');
        break;
      case 'orcamento':
        setActiveView('orcamento-form');
        break;
      case 'entrada':
        setActiveView('entrada-form');
        break;
      case 'saida':
        setActiveView('saida-form');
        break;
      case 'devedor':
        setActiveView('devedor-form');
        break;
      default:
        setActiveView('dashboard');
    }
  };

  // Handler para visualizar documentos
  const handleViewDocument = (document: DocumentItem) => {
    setViewingDocument(document);
    setActiveView('viewer');
  };

  // Handler para salvar documentos (criar ou atualizar)
  const handleSaveDocument = (formData: FormData, type: 'recibo' | 'orcamento' | 'entrada' | 'saida' | 'devedor') => {
    // Calcula o valor total baseado no tipo de documento
    let totalValue = 0;
    if (type === 'orcamento') {
      totalValue = formData.items?.reduce((sum, item) => sum + item.total, 0) || 0;
    } else {
      totalValue = formData.value || 0;
    }

    const document: DocumentItem = {
      id: editingDocument?.id || uuidv4(),
      type,
      clientName: formData.clientName,
      clientDocument: formData.clientDocument,
      date: formData.date,
      value: totalValue,
      description: formData.description,
      paymentMethod: formData.paymentMethod,
      items: formData.items,
      observations: formData.observations,
      paymentConditions: formData.paymentConditions,
      validity: formData.validity,
      createdAt: editingDocument?.createdAt || new Date().toISOString(),
      // Campos específicos para entrada/saída
      source: formData.source,
      category: formData.category,
      isRecurring: formData.isRecurring
    };

    storageService.saveDocument(document);
    
    const updatedDocuments = storageService.getDocuments();
    setDocuments(updatedDocuments);
    
    // Volta para o dashboard e limpa o estado de edição
    setActiveView('dashboard');
    setEditingDocument(undefined);
  };

  // Handler para deletar documentos
  const handleDeleteDocument = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      storageService.deleteDocument(id);
      const updatedDocuments = storageService.getDocuments();
      setDocuments(updatedDocuments);
    }
  };

  // Handler para fechar modais
  const handleCloseModal = () => {
    setActiveView('dashboard');
    setEditingDocument(undefined);
    setViewingDocument(undefined);
  };

  // Handler para editar a partir do visualizador
  const handleEditFromViewer = () => {
    if (viewingDocument) {
      setEditingDocument(viewingDocument);
      handleEditDocument(viewingDocument);
      setViewingDocument(undefined);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onNewRecibo={handleNewRecibo}
        onNewOrcamento={handleNewOrcamento}
        onNewEntrada={handleNewEntrada}
        onNewSaida={handleNewSaida}
        onNewDevedor={handleNewDevedor}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Gerencie seus recibos, orçamentos, entradas, saídas e devedores de forma profissional
          </p>
        </div>

        <DocumentTable
          documents={documents}
          onEdit={handleEditDocument}
          onDelete={handleDeleteDocument}
          onView={handleViewDocument}
        />
      </main>

      {/* Modals */}
      {activeView === 'recibo-form' && (
        <ReciboForm
          document={editingDocument}
          onSave={(data) => handleSaveDocument(data, 'recibo')}
          onCancel={handleCloseModal}
        />
      )}

      {activeView === 'orcamento-form' && (
        <OrcamentoForm
          document={editingDocument}
          onSave={(data) => handleSaveDocument(data, 'orcamento')}
          onCancel={handleCloseModal}
        />
      )}

      {activeView === 'entrada-form' && (
        <EntradaForm
          document={editingDocument}
          onSave={(data) => handleSaveDocument(data, 'entrada')}
          onCancel={handleCloseModal}
        />
      )}

      {activeView === 'saida-form' && (
        <SaidaForm
          document={editingDocument}
          onSave={(data) => handleSaveDocument(data, 'saida')}
          onCancel={handleCloseModal}
        />
      )}

      {activeView === 'devedor-form' && (
        <DevedorForm
          document={editingDocument}
          onSave={(data) => handleSaveDocument(data, 'devedor')}
          onCancel={handleCloseModal}
        />
      )}

      {activeView === 'viewer' && viewingDocument && (
        <DocumentViewer
          document={viewingDocument}
          onClose={handleCloseModal}
          onEdit={handleEditFromViewer}
        />
      )}
    </div>
  );
}

export default App;
