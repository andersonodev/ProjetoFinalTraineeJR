import { useState } from "react";
import { toast } from "sonner";
import { 
  Ban,
  Bell, 
  Building,
  Calendar,
  Edit,
  GraduationCap,
  Mail, 
  Phone,
  Shield,
  ShieldAlert,
  User as UserIcon,
  Trash2,
  Briefcase,
  Info,
  Upload,
  Clock,
  Eraser,
  Loader2,
  X,
  Save,
  Check,
  MapPin,

} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { User as UserType, UserStatus } from "@/types/user";
import { JustificativaForm } from "@/components/JustificativaForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { doc, updateDoc, deleteDoc, collection, addDoc, serverTimestamp, getDoc, increment } from "firebase/firestore";
import { db } from "../lib/firebase";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";

// Definição do tipo das props para o componente InfoItem
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

// Componente reutilizável para itens de informação - versão aprimorada
const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => (
  <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/60 hover:shadow-md transition-all duration-300 space-y-1.5 group hover:border-primary/20">
    <div className="text-sm text-gray-500 flex items-center gap-2 group-hover:text-primary/70 transition-colors">
      <div className="p-1.5 bg-white rounded-full shadow-sm border border-gray-100">{icon}</div> 
      <span>{label}</span>
    </div>
    <div className="font-medium text-gray-800 pl-1">{value}</div>
  </div>
);

// Definição do tipo das props para o componente StatCard
interface StatCardProps {
  title: string;
  value: number;
  maxValue: number;
  progressValue?: number;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  progressColor: string;
  description: string;
  warning?: string;
  info?: string;
}

