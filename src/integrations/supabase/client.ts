/**
 * CLIENTE SUPABASE - CONFIGURAÇÃO CENTRAL
 * Este arquivo instancia o cliente que permite a comunicação do frontend com o backend (Supabase).
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Carrega as variáveis de ambiente (definidas no .env)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Instância exportada do cliente.
 * Inclui configurações de persistência de sessão no localStorage para manter o usuário logado.
 */
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true, // Mantém a sessão mesmo após fechar o navegador
    autoRefreshToken: true, // Renova o token de acesso automaticamente
  }
});