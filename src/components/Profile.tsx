import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { toast } from "sonner";
import { sendPasswordResetEmail } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DashboardLayout from "@/components/DashboardLayout";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, Lock, Mail, Phone, 
  User as UserIcon, MapPin, GraduationCap, 
  Calendar, Info, Camera, Edit, 
  RefreshCcw, Save, X, Shield,
  Briefcase, Building, ArrowUpCircle,
  LogOut, Bell, ChevronUp
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useMediaQuery } from "@/hooks/use-media-query";
import { uploadProfileImage } from "@/lib/firebase";
import { Switch } from "@/components/ui/switch";

// Schema para validação do formulário de perfil
const profileFormSchema = z.object({
  nome: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }).optional(),
  telefone: z.string().optional(),
  matricula: z.string().optional(),
  curso: z.string().optional(),
  dataEntradaEmpresa: z.string().optional(),
  cargo: z.string().optional(),
  setor: z.string().optional(),
});

export function Profile() {
  // Contexto de autenticação e estado
  const { currentUser, userData, isAdmin, isPowerUser } = useAuth();
  
  // Verificar se o usuário tem permissões para editar informações profissionais
  const canEditProfessionalInfo = isAdmin || isPowerUser;
  
  const [activeTab, setActiveTab] = useState("perfil");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = useMediaQuery("(max-width: 640px)");
  const isTinyScreen = useMediaQuery("(max-width: 360px)");
  
  // Data de entrada formatada
  const formattedEntryDate = userData?.dataEntradaEmpresa ? 
    new Date(userData.dataEntradaEmpresa).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }) : "Não informada";
  
  // Função para formatar data para input type="date" - MOVIDA PARA ANTES DO USO
  const formatDateForInput = (dateString: string) => {
    try {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        // Se a data estiver no formato dd/mm/yyyy (BR)
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      // Tenta formatar assumindo que já é YYYY-MM-DD ou semelhante
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "";
    }
  };
  
  // Função para formatar data do input para exibição - MOVIDA PARA ANTES DO USO
  const formatDateForDisplay = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Erro ao formatar data para exibição:", error);
      return dateString;
    }
  };
  
  // Monitorar scroll para mostrar botão de voltar ao topo
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Cálculo do tempo na empresa
  const calculateTimeInCompany = () => {
    if (!userData?.dataEntradaEmpresa) return "Não disponível";
    const entryDate = new Date(userData.dataEntradaEmpresa);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - entryDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 30) return `${diffDays} dias`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? 'mês' : 'meses'}`;
    const diffYears = Math.floor(diffMonths / 12);
    const remainingMonths = diffMonths % 12;
    if (remainingMonths === 0) {
      return `${diffYears} ${diffYears === 1 ? 'ano' : 'anos'}`;
    }
    return `${diffYears} ${diffYears === 1 ? 'ano' : 'anos'} e ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`;
  };
  
  // Formulário de perfil
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nome: userData?.nome || "",
      email: userData?.email || "",
      telefone: userData?.telefone || "",
      matricula: userData?.matricula || "",
      curso: userData?.curso || "",
      dataEntradaEmpresa: userData?.dataEntradaEmpresa ? formatDateForInput(userData.dataEntradaEmpresa) : "",
      cargo: userData?.role || userData?.role || "",
      setor: userData?.setor || "",
    },
  });
  
  // Atualizar valores do formulário quando userData muda
  useEffect(() => {
    if (userData) {
      form.reset({
        nome: userData.nome || "",
        email: userData.email || "",
        telefone: userData.telefone || "",
        matricula: userData.matricula || "",
        curso: userData.curso || "",
        dataEntradaEmpresa: userData?.dataEntradaEmpresa ? formatDateForInput(userData.dataEntradaEmpresa) : "",
        cargo: userData?.role || userData?.role || "",
        setor: userData?.setor || "",
      });
    }
  }, [userData, form]);
  // Handler para seleção de avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Verificar tamanho do arquivo (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 5MB.");
      return;
    }
    // Verificar tipos de arquivo permitidos
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Formato não suportado. Use JPG, PNG, GIF ou WebP.");
      return;
    }
    setAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    toast.success("Foto selecionada. Clique em 'Salvar' para aplicar as mudanças.");
  };

  // Handler para envio do formulário
  const onSubmit = async (data: z.infer<typeof profileFormSchema>) => {
    if (!currentUser || !userData) return;
    
    try {
      setIsSubmitting(true);
      const userRef = doc(db, "users", currentUser.uid);
      
      // Dados a serem atualizados
      const updateData: Record<string, any> = {
        ...data,
        updatedAt: serverTimestamp()
      };
      
      // Formatar data de entrada para exibição se foi fornecida
      if (data.dataEntradaEmpresa) {
        updateData.dataEntradaEmpresa = formatDateForDisplay(data.dataEntradaEmpresa);
      }
      
      // Upload de avatar, se houver
      if (avatarFile) {
        const avatarUrl = await uploadProfileImage(currentUser.uid, avatarFile);
        if (avatarUrl) {
          updateData.avatarUrl = avatarUrl;
        }
      }
      
      // Se tiver permissões especiais, permitir a atualização de cargo e setor
      if (canEditProfessionalInfo) {
        updateData.cargo = data.cargo || null;
        updateData.setor = data.setor || null;
        
        // Manter compatibilidade com campo role se existir
        if (userData.role) {
          updateData.role = data.cargo || null;
        }
      } else {
        // Remover campos que usuários comuns não deveriam editar
        delete updateData.cargo;
        delete updateData.setor;
      }
      
      await updateDoc(userRef, updateData);
      
      // Limpar previsualização do avatar
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(null);
      }
      setAvatarFile(null);
      
      // Atualizar os dados do usuário
      await fetchUserData();
      
      toast.success("Perfil atualizado com sucesso!");
      setEditMode(false);
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error(`Erro ao atualizar perfil: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para buscar dados atualizados do usuário
  const fetchUserData = async () => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        form.reset({
          nome: userData.nome || "",
          email: userData.email || "",
          telefone: userData.telefone || "",
          matricula: userData.matricula || "",
          curso: userData.curso || "",
          dataEntradaEmpresa: userData?.dataEntradaEmpresa ? formatDateForInput(userData.dataEntradaEmpresa) : "",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
    }
  };

  // Handler para mudança de senha
  const handlePasswordChange = async () => {
    if (!currentUser?.email) return;
    
    try {
      setIsLoading(true);
      // Enviar email de redefinição de senha
      await sendPasswordResetEmail(auth, currentUser.email);
      setPasswordResetSent(true);
      toast.success("Email de redefinição de senha enviado com sucesso!");
      setTimeout(() => {
        setPasswordDialogOpen(false);
        setPasswordResetSent(false);
      }, 3000);
    } catch (error: any) {
      console.error("Erro ao solicitar redefinição de senha:", error);
      toast.error(`Erro ao solicitar redefinição de senha: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Rolar para o topo
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Verificar se há dados para exibir
  if (!userData || !currentUser) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] p-4">
          <div className="text-center">
            <div className="relative h-16 w-16 mx-auto mb-6">
              <motion.div 
                className="absolute inset-0 rounded-full border-4 border-primary/30"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div 
                className="absolute inset-0 rounded-full border-t-4 border-primary"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Carregando seu perfil...
            </h2>
            <p className="text-gray-500 mt-2 animate-pulse">
              Aguarde um momento
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-1 sm:px-2">
        {/* Banner de perfil responsivo para mobile */}
        <div className="relative w-full mb-12 sm:mb-16">
          <motion.div 
            className="h-56 sm:h-64 md:h-72 lg:h-80 rounded-xl overflow-hidden relative"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Background gradiente em turquesa como na imagem */}
            <div className="w-full h-full bg-[#3DB4C2] relative">
              {/* Container para informações do perfil - reorganizado para mobile */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
                <motion.div 
                  className="flex flex-col items-center gap-4 sm:gap-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  {/* Avatar com animação e sombra */}
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="relative bg-white rounded-full shadow-xl">
                      <Avatar className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32">
                        <AvatarImage 
                          src={avatarPreview || userData.avatarUrl} 
                          alt={userData.nome}
                          className="object-cover" 
                        />
                        <AvatarFallback className="bg-primary text-white text-3xl">
                          {userData.nome?.substring(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>

                      {/* Indicador online com pulsação */}
                      <motion.div 
                        className="absolute bottom-1 right-1"
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
                      >
                        <Badge className="bg-green-500 w-4 h-4 rounded-full p-0 border-2 border-white" />
                      </motion.div>
                      
                      {/* Botão editar avatar */}
                      {editMode && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 z-10"
                        >
                          <label className="bg-white rounded-full p-2 sm:p-2.5 shadow-lg cursor-pointer hover:bg-gray-50 border border-gray-200 transition-colors flex items-center justify-center">
                            <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleAvatarChange}
                            />
                          </label>
                        </motion.div>
                      )}

                      {/* Overlay de hover para indicar que é editável */}
                      {editMode && (
                        <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-xs sm:text-sm font-medium bg-black/40 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                            Alterar foto
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Nome e informações - texto centralizado em mobile */}
                  <div className="text-center px-2">
                    <motion.h1 
                      className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-sm"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      {isTinyScreen ? (
                        <>
                          Anderson Lima de<br/>Araujo Júnio
                        </>
                      ) : (
                        "Anderson Lima de Araujo Júnio"
                      )}
                    </motion.h1>
                    <motion.div 
                      className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-2"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/10">
                        Administrador
                      </Badge>
                      <span className="text-white/80 text-xs sm:text-sm hidden xs:inline">•</span>
                      <span className="text-white/90 text-xs sm:text-sm font-medium">
                        {isTinyScreen ? (
                          <div className="mt-1">admin@ibmecjrsolucoes.com</div>
                        ) : (
                          "admin@ibmecjrsolucoes.com"
                        )}
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Cards de estatísticas responsivos */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.03 }}
            className="card-hover-effect"
          >
            <Card className="border border-gray-200">
              <CardContent className="flex flex-col items-center justify-center p-2.5 sm:p-3 lg:p-3.5">
                <motion.div 
                  className="flex items-center justify-center mb-1"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    color: ["#3B82F6", "#60A5FA", "#3B82F6"] 
                  }}
                  transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                >
                  <Bell className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                </motion.div>
                <h3 className="text-xs text-gray-500 font-medium text-center">Notificações</h3>
                <p className="text-base sm:text-lg lg:text-xl font-bold">0</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.03 }}
            className="card-hover-effect"
          >
            <Card className="border border-gray-200">
              <CardContent className="flex flex-col items-center justify-center p-2.5 sm:p-3 lg:p-3.5">
                <motion.div 
                  className="flex items-center justify-center mb-1"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    color: ["#F59E0B", "#FBBF24", "#F59E0B"] 
                  }}
                  transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                >
                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500" />
                </motion.div>
                <h3 className="text-xs text-gray-500 font-medium text-center">Advertências</h3>
                <p className="text-base sm:text-lg lg:text-xl font-bold">0</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.03 }}
            className="card-hover-effect"
          >
            <Card className="border border-gray-200">
              <CardContent className="flex flex-col items-center justify-center p-2.5 sm:p-3 lg:p-3.5">
                <motion.div 
                  className="flex items-center justify-center mb-1"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    color: ["#6366F1", "#818CF8", "#6366F1"] 
                  }}
                  transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                >
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-500" />
                </motion.div>
                <h3 className="text-xs text-gray-500 font-medium text-center">Tempo</h3>
                <p className="text-base sm:text-lg lg:text-xl font-bold">3 dias</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.03 }}
            className="card-hover-effect"
          >
            <Card className="border border-gray-200">
              <CardContent className="flex flex-col items-center justify-center p-2.5 sm:p-3 lg:p-3.5">
                <motion.div 
                  className="flex items-center justify-center mb-1"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    color: ["#10B981", "#34D399", "#10B981"] 
                  }}
                  transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                >
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                </motion.div>
                <h3 className="text-xs text-gray-500 font-medium text-center">Status</h3>
                <motion.div
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                >
                  <Badge className="mt-0.5 bg-green-500 hover:bg-green-600 text-white text-xs px-1.5 py-0.5">Ativo</Badge>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabs responsivas */}
        <div>
          <Tabs defaultValue="perfil" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b mb-4 sm:mb-6 overflow-x-auto scrollbar-hide">
              <TabsList className="bg-transparent h-10 sm:h-12 w-full justify-start">
                <TabsTrigger 
                  value="perfil" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none flex-1 sm:flex-none"
                >
                  <UserIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Perfil</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="profissional" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none flex-1 sm:flex-none"
                >
                  <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Profissional</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="seguranca" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none flex-1 sm:flex-none"
                >
                  <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Segurança</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <Form {...form}>
              {/* Removido o elemento form aninhado que causava o problema */}
              {/* Tab: Perfil */}
              <TabsContent value="perfil" className="space-y-4 sm:space-y-6 animate-in fade-in-50">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">Informações Pessoais</h2>
                  
                  {/* Botão de edição com animação para transição suave */}
                  <AnimatePresence mode="wait" initial={false}>
                    {editMode ? (
                      <motion.div
                        key="save-button"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-1.5 sm:gap-2"
                      >
                        <Button
                          type="button" 
                          variant="outline" 
                          size={isMobile ? "sm" : "default"}
                          onClick={() => {
                            setEditMode(false);
                            form.reset();
                            if (avatarPreview) {
                              URL.revokeObjectURL(avatarPreview);
                              setAvatarPreview(null);
                              setAvatarFile(null);
                            }
                          }}
                          disabled={isSubmitting}
                          className="gap-1 sm:gap-2"
                        >
                          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span className="text-xs sm:text-sm">Cancelar</span>
                        </Button>
                        <Button
                          type="button" // Alterado de submit para button
                          size={isMobile ? "sm" : "default"}
                          disabled={isSubmitting}
                          className="gap-1 sm:gap-2 bg-primary hover:bg-primary/90"
                          onClick={form.handleSubmit(onSubmit)} // Adicionado handler de submit
                        >
                          {isSubmitting ? (
                            <>
                              <RefreshCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                              <span className="text-xs sm:text-sm">Salvando...</span>
                            </>
                          ) : (
                            <>
                              <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              <span className="text-xs sm:text-sm">Salvar</span>
                            </>
                          )}
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="edit-button"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Button
                          type="button"
                          onClick={() => setEditMode(true)}
                          variant="outline"
                          size={isMobile ? "sm" : "default"}
                          className="gap-1.5 sm:gap-2"
                        >
                          <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span className="text-xs sm:text-sm">Editar Perfil</span>
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  {/* Coluna: Informações pessoais */}
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2 sm:pb-4">
                      <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg">
                        <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        Dados Pessoais
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 pt-2">
                      {editMode ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <FormField
                            control={form.control}
                            name="nome"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs sm:text-sm">Nome Completo</FormLabel>
                                <FormControl>
                                  <Input placeholder="Seu nome" {...field} className="text-sm h-9" />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs sm:text-sm">Email</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Seu email" 
                                    {...field}
                                    disabled
                                    className="bg-gray-100 cursor-not-allowed text-sm h-9"
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="telefone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs sm:text-sm">Telefone</FormLabel>
                                <FormControl>
                                  <Input placeholder="(00) 00000-0000" {...field} className="text-sm h-9" />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="matricula"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs sm:text-sm">Matrícula</FormLabel>
                                <FormControl>
                                  <Input placeholder="Sua matrícula" {...field} className="text-sm h-9" />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="curso"
                            render={({ field }) => (
                              <FormItem className="sm:col-span-2">
                                <FormLabel className="text-xs sm:text-sm">Curso</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Seu curso ou formação" 
                                    {...field} 
                                    className="text-sm h-9" 
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      ) : (
                        <div className="divide-y">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 sm:py-3">
                            <div>
                              <p className="text-xs sm:text-sm text-gray-500 font-medium">Nome Completo</p>
                              <p className="font-medium text-sm sm:text-base">{userData.nome}</p>
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm text-gray-500 font-medium">Email</p>
                              <p className="font-medium text-sm sm:text-base break-all">{userData.email}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 sm:py-3">
                            <div>
                              <p className="text-xs sm:text-sm text-gray-500 font-medium">Telefone</p>
                              <p className="font-medium text-sm sm:text-base">{userData.telefone || "Não informado"}</p>
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm text-gray-500 font-medium">Matrícula</p>
                              <p className="font-medium text-sm sm:text-base">{userData.matricula || "Não informada"}</p>
                            </div>
                          </div>
                          <div className="py-2 sm:py-3">
                            <p className="text-xs sm:text-sm text-gray-500 font-medium">Curso</p>
                            <p className="font-medium text-sm sm:text-base">{userData.curso || "Não informado"}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Tab: Profissional */}
              <TabsContent value="profissional" className="space-y-4 sm:space-y-6 animate-in fade-in-50">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">Informações Profissionais</h2>
                  
                  {/* Botão de edição também na aba profissional */}
                  <AnimatePresence mode="wait" initial={false}>
                    {editMode ? (
                      <motion.div
                        key="save-button-prof"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-1.5 sm:gap-2"
                      >
                        <Button
                          type="button" 
                          variant="outline" 
                          size={isMobile ? "sm" : "default"}
                          onClick={() => {
                            setEditMode(false);
                            form.reset();
                          }}
                          disabled={isSubmitting}
                          className="gap-1 sm:gap-2"
                        >
                          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span className="text-xs sm:text-sm">Cancelar</span>
                        </Button>
                        <Button
                          type="button" // Alterado de submit para button
                          size={isMobile ? "sm" : "default"}
                          disabled={isSubmitting}
                          className="gap-1 sm:gap-2 bg-primary hover:bg-primary/90"
                          onClick={form.handleSubmit(onSubmit)} // Adicionado handler de submit
                        >
                          {isSubmitting ? (
                            <>
                              <RefreshCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                              <span className="text-xs sm:text-sm">Salvando...</span>
                            </>
                          ) : (
                            <>
                              <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              <span className="text-xs sm:text-sm">Salvar</span>
                            </>
                          )}
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="edit-button-prof"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Button
                          type="button"
                          onClick={() => setEditMode(true)}
                          variant="outline"
                          size={isMobile ? "sm" : "default"}
                          className="gap-1.5 sm:gap-2"
                        >
                          <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span className="text-xs sm:text-sm">Editar</span>
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  {/* Dados Profissionais */}
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2 sm:pb-4">
                      <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg">
                        <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        Dados Profissionais
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 sm:space-y-3 pt-2">
                      {editMode ? (
                        <div className="grid grid-cols-1 gap-3 sm:gap-4">
                          <FormField
                            control={form.control}
                            name="dataEntradaEmpresa"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs sm:text-sm">Data de Entrada</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="date" 
                                    {...field} 
                                    className="text-sm h-9" 
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      ) : (
                        <>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500 font-medium">Cargo</p>
                            <p className="font-medium text-sm sm:text-base">{userData.role || userData.role || "Não informado"}</p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500 font-medium">Setor</p>
                            <p className="font-medium text-sm sm:text-base">{userData.setor || "Não informado"}</p>
                          </div>
                          
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500 font-medium">Data de Entrada</p>
                            <p className="font-medium text-sm sm:text-base">{formattedEntryDate}</p>
                          </div>
                          
                          <div className="mt-1 sm:mt-2">
                            <p className="text-xs sm:text-sm text-gray-500 font-medium">Tempo na Empresa</p>
                            <Badge variant="outline" className="mt-1 text-xs sm:text-sm">
                              {calculateTimeInCompany()}
                            </Badge>
                          </div>
                        </>
                      )}
                    </CardContent>
                    <CardFooter className="text-xs sm:text-sm text-gray-500 italic pt-1 pb-3">
                      {editMode ? 
                        "Você pode atualizar sua data de entrada." : 
                        "Para alterar informações de cargo e setor, contate um administrador."}
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Tab: Segurança e Acesso */}
              <TabsContent value="seguranca" className="space-y-4 sm:space-y-6 animate-in fade-in-50">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">Segurança e Privacidade</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Coluna 1: Segurança da senha */}
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2 sm:pb-4">
                      <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg">
                        <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        Segurança da Senha
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 pt-2">
                      <div className="pb-3 sm:pb-4 border-b">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-sm sm:text-base">Notificações no aplicativo</h3>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                              Receba atualizações e alertas diretamente no sistema
                            </p>
                          </div>
                          <Switch 
                            checked={notificationsEnabled} 
                            onCheckedChange={setNotificationsEnabled} 
                          />
                        </div>
                      </div>
                      
                      <div className="pb-3 sm:pb-4 border-b">
                        <div className="flex justify-between items-center mb-2 sm:mb-3">
                          <div>
                            <h3 className="font-medium text-sm sm:text-base">Alertas por email</h3>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                              Receba notificações importantes por email
                            </p>
                          </div>
                          <Switch 
                            checked={emailAlertsEnabled} 
                            onCheckedChange={setEmailAlertsEnabled} 
                          />
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
                        onClick={() => setPasswordDialogOpen(true)}
                      >
                        <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Alterar Senha
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {/* Coluna 2: Sessão atual */}
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2 sm:pb-4">
                      <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg">
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        Sessão Atual
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 pt-2">
                      <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-50 rounded-lg">
                        <div className="bg-blue-500/80 p-1.5 sm:p-2 rounded-full">
                          <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 bg-white rounded-full" />
                        </div>
                        <div>
                          <p className="font-medium text-sm sm:text-base">Dispositivo atual</p>
                          <p className="text-xs text-gray-600">Sessão iniciada há {Math.floor(Math.random() * 10) + 1} horas</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full text-gray-700 text-xs sm:text-sm h-8 sm:h-9"
                      >
                        <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" /> Sair
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Form>
          </Tabs>
        </div>
        
        {/* Dialog para alteração de senha */}
        <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
          <DialogContent className="sm:max-w-md max-w-[calc(100%-2rem)] p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">Alterar senha</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                {passwordResetSent 
                  ? "Email de redefinição enviado com sucesso!"
                  : "Enviaremos um link para redefinição da sua senha."
                }
              </DialogDescription>
            </DialogHeader>
            {!passwordResetSent ? (
              <div className="space-y-3 sm:space-y-4 py-1 sm:py-2">
                <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-50 rounded-md border border-blue-100">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-blue-700">
                    Por razões de segurança, enviaremos um email com instruções para redefinir sua senha.
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button 
                    onClick={handlePasswordChange}
                    disabled={isLoading}
                    className="w-full text-xs sm:text-sm h-8 sm:h-10"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin mr-1.5 sm:mr-2" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar email de redefinição"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-3 sm:py-4 flex justify-center">
                <div className="bg-green-50 text-green-700 p-3 sm:p-4 rounded-md border border-green-100 flex items-center gap-2 sm:gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs sm:text-sm">Email enviado com sucesso!</p>
                </div>
              </div>
            )}
            <DialogFooter className="sm:justify-start">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setPasswordDialogOpen(false)}
                disabled={isLoading}
                className="text-xs sm:text-sm h-8 sm:h-9"
              >
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Botão de voltar ao topo */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.div
              className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.3, type: "spring" }}
            >
              <Button 
                variant="secondary" 
                size="icon" 
                className="rounded-full shadow-lg bg-white text-primary border border-gray-200 hover:bg-white hover:text-primary/80 hover:shadow-md transition-all h-9 w-9 sm:h-10 sm:w-10"
                onClick={scrollToTop}
              >
                <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

export default Profile;