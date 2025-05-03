import { useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';

export default function FixAdminPermissions() {
  useEffect(() => {
    const fixPermissions = async () => {
      try {
        // Substitua "admin" pelo ID correto do usuário admin
        const adminUserId = "admin"; 
        const userRef = doc(db, 'users', adminUserId);
        
        await updateDoc(userRef, {
          isAdmin: true,
          isPowerUser: true
        });
        
        toast.success("Permissões do administrador corrigidas!");
      } catch (error) {
        console.error("Erro ao corrigir permissões:", error);
        toast.error("Erro ao atualizar permissões");
      }
    };
    
    fixPermissions();
  }, []);
  
  return (
    <div>Atualizando permissões de administrador...</div>
  );
}
