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
  MapPin
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

// Definição do tipo das props para o componente InfoItem
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

// Componente reutilizável para itens de informação
const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => (
  <div className="p-3 rounded-lg bg-gray-50 border hover:shadow-sm transition-all space-y-1">
    <div className="text-sm text-gray-500 flex items-center gap-1.5">{icon} {label}</div>
    <div className="font-medium text-gray-800">{value}</div>
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
  
  // Lista de setores e cargos disponíveis para seleção
  const setoresDisponiveis = [
    "Administração",
    "Comercial",
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
    "Operações",
    "Produtos",
    "Recrutamento",
    "RH",
    "TI",
    "Vendas"
  ];

  const cargosDisponiveis = [
    "Analista",
    "Assistente",
    "Colaborador",
    "Consultor",
    "Coordenador",
    "Diretor",
    "Diretora",
    "Estagiário",
    "Gerente",
    "Head",
    "Membro",
    "Presidente",
    "Vice-Presidente"
  ];

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
      cargo: user.role || user.role || "",
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
    setIsProcessing(true);
    try {
      const userRef = doc(db, "users", user.id);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        toast.error("Usuário não encontrado");
        return;
      }
      
      // Obter dados atualizados do usuário
      const currentUserData = userDoc.data() as UserType;
      
      // Criar um log da ação realizada
      await addDoc(collection(db, "actionLogs"), {
        userId: user.id,
        userName: user.nome,
        actionType,
        motivo,
        createdBy: "admin", // Em uma implementação real, seria o ID do usuário logado
        timestamp: serverTimestamp()
      });
      
      if (actionType === "notificacao") {
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
      } 
      else if (actionType === "advertencia") {
        // Obter o valor atual de advertências
        const currentWarnings = currentUserData.advertencias || 0;
        const newWarningsCount = currentWarnings + 1;
        
        // Incrementar o contador de advertências
        await updateDoc(userRef, { 
          advertencias: newWarningsCount 
        });
        
        // Verificar se atingiu limite para banimento automático
        if (newWarningsCount >= 3) {
          await applyAutomaticBan(userRef, user.nome, "Banimento automático por acúmulo de 3 advertências");
        }
      } 
      else if (actionType === "banimento") {
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
      }
      
      onUserUpdate();
    } catch (error) {
      console.error("Erro ao realizar ação:", error);
      toast.error("Erro ao realizar ação. Verifique o console para mais detalhes.");
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
      // Cancelar a edição
      setIsEditing(false);
      setEditSection("");
      form.reset({
        nome: user.nome,
        email: user.email,
        telefone: user.telefone || "",
        setor: user.setor || "",
        cargo: user.role || user.role || "",
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
      cargo: user.role || user.role || "",
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
        if (user.role) {
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
        {/* Certifique-se de que todos os elementos JSX estão corretamente fechados */}
        <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          {/* Cabeçalho com animação de gradiente sutíl */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative bg-gradient-to-r from-primary/90 to-primary overflow-hidden"
          >
            <motion.div 
              className="absolute inset-0 bg-[url('/pattern-dots.png')] bg-repeat opacity-10"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 0.1 }}
              transition={{ duration: 0.5 }}
            />
            
            <DialogHeader className="px-6 py-5 relative z-10">
              <div className="flex justify-between items-center">
                <DialogTitle className="flex items-center gap-2 text-white">
                  <UserIcon className="h-6 w-6 text-white/90" />
                  <span className="text-xl font-semibold">Detalhes do Usuário</span>
                </DialogTitle>
                
                {/* Botão de fechar explícito */}
                <DialogClose asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
                    <X className="h-5 w-5" />
                    <span className="sr-only">Fechar</span>
                  </Button>
                </DialogClose>
                
                {isEditing && (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-white text-primary">
                      Modo de Edição
                    </Badge>
                  </div>
                )}
              </div>
              <DialogDescription className="text-white/80 mt-1">
                Gerencie informações e permissões de {user.nome}
              </DialogDescription>
            </DialogHeader>
          </motion.div>
          
          <Tabs defaultValue="perfil" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <div className="bg-gray-50 border-b px-6 py-2">
              <TabsList className="bg-gray-100/80 p-1">
                <TabsTrigger value="perfil" className="data-[state=active]:bg-white data-[state=active]:text-primary">
                  <UserIcon className="h-4 w-4 mr-1.5" />Perfil
                </TabsTrigger>
                <TabsTrigger value="penalidades" className="data-[state=active]:bg-white data-[state=active]:text-primary">
                  <ShieldAlert className="h-4 w-4 mr-1.5" />Penalidades
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="py-5 px-6"> {/* TabsContent container */}
              <AnimatePresence mode="wait">
                {activeTab === "perfil" && (
                  <motion.div
                    key="perfil-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TabsContent value="perfil" className="mt-0" forceMount> {/* Use forceMount if needed with AnimatePresence */}
                      {isEditing ? (
                        <div className="space-y-6">
                          {/* Modo de edição */}
                          <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-6">
                              <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-medium flex items-center gap-2 text-primary">
                                  <Edit className="h-5 w-5" />
                                  {editSection === "personal" ? "Editar Informações Pessoais" : "Editar Informações Profissionais"}
                                </h3>
                                
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button" 
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditSection(editSection === "personal" ? "professional" : "personal")}
                                    className="text-xs"
                                  >
                                    {editSection === "personal" ? "Editar Info Profissional" : "Editar Info Pessoal"}
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 mb-4">
                                <p className="text-sm text-blue-700 flex items-start gap-2">
                                  <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                  {isAdmin ? 
                                    "Como administrador, você pode editar todos os campos do usuário." :
                                    "Você só pode editar as informações pessoais do usuário."}
                                </p>
                              </div>

                              {editSection === "personal" ? (
                                <motion.div 
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="space-y-4 bg-white p-5 rounded-lg border shadow-sm"
                                >
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                      control={form.control}
                                      name="nome"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="flex items-center gap-1.5">
                                            <UserIcon className="h-3.5 w-3.5 text-gray-500" />
                                            Nome
                                          </FormLabel>
                                          <FormControl>
                                            <Input {...field} />
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
                                          <FormLabel className="flex items-center gap-1.5">
                                            <Mail className="h-3.5 w-3.5 text-gray-500" />
                                            Email
                                          </FormLabel>
                                          <FormControl>
                                            <Input {...field} />
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
                                          <FormLabel className="flex items-center gap-1.5">
                                            <Phone className="h-3.5 w-3.5 text-gray-500" />
                                            Telefone
                                          </FormLabel>
                                          <FormControl>
                                            <Input {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <FormField
                                      control={form.control}
                                      name="curso"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="flex items-center gap-1.5">
                                            <GraduationCap className="h-3.5 w-3.5 text-gray-500" />
                                            Curso
                                          </FormLabel>
                                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                              <SelectTrigger>
                                                <SelectValue placeholder="Selecione o curso" />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                              {cursosDisponiveis.map((curso) => (
                                                <SelectItem key={curso} value={curso}>{curso}</SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <FormField
                                      control={form.control}
                                      name="idade"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="flex items-center gap-1.5">
                                            <UserIcon className="h-3.5 w-3.5 text-gray-500" />
                                            Idade
                                          </FormLabel>
                                          <FormControl>
                                            <Input {...field} type="number" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                </motion.div>
                              ) : (
                                <motion.div 
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="space-y-4 bg-white p-5 rounded-lg border shadow-sm"
                                >
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(isAdmin || isPowerUser) && (
                                      <>
                                        <FormField
                                          control={form.control}
                                          name="cargo"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel className="flex items-center gap-1.5">
                                                <Briefcase className="h-3.5 w-3.5 text-gray-500" />
                                                Cargo
                                              </FormLabel>
                                              <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                                <FormControl>
                                                  <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o cargo" />
                                                  </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
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
                                              <FormLabel className="flex items-center gap-1.5">
                                                <Building className="h-3.5 w-3.5 text-gray-500" />
                                                Setor
                                              </FormLabel>
                                              <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                                <FormControl>
                                                  <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o setor" />
                                                  </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
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
                                        <FormItem>
                                          <FormLabel className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5 text-gray-500" />
                                            Data de Entrada
                                          </FormLabel>
                                          <FormControl>
                                            <Input {...field} type="date" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>

                                  {!isAdmin && !isPowerUser && (
                                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-md mt-2">
                                      <p className="text-xs text-amber-700 flex items-start gap-2">
                                        <Info className="h-3.5 w-3.5 text-amber-500 mt-0.5" />
                                        Apenas administradores podem editar cargo e setor.
                                      </p>
                                    </div>
                                  )}
                                </motion.div>
                              )}

                              <div className="flex justify-end gap-3 pt-2">
                                <Button
                                  type="button"
                                  variant="outline" 
                                  onClick={() => setIsEditing(false)}
                                  className="gap-2"
                                >
                                  <X className="h-4 w-4" /> Cancelar
                                </Button>
                                <Button
                                  type="submit"
                                  className="gap-2 bg-primary"
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
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Avatar e informações básicas - Layout melhorado */}
                          <div className="md:w-1/3">
                            <motion.div 
                              initial={{ y: 10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
                                <div className="relative bg-gradient-to-b from-primary/80 to-primary h-24">
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
                                
                                <CardContent className="pt-0 relative -mt-12 text-center flex flex-col items-center">
                                  <Avatar className="w-24 h-24 border-4 border-white shadow-lg ring-2 ring-primary/10">
                                    <AvatarImage src={user.avatarUrl} alt={user.nome} />
                                    <AvatarFallback className="bg-primary/90 text-white text-lg">
                                      {getInitials(user.nome)}
                                    </AvatarFallback>
                                  </Avatar>
                                  
                                  <motion.div 
                                    className="mt-3 space-y-1"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                  >
                                    <h3 className="font-semibold text-lg">{user.nome}</h3>
                                    <p className="text-sm text-gray-600">
                                      <span className="inline-flex items-center gap-1">
                                        <Mail className="h-3 w-3 text-gray-400" /> 
                                        {user.email}
                                      </span>
                                    </p>
                                    
                                    <div className="flex justify-center gap-2 mt-2">
                                      {getStatusBadge(userStatus)}
                                    </div>
                                  </motion.div>
                                  
                                  {/* Mini dashboard animado */}
                                  <motion.div 
                                    className="w-full p-3 bg-gray-50 rounded-md border mt-4"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 }}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2 text-gray-700">
                                        <ShieldAlert className="h-4 w-4 text-amber-500" />
                                        <span className="text-sm">Advertências:</span>
                                      </div>
                                      <span className={`font-semibold ${warningCount > 0 ? 'text-amber-500' : 'text-gray-600'}`}>
                                        {warningCount}/3
                                      </span>
                                    </div>
                                    
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${(warningCount / 3) * 100}%` }}
                                      transition={{ duration: 0.5, delay: 0.4 }}
                                    >
                                      <Progress value={(warningCount / 3) * 100} className="h-2 bg-amber-100" indicatorClassName="bg-amber-500" />
                                    </motion.div>
                                    
                                    <div className="flex items-center justify-between mt-3">
                                      <div className="flex items-center gap-2 text-gray-700">
                                        <Bell className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm">Notificações:</span>
                                      </div>
                                      <span className={`font-semibold ${notificationCount > 0 ? 'text-blue-500' : 'text-gray-600'}`}>
                                        {notificationCount % 3}/3
                                      </span>
                                    </div>
                                    
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${((notificationCount % 3) / 3) * 100}%` }}
                                      transition={{ duration: 0.5, delay: 0.5 }}
                                    >
                                      <Progress value={((notificationCount % 3) / 3) * 100} className="h-2 bg-blue-100" indicatorClassName="bg-blue-500" />
                                    </motion.div>
                                  </motion.div>
                                  
                                  {/* Quick-actions */}
                                  <div className="mt-4 flex gap-2 w-full">
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => handleEditSection("personal")}
                                      className="w-full text-xs"
                                    >
                                      <Edit className="h-3 w-3 mr-1" /> Editar Perfil
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          </div>
                          
                          {/* Coluna de Informações Detalhadas - Layout melhorado */}
                          <div className="md:w-2/3 space-y-5">
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4, delay: 0.1 }}
                            >
                              <Card className="border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-all">
                                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-blue-600" />
                                    Informações Profissionais
                                  </CardTitle>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => handleEditSection("professional")}
                                  >
                                    <Edit className="h-4 w-4 text-blue-600" />
                                  </Button>
                                </CardHeader>
                                
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                                  <InfoItem
                                    icon={<Building className="h-4 w-4 text-blue-500" />}
                                    label="Setor"
                                    value={user.setor || "Não informado"}
                                  />
                                  
                                  <InfoItem
                                    icon={<Briefcase className="h-4 w-4 text-blue-500" />}
                                    label="Cargo"
                                    value={user.cargo || user.role || "Não informado"}
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
                                </CardContent>
                              </Card>
                            </motion.div>
                            
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4, delay: 0.2 }}
                            >
                              <Card className="border-t-4 border-t-green-500 shadow-sm hover:shadow-md transition-all">
                                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                                    <UserIcon className="h-5 w-5 text-green-600" />
                                    Informações Pessoais
                                  </CardTitle>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => handleEditSection("personal")}
                                  >
                                    <Edit className="h-4 w-4 text-green-600" />
                                  </Button>
                                </CardHeader>
                                
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
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
                                </CardContent>
                              </Card>
                            </motion.div>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  </motion.div>
                )}
                  
                {activeTab === "penalidades" && (
                  <motion.div
                    key="penalidades-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TabsContent value="penalidades" className="mt-0" forceMount> {/* Use forceMount if needed */}
                      {/* Componente de estatísticas com animações */}
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

                      {/* Histórico de Ações */}
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
                    </TabsContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!isEditing && (
              <DialogFooter className="px-6 py-4 bg-gray-50 border-t">
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
          </Tabs>
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
              onClick={handleDeleteUser}
              className="bg-amber-600 hover:bg-amber-700"
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