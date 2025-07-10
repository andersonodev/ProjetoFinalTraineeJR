import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword as firebaseSignIn,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User as UserType } from '@/types/user';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: UserType | null;
  isAdmin: boolean;
  isPowerUser: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Definir persistência para LOCAL ao inicializar o componente
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .catch(error => {
        console.error("Erro ao configurar persistência:", error);
      });
  }, []);

  // Derivar as permissões baseado nos dados do usuário
  const isPowerUser = userData?.isPowerUser === true;
  const isAdmin = userData?.isAdmin === true;

  // Função para buscar dados do usuário no Firestore
  const fetchUserData = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        const userDocData = docSnap.data();
        
        setUserData({ id: docSnap.id, ...userDocData } as UserType);
        
        return userDocData;
      } else {
        console.warn("Documento do usuário não encontrado no Firestore");
        return null;
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      return null;
    }
  };

  useEffect(() => {
    setIsLoading(true);
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await fetchUserData(user.uid);
      } else {
        setUserData(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      // Fazer login
      const userCredential = await firebaseSignIn(auth, email, password);
      // Buscar dados do usuário para verificar status e permissões
      const userData = await fetchUserData(userCredential.user.uid);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      // Mensagens de erro mais amigáveis com base no código de erro
      if (error.code === 'auth/invalid-credential') {
        toast.error("Email ou senha incorretos");
      } else if (error.code === 'auth/too-many-requests') {
        toast.error("Muitas tentativas de login. Aguarde um momento e tente novamente.");
      } else if (error.code === 'auth/user-not-found') {
        toast.error("Usuário não encontrado. Verifique o email informado.");
      } else if (error.code === 'auth/invalid-email') {
        toast.error("Formato de email inválido.");
      } else {
        toast.error("Erro ao fazer login. Tente novamente.");
      }
      
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    try {
      await firebaseSendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    userData,
    isAdmin,
    isPowerUser,
    isLoading,
    signIn,
    signOut,
    sendPasswordResetEmail
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
