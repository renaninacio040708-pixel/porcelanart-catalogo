// Sitemap gerado a cada visita, com os produtos que estão de verdade no Supabase (painel do vendedor).
// Sem banco configurado, cai de volta na lista fixa que já vem no código do site.
const BASE = 'https://porcelanart-catalogo.vercel.app'

export default async function handler(req, res) {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  let slugs = []

  if (url && key) {
    try {
      const r = await fetch(`${url}/rest/v1/kits?select=slug&status=neq.oculto`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      })
      if (r.ok) slugs = (await r.json()).map((k) => k.slug)
    } catch {
      // sem internet com o banco agora — usa a lista fixa abaixo
    }
  }

  if (!slugs.length) {
    // lista fixa do código, para nunca ficar sem sitemap
    const mod = await import('../src/data.ts').catch(() => null)
    slugs = mod?.produtos?.map((p) => p.slug) ?? []
  }

  const urls = [BASE + '/', BASE + '/montar-kit', ...slugs.map((s) => `${BASE}/peca/${s}`)]
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => `  <url><loc>${u}</loc></url>\n`).join('') +
    '</urlset>\n'

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=3600')
  res.status(200).send(xml)
}
