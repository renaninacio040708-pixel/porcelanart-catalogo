import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigurado } from './config'
import { CATEGORIAS_BASE, PECAS_PADRAO, norm, produtos as produtosEstaticos, type Peca, type Produto, type Status } from './data'

/** Dados do catálogo público: vêm do painel (Supabase) e, se não houver, do catálogo estático do código. */
type Catalogo = {
  produtos: Produto[]
  pecas: Peca[]
  categorias: string[]
  carregando: boolean
  achar: (slug?: string) => Produto | undefined
}

const Ctx = createContext<Catalogo | null>(null)

const CACHE = 'pa_catalogo_v1'
const DEMO_KITS = 'pa_demo_kits'
const DEMO_PECAS = 'pa_demo_pecas'

const normalizaKit = (r: Record<string, unknown>): Produto => ({
  id: r.id as string,
  slug: r.slug as string,
  nome: r.nome as string,
  categoria: (r.categoria as string) || 'Outros',
  resumo: (r.resumo as string) || '',
  descricao: (r.descricao as string) || '',
  detalhes: (r.detalhes as string[]) ?? [],
  fotos: (r.fotos as string[]) ?? [],
  variacoes: (r.variacoes as Produto['variacoes']) ?? [],
  status: ((r.status as Status) ?? 'ativo') as Status,
  ordem: (r.ordem as number) ?? 0,
  preco: r.preco == null ? null : Number(r.preco),
})

const normalizaPeca = (r: Record<string, unknown>): Peca => ({
  id: r.id as string,
  tipo: r.tipo as string,
  modelo: r.modelo as string,
  preco: r.preco == null ? null : Number(r.preco),
  foto: (r.foto as string) ?? null,
  status: ((r.status as Status) ?? 'ativo') as Status,
  ordem: (r.ordem as number) ?? 0,
})

async function rest<T>(path: string): Promise<T> {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  })
  if (!r.ok) throw new Error(String(r.status))
  return r.json()
}

const lerLocal = <T,>(k: string): T | null => {
  try {
    const v = localStorage.getItem(k)
    return v ? (JSON.parse(v) as T) : null
  } catch {
    return null
  }
}

type Dados = { kits: Produto[] | null; pecas: Peca[] | null }

function inicial(): Dados {
  if (supabaseConfigurado) return lerLocal<Dados>(CACHE) ?? { kits: null, pecas: null }
  if (import.meta.env.DEV) {
    // só no desenvolvimento: enxerga o que foi criado no painel em modo demonstração
    const k = lerLocal<Produto[]>(DEMO_KITS)
    const p = lerLocal<Peca[]>(DEMO_PECAS)
    return { kits: k?.length ? k : null, pecas: p?.length ? p : null }
  }
  return { kits: null, pecas: null }
}

export function CatalogoProvider({ children }: { children: React.ReactNode }) {
  const [dados, setDados] = useState<Dados>(inicial)
  // false até a primeira resposta do banco (mesmo com cache), para não mostrar "peça não encontrada" de um produto novo
  const [carregando, setCarregando] = useState(supabaseConfigurado)

  useEffect(() => {
    if (!supabaseConfigurado) return
    let vivo = true
    Promise.all([
      rest<Record<string, unknown>[]>('kits?select=*&order=ordem.asc,criado_em.asc'),
      rest<Record<string, unknown>[]>('pecas?select=*&order=ordem.asc,criado_em.asc'),
    ])
      .then(([k, p]) => {
        if (!vivo) return
        const novo: Dados = { kits: k.map(normalizaKit), pecas: p.map(normalizaPeca) }
        setDados(novo)
        try {
          localStorage.setItem(CACHE, JSON.stringify(novo))
        } catch {
          /* sem cache, tudo bem */
        }
      })
      .catch(() => undefined)
      .finally(() => vivo && setCarregando(false))
    return () => {
      vivo = false
    }
  }, [])

  const valor = useMemo<Catalogo>(() => {
    // sem cache e ainda buscando: lista vazia (evita piscar o catálogo antigo do código)
    // banco respondeu (mesmo vazio) = ele manda; catálogo do código só se o banco nunca respondeu
    const base = dados.kits ? dados.kits : carregando ? [] : produtosEstaticos
    const semOcultos = base.filter((p) => p.status !== 'oculto')

    // categorias digitadas com grafias diferentes (Kits / kits / Kits e conjuntos) viram uma só —
    // a primeira grafia encontrada (ou a da lista padrão, se bater) é a exibida.
    const canonico = new Map<string, string>()
    for (const c of CATEGORIAS_BASE) canonico.set(norm(c), c)
    for (const p of semOcultos) if (!canonico.has(norm(p.categoria))) canonico.set(norm(p.categoria), p.categoria)
    const produtos = semOcultos.map((p) => ({ ...p, categoria: canonico.get(norm(p.categoria))! }))

    const pecasBrutas = dados.pecas ? dados.pecas : carregando ? [] : PECAS_PADRAO
    const pecas = pecasBrutas.filter((p) => p.status !== 'oculto')
    const usadas = [...new Set(produtos.map((p) => p.categoria))]
    const categorias = [...CATEGORIAS_BASE.filter((c) => usadas.includes(c)), ...usadas.filter((c) => !CATEGORIAS_BASE.includes(c))]
    return {
      produtos,
      pecas,
      categorias,
      carregando,
      achar: (slug) => produtos.find((p) => p.slug === slug),
    }
  }, [dados, carregando])

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}

export function useCatalogo() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useCatalogo fora do CatalogoProvider')
  return c
}
