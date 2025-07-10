// Tipos para o cargo e status do usuário
export type UserRole = "Administrador" | "Presidente" | "Head" | "Colaborador" | "Membro" | "Diretor";
export type UserStatus = "Ativo" | "Inativo" | "Banido";

// Definindo a interface User, sem a senha no Firestore
export interface User {
  id: string; // O ID do usuário será o UID do Firebase
  nome: string;
  email: string;
  role?: UserRole;
  setor?: string;
  status: UserStatus;
  avatarUrl?: string;
  dataEntradaEmpresa?: string;
  curso?: string;
  idade?: number;
  telefone?: string;
  advertencias: number;
  notificacoes: number;
  isPowerUser?: boolean; // Presidente, Diretor ou Head
  createdAt: Date;  // Data de criação do usuário no Firebase
  updatedAt?: Date;  // Data da última atualização do perfil
  banReason?: string; // Added property for ban reason
  isAdmin?: boolean; // Add this property
  bio?: string; // Biografia do usuário
  cidade?: string; // Cidade do usuário
  matricula?: string; // Matrícula do usuário
  cargo?: string; // Cargo do usuário (adicionado para compatibilidade)
}

// Interface para justificar ações como advertência, notificação ou banimento
export interface JustificativaAction {
  userId: string;
  nome: string;
  cargo?: string;
  setor?: string;
  motivo: string;
  tipo: "advertencia" | "notificacao" | "banimento";
}

// Para salvar dados temporários sobre o usuário selecionado
export interface SelectedUserData {
  userId: string;
  timestamp: number;
}

// Interfaces para o backend (auth)
export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface AuthResponse {
  user: Omit<User, 'senha'>;  // Omitimos a senha da resposta do Firebase
  token: string;
}
