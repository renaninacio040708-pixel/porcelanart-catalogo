// Roda sozinho todo dia (ver "crons" no vercel.json) só para o banco (Supabase) nunca ficar
// 7 dias parado — no plano grátis, o Supabase pausa projetos sem uso e o painel do vendedor
// para de funcionar até alguém reativar manualmente. Esta rota só faz uma leitura simples.
const URL_PADRAO = 'https://zloosoqszzghmblzvhdm.supabase.co'
const CHAVE_PADRAO =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsb29zb3FzenpnaG1ibHp2aGRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMjc4MTIsImV4cCI6MjEwNTYwMzgxMn0.YD0odyb_kbdc0pCrqI-99QvFfNb_yuM2-Dn61xXvJxo'

export default async function handler(req, res) {
  const url = process.env.VITE_SUPABASE_URL || URL_PADRAO
  const key = process.env.VITE_SUPABASE_ANON_KEY || CHAVE_PADRAO
  try {
    const r = await fetch(`${url}/rest/v1/kits?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
    res.status(200).json({ ok: r.ok, em: new Date().toISOString() })
  } catch (e) {
    // não deixa o cron "falhar" de um jeito que gere alarme — só registra
    res.status(200).json({ ok: false, erro: String(e) })
  }
}
