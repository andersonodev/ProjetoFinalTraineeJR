import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { useMobile } from "@/hooks-velho/use-mobile";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMobile();

  // Close sidebar when switching to desktop view
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Fechar o sidebar quando o usuário clicar em qualquer link no menu mobile
  useEffect(() => {
    const handleLinkClick = () => {
      if (isMobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    // Adicionar event listener para links dentro do Sidebar
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
      link.addEventListener('click', handleLinkClick);
    });

    return () => {
      sidebarLinks.forEach(link => {
        link.removeEventListener('click', handleLinkClick);
      });
    };
  }, [isMobile, sidebarOpen]);

  // Ajuste para melhorar o espaçamento no mobile
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu button - posição ajustada */}
      {isMobile && !sidebarOpen && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="fixed top-3 left-3 z-50 bg-white shadow-lg rounded-full h-9 w-9"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu size={18} />
        </Button>
      )}

      {/* Sidebar com AnimatePresence */}
      <AnimatePresence mode="wait">
        {(isMobile ? sidebarOpen : true) && (
          <motion.div 
            className={`${isMobile ? "fixed inset-y-0 left-0 z-40" : "relative"}`}
            initial={isMobile ? { x: "-100%" } : { x: 0 }}
            animate={{ x: 0 }}
            exit={isMobile ? { x: "-100%" } : {}}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Sidebar 
              isMobile={isMobile} 
              onCloseMobile={() => setSidebarOpen(false)} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile overlay com clique para fechar */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main content com padding ajustado */}
      <div className={`flex-1 overflow-auto ${isMobile ? "pt-14 pb-4" : ""}`}>
        <main className="p-3 md:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
