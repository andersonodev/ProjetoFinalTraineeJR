import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/user";
import { UserDetails } from "@/components/UserDetails";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks-velho/use-mobile";

interface UsersTableProps {
  users: User[];
  onUserUpdate?: () => void;
  isAdmin?: boolean;
  isPowerUser?: boolean;
  filterQuery?: string;
  filterSetor?: string;
}

const UsersTable = ({ 
  users, 
  onUserUpdate = () => {}, 
  isAdmin = false, 
  isPowerUser = false,
  filterQuery = "", 
  filterSetor = "todos" 
}: UsersTableProps) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Filtra usuários com base na busca e setor
  const filteredUsers = users.filter(user => {
    const nameMatch = user.nome.toLowerCase().includes(filterQuery.toLowerCase());
    const sectorMatch = filterSetor === "todos" || user.setor === filterSetor;
    return nameMatch && sectorMatch;
  });

  const handleRowClick = (user: User) => {
    setSelectedUser(user);
    setDetailsOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
    setTimeout(() => setSelectedUser(null), 300); // Limpa após a animação
  };

  // Obtém as iniciais do nome para o avatar
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n.charAt(0).toUpperCase()).join("").substring(0, 2);
  };

  const getBadgeColor = (status: string) => {
    switch (status) {
      case "Ativo": 
        return "bg-green-500 hover:bg-green-600 border-0";
      case "Banido": 
        return "bg-red-500 hover:bg-red-600 border-0";
      case "Inativo":
      default:
        return "bg-gray-400 hover:bg-gray-500 border-0";
    }
  };

  // Layout para dispositivos móveis
  if (isMobile) {
    return (
      <>
        <div className="text-sm font-medium text-gray-500 px-4 py-2">
          Usuário
        </div>
        <div className="space-y-2">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user, index) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                key={user.id}
                onClick={() => handleRowClick(user)}
                className="bg-white p-3 border rounded-lg flex items-center gap-3 shadow-sm hover:bg-blue-50/40 transition-colors cursor-pointer"
              >
                <Avatar className="h-10 w-10 border-2 border-gray-100 shadow-sm">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(user.nome)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{user.nome}</div>
                  <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                </div>
                <Badge
                  variant="default"
                  className={getBadgeColor(user.status)}
                >
                  {user.status}
                </Badge>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhum usuário encontrado.
            </div>
          )}
        </div>

        {selectedUser && (
          <UserDetails 
            user={selectedUser}
            open={detailsOpen}
            onOpenChange={handleDetailsClose}
            onUserUpdate={() => {
              onUserUpdate();
              setDetailsOpen(false);
            }}
            isAdmin={isAdmin}
            isPowerUser={isPowerUser}
          />
        )}
      </>
    );
  }

  // Layout para desktop
  return (
    <>
      <div className="table-container rounded-lg overflow-hidden shadow-sm bg-white">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[250px] font-semibold">Usuário</TableHead>
              <TableHead className="font-semibold">Setor</TableHead>
              <TableHead className="font-semibold">Cargo</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Data de Ativação</TableHead>
              <TableHead className="text-center font-semibold">Advertências</TableHead>
              <TableHead className="text-center font-semibold">Notificações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  key={user.id} 
                  className="hover-list-item cursor-pointer hover:bg-blue-50/40 transition-colors"
                  onClick={() => handleRowClick(user)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="border-2 border-gray-100 shadow-sm">
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(user.nome)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.nome}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.setor || "-"}</TableCell>
                  <TableCell>{user.role || user.cargo || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant="default"
                      className={getBadgeColor(user.status)}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.dataEntradaEmpresa || "-"}</TableCell>
                  <TableCell className="text-center">
                    <span className={`${user.advertencias > 0 ? "text-amber-600 font-medium" : ""}`}>
                      {user.advertencias}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`${user.notificacoes > 0 ? "text-blue-600 font-medium" : ""}`}>
                      {user.notificacoes}
                    </span>
                  </TableCell>
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedUser && (
        <UserDetails 
          user={selectedUser}
          open={detailsOpen}
          onOpenChange={handleDetailsClose}
          onUserUpdate={() => {
            onUserUpdate();
            setDetailsOpen(false);
          }}
          isAdmin={isAdmin}
          isPowerUser={isPowerUser}
        />
      )}
    </>
  );
};

export default UsersTable;
