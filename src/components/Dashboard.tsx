import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import UsersTable from "@/components/UsersTable";
import { User } from "@/types/user";
import { 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Bell, 
  UserPlus, 
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/spinner";

const Dashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSetor, setSelectedSetor] = useState("todos");
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin, isPowerUser } = useAuth();

  // Adicionando logs para debug
  useEffect(() => {
    console.log("Permissões do usuário:", { isAdmin, isPowerUser });
  }, [isAdmin, isPowerUser]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const snapshot = await getDocs(collection(db, "users"));
      const usersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as User[];
      setUsers(usersData);
    } catch (error) {
      console.error("Erro ao buscar usuários no Firebase:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.status === "Ativo").length;
  const totalWarnings = users.reduce((total, user) => total + (user.advertencias || 0), 0);
  const totalNotifications = users.reduce((total, user) => total + (user.notificacoes || 0), 0);

  const setores = Array.from(new Set(users.map(user => user.setor).filter(Boolean))) as string[];

  const refreshUsers = () => {
    fetchUsers();
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { delay: i * 0.1, duration: 0.5 }
    })
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-800 mb-1">Dashboard</h1>
            <p className="text-muted-foreground">
              Gerencie os usuários e acompanhe as métricas do sistema.
            </p>
          </div>
          {(isAdmin || isPowerUser) && (
            <Link to="/cadastrar-usuario">
              <Button className="bg-primary hover:bg-primary/90 shadow-sm transition-all hover:shadow gap-2 w-full md:w-auto">
                <UserPlus className="h-4 w-4" /> Adicionar Usuário
              </Button>
            </Link>
          )}
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div 
            custom={0}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="stat-card bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="stat-card-icon bg-primary/10 text-primary p-3 rounded-full">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Total de Usuários</div>
                <div className="text-3xl font-bold text-gray-900">{totalUsers}</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            custom={1}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="stat-card bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="stat-card-icon bg-green-100 text-green-600 p-3 rounded-full">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Usuários Ativos</div>
                <div className="text-3xl font-bold text-gray-900">{activeUsers}</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            custom={2}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="stat-card bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="stat-card-icon bg-amber-100 text-amber-600 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Advertências</div>
                <div className="text-3xl font-bold text-gray-900">{totalWarnings}</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            custom={3}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="stat-card bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="stat-card-icon bg-purple-100 text-purple-600 p-3 rounded-full">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Notificações</div>
                <div className="text-3xl font-bold text-gray-900">{totalNotifications}</div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-lg border p-4 md:p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-teal-600" /> 
            Gerenciamento de Usuários
          </h2>

          <div className="flex flex-col gap-4 mb-6">
            <div className="relative w-full">
              <Input
                placeholder="Buscar por nome..."
                className="pl-10 w-full border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Search className="h-5 w-5 text-muted-foreground" />
              </span>
            </div>
            <div className="w-full">
              <Select 
                defaultValue="todos"
                value={selectedSetor}
                onValueChange={setSelectedSetor}
              >
                <SelectTrigger className="border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500">
                  <SelectValue placeholder="Filtrar por Setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="todos">Todos os Setores</SelectItem>
                    {setores.map(setor => setor && (
                      <SelectItem key={setor} value={setor}>{setor}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
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
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
