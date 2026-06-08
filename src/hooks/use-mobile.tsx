import * as React from "react";

/**
 * Hook personalizado para detectar se o usuário está acessando via dispositivo móvel.
 * Baseado no breakpoint padrão de 768px.
 */
const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // Estado para armazenar se é mobile ou não (inicialmente indefinido para evitar inconsistência no SSR)
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    // Cria um listener de mídia para o breakpoint definido
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    // Função chamada sempre que o tamanho da tela muda
    const onChange = () => {
      // Atualiza o estado comparando a largura atual da janela
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Adiciona o evento de escuta para mudanças no tamanho da tela
    mql.addEventListener("change", onChange);
    
    // Define o valor inicial logo no primeiro carregamento
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Limpeza (cleanup): remove o listener quando o componente é destruído
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Retorna booleano (garante que undefined vire false)
  return !!isMobile;
}
