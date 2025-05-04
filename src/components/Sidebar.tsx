import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  UserPlus, 
  User, 
  LogOut, 
  Users, 
  Bell, 
  FileText,
  ChevronDown,
  ChevronRight,
  X,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, createContext, useContext, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
  showTooltip?: boolean;
}

interface SidebarProps {
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

const SidebarContext = createContext<{ collapsed: boolean; setCollapsed: (collapsed: boolean) => void }>({
  collapsed: false,
  setCollapsed: () => {},
});

const NavItem = ({ to, icon: Icon, label, isCollapsed, showTooltip = true }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const { setCollapsed } = useContext(SidebarContext);
  const content = (
    <Link
      to={to}
      className={cn(
        "sidebar-link flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
        isActive 
          ? "bg-white/20 text-white font-medium" 
          : "text-white/80 hover:bg-white/10 hover:text-white",
        isCollapsed ? "justify-center px-2" : ""
      )}
    >
      <Icon size={20} className="text-white" />
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );

  if (isCollapsed && showTooltip) {
    return (
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-gray-800 text-white border-0">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
};

const MenuCategory = ({ title, items, isCollapsed }: {
  title: string;
  items: {
    to: string;
    icon: React.ElementType;
    label: string;
    adminOnly?: boolean;
    powerUserOnly?: boolean;
  }[];
  isCollapsed: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const { isAdmin, isPowerUser } = useAuth();
  
  // Filtra itens com base nas permissões
  const filteredItems = items.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.powerUserOnly && !isPowerUser && !isAdmin) return false;
    return true;
  });
  
  // Se não houver itens para mostrar após filtro, não renderize a categoria
  if (filteredItems.length === 0) return null;

  return (
    <div className="mb-2">
      {!isCollapsed && (
        <div 
          className="px-3 py-2 flex items-center justify-between text-xs font-semibold text-white/70 uppercase tracking-wider cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          {title}
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      )}
      
      {(isOpen || isCollapsed) && (
        <div className="space-y-1">
          {filteredItems.map((item, i) => (
            <NavItem
              key={i}
              to={item.to}
              icon={item.icon}
              label={item.label}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ isMobile = false, onCloseMobile }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { userData, isAdmin, isPowerUser, signOut } = useAuth();
  
  // Não permitir colapsar o menu no modo mobile
  const actuallyCollapsed = isMobile ? false : collapsed;
  
  // Carregar estado de colapso do localStorage
  useEffect(() => {
    if (!isMobile) {
      const savedState = localStorage.getItem("sidebarCollapsed");
      if (savedState !== null) {
        setCollapsed(savedState === "true");
      }
    }
  }, [isMobile]);

  const toggleCollapse = () => {
    if (isMobile) return;
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao encerrar sessão");
    }
  };

  // Get first letter of name for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  // Categorias de menu
  const menuCategories = [
    {
      title: "Principal",
      items: [
        { to: "/dashboard", icon: Home, label: "Dashboard" },
      ]
    },
    {
      title: "Gerenciamento",
      items: [
        { to: "/cadastrar-usuario", icon: UserPlus, label: "Cadastrar Usuário", adminOnly: true },
        { to: "/perfil", icon: User, label: "Meu Perfil" },
      ]
    }
  ];

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <TooltipProvider>
        <div
          className={cn(
            "bg-primary h-screen flex flex-col transition-all duration-300 shadow-md relative",
            actuallyCollapsed ? "w-16" : "w-64"
          )}
        >
          {/* Botão para recolher/expandir no desktop */}
          {!isMobile && (
            <button 
              onClick={toggleCollapse} 
              className="absolute -right-3 top-6 bg-white h-6 w-6 rounded-full flex items-center justify-center border shadow-md cursor-pointer z-10"
              aria-label={actuallyCollapsed ? "Expandir menu" : "Recolher menu"}
            >
              <ChevronRight className={`h-4 w-4 text-gray-600 transition-transform ${actuallyCollapsed ? "" : "rotate-180"}`} />
            </button>
          )}
          
          {/* Cabeçalho mobile com botão de fechar */}
          {isMobile && onCloseMobile && (
            <div className="flex items-center justify-between p-4 border-b border-white/20 bg-primary-600">
              <div className="flex items-center">
                <Menu className="h-5 w-5 text-white mr-2" />
                <span className="text-white font-medium">Menu</span>
              </div>
              <button 
                onClick={onCloseMobile} 
                className="text-white p-1 hover:bg-white/10 rounded-md transition-colors"
                aria-label="Fechar menu"
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* Informações do perfil do usuário - reorganizadas verticalmente */}
          <div className={cn(
            "flex flex-col items-center p-4 border-b border-white/20",
            isMobile ? "h-auto py-5" : "h-auto py-6" 
          )}>
            {!actuallyCollapsed ? (
              <div className="flex flex-col items-center w-full text-center">
                <Avatar className="h-16 w-16 border-2 border-white mb-3">
                  <AvatarImage src={userData?.avatarUrl} alt={userData?.nome || "Usuário"} />
                  <AvatarFallback className="bg-teal-700 text-white">
                    {getInitials(userData?.nome || "User")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-0.5">
                  <h3 className="font-medium text-white text-sm">{userData?.nome || "Usuário"}</h3>
                  <p className="text-xs text-white/90">{userData?.role || userData?.role || "Membro"}</p>
                  <p className="text-xs text-white/70">{userData?.setor || "Sem setor"}</p>
                </div>
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <Avatar className="h-9 w-9 border-2 border-white">
                  <AvatarImage src={userData?.avatarUrl} alt={userData?.nome || "Usuário"} />
                  <AvatarFallback className="bg-teal-700 text-white text-xs">
                    {getInitials(userData?.nome || "User")}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>

          {/* Removendo a seção duplicada de avatar/perfil já que agora está no topo */}

          <div className="flex-1 overflow-y-auto custom-scrollbar pt-6">
            <nav className="flex flex-col gap-1 px-2">
              {menuCategories.map((category, i) => (
                <MenuCategory 
                  key={i} 
                  title={category.title} 
                  items={category.items} 
                  isCollapsed={actuallyCollapsed}
                />
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-white/20">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-3 w-full text-white hover:bg-white/10",
                actuallyCollapsed && "justify-center"
              )}
            >
              <LogOut size={20} className="text-white" />
              {!actuallyCollapsed && <span>Sair</span>}
            </Button>
          </div>
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
};

export default Sidebar;