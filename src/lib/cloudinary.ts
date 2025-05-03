// Cloudinary utiliza um upload via navegador, sem necessidade de chaves de API no frontend
// Isso permite fazer uploads diretamente do cliente sem um servidor

const CLOUDINARY_CLOUD_NAME = "seu-cloudname"; // Substituir pelo seu cloud name
const CLOUDINARY_UPLOAD_PRESET = "perfil_ibmecjr"; // Criar um unsigned upload preset no painel Cloudinary

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  created_at: string;
}

export const uploadToCloudinary = async (imageBase64: string): Promise<string> => {
  try {
    // Remover o prefixo data:image/jpeg;base64, se presente
    const base64Data = imageBase64.includes('base64,') 
      ? imageBase64.split('base64,')[1] 
      : imageBase64;
    
    // Criar FormData para upload
    const formData = new FormData();
    formData.append('file', `data:image/jpeg;base64,${base64Data}`);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    // Fazer o upload para Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    if (!response.ok) {
      throw new Error('Falha ao fazer upload para Cloudinary');
    }
    
    const data = await response.json() as CloudinaryUploadResponse;
    return data.secure_url;
    
  } catch (error) {
    console.error('Erro no upload para Cloudinary:', error);
    throw error;
  }
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  // Esta função precisa ser implementada em um backend (Cloud Function)
  // Cloudinary não permite deleção direta do frontend por questões de segurança
  console.warn('Atenção: Deleção de imagens Cloudinary requer implementação via backend');
};
