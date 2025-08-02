import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, LogIn, AlertCircle, Loader2, User, CheckCircle, ArrowLeft } from 'lucide-react';
import { LoginCredentials, RegisterCredentials } from '../types/auth';
import { authService } from '../utils/auth';

interface AuthFormProps {
  onLoginSuccess: () => void;
}

type AuthMode = 'login' | 'register';

export const AuthForm: React.FC<AuthFormProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados para login
  const [loginCredentials, setLoginCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: false
  });

  // Estados para cadastro
  const [registerCredentials, setRegisterCredentials] = useState<RegisterCredentials>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState({ strength: 'weak' as const, score: 0 });

  const validateLoginForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!loginCredentials.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!authService.validateEmail(loginCredentials.email)) {
      errors.email = 'Formato de email inválido';
    }

    if (!loginCredentials.password.trim()) {
      errors.password = 'Senha é obrigatória';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!registerCredentials.name.trim()) {
      errors.name = 'Nome é obrigatório';
    } else if (!authService.validateName(registerCredentials.name)) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres e conter apenas letras';
    }

    if (!registerCredentials.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!authService.validateEmail(registerCredentials.email)) {
      errors.email = 'Formato de email inválido';
    }

    const passwordValidation = authService.validatePassword(registerCredentials.password);
    if (!passwordValidation.isValid) {
      errors.password = `Senha deve conter: ${passwordValidation.errors.join(', ')}`;
    }

    if (!registerCredentials.confirmPassword) {
      errors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (registerCredentials.password !== registerCredentials.confirmPassword) {
      errors.confirmPassword = 'Senhas não coincidem';
    }

    if (!registerCredentials.acceptTerms) {
      errors.acceptTerms = 'Você deve aceitar os termos de uso';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateLoginForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await authService.login(loginCredentials);

      if (result.success) {
        setSuccess('Login realizado com sucesso!');
        setTimeout(() => {
          onLoginSuccess();
        }, 1000);
      } else {
        setError(result.error || 'Erro ao fazer login');
      }
    } catch {
      setError('Erro interno do servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateRegisterForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await authService.register(registerCredentials);

      if (result.success) {
        setSuccess('Cadastro realizado com sucesso! Você já pode fazer login.');
        setTimeout(() => {
          setMode('login');
          setRegisterCredentials({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            acceptTerms: false
          });
          setLoginCredentials(prev => ({ ...prev, email: registerCredentials.email }));
        }, 2000);
      } else {
        setError(result.error || 'Erro ao realizar cadastro');
      }
    } catch {
      setError('Erro interno do servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginInputChange = (field: keyof LoginCredentials, value: string | boolean) => {
    setLoginCredentials(prev => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  const handleRegisterInputChange = (field: keyof RegisterCredentials, value: string | boolean) => {
    setRegisterCredentials(prev => ({ ...prev, [field]: value }));
    
    // Atualizar força da senha em tempo real
    if (field === 'password') {
      const strength = authService.getPasswordStrength(value as string);
      setPasswordStrength(strength);
    }
    
    clearFieldError(field);
  };

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (error) {
      setError(null);
    }
    if (success) {
      setSuccess(null);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setSuccess(null);
    setFieldErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength.strength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength.strength) {
      case 'weak': return 'Fraca';
      case 'medium': return 'Média';
      case 'strong': return 'Forte';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Contro<span className="text-orange-500">LeX</span>
          </h1>
          <p className="text-gray-600">Sistema de Gestão Financeira</p>
        </div>

        {/* Card do Formulário */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header com abas */}
          <div className="flex">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-300 ${
                mode === 'login'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-300 ${
                mode === 'register'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Cadastrar
            </button>
          </div>

          <div className="p-8">
            {/* Título da seção */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {mode === 'login' ? 'Bem-vindo de volta!' : 'Criar nova conta'}
              </h2>
              <p className="text-gray-600">
                {mode === 'login' 
                  ? 'Faça login para acessar sua conta' 
                  : 'Preencha os dados para criar sua conta'
                }
              </p>
            </div>

            {/* Mensagens de erro/sucesso */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center animate-fadeIn">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-green-700 text-sm">{success}</span>
              </div>
            )}

            {/* Credenciais de demonstração (apenas no login) */}
            {mode === 'login' && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Credenciais de Demonstração:</h3>
                <div className="text-xs text-blue-700 space-y-1">
                  <div><strong>Admin:</strong> admin@controlex.com / admin123</div>
                  <div><strong>Demo:</strong> demo@controlex.com / demo123</div>
                </div>
              </div>
            )}

            {/* Formulário de Login */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Campo Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={loginCredentials.email}
                      onChange={(e) => handleLoginInputChange('email', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        fieldErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="seu@email.com"
                      disabled={loading}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-red-500 text-sm mt-1 animate-fadeIn">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Campo Senha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginCredentials.password}
                      onChange={(e) => handleLoginInputChange('password', e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        fieldErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Sua senha"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-red-500 text-sm mt-1 animate-fadeIn">{fieldErrors.password}</p>
                  )}
                </div>

                {/* Lembrar-me */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={loginCredentials.rememberMe}
                    onChange={(e) => handleLoginInputChange('rememberMe', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                    Lembrar-me por 30 dias
                  </label>
                </div>

                {/* Botão de Login */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Entrar
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Formulário de Cadastro */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-6">
                {/* Campo Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={registerCredentials.name}
                      onChange={(e) => handleRegisterInputChange('name', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        fieldErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Seu nome completo"
                      disabled={loading}
                    />
                  </div>
                  {fieldErrors.name && (
                    <p className="text-red-500 text-sm mt-1 animate-fadeIn">{fieldErrors.name}</p>
                  )}
                </div>

                {/* Campo Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={registerCredentials.email}
                      onChange={(e) => handleRegisterInputChange('email', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        fieldErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="seu@email.com"
                      disabled={loading}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-red-500 text-sm mt-1 animate-fadeIn">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Campo Senha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={registerCredentials.password}
                      onChange={(e) => handleRegisterInputChange('password', e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        fieldErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Crie uma senha segura"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  
                  {/* Indicador de força da senha */}
                  {registerCredentials.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Força da senha:</span>
                        <span className={`text-xs font-medium ${
                          passwordStrength.strength === 'strong' ? 'text-green-600' :
                          passwordStrength.strength === 'medium' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${passwordStrength.score}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {fieldErrors.password && (
                    <p className="text-red-500 text-sm mt-1 animate-fadeIn">{fieldErrors.password}</p>
                  )}
                </div>

                {/* Campo Confirmar Senha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={registerCredentials.confirmPassword}
                      onChange={(e) => handleRegisterInputChange('confirmPassword', e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        fieldErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Confirme sua senha"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={loading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1 animate-fadeIn">{fieldErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Aceitar termos */}
                <div>
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={registerCredentials.acceptTerms}
                      onChange={(e) => handleRegisterInputChange('acceptTerms', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                      disabled={loading}
                    />
                    <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
                      Eu aceito os{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-800 underline">
                        termos de uso
                      </a>{' '}
                      e{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-800 underline">
                        política de privacidade
                      </a>
                    </label>
                  </div>
                  {fieldErrors.acceptTerms && (
                    <p className="text-red-500 text-sm mt-1 animate-fadeIn">{fieldErrors.acceptTerms}</p>
                  )}
                </div>

                {/* Botão de Cadastro */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5 mr-2" />
                      Criar Conta
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2025 ControLeX. Sistema de Gestão Financeira</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};