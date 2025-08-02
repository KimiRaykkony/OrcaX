import { User, LoginCredentials } from '../types/auth';

const AUTH_STORAGE_KEY = 'controlex_auth';
const REMEMBER_ME_KEY = 'controlex_remember_me';

// Usuários de demonstração (em produção, isso viria de uma API)
const DEMO_USERS = [
  {
    id: '1',
    name: 'Administrador',
    email: 'admin@controlex.com',
    password: 'admin123',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Usuário Demo',
    email: 'demo@controlex.com',
    password: 'demo123',
    createdAt: new Date().toISOString()
  }
];

/**
 * Serviço de autenticação para gerenciar login, logout e sessões
 */
export const authService = {
  /**
   * Realiza o login do usuário
   */
  login: async (credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Validar credenciais
      const user = DEMO_USERS.find(
        u => u.email === credentials.email && u.password === credentials.password
      );

      if (!user) {
        return {
          success: false,
          error: 'Email ou senha incorretos'
        };
      }

      // Criar objeto do usuário sem a senha
      const authenticatedUser: User = {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      };

      // Salvar no localStorage
      const authData = {
        user: authenticatedUser,
        timestamp: Date.now(),
        rememberMe: credentials.rememberMe || false
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));

      // Se "lembrar-me" estiver marcado, salvar flag adicional
      if (credentials.rememberMe) {
        localStorage.setItem(REMEMBER_ME_KEY, 'true');
      }

      return {
        success: true,
        user: authenticatedUser
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  },

  /**
   * Realiza o logout do usuário
   */
  logout: (): void => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
  },

  /**
   * Verifica se existe uma sessão ativa válida
   */
  checkSession: (): { isAuthenticated: boolean; user: User | null } => {
    try {
      const authData = localStorage.getItem(AUTH_STORAGE_KEY);
      const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === 'true';

      if (!authData) {
        return { isAuthenticated: false, user: null };
      }

      const parsed = JSON.parse(authData);
      const now = Date.now();
      const sessionAge = now - parsed.timestamp;

      // Sessão expira em 24 horas (ou 30 dias se "lembrar-me" estiver ativo)
      const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

      if (sessionAge > maxAge) {
        // Sessão expirada
        authService.logout();
        return { isAuthenticated: false, user: null };
      }

      // Atualizar timestamp da sessão
      parsed.timestamp = now;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));

      return {
        isAuthenticated: true,
        user: parsed.user
      };
    } catch {
      // Dados corrompidos, limpar
      authService.logout();
      return { isAuthenticated: false, user: null };
    }
  },

  /**
   * Obtém o usuário atual da sessão
   */
  getCurrentUser: (): User | null => {
    const session = authService.checkSession();
    return session.user;
  },

  /**
   * Valida formato de email
   */
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Valida senha (mínimo 6 caracteres)
   */
  validatePassword: (password: string): boolean => {
    return password.length >= 6;
  }
};