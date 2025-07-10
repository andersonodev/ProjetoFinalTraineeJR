import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Comprime e salva uma imagem em formato base64 para o Firestore
 */
export const saveProfileImageAsBase64 = async (userId: string, imageDataUrl: string): Promise<string> => {
  try {
    
    // Limite de tamanho para evitar problemas com o tamanho do documento no Firestore (max 1MB)
    const sizeInBytes = Math.round((imageDataUrl.length * 3) / 4);
    const maxSizeBytes = 800000; // ~800KB para ficar seguro
    
    if (sizeInBytes > maxSizeBytes) {
      throw new Error(`Imagem muito grande (${Math.round(sizeInBytes/1024)}KB). Máximo permitido: ${Math.round(maxSizeBytes/1024)}KB`);
    }
    
    // Verificar se é um ID temporário (usado durante cadastro de novo usuário)
    if (userId.startsWith('temp_')) {
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
    
    return imageDataUrl;
  } catch (error) {
    console.error("Erro ao salvar imagem base64:", error);
    throw error;
  }
};

/**
 * Função para comprimir ainda mais uma imagem em base64 quando necessário
 * Pode ser usada se a imagem for muito grande
 */
export const compressBase64Image = async (base64Image: string, quality: number = 0.6): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Image;
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        // Redimensionar para dimensões máximas se necessário
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round(height * MAX_WIDTH / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round(width * MAX_HEIGHT / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível criar o contexto de canvas'));
          return;
        }

        // Desenhar a imagem redimensionada no canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // Para avatares, fazer um recorte circular
        if (Math.abs(width - height) < 10) { // Se a imagem for aproximadamente quadrada
          ctx.globalCompositeOperation = 'destination-in';
          ctx.beginPath();
          ctx.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fill();
        }

        // Converter para base64 com a qualidade especificada
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Erro ao carregar a imagem'));
    };
  });
};
