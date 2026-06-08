import { supabase } from "@/integrations/supabase/client";

/**
 * UTILITÁRIOS DE STORAGE - FUNDAÇÃO TIA ZÉLIA
 * Este arquivo contém funções auxiliares para lidar com o Supabase Storage,
 * como extração de caminhos de URLs, otimização de imagens e exclusão de arquivos.
 */

/**
 * Extrai o nome do bucket e o caminho do arquivo de uma URL pública do Supabase Storage.
 * Útil para quando temos a URL completa mas precisamos deletar o arquivo original.
 * Exemplo de URL: https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[path/to/file.jpg]
 */
export const getStoragePathFromUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    // Divide a URL pelo caractere '/' para isolar as partes do caminho
    const pathParts = urlObj.pathname.split('/');
    
    /**
     * Estrutura esperada do pathParts:
     * [0] ""
     * [1] "storage"
     * [2] "v1"
     * [3] "object"
     * [4] "public"
     * [5] NOME_DO_BUCKET
     * [6...] CAMINHO_DO_ARQUIVO
     */
    
    // Verifica se a URL segue o padrão oficial do Supabase Storage
    if (pathParts[1] === 'storage' && pathParts[4] === 'public') {
      const bucket = pathParts[5];
      // Junta as partes restantes para reconstruir o caminho interno do arquivo
      const path = pathParts.slice(6).join('/');
      return { bucket, path };
    }
    return null;
  } catch (error) {
    console.error("Erro ao extrair caminho do storage da URL:", error);
    return null;
  }
};

/**
 * Gera uma URL otimizada usando o Supabase Image Transformation.
 * Isso ajuda a carregar imagens mais rápido, reduzindo o peso e redimensionando no servidor.
 * Requer que o bucket seja público e o projeto tenha o add-on de otimização habilitado.
 */
export const getOptimizedImageUrl = (url: string | null | undefined, options: { width?: number; height?: number; quality?: number } = {}) => {
  // Se não houver URL, retorna vazio para não quebrar o <img>
  if (!url) return "";
  
  // Se for uma imagem externa (não hospedada no seu Supabase), retorna a URL original sem tentar otimizar
  if (!url.includes("supabase.co/storage/v1/object/public")) return url;

  const { width, height, quality = 80 } = options;
  const params = new URLSearchParams();
  
  // Adiciona parâmetros de redimensionamento e qualidade se fornecidos
  if (width) params.append('width', width.toString());
  if (height) params.append('height', height.toString());
  params.append('quality', quality.toString());
  params.append('format', 'origin'); // Mantém o formato original ou deixa o Supabase decidir o melhor (WebP/AVIF)

  // Altera o endpoint de '/storage/v1/object/public/' para '/storage/v1/render/image/public/' para ativar a otimização
  return url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/') + `?${params.toString()}`;
};

/**
 * Remove permanentemente um arquivo do Supabase Storage baseado na sua URL pública.
 * Muito útil para limpar fotos antigas de perfil quando o usuário sobe uma nova.
 */
export const deleteFileFromStorage = async (url: string | null | undefined) => {
  // Se a URL for nula ou vazia, não faz nada
  if (!url) return;

  // Tenta extrair o bucket e o path da URL
  const storageInfo = getStoragePathFromUrl(url);
  if (storageInfo) {
    const { bucket, path } = storageInfo;
    // Chama a API do Supabase para remover o arquivo
    const { error } = await supabase.storage.from(bucket).remove([path]);
    
    if (error) {
      console.error(`Erro ao deletar arquivo do storage (${bucket}/${path}):`, error);
    } else {
      console.log(`Arquivo deletado com sucesso do storage: ${bucket}/${path}`);
    }
  }
};

