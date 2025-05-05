import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { User, UserStatus } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge"; 
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  BadgeCheck, 
  BookUser, 
  Building, 
  Calendar, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight,
  FileText, 
  GraduationCap, 
  IdCard, 
  Info, 
  Mail, 
  Phone, 
  Save, 
  Shield, 
  User as UserIcon, 
  UserPlus,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// Corrigir a importação do DashboardLayout - importar diretamente
import DashboardLayout from "@/components/DashboardLayout";
import { AvatarUpload } from "@/components/AvatarUpload";
import { Progress } from "@/components/ui/progress";

// Firebase imports - corrigidos e consolidados
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail 
} from "firebase/auth";
import { getApp, initializeApp, deleteApp  } from "firebase/app";
import { setDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { saveProfileImageAsBase64 } from "@/lib/imageUtils";



// Validation schema
const formSchema = z.object({
  nome: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }),
  senha: z.string().min(6, {
    message: "Senha deve ter pelo menos 6 caracteres.",
  }),
  confirmarSenha: z.string(),
  cargo: z.string().min(2, {
    message: "Cargo deve ter pelo menos 2 caracteres.",
  }),
  setor: z.string().min(2, {
    message: "Setor deve ter pelo menos 2 caracteres.",
  }),
  dataEntradaEmpresa: z.string(),
  curso: z.string().optional(),
  idade: z.string().refine((value) => {
    const num = parseInt(value, 10);
    return !isNaN(num) && num > 0;
  }, {
    message: "Idade deve ser um número válido.",
  }),
  telefone: z.string().optional(),
  matricula: z.string().min(3, {
    message: "Matrícula deve ter pelo menos 3 caracteres.",
  }),
  status: z.enum(["Ativo", "Inativo", "Banido"]),
  isPowerUser: z.boolean(),
  isAdmin: z.boolean(),
  observacoes: z.string().optional(),
  avatarUrl: z.string().optional()
}).refine(data => data.senha === data.confirmarSenha, {
  message: "As senhas não correspondem",
  path: ["confirmarSenha"],
});

type FormData = z.infer<typeof formSchema>;

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

const cursosDisponiveis = [
  "Administração",
  "Ciência de Dados e Inteligência Artificial",
  "Ciências Contábeis",
  "Ciências Econômicas",
  "Direito",
  "Engenharia Civil",
  "Engenharia de Computação",
  "Engenharia de Produção",
  "Engenharia Mecânica",
  "Engenharia de Software",
  "Relações Internacionais"
];

// Define os passos do formulário com descrições mais detalhadas
const steps = [
  {
    id: 'informacoes-pessoais',
    name: 'Informações Pessoais',
    description: 'Dados básicos do membro',
    icon: UserIcon,
  },
  {
    id: 'informacoes-profissionais',
    name: 'Informações Profissionais',
    description: 'Dados sobre cargo e setor',
    icon: Building,
  },
  {
    id: 'conta-acesso',
    name: 'Conta e Acesso',
    description: 'Credenciais e permissões',
    icon: Shield,
  },
  {
    id: 'revisao',
    name: 'Revisão',
    description: 'Confirmar todos os dados',
    icon: CheckCircle,
  },
];

