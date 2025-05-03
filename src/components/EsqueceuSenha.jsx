import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebase";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail } from "lucide-react";

function EsqueceuSenhaPage() { 
  const [email, setEmail] = useState('');
  const [isEmailValido, setEmailValido] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validarEmail = (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValido(regex.test(value));
  };

  const mudar = (e) => {
    const value = e.target.value;
    setEmail(value);
    validarEmail(value);
  };

  const enviarRecuperacao = async (e) => {
    e.preventDefault();
    
    if (!isEmailValido) {
      toast.error('Por favor, digite um e-mail válido.');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success(`Enviamos um e-mail com as instruções para: ${email}`);
      navigate('/login');
    } catch (error) {
      console.error("Erro ao enviar e-mail de recuperação:", error);
      toast.error("Não foi possível enviar o e-mail de recuperação. Verifique se o endereço está correto.");
    } finally {
      setIsLoading(false);
    }
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
            <CardTitle className="text-2xl text-center font-bold text-primary">Recuperar Senha</CardTitle>
            <div className="border-b border-primary w-16 mx-auto mt-1" />
            <CardDescription className="text-center pt-2">
              Informe seu e-mail para receber as instruções de recuperação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={enviarRecuperacao} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={mudar}
                  className={email.length > 0 ? (isEmailValido ? 'border-green-500' : 'border-red-500') : ''}
                />
                {!isEmailValido && email.length > 0 && (
                  <p className="text-sm text-red-500">Formato de e-mail inválido</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={!isEmailValido || isLoading}
              >
                {isLoading ? "Enviando..." : "Recuperar Senha"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t p-4">
            <Button variant="link" onClick={() => navigate('/login')} className="text-primary hover:text-primary/90">
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar ao Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default EsqueceuSenhaPage;