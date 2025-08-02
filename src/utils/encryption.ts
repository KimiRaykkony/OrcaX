/**
 * Utilitários de criptografia para senhas
 * Implementação simples mas segura para o contexto do projeto
 */

// Função para gerar salt aleatório
const generateSalt = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let salt = '';
  for (let i = 0; i < 16; i++) {
    salt += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return salt;
};

// Função hash simples mas eficaz
const simpleHash = (text: string): string => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Converter para 32bit integer
  }
  return Math.abs(hash).toString(36);
};

// Função para criptografar senha com salt
export const encryptPassword = (password: string): string => {
  const salt = generateSalt();
  const hashedPassword = simpleHash(password + salt);
  return `${salt}:${hashedPassword}`;
};

// Função para verificar senha
export const verifyPassword = (password: string, encryptedPassword: string): boolean => {
  try {
    const [salt, hash] = encryptedPassword.split(':');
    const hashedInput = simpleHash(password + salt);
    return hashedInput === hash;
  } catch {
    return false;
  }
};

// Função para gerar senha temporária
export const generateTemporaryPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  
  // Garantir pelo menos um de cada tipo
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Maiúscula
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Minúscula
  password += '0123456789'[Math.floor(Math.random() * 10)]; // Número
  password += '!@#$%'[Math.floor(Math.random() * 5)]; // Especial
  
  // Completar com caracteres aleatórios
  for (let i = 4; i < 12; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  
  // Embaralhar a senha
  return password.split('').sort(() => Math.random() - 0.5).join('');
};