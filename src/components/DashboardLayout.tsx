import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { useMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sideUrl, setSideUrl] = useState<string | null>(null);
  const [sideLabel, setSideLabel] = useState<string | null>(null);
  const isMobile = useMobile();

  // Função para abrir externo, recebendo url e label
  const handleOpenExternal = (url: string, label?: string | null) => {
    setSideUrl(url);
    setSideLabel(label ?? null);
  };

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
              onOpenExternal={(url: string) => {
                if (!url) return; // Garante que url nunca é null
                // Descobrir label do item pelo url
                let label = null;
                if (url.includes("brasiljunior.org.br")) label = "Brasil Júnior";
                if (url.includes("riojunior.org.br")) label = "Rio Júnior";
                if (url.includes("calendar.google.com")) label = "Google Agenda";
                if (url.includes("mail.google.com")) label = "Gmail";
                handleOpenExternal(url, label);
              }}
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

      {/* Main content + split view */}
      <div className={`flex-1 flex overflow-auto ${isMobile ? "pt-14 pb-4" : ""}`}>
        {sideUrl && sideLabel === "Brasil Júnior" ? (
          <div className="w-full h-full relative flex flex-col">
            <div className="flex items-center justify-between px-6 py-3 border-b bg-white/90 z-10">
              <h2 className="text-lg font-semibold text-gray-800">Brasil Júnior</h2>
              <button
                className="bg-gray-100 hover:bg-gray-200 rounded-full p-1 shadow"
                onClick={() => { setSideUrl(null); setSideLabel(null); }}
                title="Fechar"
              >
                <span className="sr-only">Fechar</span>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <iframe
              src={sideUrl}
              title="Brasil Júnior"
              className="w-full h-full flex-1"
              frameBorder={0}
            />
          </div>
        ) : sideUrl ? (
          <div className="w-[600px] max-w-full border-l bg-white shadow-lg h-full relative flex flex-col">
            <div className="flex items-center justify-between px-6 py-3 border-b bg-white/90 z-10">
              <h2 className="text-lg font-semibold text-gray-800">{sideLabel || "Conteúdo Externo"}</h2>
              <button
                className="bg-gray-100 hover:bg-gray-200 rounded-full p-1 shadow"
                onClick={() => { setSideUrl(null); setSideLabel(null); }}
                title="Fechar"
              >
                <span className="sr-only">Fechar</span>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <iframe
              src={sideUrl}
              title={sideLabel || "Conteúdo Externo"}
              className="w-full h-full flex-1"
              frameBorder={0}
            />
          </div>
        ) : (
          <main className="flex-1 p-3 md:p-6 animate-fade-in">
            {children}
          </main>
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;
