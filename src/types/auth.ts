export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager';
  createdAt: string;
  createdBy?: string; // ID do admin que criou o gerente
  isActive: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  role?: 'admin' | 'manager';
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface Permission {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface RolePermissions {
  admin: Permission;
  manager: Permission;
}