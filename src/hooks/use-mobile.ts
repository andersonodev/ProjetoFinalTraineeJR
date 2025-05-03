import { useState, useEffect } from 'react';

export const useMobile = (breakpoint = 768) => {
  // Iniciar com null para evitar inconsistências de renderização entre servidor e cliente
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    // Função para verificar o tamanho da tela
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Verificar imediatamente
    checkScreenSize();
    
    // Adicionar event listener para resize
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [breakpoint]);

  // Retornar false durante a renderização inicial no servidor
  return isMobile === null ? false : isMobile;
};

// Breakpoints específicos para diferentes tamanhos de tela
export const useIsXS = () => useMobile(400);
export const useIsSM = () => useMobile(640);
export const useIsMD = () => useMobile(768);
export const useIsLG = () => useMobile(1024);

// Exportar useMobile como exportação nomeada
// E também como useIsMobile para compatibilidade com código existente
export { useMobile as useIsMobile };
export default useMobile;
