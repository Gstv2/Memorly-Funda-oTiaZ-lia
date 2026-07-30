import { supabase } from "@/integrations/supabase/client";

/**
 * UTILITÁRIOS DE STORAGE - FUNDAÇÃO TIA ZÉLIA
 * Este arquivo contém funções auxiliares para lidar com o Supabase Storage.
 */

/**
 * Extrai o nome do bucket e o caminho do arquivo de uma URL pública do Supabase Storage.
 */
export const getStoragePathFromUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    if (pathParts[1] === 'storage' && pathParts[4] === 'public') {
      const bucket = pathParts[5];
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
 * Normaliza e gera a URL pública da imagem.
 * Evita o endpoint '/render/image/' caso o add-on de Image Transformation não esteja ativo,
 * prevenindo erros de CORB e requisições 400.
 */
export const getOptimizedImageUrl = (
  url: string | null | undefined, 
  _options: { width?: number; height?: number; quality?: number } = {}
): string => {
  if (!url) return "";
  
  // Se já for uma URL completa (http/https), retorna diretamente a URL limpa
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Se for apenas um caminho interno (ex: "projects/123.jpg" ou "media/projects/123.jpg")
  const cleanPath = url.startsWith("/") ? url.slice(1) : url;
  
  // Se o caminho já especifica o bucket como primeira parte
  const parts = cleanPath.split("/");
  if (parts.length > 1) {
    const bucket = parts[0];
    const path = parts.slice(1).join("/");
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }

  // Fallback padrão para o bucket 'media'
  return supabase.storage.from("media").getPublicUrl(cleanPath).data.publicUrl;
};

/**
 * Remove permanentemente um arquivo do Supabase Storage baseado na sua URL pública.
 */
export const deleteFileFromStorage = async (url: string | null | undefined) => {
  if (!url) return;

  const storageInfo = getStoragePathFromUrl(url);
  if (storageInfo) {
    const { bucket, path } = storageInfo;
    const { error } = await supabase.storage.from(bucket).remove([path]);
    
    if (error) {
      console.error(`Erro ao deletar arquivo do storage (${bucket}/${path}):`, error);
    } else {
      console.log(`Arquivo deletado com sucesso do storage: ${bucket}/${path}`);
    }
  }
};