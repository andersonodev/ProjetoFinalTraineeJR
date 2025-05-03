import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload, Camera } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { saveProfileImageAsBase64 } from "@/lib/firebase";
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

  // Função para comprimir a imagem
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          // Calcular dimensões mantendo a proporção
          const MAX_SIZE = 200; // tamanho máximo em pixels (reduzido para economizar espaço)
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }
          
          // Criar canvas e redimensionar
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Converter para base64 com qualidade reduzida
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.5); // Reduzida para 0.5 para menor tamanho
          resolve(compressedDataUrl);
        };
        
        img.onerror = () => {
          reject(new Error("Erro ao processar a imagem"));
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

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    // Validar tamanho (máx 2MB para processamento inicial)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB");
      return;
    }

    try {
      setIsUploading(true);
      
      // Comprimir a imagem - importante para não exceder o limite de 1MB do Firestore
      const compressedImageUrl = await compressImage(file);
      
      // Usar o ID fornecido ou o ID do usuário atual para o upload
      const userIdForUpload = userId || currentUser?.uid;
      
      if (!userIdForUpload) {
        throw new Error("ID de usuário não disponível");
      }
      
      console.log(`Processando imagem para usuário: ${userIdForUpload}`);
      
      // Salvar a imagem base64 diretamente no Firestore
      const savedImageUrl = await saveProfileImageAsBase64(userIdForUpload, compressedImageUrl);
      
      // Atualizar estado local e notificar o componente pai
      setAvatar(savedImageUrl);
      onAvatarChange(savedImageUrl);
      
      toast.success("Avatar atualizado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao processar imagem:", error);
      
      if (error.message?.includes('muito grande')) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao salvar imagem. Tente outra menor ou redimensione esta.");
      }
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
        accept="image/*"
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