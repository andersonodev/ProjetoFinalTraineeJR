import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { LogIn, Eye, EyeOff, User, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Validação com Zod
const loginSchema = z.object({
  email: z.string().min(1, "Email é obrigatório").transform(val => val.trim()),
  senha: z.string().min(1, "Senha é obrigatória"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      senha: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      // Garantir que espaços em branco sejam removidos
      const trimmedEmail = values.email.trim();
      const trimmedSenha = values.senha.trim();
      
      await signIn(trimmedEmail, trimmedSenha);
      // Removemos o toast de sucesso daqui, pois já vamos navegar para o dashboard
      // e ele pode estar causando o problema de setState durante o render
    } catch (error) {
      console.error("Erro no login:", error);
      // Não precisamos do toast aqui, já está sendo tratado no AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cyan-50 to-primary/10">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <img 
            src="/logoibmecjr.png" 
            alt="Logo IBMEC Jr" 
            className="h-24 mx-auto mb-4" 
          />
        </div>

        <Card className="w-full shadow-lg border border-primary/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center font-bold text-primary">Login</CardTitle>
            <div className="border-b border-primary w-16 mx-auto mt-1" />
            <CardDescription className="text-center pt-2">
              Entre com seus dados para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" /> Usuário
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite seu email"
                          className="border-primary/30"
                          {...field}
                          // Remover espaços ao sair do campo
                          onBlur={(e) => {
                            e.target.value = e.target.value.trim();
                            field.onBlur();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="senha"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="flex items-center gap-2">
                          <Lock className="h-4 w-4" /> Senha
                        </FormLabel>
                        <Link
                          to="/esqueceu-senha"
                          className="text-xs text-primary hover:text-primary/90 hover:underline"
                        >
                          Esqueceu sua senha?
                        </Link>
                      </div>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Digite sua senha"
                            className="pr-10 border-primary/30"
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 text-gray-400"
                          onClick={toggleShowPassword}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 gap-2"
                  disabled={isLoading}
                >
                  <LogIn className="h-4 w-4" />
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="">
            <p className="">
              Use <span className="">admin@ibmecjrsolucoes.com.br</span> e senha <span className="">123456</span> para demonstração
            </p>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          © 2025 IBMEC Jr Soluções. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
};

export default Login;
