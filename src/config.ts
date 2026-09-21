// Conexão com o Supabase. A chave "anon" é PÚBLICA por definição (vai no navegador de qualquer forma);
// quem protege os dados são as regras RLS do banco (supabase/schema.sql). Nunca coloque a "service_role" aqui.
export const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL ?? 'https://zloosoqszzghmblzvhdm.supabase.co'
export const SUPABASE_ANON_KEY: string = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsb29zb3FzenpnaG1ibHp2aGRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMjc4MTIsImV4cCI6MjEwNTYwMzgxMn0.YD0odyb_kbdc0pCrqI-99QvFfNb_yuM2-Dn61xXvJxo'

export const supabaseConfigurado = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
