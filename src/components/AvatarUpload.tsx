import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload, Camera } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { saveProfileImageAsBase64, compressBase64Image } from "@/lib/imageUtils";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange: (avatarUrl: string) => void;
  name: string;
  userId?: string; // ID do usuário para upload
}

export function AvatarUpload({ currentAvatar, onAvatarChange, name, userId }: AvatarUploadProps) {
  const [avatar, setAvatar] = useState<string>(currentAvatar || "");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const { currentUser } = useAuth();

  // Gerar iniciais para o avatar
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n.charAt(0).toUpperCase()).join("").substring(0, 2);
  };

  // Função aprimorada para processar e comprimir a imagem
  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Validação de tipos de arquivo permitidos
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        reject(new Error("Tipo de arquivo não suportado. Use JPG, PNG, GIF, WebP, BMP ou SVG"));
        return;
      }
      
      // Validação de tamanho máximo (5MB)
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error("O arquivo deve ter no máximo 5MB"));
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        if (!event.target?.result) {
          reject(new Error("Falha ao ler a imagem"));
          return;
        }

        const img = new Image();
        img.src = event.target.result as string;
        
        img.onload = () => {
          try {
            // Determinar dimensões ideais mantendo a proporção
            const MAX_SIZE = 400; // tamanho máximo para processamento inicial
            let width = img.width;
            let height = img.height;
            let targetWidth = width;
            let targetHeight = height;
            
            // Redimensionar mantendo a proporção
            if (width > height) {
              if (width > MAX_SIZE) {
                targetHeight = Math.round((height * MAX_SIZE) / width);
                targetWidth = MAX_SIZE;
              }
            } else {
              if (height > MAX_SIZE) {
                targetWidth = Math.round((width * MAX_SIZE) / height);
                targetHeight = MAX_SIZE;
              }
            }
            
            // Criar canvas para o redimensionamento
            const canvas = document.createElement("canvas");
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              reject(new Error("Falha ao criar contexto de canvas para processamento da imagem"));
              return;
            }
            
            // Desenhar a imagem no canvas com as novas dimensões
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            
            // Para avatares, vamos fazer um canvas circular
            if (targetWidth === targetHeight) {
              // Se a imagem for quadrada, podemos criar uma versão circular
              ctx.globalCompositeOperation = 'destination-in';
              ctx.beginPath();
              ctx.arc(targetWidth / 2, targetHeight / 2, targetWidth / 2, 0, Math.PI * 2);
              ctx.closePath();
              ctx.fill();
            }
            
            // Converter para base64 com qualidade reduzida
            // Ajustar qualidade conforme tamanho - imagens maiores usam compressão maior
            const quality = Math.max(0.3, Math.min(0.7, 400 / Math.max(targetWidth, targetHeight)));
            const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
            
            // Verificação de tamanho final
            const sizeInBytes = Math.round((compressedDataUrl.length * 3) / 4);
            if (sizeInBytes > 800000) { // 800KB
              // Se ainda for grande demais, comprimir mais
              const moreCompressedDataUrl = canvas.toDataURL("image/jpeg", 0.2);
              resolve(moreCompressedDataUrl);
            } else {
              resolve(compressedDataUrl);
            }
          } catch (error) {
            reject(new Error("Falha ao processar a imagem. Tente com uma imagem menor."));
          }
        };
        
        img.onerror = () => {
          reject(new Error("Erro ao processar a imagem. Formato não suportado."));
        };
      };
      
      reader.onerror = () => {
        reject(new Error("Erro ao ler o arquivo"));
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      // Validações iniciais
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Tipo de arquivo não suportado. Use JPG, PNG, GIF, WebP, BMP ou SVG");
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        throw new Error("A imagem deve ter no máximo 5MB");
      }
      
      // Processar e comprimir a imagem - usando nossa função aprimorada
      const processedImageUrl = await processImage(file);
      
      // Usar o ID fornecido ou o ID do usuário atual para o upload
      const userIdForUpload = userId || currentUser?.uid;
      
      if (!userIdForUpload) {
        throw new Error("ID de usuário não disponível");
      }
      
      // Se for um ID temporário ou estamos criando um novo usuário, apenas salvamos localmente
      if (userIdForUpload.startsWith('temp_')) {
        setAvatar(processedImageUrl);
        onAvatarChange(processedImageUrl); // Passar a imagem para o componente pai
        toast.success("Imagem processada com sucesso!");
      } else {
        // Para usuários existentes, salvamos diretamente no Firestore como base64
        try {
          // Verificar se precisamos comprimir ainda mais
          const sizeInBytes = Math.round((processedImageUrl.length * 3) / 4);
          let finalImageUrl = processedImageUrl;
          
          if (sizeInBytes > 800000) { // Se for maior que 800KB
            // Comprimir ainda mais
            finalImageUrl = await compressBase64Image(processedImageUrl, 0.4);
          }
          
          // Salvar a imagem base64 no Firestore
          const savedImageUrl = await saveProfileImageAsBase64(userIdForUpload, finalImageUrl);
          setAvatar(savedImageUrl);
          onAvatarChange(savedImageUrl);
          toast.success("Avatar atualizado com sucesso!");
        } catch (innerError: any) {
          console.error("Erro ao salvar imagem:", innerError);
          // Mesmo com erro, mantemos a imagem localmente para não perder o processamento
          setAvatar(processedImageUrl);
          onAvatarChange(processedImageUrl);
          toast.error(`Erro ao salvar imagem: ${innerError.message}`);
        }
      }
    } catch (error: any) {
      console.error("Erro ao processar imagem:", error);
      toast.error(error.message || "Falha ao processar a imagem");
    } finally {
      setIsUploading(false);
      // Limpar o input de arquivo para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileInput = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative cursor-pointer" onClick={triggerFileInput}>
        <Avatar className="border-4 border-white shadow-lg" style={{
          width: isMobile ? '5rem' : '7rem',
          height: isMobile ? '5rem' : '7rem'
        }}>
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="bg-blue-700 text-white text-base sm:text-xl font-semibold">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        
        {/* Overlay para câmera que aparece ao passar mouse/touch */}
        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          {isUploading ? 
            <Loader2 className="h-6 w-6 text-white animate-spin" /> : 
            <Camera className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-white`} />
          }
        </div>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        disabled={isUploading}
      />
      
      <Button 
        type="button" 
        variant="ghost" 
        size="sm" 
        onClick={triggerFileInput}
        className="mt-2 text-xs text-blue-600 px-2 py-0 h-auto"
        disabled={isUploading}
      >
        {isUploading ? (
          <div className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Processando...</span>
          </div>
        ) : (
          <>
            <Upload className="h-3 w-3 mr-1" />
            Alterar foto
          </>
        )}
      </Button>
    </div>
  );
}