// Só quem recebe isto: robôs de prévia de link (WhatsApp, Instagram, Facebook, Twitter/X, Telegram,
// LinkedIn, Discord…) — ver a regra em vercel.json que só manda pedidos DESSES robôs para cá.
// Uma pessoa de verdade nunca vê esta página: ela sempre abre o site normal (React).
// O motivo de existir: esses robôs não executam o site (não rodam JavaScript), então sem esta rota
// eles sempre viam a mesma imagem/título genéricos do site inteiro, em vez da foto da peça compartilhada.
const BASE = 'https://porcelanart-catalogo.vercel.app'
const URL_PADRAO = 'https://zloosoqszzghmblzvhdm.supabase.co'
const CHAVE_PADRAO =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsb29zb3FzenpnaG1ibHp2aGRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMjc4MTIsImV4cCI6MjEwNTYwMzgxMn0.YD0odyb_kbdc0pCrqI-99QvFfNb_yuM2-Dn61xXvJxo'

const escapa = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

const absoluta = (f) => {
  if (f == null) return `${BASE}/img/foto-28.webp`
  const s = typeof f === 'number' ? `/img/foto-${f}.webp` : String(f)
  return /^https?:/.test(s) ? s : `${BASE}${s.startsWith('/') ? '' : '/'}${s}`
}

export default async function handler(req, res) {
  const slug = String(req.query.slug || '')
  const url = process.env.VITE_SUPABASE_URL || URL_PADRAO
  const key = process.env.VITE_SUPABASE_ANON_KEY || CHAVE_PADRAO
  let produto = null

  try {
    const r = await fetch(`${url}/rest/v1/kits?slug=eq.${encodeURIComponent(slug)}&select=nome,resumo,fotos&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
    if (r.ok) produto = (await r.json())[0] ?? null
  } catch {
    // sem banco agora — tenta o catálogo fixo do código abaixo
  }

  if (!produto) {
    const mod = await import('../src/data.ts').catch(() => null)
    produto = mod?.produtos?.find((p) => p.slug === slug) ?? null
  }

  const titulo = produto ? `${produto.nome} — PorcelanArt` : 'PorcelanArt — Porcelana pintada à mão'
  const descricao = produto ? `${produto.resumo || 'Peça pintada à mão, sob encomenda.'} Personalize a sua pelo WhatsApp.` : 'Canecas, xícaras, pratos e kits de porcelana pintados à mão. Personalize a sua pelo WhatsApp.'
  const imagem = absoluta(produto?.fotos?.[0])
  const pagina = produto ? `${BASE}/peca/${slug}` : BASE

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=600')
  res.status(200).send(`<!doctype html>
<html lang="pt-BR"><head>
<meta charset="UTF-8">
<title>${escapa(titulo)}</title>
<meta name="description" content="${escapa(descricao)}">
<meta property="og:title" content="${escapa(titulo)}">
<meta property="og:description" content="${escapa(descricao)}">
<meta property="og:image" content="${escapa(imagem)}">
<meta property="og:url" content="${escapa(pagina)}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
</head><body>
<a href="${escapa(pagina)}">${escapa(titulo)}</a>
</body></html>`)
}
