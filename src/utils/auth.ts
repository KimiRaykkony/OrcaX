import { User, LoginCredentials, RegisterCredentials } from '../types/auth';
import { encryptPassword, verifyPassword } from './encryption';

const AUTH_STORAGE_KEY = 'controlex_auth';
const REMEMBER_ME_KEY = 'controlex_remember_me';
const USERS_STORAGE_KEY = 'controlex_users';

// Usuário administrador padrão
const getDefaultAdmin = () => ({
  id: 'admin-001',
  name: 'Administrador Principal',
  email: 'admin@controlex.com',
  password: encryptPassword('admin123'),
  role: 'admin' as const,
  createdAt: new Date().toISOString(),
  isActive: true
});

// Função para obter todos os usuários
const getAllUsers = (): any[] => {
  try {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    
    // Se não há usuários, inicializar com admin padrão
    if (users.length === 0) {
      const defaultAdmin = getDefaultAdmin();
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([defaultAdmin]));
      return [defaultAdmin];
    }
    
    return users;
  } catch {
    const defaultAdmin = getDefaultAdmin();
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([defaultAdmin]));
    return [defaultAdmin];
  }
};

// Função para salvar usuário
const saveUser = (user: any): boolean => {
  try {
    const users = getAllUsers();
    users.push(user);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    return true;
  } catch {
    return false;
  }
};

// Função para atualizar usuário
const updateUser = (updatedUser: any): boolean => {
  try {
    const users = getAllUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

// Função para deletar usuário
const deleteUser = (userId: string): boolean => {
  try {
    const users = getAllUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filteredUsers));
    return true;
  } catch {
    return false;
  }
};

/**
 * Serviço de autenticação com controle de permissões
 */
export const authService = {
  /**
   * Registra um novo usuário (apenas admins podem criar gerentes)
   */
  register: async (credentials: RegisterCredentials, createdBy?: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const users = getAllUsers();
      
      // Verificar se email já existe
      const existingUser = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());
      if (existingUser) {
        return { success: false, error: 'Este email já está cadastrado' };
      }

      // Se está criando um gerente, verificar limites
      if (credentials.role === 'manager') {
        const activeManagers = users.filter(u => u.role === 'manager' && u.isActive);
        if (activeManagers.length >= 2) {
          return { success: false, error: 'Limite máximo de 2 gerentes atingido' };
        }
      }

      // Criar novo usuário
      const newUser = {
        id: `${credentials.role}-${Date.now()}`,
        name: credentials.name,
        email: credentials.email.toLowerCase(),
        password: encryptPassword(credentials.password),
        role: credentials.role || 'manager',
        createdAt: new Date().toISOString(),
        createdBy: createdBy,
        isActive: true
      };

      const saved = saveUser(newUser);
      if (!saved) {
        return { success: false, error: 'Erro ao salvar usuário' };
      }

      // Retornar usuário sem senha
      const registeredUser: User = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
        createdBy: newUser.createdBy,
        isActive: newUser.isActive
      };

      return { success: true, user: registeredUser };
    } catch {
      return { success: false, error: 'Erro interno do servidor' };
    }
  },

  /**
   * Realiza o login do usuário
   */
  login: async (credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const users = getAllUsers();
      const user = users.find(u => 
        u.email.toLowerCase() === credentials.email.toLowerCase() && 
        u.isActive
      );

      if (!user || !verifyPassword(credentials.password, user.password)) {
        return { success: false, error: 'Email ou senha incorretos' };
      }

      // Criar objeto do usuário sem a senha
      const authenticatedUser: User = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        createdBy: user.createdBy,
        isActive: user.isActive
      };

      // Salvar sessão
      const authData = {
        user: authenticatedUser,
        timestamp: Date.now(),
        rememberMe: credentials.rememberMe || false
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));

      if (credentials.rememberMe) {
        localStorage.setItem(REMEMBER_ME_KEY, 'true');
      }

      return { success: true, user: authenticatedUser };
    } catch {
      return { success: false, error: 'Erro interno do servidor' };
    }
  },

  /**
   * Realiza o logout
   */
  logout: (): void => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
  },

  /**
   * Verifica sessão ativa
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

      // Sessão expira em 8 horas (ou 30 dias se lembrar)
      const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000;

      if (sessionAge > maxAge) {
        authService.logout();
        return { isAuthenticated: false, user: null };
      }

      // Atualizar timestamp
      parsed.timestamp = now;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));

      return { isAuthenticated: true, user: parsed.user };
    } catch {
      authService.logout();
      return { isAuthenticated: false, user: null };
    }
  },

  /**
   * Obtém usuário atual
   */
  getCurrentUser: (): User | null => {
    const session = authService.checkSession();
    return session.user;
  },

  /**
   * Obtém todos os gerentes (apenas para admins)
   */
  getManagers: (): User[] => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return [];
    }

    const users = getAllUsers();
    return users
      .filter(u => u.role === 'manager')
      .map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        createdBy: u.createdBy,
        isActive: u.isActive
      }));
  },

  /**
   * Ativa/desativa gerente (apenas para admins)
   */
  toggleManagerStatus: (managerId: string): boolean => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return false;
    }

    const users = getAllUsers();
    const manager = users.find(u => u.id === managerId && u.role === 'manager');
    
    if (!manager) return false;

    manager.isActive = !manager.isActive;
    return updateUser(manager);
  },

  /**
   * Remove gerente (apenas para admins)
   */
  deleteManager: (managerId: string): boolean => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return false;
    }

    return deleteUser(managerId);
  },

  /**
   * Verifica permissões do usuário
   */
  hasPermission: (action: 'create' | 'read' | 'update' | 'delete'): boolean => {
    const user = authService.getCurrentUser();
    if (!user) return false;

    const permissions = {
      admin: { create: true, read: true, update: true, delete: true },
      manager: { create: true, read: true, update: false, delete: false }
    };

    return permissions[user.role][action];
  },

  /**
   * Validações
   */
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePassword: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) errors.push('Mínimo 8 caracteres');
    if (!/[A-Z]/.test(password)) errors.push('Uma letra maiúscula');
    if (!/[a-z]/.test(password)) errors.push('Uma letra minúscula');
    if (!/\d/.test(password)) errors.push('Um número');
    
    return { isValid: errors.length === 0, errors };
  },

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

  validateName: (name: string): boolean => {
    return name.trim().length >= 2 && /^[a-zA-ZÀ-ÿ\s]+$/.test(name.trim());
  }
};