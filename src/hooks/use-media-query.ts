import { useState, useEffect } from 'react';

/**
 * Hook personalizado que verifica se uma media query CSS corresponde ao estado atual da janela
 * @param query A media query CSS a ser verificada (ex: "(max-width: 768px)")
 * @returns Um booleano indicando se a media query corresponde
 */
export function useMediaQuery(query: string): boolean {
  // Estado inicial como false para evitar inconsistências entre SSR e cliente
  const [matches, setMatches] = useState<boolean>(false);
  
  useEffect(() => {
    // Verificar se estamos no ambiente do navegador
    if (typeof window !== 'undefined') {
      // Criar media query
      const mediaQuery = window.matchMedia(query);
      
      // Definir o valor inicial
      setMatches(mediaQuery.matches);

      // Função para atualizar o estado quando a media query mudar
      const handleChange = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };

      // Adicionar listener
      mediaQuery.addEventListener('change', handleChange);
      
      // Cleanup: remover listener quando o componente for desmontado
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
    
    // Se não estamos em um navegador, retornar false
    return undefined;
  }, [query]);

  return matches;
}

export default useMediaQuery;
