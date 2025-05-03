import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC52svDmVusLYswOmZqFhB8BwlvVAlr4As",
  authDomain: "ibmec-jr-solucoes.firebaseapp.com",
  projectId: "ibmec-jr-solucoes",
  storageBucket: "ibmec-jr-solucoes.appspot.com",
  messagingSenderId: "787954916425",
  appId: "1:787954916425:web:826c5ef12de4c207f13398"
};

// Evita múltiplas inicializações
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
export default app;

// Função para salvar imagem como base64 diretamente no Firestore
export const saveProfileImageAsBase64 = async (userId: string, imageDataUrl: string): Promise<string> => {
  try {
    console.log(`Iniciando processamento de imagem para usuário: ${userId}`);
    
    // Limite de tamanho para evitar problemas com o tamanho do documento no Firestore (max 1MB)
    const sizeInBytes = Math.round((imageDataUrl.length * 3) / 4);
    const maxSizeBytes = 800000; // ~800KB para estar seguro
    
    if (sizeInBytes > maxSizeBytes) {
      throw new Error(`Imagem muito grande (${Math.round(sizeInBytes/1024)}KB). Máximo permitido: ${Math.round(maxSizeBytes/1024)}KB`);
    }
    
    // Gerar identificador único da imagem
    const timestamp = new Date().getTime();
    const imageId = `${userId}_${timestamp}`;
    
    // Referência do usuário no Firestore
    const userRef = doc(db, "users", userId);
    
    // Atualizar o avatar do usuário
    await updateDoc(userRef, {
      avatarUrl: imageDataUrl
    });
    
    console.log('Imagem salva com sucesso no Firestore como base64');
    return imageDataUrl;
  } catch (error) {
    console.error('Erro ao salvar imagem base64:', error);
    throw error;
  }
};

// Função para obter informações do usuário
export const getUserData = async (userId: string) => {
  try {
    const userDoc = doc(db, "users", userId);
    const userSnapshot = await getDoc(userDoc);

    if (userSnapshot.exists()) {
      return userSnapshot.data();
    } else {
      throw new Error("Usuário não encontrado no Firestore.");
    }
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    throw error;
  }
};

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
