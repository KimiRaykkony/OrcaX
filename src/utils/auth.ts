import { User, LoginCredentials, RegisterCredentials } from '../types/auth';

const AUTH_STORAGE_KEY = 'controlex_auth';
const REMEMBER_ME_KEY = 'controlex_remember_me';
const USERS_STORAGE_KEY = 'controlex_users';

// Usuários padrão do sistema
const getDefaultUsers = () => [
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

// Função para obter todos os usuários (incluindo cadastrados)
const getAllUsers = () => {
  try {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    
    // Se não há usuários armazenados, inicializar com usuários padrão
    if (users.length === 0) {
      const defaultUsers = getDefaultUsers();
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    
    return users;
  } catch {
    const defaultUsers = getDefaultUsers();
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }
};

// Função para salvar um novo usuário
const saveUser = (user: any) => {
  try {
    const users = getAllUsers();
    users.push(user);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    return true;
  } catch {
    return false;
  }
};
/**
 * Serviço de autenticação para gerenciar login, logout e sessões
 */
export const authService = {
  /**
   * Registra um novo usuário
   */
  register: async (credentials: RegisterCredentials): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Validar se email já existe
      const users = getAllUsers();
      const existingUser = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());
      
      if (existingUser) {
        return {
          success: false,
          error: 'Este email já está cadastrado'
        };
      }

      // Criar novo usuário
      const newUser = {
        id: Date.now().toString(),
        name: credentials.name,
        email: credentials.email.toLowerCase(),
        password: credentials.password, // Em produção, seria hasheada
        createdAt: new Date().toISOString()
      };

      // Salvar usuário
      const saved = saveUser(newUser);
      if (!saved) {
        return {
          success: false,
          error: 'Erro ao salvar usuário'
        };
      }

      // Retornar usuário sem senha
      const registeredUser: User = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt
      };

      return {
        success: true,
        user: registeredUser
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  },

  /**
   * Realiza o login do usuário
   */
  login: async (credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Validar credenciais
      const users = getAllUsers();
      const user = users.find(
        u => u.email.toLowerCase() === credentials.email.toLowerCase() && u.password === credentials.password
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
  validatePassword: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Mínimo 8 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Uma letra maiúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Uma letra minúscula');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Um número');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Calcula a força da senha
   */
  getPasswordStrength: (password: string): { strength: 'weak' | 'medium' | 'strong'; score: number } => {
    let score = 0;
    
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[a-z]/.test(password)) score += 25;
    if (/\d/.test(password)) score += 25;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;
    
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (score >= 75) strength = 'strong';
    else if (score >= 50) strength = 'medium';
    
    return { strength, score: Math.min(100, score) };
  },

  /**
   * Valida nome completo
   */
  validateName: (name: string): boolean => {
    return name.trim().length >= 2 && /^[a-zA-ZÀ-ÿ\s]+$/.test(name.trim());
  }
};