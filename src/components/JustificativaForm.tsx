import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types/user";
import { Ban, Bell, ShieldAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { serverTimestamp, addDoc, collection } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../lib/firebase";

interface JustificativaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  actionType: "notificacao" | "advertencia" | "banimento";
  onConfirm: (motivo: string) => void;
}

export function JustificativaForm({ open, onOpenChange, user, actionType, onConfirm }: JustificativaFormProps) {
  const [motivo, setMotivo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Definições de configuração para cada tipo de ação
  const actionConfig = {
    notificacao: {
      title: "Enviar Notificação",
      description: "Envie uma notificação para este usuário explicando o motivo.",
      icon: <Bell className="h-5 w-5 text-blue-500" />,
      buttonText: "Enviar Notificação",
      buttonClass: "bg-blue-500 hover:bg-blue-600",
    },
    advertencia: {
      title: "Registrar Advertência",
      description: "Registre uma advertência formal para este usuário explicando o motivo.",
      icon: <ShieldAlert className="h-5 w-5 text-amber-500" />,
      buttonText: "Registrar Advertência",
      buttonClass: "bg-amber-600 hover:bg-amber-700",
    },
    banimento: {
      title: user.status === "Ativo" ? "Banir Usuário" : "Reativar Usuário",
      description: user.status === "Ativo" 
        ? "Isso irá impedir o acesso deste usuário ao sistema." 
        : "Isso irá restaurar o acesso deste usuário ao sistema.",
      icon: <Ban className="h-5 w-5 text-amber-500" />,
      buttonText: user.status === "Ativo" ? "Confirmar Banimento" : "Confirmar Reativação",
      buttonClass: user.status === "Ativo" ? "bg-amber-600 hover:bg-amber-700" : "bg-green-500 hover:bg-green-600",
    },
  };
  
  // Configuração para a ação atual
  const config = actionConfig[actionType];
  
  // Limpar o motivo quando o formulário abre/fecha
  useEffect(() => {
    if (open === false) {
      setMotivo("");
    }
  }, [open]);
  
  // Obtém as iniciais do nome para o avatar
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n.charAt(0).toUpperCase()).join("").substring(0, 2);
  };
  
  const handleSubmit = async () => {
    // Validação mais rigorosa
    if (!motivo.trim() || motivo.length < 3) {
      toast.error("Por favor, forneça uma justificativa mais detalhada");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Verificar se o usuário está autenticado
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        toast.error("Você precisa estar autenticado para realizar esta ação");
        setIsSubmitting(false);
        return;
      }
      
      try {
        // Registrar a tentativa de ação no Firebase - para fins de auditoria
        await addDoc(collection(db, "actionLogs"), {
          userId: user.id,
          userName: user.nome,
          actionType: actionType,
          motivo: motivo,
          timestamp: serverTimestamp(),
          executedBy: {
            uid: currentUser.uid,
            email: currentUser.email
          },
          status: "initiated"
        });
        
        // Chamar o callback de confirmação que aplicará a ação no usuário
        await onConfirm(motivo);
        
        // Limpar o formulário
        setMotivo("");
      } catch (innerError) {
        if (innerError instanceof Error) {
          toast.error(`Erro de permissão: ${innerError.message}. Verifique se você tem permissões adequadas.`);
        } else {
          toast.error("Erro de permissão desconhecido. Verifique se você tem permissões adequadas.");
        }
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao processar a ação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newState) => {
      if (!isSubmitting) {
        setMotivo(""); // Limpar o motivo quando fechar
        onOpenChange(newState);
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {config.icon}
            {config.title}
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-3 py-2">
          <Avatar>
            <AvatarImage src={user.avatarUrl} alt={user.nome} />
            <AvatarFallback>{getInitials(user.nome)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.nome}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="setor" className="text-sm text-muted-foreground">Setor</Label>
              <div id="setor" className="font-medium">{user.setor || "-"}</div>
            </div>
            <div>
              <Label htmlFor="cargo" className="text-sm text-muted-foreground">Cargo</Label>
              <div id="cargo" className="font-medium">{user.role || "-"}</div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="motivo" className="text-sm font-medium">
              Justificativa <span className="text-amber-500">*</span>
            </Label>
            <Textarea
              id="motivo"
              placeholder="Descreva o motivo desta ação..."
              className="mt-1"
              rows={5}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
              disabled={isSubmitting}
              maxLength={500}
            />
            <div className="text-xs text-right mt-1 text-muted-foreground">
              {motivo.length}/500 caracteres
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex gap-2 flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            className={`flex-1 ${config.buttonClass}`}
            onClick={handleSubmit}
            disabled={!motivo.trim() || motivo.length < 3 || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              config.buttonText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
