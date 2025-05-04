import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import UsersTable from "@/components/UsersTable";
import { User, UserStatus } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Spinner } from "@/components/ui/spinner"; // Adjust the path if necessary
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSetor, setSelectedSetor] = useState("todos");
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin, isPowerUser } = useAuth();
  
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const usersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as User[];
        setUsers(usersData);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
        toast.error("Erro ao carregar usuários");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAddUserClick = () => {
    if (isAdmin) {
      navigate("/cadastrar-usuario");
    } else {
      toast.error("Apenas administradores podem cadastrar novos usuários");
    }
  };

  const refreshUsers = async () => {
    setIsLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const usersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as User[];
      setUsers(usersData);
    } catch (error) {
      console.error("Erro ao atualizar usuários:", error);
      toast.error("Erro ao atualizar lista de usuários");
    } finally {
      setIsLoading(false);
    }
  };

  // Extrair lista de setores únicos dos usuários
  const setores = useMemo(() => {
    const setoresList = ["Consultoria Empresarial", "Departamento Pessoal", 
      "Desenvolvimento Organizacional", "Diretoria", "Engenharia", "Financeiro", 
      "Gestão de Pessoas", "Gestão de Processos", "Inovações", "Jurídico", 
      "Marketing", "Produtos", "Recrutamento", "Vendas"];
    
    // Também inclui qualquer setor presente nos usuários que não esteja na lista padrão
    users.forEach(user => {
      if (user.setor && !setoresList.includes(user.setor)) {
        setoresList.push(user.setor);
      }
    });
    
    return setoresList.sort();
  }, [users]);

  return (
    <DashboardLayout>
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-800">Usuários</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todos os usuários do sistema.
            </p>
          </div>
          {isAdmin && (
            <Button 
              className="bg-primary hover:bg-primary/90 shadow-sm transition-all hover:shadow"
              onClick={handleAddUserClick}
            >
              <UserPlus className="mr-2 h-4 w-4" /> Adicionar Usuário
            </Button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-96">
            <Input
              placeholder="Buscar por nome..."
              className="pl-10 w-full border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Search className="h-5 w-5 text-muted-foreground" />
            </span>
          </div>
          <div className="w-full md:w-64">
            <Select 
              defaultValue="todos"
              value={selectedSetor}
              onValueChange={setSelectedSetor}
            >
              <SelectTrigger className="border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary">
                <SelectValue placeholder="Filtrar por Setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="todos">Todos os Setores</SelectItem>
                  {setores.map(setor => (
                    <SelectItem key={setor} value={setor}>{setor}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner />
            <span className="ml-2">Carregando usuários...</span>
          </div>
        ) : (
          <UsersTable 
            users={users} 
            onUserUpdate={refreshUsers}
            isAdmin={isAdmin}
            isPowerUser={isPowerUser}
            filterQuery={searchQuery}
            filterSetor={selectedSetor}
          />
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default Users;
