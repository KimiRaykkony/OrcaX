import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AuthForm } from './components/AuthForm';
import { Header } from './components/Header';
import { FinancialSummary } from './components/FinancialSummary';
import { DocumentTable } from './components/DocumentTable';
import { ReciboForm } from './components/ReciboForm';
import { OrcamentoForm } from './components/OrcamentoForm';
import { EntradaForm } from './components/EntradaForm';
import { SaidaForm } from './components/SaidaForm';
import { DevedorForm } from './components/DevedorForm';
import { DocumentViewer } from './components/DocumentViewer';
import { Rodape } from './components/Rodape'; // ✅ Importação do rodapé
import { UserManagement } from './components/admin/UserManagement';
import { DocumentItem, FormData } from './types';
import { User } from './types/auth';
import { authService } from './utils/auth';
import { storageService } from './utils/storage';

type ActiveView =
  | 'dashboard'
  | 'user-management'
  | 'recibo-form'
  | 'orcamento-form'
  | 'entrada-form'
  | 'saida-form'
  | 'devedor-form'
  | 'viewer';

function App() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [editingDocument, setEditingDocument] = useState<DocumentItem | undefined>();
  const [viewingDocument, setViewingDocument] = useState<DocumentItem | undefined>();

  // Verificar sessão ativa ao carregar a aplicação
  useEffect(() => {
    const session = authService.checkSession();
    setIsAuthenticated(session.isAuthenticated);
    setCurrentUser(session.user);
    setAuthLoading(false);
  }, []);

  // Carregar documentos apenas se autenticado
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const storedDocuments = storageService.getDocuments();
    setDocuments(storedDocuments);
  }, [isAuthenticated]);

  const handleLoginSuccess = () => {
    const session = authService.checkSession();
    setIsAuthenticated(session.isAuthenticated);
    setCurrentUser(session.user);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveView('dashboard');
  };

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

  const handleUserManagement = () => {
    setActiveView('user-management');
  };

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

  const handleViewDocument = (document: DocumentItem) => {
    setViewingDocument(document);
    setActiveView('viewer');
  };

  const handleSaveDocument = (
    formData: FormData,
    type: 'recibo' | 'orcamento' | 'entrada' | 'saida' | 'devedor'
  ) => {
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
      source: formData.source,
      category: formData.category,
      isRecurring: formData.isRecurring
    };

    storageService.saveDocument(document);

    const updatedDocuments = storageService.getDocuments();
    setDocuments(updatedDocuments);

    setActiveView('dashboard');
    setEditingDocument(undefined);
  };

  const handleDeleteDocument = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      storageService.deleteDocument(id);
      const updatedDocuments = storageService.getDocuments();
      setDocuments(updatedDocuments);
    }
  };

  const handleCloseModal = () => {
    setActiveView('dashboard');
    setEditingDocument(undefined);
    setViewingDocument(undefined);
  };

  const handleEditFromViewer = () => {
    if (viewingDocument) {
      setEditingDocument(viewingDocument);
      handleEditDocument(viewingDocument);
      setViewingDocument(undefined);
    }
  };

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Mostrar tela de login se não autenticado
  if (!isAuthenticated) {
    return <AuthForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">{/* ✅ padding-bottom para o rodapé fixo */}
      <Header
        onNewRecibo={handleNewRecibo}
        onNewOrcamento={handleNewOrcamento}
        onNewEntrada={handleNewEntrada}
        onNewSaida={handleNewSaida}
        onNewDevedor={handleNewDevedor}
        onLogout={handleLogout}
        onUserManagement={currentUser?.role === 'admin' ? handleUserManagement : undefined}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'dashboard' && (
          <>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Gerencie seus recibos, orçamentos, entradas, saídas e devedores de forma profissional
          </p>
        </div>

        <div className="mb-8">
          <FinancialSummary documents={documents} />
        </div>

        <DocumentTable
          documents={documents}
          onEdit={handleEditDocument}
          onDelete={handleDeleteDocument}
          onView={handleViewDocument}
        />
          </>
        )}

        {activeView === 'user-management' && currentUser?.role === 'admin' && (
          <UserManagement />
        )}
      </main>

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

      <Rodape /> {/* ✅ Rodapé fixo no fim da tela */}
    </div>
  );
}

export default App;
