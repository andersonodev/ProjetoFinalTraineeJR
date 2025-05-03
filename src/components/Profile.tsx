import { useState, useEffect } from "react";
import { toast } from "sonner";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import db from "../lib/firebase";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { AvatarUpload } from "@/components/AvatarUpload";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  User, 
  Mail, 
  Briefcase, 
  Building, 
  Phone, 
  GraduationCap, 
  Calendar, 
  MapPin,
  ShieldAlert,
  Bell,
  Clock,
  Medal,
  Settings,
  Save,
  Info,
  Key,
  Lock,
  FileText
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Validação com Zod
const profileSchema = z.object({
  nome: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  telefone: z.string().optional(),
  bio: z.string().max(200, { message: "Biografia deve ter no máximo 200 caracteres" }).optional(),
  cidade: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
  const { userData, currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(userData?.avatarUrl || "");
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil");
  const isMobile = useIsMobile();
  
  // Form setup with React Hook Form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nome: userData?.nome || "",
      email: userData?.email || "",
      telefone: userData?.telefone || "",
      bio: userData?.bio || "",
      cidade: userData?.cidade || "",
    },
  });
  
  // Sync form with userData when it changes
  useEffect(() => {
    if (userData) {
      form.reset({
        nome: userData.nome || "",
        email: userData.email || "",
        telefone: userData?.telefone || "",
        bio: userData?.bio || "",
        cidade: userData?.cidade || "",
      });
      setAvatarUrl(userData.avatarUrl || "");
    }
  }, [userData, form]);
  
  // Real-time listener for user data changes
  useEffect(() => {
    if (!currentUser?.uid) return;
    
    const userRef = doc(db, "users", currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists() && !isSubmitting) {
        const updatedUserData = { id: doc.id, ...doc.data() } as any; // Renamed to avoid conflict
        // We don't update the form here to prevent conflicts during editing
        console.log("Received updated user data:", updatedUserData);
      }
    });
    
    return () => unsubscribe();
  }, [currentUser?.uid, isSubmitting]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!userData) return;
    
    setIsSubmitting(true);
    try {
      const userRef = doc(db, "users", userData.id);
      
      // Atualiza o usuário com a nova URL (que já está no campo avatarUrl)
      await updateDoc(userRef, {
        ...values,
        avatarUrl: avatarUrl, // Ensure avatarUrl is explicitly included if changed
        updatedAt: new Date(),
      });
      
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 2000);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Erro ao atualizar perfil");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarChange = (url: string) => {
    setAvatarUrl(url);
    // Mark form as dirty when avatar changes
    form.setValue('nome', form.getValues('nome'), { shouldDirty: true }); 
  };
  
  // Generate timestamp since registration
  const getMembershipTime = () => {
    if (!userData?.createdAt) return "N/A";
    
    // Ensure createdAt is a Date object
    const createdDate = userData.createdAt instanceof Date 
      ? userData.createdAt 
      : (userData.createdAt as any)?.toDate 
        ? (userData.createdAt as any).toDate() 
        : new Date(userData.createdAt);

    if (isNaN(createdDate.getTime())) return "Data inválida"; // Check if date is valid

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} dias`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} meses`;
    const diffYears = Math.floor(diffMonths / 12);
    const remainingMonths = diffMonths % 12;
    return `${diffYears} ano${diffYears > 1 ? 's' : ''}${remainingMonths > 0 ? ` e ${remainingMonths} mes${remainingMonths > 1 ? 'es' : ''}` : ''}`;
  };

  if (!userData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando perfil...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full max-w-5xl mx-auto pb-6 px-4 sm:px-6">
        {/* Layout Responsivo - Mobile First */}
        <div className="space-y-6">
          {/* Perfil e Stats Card - Mais adaptado para mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden"
          >
            <Card className="border-0 shadow-lg overflow-hidden">
              {/* Header Card com gradiente - Ajustado para nova cor */}
              <div className="bg-gradient-to-r from-primary to-cyan-600 p-4 sm:p-6 md:p-8 flex flex-col items-center relative overflow-hidden">
                {/* Elementos decorativos animados */}
                <motion.div 
                  className="absolute -top-12 -left-12 w-24 h-24 rounded-full bg-white/10"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
                />
                <motion.div 
                  className="absolute -bottom-16 -right-16 w-32 h-32 rounded-full bg-white/10"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
                />
                
                {/* Efeito de brilho sutil */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 3.5, repeat: Infinity, repeatType: "loop", ease: "linear" }}
                />
                
                <div className="relative mb-2 z-10">
                  <div className="w-24 h-24 sm:w-[120px] sm:h-[120px] md:w-[140px] md:h-[140px]">
                    <AvatarUpload
                      currentAvatar={avatarUrl}
                      onAvatarChange={handleAvatarChange}
                      name={form.watch("nome") || userData.nome}
                      userId={userData.id}
                    />
                  </div>
                  
                  <AnimatePresence>
                    {showSuccessAnimation && (
                      <motion.div 
                        className="absolute inset-0 bg-green-500/80 rounded-full flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <Save className="text-white h-8 w-8 sm:h-12 sm:w-12" />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <h2 className="text-lg sm:text-xl font-bold mt-2 text-white">{userData.nome}</h2>
                <p className="text-xs sm:text-sm md:text-base text-blue-100 mb-2">{userData.email}</p>
                
                <div className="mt-1 bg-white/20 px-3 sm:px-4 py-0.5 sm:py-1 rounded-full text-white text-xs sm:text-sm">
                  {userData.cargo || userData.role || "Membro"} {/* Display cargo first */}
                </div>
              </div>
              
              {/* Stats Cards - Layout melhorado para mobile */}
              <CardContent className="p-3 sm:p-4 pt-4 sm:pt-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  <StatItem 
                    icon={<Bell className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />}
                    label="Notificações"
                    value={userData.notificacoes || 0}
                    isMobile={isMobile}
                  />
                  
                  <StatItem 
                    icon={<ShieldAlert className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500" />}
                    label="Advertências"
                    value={userData.advertencias || 0}
                    isMobile={isMobile}
                  />
                  
                  <StatItem 
                    icon={<Clock className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-500" />}
                    label="Tempo"
                    value={getMembershipTime()}
                    valueClass="text-xs"
                    isMobile={isMobile}
                  />
                  
                  <StatItem 
                    icon={<Medal className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />}
                    label="Status"
                    value={
                      <Badge className={`
                        text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 sm:py-0.5 font-normal
                        ${userData.status === "Ativo" ? "bg-green-500" : 
                          userData.status === "Inativo" ? "bg-gray-400" : 
                          "bg-red-500"} text-white`}
                      >
                        {userData.status}
                      </Badge>
                    }
                    isMobile={isMobile}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Informações e Formulário - Card mais amplo em mobile */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-xl font-bold flex items-center gap-1.5 sm:gap-2">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Seu Perfil
                  </CardTitle>
                  <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 text-[10px] sm:text-xs">
                    ID: {userData.id.substring(0, 6)}...
                  </Badge>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Atualize seus dados pessoais
                </CardDescription>
              </CardHeader>
              
              {/* Sistema de abas redesenhado para garantir compatibilidade móvel */}
              <div className="w-full">
                {/* Cabeçalho das abas */}
                <div className="px-2 sm:px-4">
                  <div className="relative grid w-full grid-cols-3 h-12 sm:h-14 mt-2 p-1 sm:p-1.5 gap-x-1 sm:gap-x-1.5 bg-slate-100/80 rounded-lg sm:rounded-xl overflow-hidden">
                    {/* Indicador visual da aba ativa */}
                    <motion.div 
                      className="absolute h-[calc(100%-8px)] sm:h-[calc(100%-12px)] bg-white rounded-md sm:rounded-lg shadow-sm z-0 top-[4px] sm:top-[6px]"
                      layoutId="activeTabIndicator"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      style={{ 
                        width: `calc(33.333% - ${isMobile ? 4 : 8}px)`,
                        left: `calc(${activeTab === "perfil" ? 0 : activeTab === "profissional" ? 33.333 : 66.666}% + ${activeTab === "perfil" ? (isMobile ? 2 : 6) : activeTab === "profissional" ? (isMobile ? 4 : 8) : (isMobile ? 6 : 10)}px)` 
                      }}
                    />
                    
                    {/* Botões de navegação das abas */}
                    <button 
                      onClick={() => setActiveTab("perfil")}
                      className={`relative z-10 px-0 sm:px-1 py-1 sm:py-1.5 text-[10px] sm:text-xs md:text-sm rounded-md transition-all hover:bg-white/50 focus:outline-none ${activeTab === "perfil" ? "text-blue-600 font-medium" : "text-gray-600"}`}
                    >
                      <motion.div
                        whileTap={{ scale: 0.97 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5"
                      >
                        <User className="h-3 w-3 min-w-3 sm:h-4 sm:w-4 sm:min-w-4" /> 
                        <span className="text-[9px] sm:text-xs">Pessoal</span>
                      </motion.div>
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab("profissional")}
                      className={`relative z-10 px-0 sm:px-1 py-1 sm:py-1.5 text-[10px] sm:text-xs md:text-sm rounded-md transition-all hover:bg-white/50 focus:outline-none ${activeTab === "profissional" ? "text-blue-600 font-medium" : "text-gray-600"}`}
                    >
                      <motion.div
                        whileTap={{ scale: 0.97 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5"
                      >
                        <Briefcase className="h-3 w-3 min-w-3 sm:h-4 sm:w-4 sm:min-w-4" /> 
                        <span className="text-[9px] sm:text-xs">Profissional</span>
                      </motion.div>
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab("configuracoes")}
                      className={`relative z-10 px-0 sm:px-1 py-1 sm:py-1.5 text-[10px] sm:text-xs md:text-sm rounded-md transition-all hover:bg-white/50 focus:outline-none ${activeTab === "configuracoes" ? "text-blue-600 font-medium" : "text-gray-600"}`}
                    >
                      <motion.div
                        whileTap={{ scale: 0.97 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5"
                      >
                        <Settings className="h-3 w-3 min-w-3 sm:h-4 sm:w-4 sm:min-w-4" /> 
                        <span className="text-[9px] sm:text-xs">Config</span>
                      </motion.div>
                    </button>
                  </div>
                </div>
                
                {/* Conteúdo das abas - usando renderização condicional explícita */}
                <div className="p-4 sm:p-6 pt-5">
                  <AnimatePresence mode="wait">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)}>
                        {/* Conteúdo da aba Perfil */}
                        {activeTab === "perfil" && (
                          <motion.div 
                            key="perfil"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.25 }}
                            className="space-y-5"
                          >
                            {/* Input de nome com visual melhorado */}
                            <FormField
                              control={form.control}
                              name="nome"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-1.5 text-sm">
                                    <div className="p-1.5 bg-blue-50 rounded-full">
                                      <User className="h-3 w-3 text-blue-600" />
                                    </div>
                                    <span>Nome</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      className="h-10 transition-all duration-200 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-md shadow-sm" 
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                            
                            {/* Input de email */}
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-1.5 text-sm">
                                    <div className="p-1.5 bg-blue-50 rounded-full">
                                      <Mail className="h-3 w-3 text-blue-600" />
                                    </div>
                                    <span>Email</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      className="h-10 transition-all duration-200 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-md shadow-sm"  
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                            
                            {/* Grid de 2 colunas em telas maiores, 1 coluna em mobile */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                              <FormField
                                control={form.control}
                                name="telefone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="flex items-center gap-1.5 text-sm">
                                      <div className="p-1.5 bg-blue-50 rounded-full">
                                        <Phone className="h-3 w-3 text-blue-600" />
                                      </div>
                                      <span>Telefone</span>
                                    </FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        className="h-10 transition-all duration-200 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-md shadow-sm"
                                      />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="cidade"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="flex items-center gap-1.5 text-sm">
                                      <div className="p-1.5 bg-blue-50 rounded-full">
                                        <MapPin className="h-3 w-3 text-blue-600" />
                                      </div>
                                      <span>Cidade</span>
                                    </FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        className="h-10 transition-all duration-200 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-md shadow-sm"
                                      />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            {/* Campo de biografia */}
                            <FormField
                              control={form.control}
                              name="bio"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm flex items-center gap-1.5">
                                    <div className="p-1.5 bg-blue-50 rounded-full">
                                      <FileText className="h-3 w-3 text-blue-600" />
                                    </div>
                                    <span>Biografia</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Conte um pouco sobre você..." 
                                      className="resize-none min-h-[100px] transition-all duration-200 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-md shadow-sm" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                          </motion.div>
                        )}

                        {/* Conteúdo da aba Profissional */}
                        {activeTab === "profissional" && (
                          <motion.div 
                            key="profissional"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {/* Layout em grid para informações profissionais */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                              <div className="space-y-2">
                                <Label className="flex items-center gap-1.5 text-sm text-gray-500">
                                  <Briefcase className="h-3.5 w-3.5" /> Cargo
                                </Label>
                                <div className="p-2 bg-gray-50 border rounded-md text-sm">
                                  {userData.cargo || userData.role || "Não informado"} {/* Display cargo first */}
                                </div>
                                <p className="text-[10px] sm:text-xs text-gray-500">
                                  Definido pelo administrador
                                </p>
                              </div>
                              
                              <div className="space-y-2">
                                <Label className="flex items-center gap-1.5 text-sm text-gray-500">
                                  <Building className="h-3.5 w-3.5" /> Setor
                                </Label>
                                <div className="p-2 bg-gray-50 border rounded-md text-sm">
                                  {userData.setor || "Não informado"}
                                </div>
                                <p className="text-[10px] sm:text-xs text-gray-500">
                                  Definido pelo administrador
                                </p>
                              </div>
                              
                              <div className="space-y-2">
                                <Label className="flex items-center gap-1.5 text-sm text-gray-500">
                                  <Calendar className="h-3.5 w-3.5" /> Data de Entrada
                                </Label>
                                <div className="p-2 bg-gray-50 border rounded-md text-sm">
                                  {userData.dataEntradaEmpresa || "Não informada"}
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label className="flex items-center gap-1.5 text-sm text-gray-500">
                                  <GraduationCap className="h-3.5 w-3.5" /> Curso
                                </Label>
                                <div className="p-2 bg-gray-50 border rounded-md text-sm">
                                  {userData.curso || "Não informado"}
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-5 p-3 sm:p-4 bg-amber-50 border border-amber-100 rounded-md">
                              <p className="text-xs sm:text-sm text-amber-800 flex items-start gap-2">
                                <Info className="h-3.5 w-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                                <span>As informações profissionais só podem ser alteradas por um administrador.
                                Entre em contato caso precise atualizar algum destes dados.</span>
                              </p>
                            </div>
                          </motion.div>
                        )}
                        
                        {/* Conteúdo da aba Configurações */}
                        {activeTab === "configuracoes" && (
                          <motion.div 
                            key="configuracoes"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="space-y-5">
                              <div className="space-y-3">
                                <h3 className="font-medium text-sm sm:text-base flex items-center gap-1.5">
                                  <Lock className="h-4 w-4 text-gray-600" /> Segurança
                                </h3>
                                <div className="space-y-2">
                                  <Button variant="outline" size={isMobile ? "sm" : "default"} className="gap-1.5 w-full sm:w-auto">
                                    <Key className="h-3.5 w-3.5" /> Alterar senha
                                  </Button>
                                </div>
                                <div className="border-t pt-3 mt-3">
                                  <h4 className="font-medium mb-2 text-sm text-gray-700">Sessões ativas</h4>
                                  <div className="p-3 bg-gray-50 border rounded-md">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <p className="font-medium text-sm">Dispositivo atual</p>
                                        <p className="text-xs text-gray-500">Última atividade: agora</p>
                                      </div>
                                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                        Ativo
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <h3 className="font-medium text-sm sm:text-base flex items-center gap-1.5">
                                  <Settings className="h-4 w-4 text-gray-600" /> Preferências
                                </h3>
                                <div className="p-3 sm:p-4 bg-blue-50 border border-blue-100 rounded-md">
                                  <p className="text-xs sm:text-sm text-blue-800 flex items-start gap-2">
                                    <Info className="h-3.5 w-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <span>Mais opções de configuração estarão disponíveis em breve.</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                        
                        {/* Botão de salvar alterações - aparece apenas quando há mudanças */}
                        {activeTab !== "configuracoes" && (
                          <motion.div 
                            className="flex justify-end mt-6"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.2 }}
                          >
                            <Button 
                              type="submit" 
                              className="gap-2 w-full sm:w-auto relative group overflow-hidden bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600" 
                              disabled={isSubmitting || !form.formState.isDirty}
                              size={isMobile ? "sm" : "default"}
                            >
                              {isSubmitting ? (
                                <>
                                  <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    className="h-3.5 w-3.5 border-2 border-t-transparent border-white rounded-full"
                                  />
                                  <span>Salvando...</span>
                                </>
                              ) : (
                                <>
                                  <Save className="h-3.5 w-3.5" /> 
                                  <span>Salvar Alterações</span>
                                  <span className="absolute inset-0 w-0 bg-white/20 transition-all duration-300 group-hover:w-full"></span>
                                </>
                              )}
                            </Button>
                          </motion.div>
                        )}
                      </form>
                    </Form>
                  </AnimatePresence>
                </div>
              </div>
            </Card>
            
            {/* Seção de atividades - simplificada e compacta para mobile */}
            <Card className="shadow-md">
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="text-sm sm:text-base flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" /> 
                  Atividades Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 sm:p-6 text-center text-gray-500 text-sm">
                  <p>Nenhuma atividade recente para exibir</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Componente de item estatístico para melhor reuso e consistência visual
const StatItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  value: React.ReactNode; 
  valueClass?: string; 
  isMobile?: boolean; 
}> = ({ icon, label, value, valueClass = "", isMobile = false }) => (
  <motion.div 
    whileHover={{ y: -2 }}
    transition={{ type: "spring", stiffness: 400 }}
    className="flex flex-col items-center justify-center p-1.5 sm:p-2 md:p-3 bg-gradient-to-b from-white to-gray-50/80 rounded-lg border border-gray-100 shadow-sm hover:shadow-md"
  >
    <div className="flex items-center gap-0.5 sm:gap-1.5 text-[8px] sm:text-xs text-gray-600 mb-0.5 sm:mb-1.5">
      <div className="p-0.5 sm:p-1 bg-gray-100 rounded-full">
        {icon}
      </div>
      <span>{label}</span>
    </div>
    <motion.div 
      className={`font-medium ${valueClass || (isMobile ? "text-[10px]" : "text-sm")} text-center`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
    >
      {value}
    </motion.div>
  </motion.div>
);

export default Profile;