const CreateUser = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  
  // Obter informações do usuário atual (administrador)
  const { currentUser, userData } = useAuth();
  
  // Inicializa o formulário com React Hook Form
  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
      confirmarSenha: "",
      cargo: "",
      setor: "",
      dataEntradaEmpresa: new Date().toISOString().split('T')[0],
      curso: "",
      idade: "",
      telefone: "",
      matricula: "",
      status: "Ativo",
      isPowerUser: false,
      isAdmin: false,
      observacoes: ""
    },
    mode: "onChange"
  });

  const { trigger, getValues, watch } = methods;

  // Calcular o progresso com base no passo atual
  const progressValue = ((currentStep + 1) / steps.length) * 100;
  
  // Observar campos importantes para previews
  const watchedNome = watch("nome");
  const watchedEmail = watch("email");
  const watchedCargo = watch("cargo");
  const watchedStatus = watch("status");
  const watchedMatricula = watch("matricula");
  const watchedIsPowerUser = watch("isPowerUser");
  const watchedIsAdmin = watch("isAdmin");

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const idadeNum = parseInt(data.idade, 10);
      
      // Criar o objeto base do usuário
      const userData: Partial<User> = {
        ...data,
        idade: idadeNum,
        advertencias: 0,
        notificacoes: 0,
        // Incluir avatarUrl diretamente se estiver disponível
        ...(avatarUrl ? { avatarUrl } : {})
      };
      
      // Remover o campo confirmarSenha antes de salvar
      delete (userData as any).confirmarSenha;
      
      try {
        const secondaryApp = initializeApp(getApp().options, 'SecondaryApp');
        const secondaryAuth = getAuth(secondaryApp);
      
        const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4) + "!1";
      
        const userCredential = await createUserWithEmailAndPassword(
          secondaryAuth, 
          data.email, 
          tempPassword
        );
        
        const user = userCredential.user;
        
        // Salvar os dados do usuário no Firestore diretamente com a imagem base64
        await setDoc(doc(db, "users", user.uid), {
          ...userData,
          id: user.uid,
          createdAt: serverTimestamp()
        });
        
        // Enviar email de redefinição de senha para o novo usuário
        await sendPasswordResetEmail(secondaryAuth, data.email);
        
        // Deslogar da instância secundária e limpá-la para evitar interferências
        await signOut(secondaryAuth);
        await deleteApp(secondaryApp).catch(console.error);
        
        toast.success("Usuário criado com sucesso e email de definição de senha enviado!");
        navigate("/dashboard"); // Redireciona para o Dashboard
        
      } catch (error: any) {
        console.error("Erro ao criar usuário:", error);
        if (error.code === "auth/email-already-in-use") {
          toast.error("Este email já está em uso. Tente outro.");
        } else {
          toast.error(`Erro ao criar usuário: ${error.message || "Erro desconhecido"}`);
        }
      }
    } catch (error: any) {
      console.error("Erro ao processar formulário:", error);
      toast.error("Erro ao processar dados do formulário.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (url: string) => {
    setAvatarUrl(url);
  };

  // Função para avançar para o próximo passo com validação
  const nextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    
    // Define quais campos validar em cada passo
    switch (currentStep) {
      case 0: // Informações pessoais
        fieldsToValidate = ["nome", "email", "matricula", "idade", "telefone"];
        break;
      case 1: // Informações profissionais
        fieldsToValidate = ["cargo", "setor", "dataEntradaEmpresa"];
        break;
      case 2: // Conta e acesso
        fieldsToValidate = ["senha", "confirmarSenha", "status"];
        break;
      default:
        break;
    }
    
    // Valida os campos do passo atual
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  // Função para voltar ao passo anterior
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  // Renderiza o conteúdo com base no passo atual
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
              <UserIcon className="h-5 w-5" />
              <h2>Informações Pessoais</h2>
            </div>
            <div className="flex flex-col items-center mb-6">
              {/* Ensure watchedNome is defined using watch from react-hook-form */}
              <AvatarUpload 
                currentAvatar={avatarUrl} 
                onAvatarChange={handleAvatarChange} 
                name={watchedNome || "Novo Usuário"}
                userId={`temp_${Date.now()}`} // ID temporário para novos usuários
              />
              <p className="text-sm text-muted-foreground mt-2">
                Adicione uma foto de perfil (opcional)
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={methods.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do usuário" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="exemplo@ibmecjr.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="idade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idade <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Idade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="matricula"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matrícula <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Matrícula/ID do usuário" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
              <Building className="h-5 w-5" />
              <h2>Informações Profissionais</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={methods.control}
                name="cargo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo <span className="text-blue-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cargo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {cargosDisponiveis.map((cargo) => (
                            <SelectItem key={cargo} value={cargo}>
                              {cargo}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="setor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Setor <span className="text-blue-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o setor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {setoresDisponiveis.map((setor) => (
                            <SelectItem key={setor} value={setor}>
                              {setor}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="curso"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Curso</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o curso" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {cursosDisponiveis.map((curso) => (
                            <SelectItem key={curso} value={curso}>
                              {curso}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="dataEntradaEmpresa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Entrada <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={methods.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Informações adicionais relevantes sobre o usuário" 
                      className="min-h-28" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
              <Shield className="h-5 w-5" />
              <h2>Configurações de Conta</h2>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={methods.control}
                  name="senha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Digite a senha" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={methods.control}
                  name="confirmarSenha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Confirme a senha" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={methods.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status do Usuário <span className="text-blue-500">*</span></FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-3 gap-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Ativo" id="status-ativo" />
                          </FormControl>
                          <FormLabel htmlFor="status-ativo" className="flex items-center gap-1.5 font-normal">
                            <span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>
                            Ativo
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Inativo" id="status-inativo" />
                          </FormControl>
                          <FormLabel htmlFor="status-inativo" className="flex items-center gap-1.5 font-normal">
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                            Inativo
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Banido" id="status-banido" />
                          </FormControl>
                          <FormLabel htmlFor="status-banido" className="flex items-center gap-1.5 font-normal">
                            <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                            Banido
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-4">
                <h3 className="text-base font-medium">Nível de Permissão</h3>
                <FormField
                  control={methods.control}
                  name="isAdmin"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <div className="flex items-center justify-between p-4 bg-white rounded-md border shadow-sm">
                        <div className="flex flex-col gap-0.5">
                          <FormLabel className="font-medium text-base cursor-pointer flex items-center gap-1.5">
                            <Shield className="h-4 w-4 text-red-500" />
                            Administrador
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Acesso total ao sistema, pode gerenciar todos os usuários e funcionalidades
                          </p>
                        </div>
                        <FormControl>
                          <Switch 
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (checked) methods.setValue("isPowerUser", true);
                            }}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={methods.control}
                  name="isPowerUser"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <div className="flex items-center justify-between p-4 bg-white rounded-md border shadow-sm">
                        <div className="flex flex-col gap-0.5">
                          <FormLabel className="font-medium text-base cursor-pointer flex items-center gap-1.5">
                            <BookUser className="h-4 w-4 text-amber-500" />
                            Usuário Avançado
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Pode gerenciar usuários regulares e tem acesso à maioria das funcionalidades
                          </p>
                        </div>
                        <FormControl>
                          <Switch 
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (!checked) methods.setValue("isAdmin", false);
                            }}
                            disabled={watchedIsAdmin}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className={`p-4 bg-white rounded-md border shadow-sm ${!watchedIsPowerUser && !watchedIsAdmin ? "ring-2 ring-primary/20" : ""}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-base flex items-center gap-1.5">
                        <UserIcon className="h-4 w-4 text-blue-500" />
                        Membro Regular
                      </span>
                      <p className="text-xs text-muted-foreground">
                        Acesso básico ao sistema, pode visualizar informações mas não gerencia outros usuários
                      </p>
                    </div>
                    <div className="h-6 w-10 flex items-center justify-center">
                      {!watchedIsPowerUser && !watchedIsAdmin && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-5 w-5 text-amber-600" />
                  <h3 className="font-medium text-amber-800">Informações de Segurança</h3>
                </div>
                <p className="text-sm text-amber-700">
                  Senhas devem ter pelo menos 6 caracteres. Recomendamos usar letras maiúsculas, 
                  minúsculas, números e caracteres especiais para maior segurança.
                </p>
              </div>
            </div>
          </div>
        );
      case 3:
        const values = getValues();
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
              <CheckCircle className="h-5 w-5" />
              <h2>Revisão e Confirmação</h2>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100 shadow-sm">
              <h3 className="font-medium text-lg mb-4 text-blue-800 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" /> Resumo do Cadastro
              </h3>
              <div className="flex flex-col md:flex-row gap-6 mb-6 items-center md:items-start">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="text-xl bg-gradient-to-br from-primary to-primary-foreground text-white">
                      {values.nome ? values.nome.substring(0, 2).toUpperCase() : "NU"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 rounded-full bg-white p-1 shadow-md">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <h4 className="text-xl font-bold text-gray-800">{values.nome}</h4>
                  <p className="text-gray-600 mb-3">{values.email}</p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                    <Badge className={`${values.status === "Ativo" ? "bg-green-500" : values.status === "Inativo" ? "bg-amber-500" : "bg-red-500"} text-white px-3 py-1`}>
                      {values.status}
                    </Badge>
                    {values.isAdmin && <Badge className="bg-blue-500 text-white px-3 py-1">Administrador</Badge>}
                    {values.isPowerUser && !values.isAdmin && <Badge className="bg-purple-500 text-white px-3 py-1">Usuário Avançado</Badge>}
                    {!values.isPowerUser && !values.isAdmin && <Badge className="bg-gray-500 text-white px-3 py-1">Membro Regular</Badge>}
                  </div>
                </div>
              </div>
              <div className="space-y-6 bg-white rounded-lg p-4 border border-blue-100 shadow-inner">
                <div>
                  <h4 className="font-medium border-b border-blue-100 pb-2 text-blue-700 flex items-center gap-2">
                    <UserIcon className="h-4 w-4" /> Informações Pessoais
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    <div>
                      <p className="text-sm text-gray-500">Matrícula</p>
                      <p className="font-medium">{values.matricula}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Idade</p>
                      <p className="font-medium">{values.idade} anos</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Telefone</p>
                      <p className="font-medium">{values.telefone || "Não informado"}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium border-b border-blue-100 pb-2 text-blue-700 flex items-center gap-2">
                    <Building className="h-4 w-4" /> Informações Profissionais
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    <div>
                      <p className="text-sm text-gray-500">Cargo</p>
                      <p className="font-medium">{values.cargo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Setor</p>
                      <p className="font-medium">{values.setor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Data de Entrada</p>
                      <p className="font-medium">{values.dataEntradaEmpresa}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Curso</p>
                      <p className="font-medium">{values.curso || "Não informado"}</p>
                    </div>
                  </div>
                </div>
                {values.observacoes && (
                  <div>
                    <h4 className="font-medium border-b border-blue-100 pb-2 text-blue-700 flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Observações
                    </h4>
                    <p className="text-sm mt-2">{values.observacoes}</p>
                  </div>
                )}
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  <p className="text-sm text-blue-700">
                    Verifique todas as informações antes de finalizar o cadastro.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto py-3 px-4 md:py-6 md:px-0">
        <Card className="shadow-lg border border-gray-200/60">
          <CardHeader className="border-b pb-8">
            <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2 mb-6">
              <UserPlus className="h-5 w-5 md:h-6 md:w-6 text-primary" /> Cadastro de Novo Membro
            </CardTitle>
            {/* Barra de progresso e passos */}
            <div className="space-y-4 md:space-y-6">
              <div className="flex justify-between text-sm font-medium">
                <span>Passo {currentStep + 1} de {steps.length}</span>
                <span>{Math.round(progressValue)}% completo</span>
              </div>
              <Progress value={progressValue} className="h-2 hidden md:block" />
              <div className="hidden md:flex justify-between">
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  const status = 
                    currentStep > index ? "completed" : 
                    currentStep === index ? "current" : "upcoming";
                  return (
                    <div key={step.id} className="flex flex-col items-center">
                      <div 
                        className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all
                          ${status === 'completed' 
                            ? 'bg-primary border-primary text-white' 
                            : status === 'current' 
                              ? 'border-primary text-primary' 
                              : 'border-gray-300 text-gray-300'
                          }`}
                      >
                        {status === 'completed' ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          <StepIcon className="h-6 w-6" />
                        )}
                        <span className="sr-only">{step.name}</span>
                      </div>
                      <span className={`mt-2 text-sm font-medium
                          ${status === 'completed' 
                            ? 'text-primary' 
                            : status === 'current' 
                              ? 'text-gray-900' 
                              : 'text-gray-500'
                          }`}
                      >
                        {step.name}
                      </span>
                      <span className="text-xs text-gray-500 hidden md:block">{step.description}</span>
                    </div>
                  );
                })}
              </div>
              {/* Versão mobile dos steps */}
              <div className="flex md:hidden">
                {steps.map((step, index) => (
                  <div 
                    key={step.id} 
                    className={`flex-1 h-1.5 ${
                      index < currentStep ? 'bg-primary' : 
                      index === currentStep ? 'bg-primary/50' : 
                      'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <div className="md:hidden text-center">
                <span className="text-primary font-medium">{steps[currentStep].name}</span>
                <p className="text-xs text-gray-500">{steps[currentStep].description}</p>
              </div>
            </div>
          </CardHeader>
          <FormProvider {...methods}>
            <form>
              <CardContent className="pt-6 pb-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderStepContent(currentStep)}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4 md:p-6 bg-gray-50/70">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0 || isLoading}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" /> Voltar
                </Button>
                <div className="flex gap-3">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/usuarios")}
                    disabled={isLoading}
                    className="hidden md:flex"
                  >
                    Cancelar
                  </Button>
                  {currentStep < steps.length - 1 ? (
                    <Button 
                      type="button"
                      onClick={nextStep}
                      disabled={isLoading}
                      className="gap-2 bg-primary hover:bg-primary/90"
                    >
                      Próximo <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      type="button"
                      onClick={methods.handleSubmit(onSubmit)}
                      disabled={isLoading}
                      className="gap-2 bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800"
                    >
                      {isLoading ? (
                        <>
                          <motion.div 
                            className="h-4 w-4" 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Sparkles className="h-4 w-4" />
                          </motion.div>
                          Cadastrando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" /> Finalizar Cadastro
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardFooter>
            </form>
          </FormProvider>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateUser;