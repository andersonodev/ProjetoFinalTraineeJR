import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';

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
const storage = getStorage(app); // Inicializar o Storage

export { auth, db, storage };
export default app;

// Função para salvar imagem como base64 diretamente no Firestore
export const saveProfileImageAsBase64 = async (userId: string, imageDataUrl: string): Promise<string> => {
  try {
    console.log(`Iniciando processamento de imagem para usuário: ${userId}`);
    
    // Limite de tamanho para evitar problemas
    const sizeInBytes = Math.round((imageDataUrl.length * 3) / 4);
    const maxSizeBytes = 800000; // ~800KB para estar seguro
    
    if (sizeInBytes > maxSizeBytes) {
      throw new Error(`Imagem muito grande (${Math.round(sizeInBytes/1024)}KB). Máximo permitido: ${Math.round(maxSizeBytes/1024)}KB`);
    }
    
    // Verificar se é um ID temporário (usado durante cadastro de novo usuário)
    if (userId.startsWith('temp_')) {
      console.log('ID temporário detectado, retornando imagem processada localmente');
      return imageDataUrl; // Para IDs temporários, só retornamos a imagem processada
    }
    
    // Verificar se o documento do usuário existe antes de atualizá-lo
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);
    
    if (!docSnap.exists()) {
      throw new Error(`Usuário com ID ${userId} não encontrado`);
    }
    
    // Atualizar o documento do usuário com a imagem em base64
    await updateDoc(userRef, {
      avatarUrl: imageDataUrl,
      avatarUpdatedAt: serverTimestamp()
    });
    
    console.log(`Imagem salva com sucesso para usuário ${userId} diretamente no Firestore`);
    
    return imageDataUrl;
  } catch (error) {
    console.error("Erro ao salvar imagem base64:", error);
    throw error;
  }
};

// Função para excluir uma imagem do Storage
export const deleteProfileImage = async (storagePath: string): Promise<void> => {
  if (!storagePath) return;
  
  try {
    const imageRef = ref(storage, storagePath);
    await deleteObject(imageRef);
    console.log(`Imagem excluída com sucesso: ${storagePath}`);
  } catch (error) {
    console.error("Erro ao excluir imagem:", error);
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

// Função para fazer upload da imagem de perfil (agora usando base64)
export const uploadProfileImage = async (userId: string, imageFile: File): Promise<string> => {
  try {
    // Converter o arquivo para base64
    const base64Image = await fileToBase64(imageFile);
    
    // Usar a função saveProfileImageAsBase64 existente para salvar a imagem
    return await saveProfileImageAsBase64(userId, base64Image);
  } catch (error) {
    console.error("Erro ao fazer upload da imagem de perfil:", error);
    throw error;
  }
};

// Função auxiliar para converter File para base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
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
