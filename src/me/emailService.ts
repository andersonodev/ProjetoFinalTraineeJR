import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase"; // Importe do arquivo de configuração do Firebase

export const firebaseService = {
  createUser: async (userData: {
    email: string;
    senha: string;
    nome: string;
    cargo?: string;
    setor?: string;
    status?: string;
    avatarUrl?: string;
    dataEntradaEmpresa?: string;
    curso?: string;
    idade?: number;
    telefone?: string;
    isPowerUser?: boolean;
  }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.senha);
      const userId = userCredential.user.uid;

      const userDoc = doc(db, "users", userId);
      await setDoc(userDoc, {
        nome: userData.nome,
        email: userData.email,
        cargo: userData.cargo,
        setor: userData.setor,
        status: userData.status || "Ativo",
        avatarUrl: userData.avatarUrl || "",
        dataEntradaEmpresa: userData.dataEntradaEmpresa,
        curso: userData.curso,
        idade: userData.idade,
        telefone: userData.telefone,
        advertencias: 0,
        notificacoes: 0,
        isPowerUser: userData.isPowerUser || false,
      });

      return userCredential.user;
    } catch (error) {
      console.error("Erro ao criar usuário no Firebase:", error);
      throw error;
    }
  },

  login: async (email: string, senha: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const token = await userCredential.user.getIdToken();
      return { user: userCredential.user, token };
    } catch (error) {
      console.error("Erro ao fazer login no Firebase:", error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao fazer logout no Firebase:", error);
      throw error;
    }
  },

  getUserData: async (userId: string) => {
    try {
      const userDoc = doc(db, "users", userId);
      const userSnapshot = await getDoc(userDoc);

      if (userSnapshot.exists()) {
        return userSnapshot.data();
      } else {
        throw new Error("Usuário não encontrado no Firestore.");
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário no Firebase:", error);
      throw error;
    }
  },
};
