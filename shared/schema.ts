export type UserRole = "Administrador" | "Presidente" | "Head" | "Colaborador" | "Membro" | "Diretor" | "Diretora" | "Consultor" | "Analista";
export type UserStatus = "Ativo" | "Inativo" | "Banido";

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  sector: string;
  role: UserRole;
  status: UserStatus;
  activationDate: string;
  notifications: number;
  warnings: number;
  banned: boolean;
  isAdmin: boolean;
}

export interface InsertUser {
  name: string;
  email: string;
  password: string;
  sector: string;
  role: UserRole;
  status: UserStatus;
}

export interface EditUser {
  name?: string;
  email?: string;
  password?: string;
  sector?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface EditProfile {
  name?: string;
  email?: string;
  password?: string;
  sector?: string;
  role?: UserRole;
}

export interface Penalty {
  id: number;
  userId: number;
  type: "notification" | "warning" | "ban";
  reason: string;
  date: string;
  appliedById: number;
}

export interface InsertPenalty {
  userId: number;
  type: "notification" | "warning" | "ban";
  reason: string;
  date: string;
  appliedById: number;
}