// Componente de card estatístico
const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  maxValue, 
  progressValue, 
  icon, 
  bgColor, 
  textColor, 
  progressColor,
  description,
  warning,
  info
}) => {
  const calculatedProgressValue = progressValue !== undefined ? progressValue : ((value / maxValue) * 100);
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex flex-col items-center text-center">
          <div className={`${bgColor} p-4 rounded-full mb-4`}>
            {icon}
          </div>
          
          <h3 className={`text-lg font-semibold mb-1 ${textColor}`}>{title}</h3>
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Badge className={`${textColor} ${bgColor} border-0 text-base font-semibold px-3`}>{value}</Badge>
            {maxValue !== value && <span className="text-gray-400">/ {maxValue}</span>}
          </div>
          
          <p className="text-sm text-gray-500 mb-3">{description}</p>
          
          <div className="w-full">
            <motion.div 
              className="h-2 rounded-full bg-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className={`h-full rounded-full ${progressColor}`}
                initial={{ width: 0 }}
                animate={{ width: `${calculatedProgressValue}%` }}
                transition={{ duration: 0.7, delay: 0.2 }}
              />
            </motion.div>
          </div>
          
          {warning && (
            <p className="text-xs text-red-600 mt-2 font-medium">{warning}</p>
          )}
          
          {info && (
            <p className="text-xs text-gray-500 mt-2">{info}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Definição do tipo das props para o componente principal
interface UserDetailsProps {
  user: UserType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdate: () => void;
  isAdmin?: boolean;
  isPowerUser?: boolean;
}

// Definir o schema de validação para edição de usuário
const userEditSchema = z.object({
  nome: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  telefone: z.string().optional(),
  setor: z.string().optional(),
  cargo: z.string().optional(),
  curso: z.string().optional(),
  idade: z.string().transform(val => {
    const parsed = parseInt(val);
    return isNaN(parsed) ? undefined : parsed;
  }).optional(),
  dataEntradaEmpresa: z.string().optional()
});

type UserEditFormValues = z.infer<typeof userEditSchema>;

// Componente principal UserDetails
export function UserDetails({ user, open, onOpenChange, onUserUpdate, isAdmin = false, isPowerUser = false }: UserDetailsProps) {
  // Estado local
  const [activeTab, setActiveTab] = useState("perfil");
  const [showJustificativa, setShowJustificativa] = useState(false);
  const [actionType, setActionType] = useState<"advertencia" | "notificacao" | "banimento">("notificacao");
  const [userStatus, setUserStatus] = useState<UserStatus>(user.status);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editSection, setEditSection] = useState<"personal" | "professional" | "">("");
  const { currentUser } = useAuth();
  
  // Lista de setores e cargos disponíveis para seleção
  const setoresDisponiveis = [
    "Consultoria Empresarial",
    "Departamento Pessoal",
    "Desenvolvimento Organizacional",
    "Diretoria",
    "Engenharia",
    "Financeiro",
    "Gestão de Pessoas",
    "Gestão de Processos",
    "Inovações",
    "Jurídico",
    "Marketing",
    "Produtos",
    "Recrutamento",
    "Vendas"
  ];

  const cargosDisponiveis = [
    "Analista",
    "Trainee",
    "Consultor",
    "Diretor",
    "Diretora",
    "Head",
    "Presidente Executivo",
  ];

  // Dados para as métricas
  const warningCount = user.advertencias || 0;
  const notificationCount = user.notificacoes || 0;
  
  // Formulário para edição
  const form = useForm<UserEditFormValues, any>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      nome: user.nome,
      email: user.email,
      telefone: user.telefone || "",
      setor: user.setor || "",
      cargo: user.role || user.cargo || "",
      curso: user.curso || "",
      idade: user.idade || undefined,
      dataEntradaEmpresa: user.dataEntradaEmpresa || ""
    }
  });
  
  // Calcula o progresso das advertências
  const warningProgress = (warningCount / 3) * 100;
  const notificationProgress = ((notificationCount % 3) / 3) * 100;
  
  // Função para lidar com ações (notificação, advertência, banimento)
  const handleAction = (type: "advertencia" | "notificacao" | "banimento") => {
    setActionType(type);
    setShowJustificativa(true);
  };
  
  // Função para alterar o status do usuário
  const handleStatusChange = async (newStatus: UserStatus) => {
    if (newStatus === user.status) return;
    
    setIsProcessing(true);
    try {
      // Atualizar o status do usuário no Firestore
      const userRef = doc(db, "users", user.id);
      
      // Se estiver reativando um usuário banido, zerar advertências e notificações
      if (user.status === "Banido" && newStatus === "Ativo") {
        await updateDoc(userRef, { 
          status: newStatus,
          banReason: null,
          advertencias: 0,
          notificacoes: 0,
          lastReactivated: serverTimestamp()
        });
        
        toast.success("Usuário reativado com sucesso! Contadores zerados.");
      } else {
        // Caso contrário, apenas atualiza o status
        await updateDoc(userRef, { 
          status: newStatus 
        });
        
        toast.success(`Status alterado para ${newStatus}`);
      }
      
      // Registrar a alteração de status no log de ações
      await addDoc(collection(db, "statusLogs"), {
        userId: user.id,
        userName: user.nome,
        previousStatus: user.status,
        newStatus: newStatus,
        countersReset: user.status === "Banido" && newStatus === "Ativo",
        changedBy: "admin", // Em uma implementação real, seria o ID do usuário logado
        timestamp: serverTimestamp()
      });
      
      setUserStatus(newStatus);
      onUserUpdate();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast.error("Erro ao alterar status do usuário");
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para confirmar exclusão de usuário
  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(true);
  };

  // Função para excluir usuário
  const handleDeleteUser = async () => {
    setIsProcessing(true);
    try {
      // Excluir o usuário do Firestore
      const userRef = doc(db, "users", user.id);
      
      // Antes de excluir, criar um registro do usuário excluído
      await addDoc(collection(db, "deletedUsers"), {
        ...user,
        deletedAt: serverTimestamp(),
        deletedBy: "admin" // Em uma implementação real, seria o ID do usuário logado
      });
      
      // Excluir o documento do usuário
      await deleteDoc(userRef);
      
      toast.success(`Usuário ${user.nome} excluído com sucesso`);
      setShowDeleteConfirm(false);
      onOpenChange(false);
      onUserUpdate();
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      toast.error("Erro ao excluir usuário. Tente novamente");
    } finally {
      setIsProcessing(false);
    } 
  };

  // Função para lidar com a confirmação de ação na justificativa
  const handleConfirmAction = async (motivo: string) => {
    // Proteção extra: impedir ação em si mesmo
    if (currentUser && user.id === currentUser.uid) {
      toast.error("Você não pode aplicar advertência ou notificação em si mesmo!");
      setIsProcessing(false);
      setShowJustificativa(false);
      return;
    }
    setIsProcessing(true);
    try {
      const userRef = doc(db, "users", user.id);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        toast.error("Usuário não encontrado");
        setIsProcessing(false);
        setShowJustificativa(false);
        return;
      }
      
      // Obter dados atualizados do usuário
      const currentUserData = userDoc.data() as UserType;
      
      // Primeiro, registrar a ação no log (isso tem permissões mais amplas)
      await addDoc(collection(db, "actionLogs"), {
        userId: user.id,
        userName: user.nome,
        actionType,
        motivo,
        // Use o ID real do usuário atual em vez de "admin"
        createdBy: "admin",
        timestamp: serverTimestamp()
      });
      
      if (actionType === "notificacao") {
        try {
          // Incrementar o contador de notificações
          await updateDoc(userRef, { 
            notificacoes: increment(1)
          });
          
          // Adicionar a notificação na coleção de notificações
          await addDoc(collection(db, "notifications"), {
            userId: user.id,
            title: "Notificação do sistema",
            message: motivo,
            date: new Date().toLocaleDateString(),
            isNew: true,
            priority: "Média",
            timestamp: serverTimestamp()
          });
          
          // Verificar se atingiu limite para gerar advertência automática
          const currentNotifications = currentUserData.notificacoes || 0;
          const updatedNotificationCount = currentNotifications + 1;
          
          if (updatedNotificationCount % 3 === 0) {
            // A cada 3 notificações, gera uma advertência automática
            const currentWarnings = currentUserData.advertencias || 0;
            const newWarningsCount = currentWarnings + 1;
            
            await updateDoc(userRef, { 
              advertencias: newWarningsCount
            });
            
            await addDoc(collection(db, "actionLogs"), {
              userId: user.id,
              userName: user.nome,
              actionType: "advertencia",
              motivo: "Advertência automática gerada por acúmulo de 3 notificações",
              createdBy: "system",
              isAutomatic: true,
              timestamp: serverTimestamp()
            });
            
            toast.warning(`${user.nome} recebeu uma advertência automática por acumular 3 notificações`);
            
            // Verificar se o novo número de advertências atingiu o limite para banimento  
            if (newWarningsCount >= 3) {
              await applyAutomaticBan(userRef, user.nome, "Banimento automático por acúmulo de 3 advertências");
            }
          }
          
          toast.success(`${user.nome} foi notificado com sucesso.`);
        } catch (error) {
          console.error("Erro ao processar notificação:", error);
          toast.error(`Erro ao notificar: ${(error as any)?.message || "Erro desconhecido"}`);
        }
      } 
      else if (actionType === "advertencia") {
        try {
          // Obter o valor atual de advertências
          const currentWarnings = currentUserData.advertencias || 0;
          const newWarningsCount = currentWarnings + 1;
          
          // Incrementar o contador de advertências
          await updateDoc(userRef, { 
            advertencias: newWarningsCount
          });
          
          toast.warning(`${user.nome} foi advertido com sucesso.`);
          
          // Verificar se atingiu limite para banimento automático
          if (newWarningsCount >= 3) {
            await applyAutomaticBan(userRef, user.nome, "Banimento automático por acúmulo de 3 advertências");
          }
        } catch (error) {
          console.error("Erro ao processar advertência:", error);
          toast.error(`Erro ao advertir: ${(error as any)?.message || "Erro desconhecido"}`);
        }
      } 
      else if (actionType === "banimento") { 
        try {
          if (userStatus === "Banido") {
            // Reativar o usuário e zerar contadores
            await updateDoc(userRef, { 
              status: "Ativo",
              banReason: null,
              advertencias: 0,
              notificacoes: 0,
              lastReactivated: serverTimestamp()
            });
            
            setUserStatus("Ativo");
            toast.success("Usuário reativado com sucesso! Contadores zerados.");
          } else {
            // Banir o usuário
            await updateDoc(userRef, { 
              status: "Banido",
              banReason: motivo,
              bannedAt: serverTimestamp()
            });
            
            setUserStatus("Banido");
            toast.success("Usuário foi banido com sucesso");
          }
        } catch (error) {
          console.error("Erro ao processar banimento:", error);
          toast.error(`Erro ao banir/reativar: ${(error as any)?.message || "Erro desconhecido"}`);
        }
      }
      
      // Atualiza a lista de usuários independentemente de sucesso/erro em operações específicas
      onUserUpdate();
    } catch (error) {
      console.error("Erro ao processar ação:", error);
      toast.error(`Erro ao realizar ação: ${(error as any)?.message || "Erro desconhecido"}`);
    } finally {
      setIsProcessing(false);
      setShowJustificativa(false);
    }
  };

  // Nova função para aplicar banimento automático
  const applyAutomaticBan = async (userRef: any, userName: string, reason: string) => {
    try {
      // Atualizar status para banido
      await updateDoc(userRef, { 
        status: "Banido",
        banReason: reason,
        bannedAt: serverTimestamp()
      });
      
      // Registrar o log da ação
      await addDoc(collection(db, "actionLogs"), {
        userId: user.id,
        userName,
        actionType: "banimento",
        motivo: reason,
        createdBy: "system",
        isAutomatic: true,
        timestamp: serverTimestamp()
      });
      
      // Atualizar o estado local
      setUserStatus("Banido");
      
      // Notificar o usuário
      toast.error(`${userName} foi banido automaticamente: ${reason}`);
    } catch (error) {
      console.error("Erro ao aplicar banimento automático:", error);
      toast.error("Erro ao aplicar banimento automático");
    }
  };

  // Verificar se o usuário atual é presidente (cargo ou role)
  const isPresidente = user.role === "Presidente";

  // Verificar se tem permissão para limpar contadores
  const canClearCounters = isAdmin || isPresidente;

  // Funções para limpar contadores
  const handleClearWarnings = async () => {
    setIsProcessing(true);
    try {
      const userRef = doc(db, "users", user.id);
      
      // Resetar o contador de advertências
      await updateDoc(userRef, { 
        advertencias: 0
      });
      
      // Registrar a ação no log
      await addDoc(collection(db, "actionLogs"), {
        userId: user.id,
        userName: user.nome,
        actionType: "limparAdvertencias",
        motivo: "Limpeza manual de advertências",
        createdBy: "admin", // Em uma implementação real, seria o ID do usuário logado
        timestamp: serverTimestamp()
      });
      
      toast.success(`Advertências de ${user.nome} foram zeradas com sucesso`);
      onUserUpdate();
    } catch (error) {
      console.error("Erro ao limpar advertências:", error);
      toast.error("Erro ao limpar advertências");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearNotifications = async () => {
    setIsProcessing(true);
    try {
      const userRef = doc(db, "users", user.id);
      
      // Resetar o contador de notificações
      await updateDoc(userRef, { 
        notificacoes: 0
      });
      
      // Registrar a ação no log
      await addDoc(collection(db, "actionLogs"), {
        userId: user.id,
        userName: user.nome,
        actionType: "limparNotificacoes",
        motivo: "Limpeza manual de notificações",
        createdBy: "admin",
        timestamp: serverTimestamp()
      });
      
      toast.success(`Notificações de ${user.nome} foram zeradas com sucesso`);
      onUserUpdate();
    } catch (error) {
      console.error("Erro ao limpar notificações:", error);
      toast.error("Erro ao limpar notificações");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearAll = async () => {
    setIsProcessing(true);
    try {
      const userRef = doc(db, "users", user.id);
      
      // Resetar ambos contadores
      await updateDoc(userRef, { 
        advertencias: 0,
        notificacoes: 0
      });
      
      // Registrar a ação no log
      await addDoc(collection(db, "actionLogs"), {
        userId: user.id,
        userName: user.nome,
        actionType: "limparTudo",
        motivo: "Limpeza completa de contadores (advertências e notificações)",
        createdBy: "admin",
        timestamp: serverTimestamp()
      });
      
      toast.success(`Todos os contadores de ${user.nome} foram zerados com sucesso`);
      onUserUpdate();
    } catch (error) {
      console.error("Erro ao limpar contadores:", error);
      toast.error("Erro ao limpar contadores");
    } finally {
      setIsProcessing(false);
    }
  };

  // Obtém as iniciais do nome para o avatar
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n.charAt(0).toUpperCase()).join("").substring(0, 2);
  };

  // Verifica se o usuário atual tem permissão para estas ações
  const canPerformActions = isAdmin || isPowerUser;

  // Badge de status com cores adequadas
  const getStatusBadge = (status: UserStatus) => {
    switch(status) {
      case "Ativo":
        return <Badge className="bg-green-500 hover:bg-green-600 border-0">{status}</Badge>;
      case "Inativo":
        return <Badge variant="secondary">{status}</Badge>;
      case "Banido":
        return <Badge className="bg-red-500 hover:bg-red-600 border-0">{status}</Badge>;
    }
  };

  // Função para iniciar o modo de edição
  const handleEditClick = () => {
    if (isEditing) {
      // Cancelar a edição e resetar o formulário com os dados atuais do usuário
      setIsEditing(false);
      setEditSection("");
      form.reset({
        nome: user.nome,
        email: user.email,
        telefone: user.telefone || "",
        setor: user.setor || "",
        cargo: user.role || user.cargo || "",
        curso: user.curso || "",
        idade: user.idade || undefined,
        dataEntradaEmpresa: user.dataEntradaEmpresa || ""
      });
      return;
    }

    // Iniciar edição - resetar o formulário com os dados atuais do usuário
    form.reset({
      nome: user.nome,
      email: user.email,
      telefone: user.telefone || "",
      setor: user.setor || "",
      cargo: user.role || user.cargo || "",
      curso: user.curso || "",
      idade: user.idade || undefined,
      dataEntradaEmpresa: user.dataEntradaEmpresa || ""
    });
    setIsEditing(true);
    // Iniciar na seção pessoal por padrão
    setEditSection("personal");
    // Mudar para a aba de perfil automaticamente
    setActiveTab("perfil");
  };

  // Editar seção específica
  const handleEditSection = (section: "personal" | "professional") => {
    setEditSection(section);
    setIsEditing(true);
  };

  // Função para salvar as alterações
  const onSubmitEdit = async (values: UserEditFormValues) => {
    setIsProcessing(true);
    try {
      const userRef = doc(db, "users", user.id);
      
      // Converter idade para número se estiver presente
      const idadeNum = typeof values.idade === 'string' && values.idade !== "" ? 
        parseInt(values.idade) : 
        (typeof values.idade === 'number' ? values.idade : null);
      
      // Dados para atualizar no Firebase
      const updateData: Record<string, any> = {
        nome: values.nome,
        email: values.email,
        telefone: values.telefone || null,
        curso: values.curso || null,
        idade: idadeNum,
        updatedAt: serverTimestamp()
      };
      
      // Se for admin ou powerUser, adicionar campos restritos
      if (isAdmin || isPowerUser) {
        updateData.setor = values.setor || null;
        updateData.cargo = values.cargo || null;
        
        // Manter compatibilidade com campo role se existir
        if (user.role !== undefined) {
          updateData.role = values.cargo || null;
        }
        updateData.dataEntradaEmpresa = values.dataEntradaEmpresa || null;
      }
      
      await updateDoc(userRef, updateData);
      
      toast.success("Perfil atualizado com sucesso!");
      setIsEditing(false);
      onUserUpdate(); // Atualizar a lista principal de usuários
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Erro ao atualizar perfil. Por favor, tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Render do componente principal
  return (
    <>
      <Dialog open={open} onOpenChange={(newValue) => {
        // Resetar o estado de edição ao fechar o diálogo
        if (!newValue) {
          setIsEditing(false);
          setEditSection("");
        }
        onOpenChange(newValue);
      }}>
        <DialogContent hideCloseButton className="w-full max-w-full sm:max-w-xl md:max-w-3xl max-h-[95vh] overflow-y-auto p-0 rounded-xl border shadow-xl flex flex-col">
          {/* Header premium com efeito de glassmorphism */}
          <motion.div 
            className="relative bg-gradient-to-r from-primary/90 via-primary to-primary/80 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div 
              className="absolute inset-0 bg-[url('/pattern-dots.png')] bg-repeat opacity-10"
              animate={{ 
                backgroundPosition: ["0% 0%", "100% 100%"], 
              }}
              transition={{ 
                repeat: Infinity, 
                repeatType: "reverse", 
                duration: 60,
              }}
            />
            <DialogHeader className="px-6 py-6 sm:py-8 relative z-10">
              <div className="flex justify-between items-center">
                <DialogTitle className="flex items-center gap-3 text-white">
                  <div className="p-2.5 bg-white/10 rounded-lg backdrop-blur-sm">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold">Detalhes do Usuário</span>
                </DialogTitle>
                
                <DialogClose asChild>
                  <Button variant="ghost" size="icon" className="text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm">
                    <X className="h-5 w-5" />
                    <span className="sr-only">Fechar</span>
                  </Button>
                </DialogClose>
              </div>
              {isEditing && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-white/20 text-white backdrop-blur-sm border-white/10">
                    Modo de Edição
                  </Badge>
                </div>
              )}
              <DialogDescription className="text-white/90 mt-2 font-medium">
                {user.nome}
              </DialogDescription>
            </DialogHeader>
          </motion.div>
          
          {/* Tabs com design aprimorado */}
          <div className="bg-white sticky top-0 z-10 shadow-sm">
            <div className="flex justify-center border-b">
              <div className="w-full max-w-md flex">
                <button
                  onClick={() => setActiveTab("perfil")}
                  className={`relative flex items-center justify-center gap-2 flex-1 py-4 px-2 font-medium 
                    transition-all duration-300 border-b-2 ${
                    activeTab === "perfil"
                      ? "text-primary border-primary"
                      : "text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  <div className={`p-1.5 rounded-md ${activeTab === "perfil" ? "bg-primary/10" : "bg-gray-100"}`}>
                    <UserIcon className={`h-4 w-4 ${activeTab === "perfil" ? "text-primary" : "text-gray-500"}`} />
                  </div>
                  <span className="text-sm">Perfil</span>
                </button>
                <button
                  onClick={() => setActiveTab("penalidades")}
                  className={`relative flex items-center justify-center gap-2 flex-1 py-4 px-2 font-medium 
                    transition-all duration-300 border-b-2 ${
                    activeTab === "penalidades"
                      ? "text-primary border-primary"
                      : "text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  <div className={`p-1.5 rounded-md ${activeTab === "penalidades" ? "bg-primary/10" : "bg-gray-100"}`}>
                    <ShieldAlert className={`h-4 w-4 ${activeTab === "penalidades" ? "text-primary" : "text-gray-500"}`} />
                  </div>
                  <span className="text-sm">Penalidades</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="py-5 px-4 sm:px-6"> {/* Conteúdo principal com padding ajustável */}
            <AnimatePresence mode="wait">
              {activeTab === "perfil" && (
                <motion.div 
                  key="perfil-content"
                  initial={{ opacity: 0, y: 10 }}  
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {isEditing ? (
                    <div className="space-y-6">
                      {/* Modo de edição premium */}
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-6">
                          <div className="mb-6">
                            <motion.div 
                              className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 mb-6"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-700 mb-1">
                                <Edit className="h-5 w-5 text-blue-600" />
                                {editSection === "personal" ? "Editar Informações Pessoais" : "Editar Informações Profissionais"}
                              </h3>
                              <p className="text-sm text-blue-600">
                                {isAdmin 
                                  ? "Como administrador, você pode editar todos os campos deste usuário."
                                  : "Preencha os campos abaixo para atualizar as informações."}
                              </p>
                              
                              <div className="flex flex-wrap gap-2 mt-4">
                                <Button
                                  type="button" 
                                  size="sm"
                                  variant={editSection === "personal" ? "default" : "outline"}
                                  onClick={() => setEditSection("personal")}
                                  className="rounded-full"
                                >
                                  <UserIcon className="h-3.5 w-3.5 mr-1" />
                                  Dados Pessoais
                                </Button>
                                <Button
                                  type="button" 
                                  size="sm"
                                  variant={editSection === "professional" ? "default" : "outline"}
                                  onClick={() => setEditSection("professional")}
                                  className="rounded-full"
                                >
                                  <Briefcase className="h-3.5 w-3.5 mr-1" />
                                  Dados Profissionais
                                </Button>
                              </div>
                            </motion.div>
                          
                            {editSection === "personal" ? (
                              <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                key="personal-form"
                                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
                              >
                                <h4 className="text-base font-medium mb-4 text-gray-700">Informações Pessoais</h4>
                                <div className="grid gap-5 sm:grid-cols-2">
                                  <FormField
                                    control={form.control}
                                    name="nome"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="flex items-center gap-1.5 text-sm">
                                          <div className="p-1 bg-blue-50 rounded-md">
                                            <UserIcon className="h-3 w-3 text-blue-600" />
                                          </div>
                                          Nome
                                        </FormLabel>
                                        <FormControl>
                                          <Input {...field} 
                                            className="border-gray-200 focus-visible:ring-blue-400"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="flex items-center gap-1.5 text-sm">
                                          <div className="p-1 bg-blue-50 rounded-md">
                                            <Mail className="h-3 w-3 text-blue-600" />
                                          </div>
                                          Email
                                        </FormLabel>
                                        <FormControl>
                                          <Input {...field} 
                                            className="border-gray-200 focus-visible:ring-blue-400"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={form.control}
                                    name="telefone"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="flex items-center gap-1.5 text-sm">
                                          <div className="p-1 bg-blue-50 rounded-md">
                                            <Phone className="h-3 w-3 text-blue-600" />
                                          </div>
                                          Telefone
                                        </FormLabel>
                                        <FormControl>
                                          <Input {...field} 
                                            className="border-gray-200 focus-visible:ring-blue-400"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={form.control}
                                    name="idade"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="flex items-center gap-1.5 text-sm">
                                          <div className="p-1 bg-blue-50 rounded-md">
                                            <UserIcon className="h-3 w-3 text-blue-600" />
                                          </div>
                                          Idade
                                        </FormLabel>
                                        <FormControl>
                                          <Input {...field} type="number" 
                                            className="border-gray-200 focus-visible:ring-blue-400"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={form.control}
                                    name="curso"
                                    render={({ field }) => (
                                      <FormItem className="sm:col-span-2">
                                        <FormLabel className="flex items-center gap-1.5 text-sm">
                                          <div className="p-1 bg-blue-50 rounded-md">
                                            <GraduationCap className="h-3 w-3 text-blue-600" />
                                          </div>
                                          Curso
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                          <FormControl>
                                            <SelectTrigger 
                                              className="border-gray-200 focus:ring-blue-400">
                                              <SelectValue placeholder="Selecione o curso" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent className="max-h-[260px]">
                                            {cargosDisponiveis.map((curso) => (
                                              <SelectItem key={curso} value={curso}>{curso}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </motion.div>
                            ) : (
                              <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                key="professional-form"
                                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
                              >
                                <h4 className="text-base font-medium mb-4 text-gray-700">Informações Profissionais</h4>
                                <div className="grid gap-5 sm:grid-cols-2">
                                  {(isAdmin || isPowerUser) && (
                                    <>
                                      <FormField
                                        control={form.control}
                                        name="cargo"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="flex items-center gap-1.5 text-sm">
                                              <div className="p-1 bg-indigo-50 rounded-md">
                                                <Briefcase className="h-3 w-3 text-indigo-600" />
                                              </div>
                                              Cargo
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                              <FormControl>
                                                <SelectTrigger className="border-gray-200 focus:ring-indigo-400">
                                                  <SelectValue placeholder="Selecione o cargo" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent className="max-h-[260px]">
                                                {cargosDisponiveis.map((cargo) => (
                                                  <SelectItem key={cargo} value={cargo}>{cargo}</SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      
                                      <FormField
                                        control={form.control}
                                        name="setor"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="flex items-center gap-1.5 text-sm">
                                              <div className="p-1 bg-indigo-50 rounded-md">
                                                <Building className="h-3 w-3 text-indigo-600" />
                                              </div>
                                              Setor
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                              <FormControl>
                                                <SelectTrigger className="border-gray-200 focus:ring-indigo-400">
                                                  <SelectValue placeholder="Selecione o setor" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent className="max-h-[260px]">
                                                {setoresDisponiveis.map((setor) => (
                                                  <SelectItem key={setor} value={setor}>{setor}</SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </>
                                  )}
                                  
                                  <FormField
                                    control={form.control}
                                    name="dataEntradaEmpresa"
                                    render={({ field }) => (
                                      <FormItem className={!isAdmin && !isPowerUser ? "sm:col-span-2" : ""}>
                                        <FormLabel className="flex items-center gap-1.5 text-sm">
                                          <div className="p-1 bg-indigo-50 rounded-md">
                                            <Calendar className="h-3 w-3 text-indigo-600" />
                                          </div>
                                          Data de Entrada
                                        </FormLabel>
                                        <FormControl>
                                          <Input {...field} type="date" 
                                            className="border-gray-200 focus-visible:ring-indigo-400"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                
                                {!isAdmin && !isPowerUser && (
                                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg mt-4 flex items-start gap-2">
                                    <Info className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-amber-700">
                                      Apenas administradores podem editar cargo e setor.
                                      Entre em contato com um administrador se precisar atualizar estas informações.
                                    </p>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </div>
                          
                          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
                            <Button
                              type="button"
                              variant="outline" 
                              onClick={() => setIsEditing(false)}
                              className="gap-2 order-2 sm:order-1"
                            >
                              <X className="h-4 w-4" /> Cancelar
                            </Button>
                            <Button
                              type="submit"
                              className="gap-2 order-1 sm:order-2 bg-gradient-to-r from-primary to-primary/90"
                              disabled={isProcessing || !form.formState.isDirty}
                            >
                              {isProcessing ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Salvando...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4" />
                                  Salvar Alterações
                                </>
                              )}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </div>
                  ) : (
                    <div className="flex flex-col lg:flex-row gap-5">
                      {/* Avatar e informações básicas - Layout premium */}
                      <div className="lg:w-1/3 order-2 lg:order-1">
                        <motion.div 
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="sticky top-[85px]"
                        >
                          <Card className="overflow-hidden rounded-xl border-0 shadow-lg">
                            <div className="relative bg-gradient-to-br from-primary via-primary to-primary/90 h-28">
                              <motion.div 
                                className="absolute inset-0 bg-[url('/pattern-dots.png')] bg-repeat opacity-5"
                                animate={{ 
                                  backgroundPosition: ["0% 0%", "100% 100%"], 
                                }}
                                transition={{ 
                                  repeat: Infinity, 
                                  repeatType: "reverse", 
                                  duration: 30,
                                }}
                              />
                            </div>
                            <CardContent className="pt-0 relative -mt-14 text-center flex flex-col items-center">
                              <Avatar className="w-28 h-28 border-4 border-white shadow-xl">
                                <AvatarImage src={user.avatarUrl} alt={user.nome} />
                                <AvatarFallback className="bg-gradient-to-br from-primary/90 to-primary text-white text-xl">
                                  {getInitials(user.nome)}
                                </AvatarFallback>
                              </Avatar>
                              
                              <motion.div 
                                className="mt-4 space-y-1.5 w-full"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }} 
                              >
                                <h3 className="font-bold text-lg">{user.nome}</h3>
                                <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                                  <Mail className="h-3.5 w-3.5 text-gray-400" /> 
                                  <span className="truncate max-w-[180px]">{user.email}</span>
                                </p>
                                <div className="flex justify-center gap-2 mt-3 mb-1">
                                  {getStatusBadge(userStatus)}
                                </div>
                              </motion.div>
                              
                              {/* Mini dashboard animado e aprimorado */}
                              <motion.div 
                                className="w-full p-4 bg-gray-50 rounded-xl border mt-4"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <div className="p-1.5 bg-amber-100 rounded-full">
                                      <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                                    </div>
                                    <span className="text-sm font-medium">Advertências:</span>
                                  </div>
                                  <span className={`font-bold ${warningCount > 0 ? 'text-amber-500' : 'text-gray-600'}`}>
                                    {warningCount}/3
                                  </span>
                                </div>
                                
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(warningCount / 3) * 100}%` }}
                                  transition={{ duration: 0.5, delay: 0.4 }}
                                >
                                  <Progress value={(warningCount / 3) * 100} className="h-1.5 bg-amber-100" indicatorClassName="bg-amber-500" />
                                </motion.div>
                                
                                <div className="flex items-center justify-between mt-4 mb-1">
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <div className="p-1.5 bg-blue-100 rounded-full">
                                      <Bell className="h-3.5 w-3.5 text-blue-500" />
                                    </div>
                                    <span className="text-sm font-medium">Notificações:</span>
                                  </div>
                                  <span className={`font-bold ${notificationCount > 0 ? 'text-blue-500' : 'text-gray-600'}`}>
                                    {notificationCount % 3}/3
                                  </span>
                                </div>
                                
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${((notificationCount % 3) / 3) * 100}%` }}
                                  transition={{ duration: 0.5, delay: 0.5 }}
                                >
                                  <Progress value={((notificationCount % 3) / 3) * 100} className="h-1.5 bg-blue-100" indicatorClassName="bg-blue-500" />
                                </motion.div>
                              </motion.div>
                              
                              {/* Quick-actions aprimoradas */}
                              <div className="mt-5 w-full">
                                <Button 
                                  variant="outline" 
                                  onClick={() => handleEditSection("personal")}
                                  className="w-full gap-2 border-primary/20 hover:bg-primary/5 font-medium text-primary"
                                >
                                  <Edit className="h-4 w-4" /> Editar Perfil
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </div>
                      
                      {/* Coluna de Informações Detalhadas - Layout premium */}
                      <div className="lg:w-2/3 space-y-6 order-1 lg:order-2">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                              <Briefcase className="h-5 w-5 text-primary" />
                              Informações Profissionais
                            </h2>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleEditSection("professional")}
                              className="text-gray-500 hover:text-primary hover:bg-primary/5"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoItem
                              icon={<Building className="h-4 w-4 text-blue-500" />}
                              label="Setor"
                              value={user.setor || "Não informado"}
                            />
                            
                            <InfoItem
                              icon={<Briefcase className="h-4 w-4 text-blue-500" />}
                              label="Cargo"
                              value={user.role || user.cargo || "Não informado"}
                            />
                            
                            <InfoItem
                              icon={<Calendar className="h-4 w-4 text-blue-500" />}
                              label="Data de Entrada"
                              value={user.dataEntradaEmpresa || "Não informada"}
                            />
                            
                            <InfoItem
                              icon={<Clock className="h-4 w-4 text-blue-500" />}
                              label="Tempo na Empresa"
                              value={
                                user.dataEntradaEmpresa ? 
                                  (() => {
                                    const entryDate = new Date(user.dataEntradaEmpresa);
                                    const now = new Date();
                                    const diffTime = Math.abs(now.getTime() - entryDate.getTime());
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    const diffMonths = Math.floor(diffDays / 30);
                                    return diffMonths < 1 ? `${diffDays} dias` : `${diffMonths} meses`;
                                  })() : 
                                  "Não informado"
                              }
                            />
                          </div>
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                              <UserIcon className="h-5 w-5 text-green-600" />
                              Informações Pessoais
                            </h2>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleEditSection("personal")}
                              className="text-gray-500 hover:text-green-600 hover:bg-green-600/5"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoItem
                              icon={<GraduationCap className="h-4 w-4 text-green-500" />}
                              label="Curso"
                              value={user.curso || "Não informado"}
                            />
                            
                            <InfoItem
                              icon={<UserIcon className="h-4 w-4 text-green-500" />}
                              label="Idade"
                              value={user.idade ? `${user.idade} anos` : "Não informada"}
                            />
                            
                            <InfoItem
                              icon={<Phone className="h-4 w-4 text-green-500" />}
                              label="Telefone"
                              value={user.telefone || "Não informado"}
                            />

                            <InfoItem
                              icon={<MapPin className="h-4 w-4 text-green-500" />}
                              label="Matrícula"
                              value={user.matricula || "Não informada"}
                            />
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
              
              {activeTab === "penalidades" && (
                <motion.div
                  key="penalidades-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Conteúdo da aba de penalidades */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <StatCard 
                        title="Advertências"
                        value={warningCount}
                        maxValue={3}
                        icon={<ShieldAlert className="h-8 w-8 text-amber-500" />}
                        bgColor="bg-amber-100"
                        textColor="text-amber-500"
                        progressColor="bg-amber-500"
                        description={
                          warningCount === 0 
                            ? "Nenhuma advertência registrada" 
                            : warningCount === 1 
                              ? "1 advertência registrada"
                              : `${warningCount} advertências registradas`
                        }
                        warning={warningCount >= 3 ? "Limite atingido - Banimento automático aplicado" : ""}
                      />
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      <StatCard 
                        title="Notificações"
                        value={notificationCount}
                        maxValue={notificationCount}
                        progressValue={((notificationCount % 3) / 3) * 100}
                        icon={<Bell className="h-8 w-8 text-blue-500" />}
                        bgColor="bg-blue-100"
                        textColor="text-blue-500"
                        progressColor="bg-blue-500"
                        description={
                          notificationCount === 0 
                            ? "Nenhuma notificação enviada" 
                            : notificationCount === 1 
                              ? "1 notificação enviada"
                              : `${notificationCount} notificações enviadas`
                        }
                        info={`${3 - (notificationCount % 3)} notificações até próxima advertência`}
                      />
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/30 mb-6 shadow-sm">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-amber-100 rounded-full">
                            <Shield className="h-6 w-6 text-amber-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-amber-800 mb-3 text-lg">Regras do sistema</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="bg-white/60 p-3 rounded-md border border-amber-200 shadow-sm">
                                <div className="flex items-center gap-2 font-medium text-amber-700 mb-1">
                                  <Bell className="h-4 w-4" />
                                  <span>Notificações</span>
                                </div>
                                <p className="text-sm text-amber-700">3 notificações = 1 advertência automática</p>
                              </div>
                              
                              <div className="bg-white/60 p-3 rounded-md border border-amber-200 shadow-sm">
                                <div className="flex items-center gap-2 font-medium text-amber-700 mb-1">
                                  <ShieldAlert className="h-4 w-4" />
                                  <span>Advertências</span>
                                </div>
                                <p className="text-sm text-amber-700">3 advertências = banimento automático</p>
                              </div>
                              
                              <div className="bg-white/60 p-3 rounded-md border border-amber-200 shadow-sm">
                                <div className="flex items-center gap-2 font-medium text-amber-700 mb-1">
                                  <Info className="h-4 w-4" />
                                  <span>Registro</span>
                                </div>
                                <p className="text-sm text-amber-700">Todas as ações são registradas com justificativas</p>
                              </div>
                              
                              <div className="bg-white/60 p-3 rounded-md border border-amber-200 shadow-sm">
                                <div className="flex items-center gap-2 font-medium text-amber-700 mb-1">
                                  <Ban className="h-4 w-4" />
                                  <span>Acesso</span>
                                </div>
                                <p className="text-sm text-amber-700">Usuários banidos não podem acessar o sistema</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <Card className="shadow-sm">
                      <CardHeader className="pb-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                          <Clock className="h-5 w-5 text-primary" />
                          Histórico de Ações
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                          <p className="text-gray-500 text-sm">Nenhuma ação registrada para este usuário.</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {!isEditing && (
            <DialogFooter className="px-4 sm:px-6 py-4 border-t bg-gradient-to-br from-gray-50 to-gray-100">
              {/* Verificação adicional para garantir que as ações apareçam */}
              {(canPerformActions || isAdmin || isPowerUser) && (
                <div className="flex flex-wrap gap-2 w-full">
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 relative overflow-hidden group"
                    onClick={() => handleAction("notificacao")}
                    disabled={userStatus === "Banido" || isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <motion.div whileTap={{ scale: 0.9 }} className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <span>Notificar</span>
                      </motion.div>
                    )}
                    <span className="absolute inset-0 w-0 bg-blue-100/50 transition-all duration-300 group-hover:w-full"></span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
                    onClick={() => handleAction("advertencia")}
                    disabled={userStatus === "Banido" || isProcessing}
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
                    Advertir
                  </Button>
                  
                  <Button 
                    variant={userStatus === "Banido" ? "default" : "destructive"}
                    className={`flex-1 gap-2 ${userStatus === "Banido" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}
                    onClick={() => handleAction("banimento")}
                    disabled={isProcessing}
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                    {userStatus === "Banido" ? "Reativar" : "Banir"}
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="destructive"
                      className="flex-1 gap-2 bg-amber-600 hover:bg-amber-700"
                      onClick={handleDeleteConfirm}
                      disabled={isProcessing}
                    >
                      {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      Excluir
                    </Button>
                  )}
                </div>
              )}

              {/* Reformulação de botões secundários */}
              {(canPerformActions || isAdmin || isPowerUser) && (
                <div className="flex flex-col w-full gap-2 mt-2">
                  <Button 
                    variant="outline"
                    className="w-full gap-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                    onClick={handleEditClick}
                    disabled={isProcessing}
                  >
                    <Edit className="h-4 w-4" />
                    {isEditing ? "Cancelar Edição" : "Editar Perfil"}
                  </Button>
                  
                  {/* Dropdown para limpar contadores */}
                  {canClearCounters && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                          disabled={isProcessing}
                        >
                          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eraser className="h-4 w-4" />}
                          Limpar Contadores
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem 
                          onClick={handleClearWarnings}
                          className="cursor-pointer flex items-center gap-2 text-amber-600"
                          disabled={isProcessing || user.advertencias === 0}
                        >
                          <ShieldAlert className="h-4 w-4" /> Limpar Advertências
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={handleClearNotifications}
                          className="cursor-pointer flex items-center gap-2 text-blue-600"
                          disabled={isProcessing || user.notificacoes === 0}
                        >
                          <Bell className="h-4 w-4" /> Limpar Notificações
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          onClick={handleClearAll}
                          className="cursor-pointer flex items-center gap-2 text-indigo-600 font-medium"
                          disabled={isProcessing || (user.advertencias === 0 && user.notificacoes === 0)}
                        >
                          <Eraser className="h-4 w-4" /> Limpar Tudo
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário <strong>{user.nome}</strong>? Esta ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-amber-600 hover:bg-amber-700"
              onClick={handleDeleteUser}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <JustificativaForm
        open={showJustificativa}
        onOpenChange={setShowJustificativa}
        user={user}
        actionType={actionType}
        onConfirm={handleConfirmAction}
      />
    </>
  );
}