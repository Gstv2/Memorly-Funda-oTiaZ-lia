import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilitário para mesclar classes CSS de forma inteligente.
 * Combina 'clsx' (para lógica condicional) com 'twMerge' (para evitar conflitos de classes do Tailwind).
 * 
 * Exemplo de uso:
 * cn("px-2 py-1", isActive && "bg-blue-500", className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
