// Conexão com o Supabase (chave PÚBLICA "anon": pode ficar no código; quem protege os dados são as regras RLS).
// Preencha aqui OU nas variáveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY na Vercel.
export const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL ?? ''
export const SUPABASE_ANON_KEY: string = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const supabaseConfigurado = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
