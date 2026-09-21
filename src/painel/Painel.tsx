import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { STATUS_ROTULO, aPartirDe, foto, type Peca, type Produto, type Status, type Variacao } from '../data'
import { catalogoAtualComoLinhas, slugDe, store, type NovaPeca, type NovoProduto, type Store } from './store'

// ---------- estilos do painel (estilo "Central do Vendedor")
const btn = 'inline-flex min-h-[40px] items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors disabled:opacity-50'
const btnPrimario = `${btn} bg-indigo text-white hover:bg-[#1b3369]`
const btnLaranja = `${btn} bg-laranja text-white hover:bg-[#b4470a]`
const btnLinha = `${btn} border border-black/20 bg-white text-tinta hover:bg-black/5`
const btnPerigo = `${btn} border border-red-300 bg-white text-red-700 hover:bg-red-50`
const campo = 'w-full rounded-md border border-black/25 bg-white px-3 py-2.5 text-[15px] text-tinta outline-none focus:border-indigo focus:ring-2 focus:ring-indigo/20'
const rotuloCampo = 'mb-1.5 block text-sm font-medium text-tinta'

const COR_STATUS: Record<Status, string> = {
  ativo: 'bg-green-100 text-green-800 border-green-300',
  esgotado: 'bg-amber-100 text-amber-900 border-amber-300',
  oculto: 'bg-black/10 text-tinta-suave border-black/20',
}

type Aba = 'geral' | 'produtos' | 'pecas'
const SUGESTOES_CATEGORIA = ['Xícaras', 'Canecas', 'Pratos', 'Bandejas', 'Boleiras', 'Bules', 'Kits', 'Decoração', 'Infantil']
const MAX_FOTOS = 9

const TEMA = 'pa_painel_tema'

/** Modo escuro do painel: guarda a escolha no aparelho; sem escolha, segue o tema do celular/computador. */
function useTema() {
  const [escuro, setEscuro] = useState(() => {
    try {
      const v = localStorage.getItem(TEMA)
      if (v) return v === 'escuro'
    } catch {
      /* sem armazenamento */
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  })
  useEffect(() => {
    document.documentElement.classList.toggle('painel-escuro', escuro)
    return () => document.documentElement.classList.remove('painel-escuro')
  }, [escuro])
  const alternar = () =>
    setEscuro((v) => {
      try {
        localStorage.setItem(TEMA, v ? 'claro' : 'escuro')
      } catch {
        /* sem armazenamento */
      }
      return !v
    })
  return { escuro, alternar }
}

function BotaoTema({ escuro, alternar, className = '' }: { escuro: boolean; alternar: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={escuro}
      aria-label={escuro ? 'Mudar para o modo claro' : 'Mudar para o modo escuro'}
      title={escuro ? 'Modo claro' : 'Modo escuro'}
      className={`grid h-10 w-10 place-items-center rounded-md text-lg hover:bg-white/10 ${className}`}
    >
      {escuro ? '☀' : '☾'}
    </button>
  )
}

export default function Painel() {
  const [sessao, setSessao] = useState<string | null | undefined>(undefined)
  const tema = useTema()

  useEffect(() => {
    document.title = 'Central do Vendedor — PorcelanArt'
    document.head.querySelector('meta[name="robots"]')?.setAttribute('content', 'noindex,nofollow')
    store?.sessao().then(setSessao).catch(() => setSessao(null))
  }, [])

  if (!store)
    return (
      <div className="mx-auto max-w-xl px-5 py-24">
        <h1 className="titulo text-5xl">Painel ainda não conectado</h1>
        <p className="mt-4 text-tinta-suave">
          Falta conectar o banco de dados (Supabase). Peça para quem montou o site seguir o passo a passo do arquivo <code>supabase/LEIA-ME.md</code>.
        </p>
      </div>
    )
  if (sessao === undefined) return <p className="p-10 text-center text-tinta-suave">Carregando…</p>
  if (!sessao) return <Login s={store} aoEntrar={setSessao} tema={tema} />
  return <Central s={store} email={sessao} aoSair={() => setSessao(null)} tema={tema} />
}

// ---------------------------------------------------------------- login
function Login({ s, aoEntrar, tema }: { s: Store; aoEntrar: (email: string) => void; tema: { escuro: boolean; alternar: () => void } }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    try {
      await s.entrar(email.trim(), senha)
      aoEntrar((await s.sessao()) ?? email)
    } catch (err) {
      setErro((err as Error).message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[#f5f5f5] px-5">
      <form onSubmit={enviar} className="relative w-full max-w-sm rounded-lg bg-white p-8 shadow-suave">
        <BotaoTema escuro={tema.escuro} alternar={tema.alternar} className="absolute right-3 top-3 !text-tinta hover:!bg-black/5" />
        <p className="titulo text-4xl">PorcelanArt</p>
        <h1 className="mt-1 text-lg font-medium text-tinta">Central do Vendedor</h1>
        {s.demo && <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-900">Modo demonstração: os dados ficam só neste navegador. Qualquer e-mail entra.</p>}
        <label className={`${rotuloCampo} mt-6`} htmlFor="em">E-mail</label>
        <input id="em" type="email" required autoComplete="username" className={campo} value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className={`${rotuloCampo} mt-4`} htmlFor="se">Senha</label>
        <input id="se" type="password" required={!s.demo} autoComplete="current-password" className={campo} value={senha} onChange={(e) => setSenha(e.target.value)} />
        {erro && <p role="alert" className="mt-3 text-sm text-red-700">{erro}</p>}
        <button className={`${btnPrimario} mt-6 w-full`} disabled={carregando}>{carregando ? 'Entrando…' : 'Entrar'}</button>
        <Link to="/" className="mt-5 block text-center text-sm text-tinta-suave underline">Voltar ao site</Link>
      </form>
    </div>
  )
}

// ---------------------------------------------------------------- estrutura geral
function Central({ s, email, aoSair, tema }: { s: Store; email: string; aoSair: () => void; tema: { escuro: boolean; alternar: () => void } }) {
  const [aba, setAba] = useState<Aba>('geral')
  const [filtroProdutos, setFiltroProdutos] = useState<Filtro>('todos')
  const [kits, setKits] = useState<Produto[] | null>(null)
  const [pecas, setPecas] = useState<Peca[] | null>(null)
  const [aviso, setAviso] = useState<{ t: string; erro?: boolean } | null>(null)
  const [menuAberto, setMenuAberto] = useState(false)

  const avisar = useCallback((t: string, erro = false) => {
    setAviso({ t, erro })
    window.setTimeout(() => setAviso(null), erro ? 6000 : 2800)
  }, [])

  const carregar = useCallback(async () => {
    try {
      const [k, p] = await Promise.all([s.listarKits(), s.listarPecas()])
      setKits(k)
      setPecas(p)
    } catch (e) {
      avisar('Não foi possível carregar: ' + (e as Error).message, true)
    }
  }, [s, avisar])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const itens: [Aba, string, number | null][] = [
    ['geral', 'Visão geral', null],
    ['produtos', 'Meus produtos', kits?.length ?? null],
    ['pecas', 'Peças para montar kit', pecas?.length ?? null],
  ]

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-tinta">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-indigo px-4 text-white">
        <div className="flex items-center gap-3">
          <button className="grid h-10 w-10 place-items-center rounded-md hover:bg-white/10 md:hidden" aria-label="Menu" onClick={() => setMenuAberto((v) => !v)}>
            <span className="text-2xl leading-none">☰</span>
          </button>
          <span className="titulo !text-white text-2xl tracking-[0.06em]">PorcelanArt</span>
          <span className="hidden text-sm text-white/80 sm:inline">| Central do Vendedor</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden max-w-[220px] truncate text-white/80 sm:inline">{email}</span>
          <BotaoTema escuro={tema.escuro} alternar={tema.alternar} />
          <Link to="/" target="_blank" className="rounded-md px-3 py-2 hover:bg-white/10">Ver site</Link>
          <button className="rounded-md bg-white/15 px-3 py-2 hover:bg-white/25" onClick={async () => { await s.sair(); aoSair() }}>Sair</button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1300px]">
        <nav aria-label="Menu do painel" className={`${menuAberto ? 'block' : 'hidden'} fixed inset-x-0 top-14 z-20 border-b border-black/10 bg-white p-3 md:sticky md:top-14 md:block md:h-[calc(100vh-56px)] md:w-60 md:shrink-0 md:border-b-0 md:border-r`}>
          {itens.map(([id, nome, n]) => (
            <button
              key={id}
              onClick={() => { setAba(id); setMenuAberto(false) }}
              aria-current={aba === id ? 'page' : undefined}
              className={`mb-1 flex w-full items-center justify-between rounded-md px-3 py-3 text-left text-[15px] ${aba === id ? 'bg-laranja/15 font-medium text-[#8a3606]' : 'hover:bg-black/5'}`}
            >
              {nome}
              {n !== null && <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">{n}</span>}
            </button>
          ))}
          {s.demo && <p className="mt-4 rounded-md bg-amber-50 p-3 text-xs text-amber-900">Modo demonstração: dados só neste navegador.</p>}
        </nav>

        <main className="min-w-0 flex-1 p-4 md:p-6">
          {aba === 'geral' && <Geral s={s} kits={kits} pecas={pecas} ir={(a, f) => { setFiltroProdutos(f ?? 'todos'); setAba(a) }} recarregar={carregar} avisar={avisar} />}
          {aba === 'produtos' && <Produtos key={filtroProdutos} s={s} kits={kits} recarregar={carregar} avisar={avisar} filtroInicial={filtroProdutos} />}
          {aba === 'pecas' && <Pecas s={s} pecas={pecas} recarregar={carregar} avisar={avisar} />}
        </main>
      </div>

      {aviso && (
        <div role="status" className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-md px-5 py-3 text-sm text-white shadow-cartao ${aviso.erro ? 'bg-red-700' : 'bg-tinta'}`}>
          {aviso.t}
        </div>
      )}
    </div>
  )
}

type Comum = { s: Store; recarregar: () => Promise<void>; avisar: (t: string, erro?: boolean) => void }

// ---------------------------------------------------------------- visão geral
function Geral({ s, kits, pecas, ir, recarregar, avisar }: Comum & { kits: Produto[] | null; pecas: Peca[] | null; ir: (a: Aba, f?: Filtro) => void }) {
  const [importando, setImportando] = useState(false)
  const conta = (st: Status) => kits?.filter((k) => (k.status ?? 'ativo') === st).length ?? 0

  const importar = async () => {
    if (!confirm('Trazer para o painel os produtos que já estão no site? Depois você poderá editar, esconder ou apagar cada um.')) return
    setImportando(true)
    try {
      for (const k of catalogoAtualComoLinhas()) await s.salvarKit(k)
      await recarregar()
      avisar('Catálogo importado! Agora é só editar.')
    } catch (e) {
      avisar('Erro ao importar: ' + (e as Error).message, true)
    } finally {
      setImportando(false)
    }
  }

  const pendencias = (kits ?? []).filter((k) => !qualidade(k).ok).length
  const semPreco = (pecas ?? []).filter((p) => p.preco == null).length
  const semFoto = (kits ?? []).filter((k) => k.fotos.length === 0).length

  const cartoes: [string, number, string, Aba, Filtro?][] = [
    ['No ar', conta('ativo'), 'text-green-700', 'produtos', 'ativo'],
    ['Esgotados', conta('esgotado'), 'text-amber-700', 'produtos', 'esgotado'],
    ['Ocultos', conta('oculto'), 'text-tinta-suave', 'produtos', 'oculto'],
    ['Peças p/ montar kit', pecas?.length ?? 0, 'text-indigo', 'pecas'],
  ]
  const afazer: [string, number, string, Aba, Filtro?][] = [
    ['Produtos que precisam de melhoria', pendencias, 'Fotos, descrição ou destaques faltando', 'produtos', 'pendencias'],
    ['Produtos esgotados', conta('esgotado'), 'Volte quando o fornecedor repor', 'produtos', 'esgotado'],
    ['Produtos sem foto', semFoto, 'Sem foto quase ninguém clica', 'produtos', 'pendencias'],
    ['Peças sem preço base', semPreco, 'O cliente vê “sob consulta”', 'pecas'],
  ]

  return (
    <div>
      <h1 className="text-2xl font-medium">Visão geral</h1>

      <section className="mt-5 rounded-lg bg-white p-5 shadow-suave">
        <h2 className="font-medium">A fazer</h2>
        <p className="text-sm text-tinta-suave">Coisas que merecem sua atenção hoje.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {afazer.map(([t, n, dica, aba, f]) => (
            <button key={t} onClick={() => ir(aba, f)} className="rounded-md border border-black/10 p-4 text-left hover:border-laranja hover:bg-laranja/5">
              <span className={`block text-3xl font-medium ${n > 0 ? 'text-[#b4470a]' : 'text-green-700'}`}>{n}</span>
              <span className="mt-1 block text-sm font-medium">{t}</span>
              <span className="mt-0.5 block text-xs text-tinta-suave">{dica}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cartoes.map(([t, n, cor, aba, f]) => (
          <button key={t} onClick={() => ir(aba, f)} className="rounded-lg bg-white p-5 text-left shadow-suave hover:shadow-cartao">
            <span className="text-sm text-tinta-suave">{t}</span>
            <span className={`mt-1 block text-4xl font-medium ${cor}`}>{n}</span>
          </button>
        ))}
      </div>

      {kits && kits.length === 0 && (
        <div className="mt-6 rounded-lg border border-laranja/40 bg-white p-5">
          <h2 className="font-medium">Seus produtos ainda não estão no painel</h2>
          <p className="mt-1 text-sm text-tinta-suave">O site já mostra {catalogoAtualComoLinhas().length} produtos. Traga todos para cá para poder marcar como esgotado, esconder ou editar.</p>
          <button className={`${btnLaranja} mt-4`} onClick={importar} disabled={importando}>{importando ? 'Importando…' : 'Importar catálogo atual'}</button>
        </div>
      )}

      <div className="mt-6 rounded-lg bg-white p-5 text-[15px] leading-relaxed text-tinta-suave shadow-suave">
        <h2 className="font-medium text-tinta">Como funciona</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li><b>Meus produtos:</b> mude o status (No ar, Esgotado, Oculto), adicione, edite ou apague kits.</li>
          <li><b>Peças para montar kit:</b> cadastre xícaras, pires, pratos, bandejas etc. com o <b>preço base</b>. O cliente vê como <i>“a partir de”</i>.</li>
          <li>As mudanças aparecem no site na hora.</li>
        </ul>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- lista de produtos
type Filtro = 'todos' | Status | 'pendencias'
type Ordem = 'ordem' | 'nome' | 'status' | 'qualidade'

/** "Qualidade do anúncio": o que falta para o produto vender melhor. */
export function qualidade(k: Pick<Produto, 'fotos' | 'descricao' | 'resumo' | 'detalhes'>) {
  const faltas: string[] = []
  if (k.fotos.length < 3) faltas.push('Adicione pelo menos 3 fotos')
  if (k.descricao.trim().length < 60) faltas.push('A descrição está curta (mínimo 60 letras)')
  if (!k.resumo.trim()) faltas.push('Falta o resumo do cartão')
  if (!k.detalhes.length) faltas.push('Adicione destaques (ex.: “Inicial em ouro”)')
  return { faltas, ok: faltas.length === 0 }
}

function Interruptor({ ligado, aoMudar, rotulo }: { ligado: boolean; aoMudar: (v: boolean) => void; rotulo: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      aria-label={rotulo}
      onClick={() => aoMudar(!ligado)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${ligado ? 'bg-green-600' : 'bg-black/25'}`}
    >
      <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${ligado ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  )
}

function Produtos({ s, kits, recarregar, avisar, filtroInicial = 'todos' }: Comum & { kits: Produto[] | null; filtroInicial?: Filtro }) {
  const [filtro, setFiltro] = useState<Filtro>(filtroInicial)
  const [busca, setBusca] = useState('')
  const [cat, setCat] = useState('')
  const [ordem, setOrdem] = useState<Ordem>('ordem')
  const [marcados, setMarcados] = useState<Set<string>>(new Set())
  const [editando, setEditando] = useState<NovoProduto | null>(null)
  const [ocupado, setOcupado] = useState(false)

  const st = (k: Produto) => (k.status ?? 'ativo') as Status
  const cats = useMemo(() => [...new Set((kits ?? []).map((k) => k.categoria))], [kits])

  const lista = useMemo(() => {
    const b = busca.trim().toLowerCase()
    const l = (kits ?? []).filter(
      (k) =>
        (filtro === 'todos' || (filtro === 'pendencias' ? !qualidade(k).ok : st(k) === filtro)) &&
        (!cat || k.categoria === cat) &&
        (!b || k.nome.toLowerCase().includes(b) || k.categoria.toLowerCase().includes(b)),
    )
    const peso: Record<Status, number> = { ativo: 0, esgotado: 1, oculto: 2 }
    return [...l].sort((x, y) =>
      ordem === 'nome' ? x.nome.localeCompare(y.nome, 'pt-BR') : ordem === 'status' ? peso[st(x)] - peso[st(y)] : ordem === 'qualidade' ? qualidade(x).faltas.length - qualidade(y).faltas.length : (x.ordem ?? 0) - (y.ordem ?? 0),
    )
  }, [kits, filtro, busca, cat, ordem])

  const contar = (f: Filtro) => (kits ?? []).filter((k) => f === 'todos' || (f === 'pendencias' ? !qualidade(k).ok : st(k) === f)).length

  if (editando)
    return (
      <FormProduto
        s={s}
        inicial={editando}
        existentes={kits ?? []}
        fechar={() => setEditando(null)}
        salvo={async () => { setEditando(null); await recarregar(); avisar('Produto salvo!') }}
        avisar={avisar}
      />
    )

  const novo = (): NovoProduto => ({ slug: '', nome: '', categoria: '', resumo: '', descricao: '', detalhes: [], fotos: [], variacoes: [], preco: null, status: 'ativo', ordem: 0 })

  const emLote = async (ids: string[], acao: (id: string) => Promise<void>, ok: string) => {
    setOcupado(true)
    try {
      for (const id of ids) await acao(id)
      await recarregar()
      setMarcados(new Set())
      avisar(ok)
    } catch (e) {
      avisar((e as Error).message, true)
    } finally {
      setOcupado(false)
    }
  }
  const status = (ids: string[], novoSt: Status) => emLote(ids, (id) => s.statusKit(id, novoSt), `${ids.length} produto(s): ${STATUS_ROTULO[novoSt]}`)
  const apagar = async (ids: string[]) => {
    if (!confirm(`Apagar ${ids.length} produto(s) de vez? Isso não pode ser desfeito.\n\n(Se só quer tirar do ar por um tempo, use “Oculto”.)`)) return
    await emLote(ids, (id) => s.removerKit(id), 'Apagado.')
  }
  const duplicar = (k: Produto) => setEditando({ ...k, id: undefined, slug: '', nome: `${k.nome} (cópia)`, status: 'oculto' })

  const idsLista = lista.map((k) => k.id!)
  const todosMarcados = idsLista.length > 0 && idsLista.every((id) => marcados.has(id))
  const alterna = (id: string) => setMarcados((m) => { const n = new Set(m); if (n.has(id)) n.delete(id); else n.add(id); return n })
  const abas: [Filtro, string][] = [['todos', 'Todos'], ['ativo', 'No ar'], ['esgotado', 'Esgotados'], ['oculto', 'Ocultos'], ['pendencias', 'Precisam de melhoria']]
  const sel = [...marcados]

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-medium">Meus produtos</h1>
        <button className={btnLaranja} onClick={() => setEditando(novo())}>+ Adicionar novo produto</button>
      </div>

      <div className="mt-5 rounded-lg bg-white shadow-suave">
        <div className="sem-barra flex items-center gap-1 overflow-x-auto border-b border-black/10 px-3 pt-2">
          {abas.map(([f, nome]) => (
            <button key={f} onClick={() => { setFiltro(f); setMarcados(new Set()) }} className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-[15px] ${filtro === f ? 'border-laranja font-medium text-[#8a3606]' : 'border-transparent text-tinta-suave hover:text-tinta'}`}>
              {nome} ({contar(f)})
            </button>
          ))}
        </div>

        <div className="grid gap-2 p-3 md:grid-cols-[1fr_200px_200px]">
          <input className={campo} placeholder="Buscar por nome ou categoria" aria-label="Buscar produtos" value={busca} onChange={(e) => setBusca(e.target.value)} />
          <select className={campo} aria-label="Filtrar por categoria" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">Todas as categorias</option>
            {cats.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className={campo} aria-label="Ordenar por" value={ordem} onChange={(e) => setOrdem(e.target.value as Ordem)}>
            <option value="ordem">Ordem do site</option>
            <option value="nome">Nome (A–Z)</option>
            <option value="status">Situação</option>
            <option value="qualidade">Qualidade do anúncio</option>
          </select>
        </div>

        {sel.length > 0 ? (
          <div className="sticky top-14 z-10 flex flex-wrap items-center gap-2 border-y border-indigo/30 bg-indigo/5 px-3 py-2" role="region" aria-label="Ações em lote">
            <span className="mr-2 text-sm font-medium">{sel.length} selecionado(s)</span>
            <button className={btnLinha} disabled={ocupado} onClick={() => status(sel, 'ativo')}>Colocar no ar</button>
            <button className={btnLinha} disabled={ocupado} onClick={() => status(sel, 'esgotado')}>Marcar esgotado</button>
            <button className={btnLinha} disabled={ocupado} onClick={() => status(sel, 'oculto')}>Ocultar</button>
            <button className={btnPerigo} disabled={ocupado} onClick={() => apagar(sel)}>Apagar</button>
            <button className="ml-auto text-sm underline" onClick={() => setMarcados(new Set())}>Limpar seleção</button>
          </div>
        ) : (
          lista.length > 0 && (
            <label className="flex min-h-[44px] items-center gap-3 border-y border-black/10 bg-black/[0.03] px-4 text-sm text-tinta-suave">
              <input type="checkbox" className="h-5 w-5" checked={todosMarcados} onChange={() => setMarcados(new Set(idsLista))} /> Selecionar todos ({lista.length})
            </label>
          )
        )}

        {kits === null ? (
          <p className="p-6 text-tinta-suave">Carregando…</p>
        ) : lista.length === 0 ? (
          <p className="p-6 text-tinta-suave">{kits.length === 0 ? 'Nenhum produto cadastrado ainda. Use “Importar catálogo atual” na Visão geral ou adicione um novo.' : 'Nenhum produto encontrado com esses filtros.'}</p>
        ) : (
          <ul className="divide-y divide-black/10">
            {lista.map((k) => {
              const q = qualidade(k)
              return (
                <li key={k.id} className={`flex flex-wrap items-center gap-3 p-3 md:flex-nowrap ${marcados.has(k.id!) ? 'bg-indigo/5' : ''}`}>
                  <input type="checkbox" className="h-5 w-5 shrink-0" aria-label={`Selecionar ${k.nome}`} checked={marcados.has(k.id!)} onChange={() => alterna(k.id!)} />
                  <img src={foto(k.fotos[0])} alt="" className="h-16 w-16 shrink-0 rounded-md bg-black/5 object-cover" />
                  <div className="min-w-0 flex-1 basis-40">
                    <p className="truncate font-medium">{k.nome}</p>
                    <p className="truncate text-sm text-tinta-suave">{k.categoria}{k.preco ? ` · ${aPartirDe(k.preco)}` : ''}{k.variacoes?.length ? ` · ${k.variacoes.length} variação(ões)` : ''}</p>
                    <p className={`mt-0.5 text-xs ${q.ok ? 'text-green-700' : 'text-amber-800'}`} title={q.faltas.join('\n')}>
                      {q.ok ? '✓ Anúncio completo' : `⚠ Melhorar: ${q.faltas[0]}${q.faltas.length > 1 ? ` (+${q.faltas.length - 1})` : ''}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2" title="Liga/desliga a venda deste produto no site">
                    <Interruptor ligado={st(k) === 'ativo'} rotulo={`${k.nome}: no ar`} aoMudar={(v) => status([k.id!], v ? 'ativo' : 'oculto')} />
                    <select aria-label={`Situação de ${k.nome}`} value={st(k)} onChange={(e) => status([k.id!], e.target.value as Status)} className={`min-h-[40px] rounded-full border px-3 text-sm font-medium ${COR_STATUS[st(k)]}`}>
                      {(Object.keys(STATUS_ROTULO) as Status[]).map((x) => <option key={x} value={x}>{STATUS_ROTULO[x]}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className={btnLinha} onClick={() => setEditando(k)}>Editar</button>
                    <Link className={btnLinha} to={`/peca/${k.slug}`} target="_blank" title="Ver como o cliente vê">Ver no site</Link>
                    <button className={btnLinha} onClick={() => duplicar(k)} title="Criar uma cópia para editar">Duplicar</button>
                    <button className={btnPerigo} onClick={() => apagar([k.id!])}>Apagar</button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- upload de fotos
function useEnvioFotos(s: Store, avisar: Comum['avisar']) {
  const [enviando, setEnviando] = useState(0)
  const enviar = async (arquivos: FileList | File[]): Promise<string[]> => {
    const ok: string[] = []
    for (const a of Array.from(arquivos)) {
      if (!a.type.startsWith('image/')) { avisar(`“${a.name}” não é uma imagem.`, true); continue }
      setEnviando((n) => n + 1)
      try {
        ok.push(await s.enviarFoto(a))
      } catch (e) {
        avisar((e as Error).message, true)
      } finally {
        setEnviando((n) => n - 1)
      }
    }
    return ok
  }
  return { enviar, enviando }
}

// ---------------------------------------------------------------- formulário de produto
function FormProduto({ s, inicial, existentes, fechar, salvo, avisar }: { s: Store; inicial: NovoProduto; existentes: Produto[]; fechar: () => void; salvo: () => Promise<void>; avisar: Comum['avisar'] }) {
  const [p, setP] = useState<NovoProduto>({ ...inicial, fotos: [...inicial.fotos], detalhes: [...inicial.detalhes], variacoes: (inicial.variacoes ?? []).map((v) => ({ ...v, opcoes: [...v.opcoes] })) })
  const [preco, setPreco] = useState(inicial.preco != null ? String(inicial.preco).replace('.', ',') : '')
  const [detalheNovo, setDetalheNovo] = useState('')
  const [gravando, setGravando] = useState(false)
  const { enviar, enviando } = useEnvioFotos(s, avisar)
  const inputFoto = useRef<HTMLInputElement>(null)
  const cats = [...new Set([...existentes.map((k) => k.categoria), ...SUGESTOES_CATEGORIA])]

  const set = <K extends keyof NovoProduto>(k: K, v: NovoProduto[K]) => setP((x) => ({ ...x, [k]: v }))
  const mover = (i: number, d: number) => setP((x) => {
    const f = [...x.fotos]; const j = i + d
    if (j < 0 || j >= f.length) return x
    ;[f[i], f[j]] = [f[j], f[i]]
    return { ...x, fotos: f }
  })

  const addFotos = async (l: FileList | null) => {
    if (!l?.length) return
    const vagas = MAX_FOTOS - p.fotos.length
    if (l.length > vagas) avisar(`Cabem no máximo ${MAX_FOTOS} fotos. Foram enviadas só ${vagas}.`, true)
    const urls = await enviar(Array.from(l).slice(0, Math.max(vagas, 0)))
    if (urls.length) setP((x) => ({ ...x, fotos: [...x.fotos, ...urls].slice(0, MAX_FOTOS) }))
    if (inputFoto.current) inputFoto.current.value = ''
  }

  const addDetalhe = () => {
    const t = detalheNovo.trim()
    if (t) set('detalhes', [...p.detalhes, t])
    setDetalheNovo('')
  }
  const setVar = (i: number, v: Variacao) => set('variacoes', (p.variacoes ?? []).map((x, k) => (k === i ? v : x)))

  const gravar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!p.nome.trim()) return avisar('Dê um título ao produto.', true)
    if (!p.categoria.trim()) return avisar('Escolha ou digite a categoria (ex.: Boleira, Xícaras, Pratos).', true)
    if (!p.fotos.length && !confirm('Este produto está sem fotos. Salvar mesmo assim?')) return
    const n = Number(preco.replace(/\./g, '').replace(',', '.'))
    if (preco.trim() && (!Number.isFinite(n) || n < 0)) return avisar('O preço base está inválido.', true)
    let slug = p.slug
    if (!slug) {
      const base = slugDe(p.nome)
      const usados = new Set(existentes.map((k) => k.slug))
      slug = base
      for (let i = 2; usados.has(slug); i++) slug = `${base}-${i}`
    }
    const limpo: NovoProduto = {
      ...p,
      slug,
      nome: p.nome.trim(),
      categoria: p.categoria.trim(),
      resumo: p.resumo.trim(),
      descricao: p.descricao.trim(),
      preco: preco.trim() ? n : null,
      variacoes: (p.variacoes ?? []).filter((v) => v.nome.trim() && v.opcoes.length).map((v) => ({ nome: v.nome.trim(), opcoes: v.opcoes })),
    }
    setGravando(true)
    try {
      await s.salvarKit(limpo)
      await salvo()
    } catch (err) {
      avisar('Não foi possível salvar: ' + (err as Error).message, true)
      setGravando(false)
    }
  }

  return (
    <form onSubmit={gravar}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-medium">{inicial.id ? 'Editar produto' : 'Adicionar novo produto'}</h1>
        <div className="flex gap-2">
          <button type="button" className={btnLinha} onClick={fechar}>Cancelar</button>
          <button className={btnLaranja} disabled={gravando || enviando > 0}>{gravando ? 'Salvando…' : 'Salvar'}</button>
        </div>
      </div>

      <section className="mt-5 rounded-lg bg-white p-5 shadow-suave">
        <h2 className="text-lg font-medium">Informação básica</h2>
        <h3 className="mt-4 font-medium">Imagens do Produto</h3>
        <p className="mt-3 text-sm"><span className="text-red-600">*</span> Imagem 1:1 <span className="text-tinta-suave">— a primeira é a foto de capa. Use as setas para reordenar.</span></p>
        <div className="mt-2 flex flex-wrap gap-3">
          {p.fotos.map((f, i) => (
            <div key={String(f) + i} className="w-28">
              <div className="relative overflow-hidden rounded-md border border-black/15">
                <img src={foto(f)} alt={`Foto ${i + 1}`} className="aspect-square w-28 bg-black/5 object-cover" />
                {i === 0 && <span className="absolute inset-x-0 bottom-0 bg-black/60 py-1 text-center text-xs text-white"><span className="text-red-400">*</span> De capa</span>}
              </div>
              <div className="mt-1 flex justify-between">
                <button type="button" className="h-9 w-9 rounded border border-black/20 disabled:opacity-40" aria-label="Mover para trás" disabled={i === 0} onClick={() => mover(i, -1)}>←</button>
                <button type="button" className="h-9 w-9 rounded border border-black/20 text-red-700" aria-label="Remover foto" onClick={() => set('fotos', p.fotos.filter((_, k) => k !== i))}>✕</button>
                <button type="button" className="h-9 w-9 rounded border border-black/20 disabled:opacity-40" aria-label="Mover para frente" disabled={i === p.fotos.length - 1} onClick={() => mover(i, 1)}>→</button>
              </div>
            </div>
          ))}
          {p.fotos.length < MAX_FOTOS && (
            <button type="button" onClick={() => inputFoto.current?.click()} className="grid h-28 w-28 place-items-center rounded-md border-2 border-dashed border-black/30 p-2 text-center text-sm text-[#b4470a] hover:border-laranja hover:bg-laranja/5">
              {enviando ? 'Enviando…' : <span>＋<br />Adicionar Imagem<br />({p.fotos.length}/{MAX_FOTOS})</span>}
            </button>
          )}
          <input ref={inputFoto} type="file" accept="image/*" multiple hidden onChange={(e) => addFotos(e.target.files)} />
        </div>
      </section>

      <section className="mt-4 grid gap-4 rounded-lg bg-white p-5 shadow-suave md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={rotuloCampo} htmlFor="nome"><span className="text-red-600">*</span> Nome do Produto</label>
          <div className="relative">
            <input id="nome" className={`${campo} pr-20`} value={p.nome} maxLength={120} onChange={(e) => set('nome', e.target.value)} placeholder="Ex.: Kit Chá com Bule e Xícara" required />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-tinta-suave">{p.nome.length}/120</span>
          </div>
        </div>
        <div>
          <label className={rotuloCampo} htmlFor="cat"><span className="text-red-600">*</span> Categoria</label>
          <input id="cat" className={campo} list="cats" value={p.categoria} onChange={(e) => set('categoria', e.target.value)} placeholder="Ex.: Boleira, Xícaras, Pratos" maxLength={40} required />
          <p className="mt-1 text-xs text-tinta-suave">Digite o nome da categoria. Ela vira um filtro no site.</p>
          <datalist id="cats">{cats.map((c) => <option key={c} value={c} />)}</datalist>
        </div>
        <div>
          <label className={rotuloCampo} htmlFor="preco">Preço base (a partir de) — opcional</label>
          <div className="flex items-center gap-2">
            <span className="text-tinta-suave">R$</span>
            <input id="preco" className={campo} inputMode="decimal" value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="Ex.: 89,90" />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className={rotuloCampo} htmlFor="resumo">Resumo (frase curta que aparece no cartão)</label>
          <input id="resumo" className={campo} value={p.resumo} maxLength={140} onChange={(e) => set('resumo', e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className={rotuloCampo} htmlFor="desc">Descrição</label>
          <textarea id="desc" rows={5} className={campo} value={p.descricao} onChange={(e) => set('descricao', e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className={rotuloCampo} htmlFor="det">Destaques (um por vez; Enter para adicionar)</label>
          <div className="flex gap-2">
            <input id="det" className={campo} value={detalheNovo} onChange={(e) => setDetalheNovo(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDetalhe() } }} placeholder="Ex.: Inicial em ouro" />
            <button type="button" className={btnLinha} onClick={addDetalhe}>Adicionar</button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {p.detalhes.map((d, i) => (
              <span key={d + i} className="inline-flex items-center gap-2 rounded-full bg-indigo/10 py-1 pl-3 pr-1 text-sm text-indigo">
                {d}
                <button type="button" aria-label={`Remover ${d}`} className="grid h-7 w-7 place-items-center rounded-full hover:bg-indigo/15" onClick={() => set('detalhes', p.detalhes.filter((_, k) => k !== i))}>✕</button>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-lg bg-white p-5 shadow-suave">
        <h2 className="font-medium">Variações</h2>
        <p className="text-sm text-tinta-suave">O cliente escolhe uma opção de cada variação antes de pedir. Ex.: <b>Cor</b> → Rosa, Azul · <b>Inicial</b> → A, B, C.</p>
        <div className="mt-3 space-y-3">
          {(p.variacoes ?? []).map((v, i) => (
            <VariacaoLinha key={i} v={v} aoMudar={(nv) => setVar(i, nv)} aoRemover={() => set('variacoes', (p.variacoes ?? []).filter((_, k) => k !== i))} />
          ))}
        </div>
        <button type="button" className={`${btnLinha} mt-3`} onClick={() => set('variacoes', [...(p.variacoes ?? []), { nome: '', opcoes: [] }])}>+ Adicionar variação</button>
      </section>

      <section className="mt-4 rounded-lg bg-white p-5 shadow-suave">
        <h2 className="font-medium">Situação no site</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {(Object.keys(STATUS_ROTULO) as Status[]).map((st) => (
            <label key={st} className={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md border px-4 ${p.status === st ? 'border-indigo bg-indigo/5' : 'border-black/20'}`}>
              <input type="radio" name="status" checked={p.status === st} onChange={() => set('status', st)} />
              {STATUS_ROTULO[st]}
              <span className="text-xs text-tinta-suave">{st === 'ativo' ? '(aparece e aceita pedidos)' : st === 'esgotado' ? '(aparece, sem pedido)' : '(não aparece)'}</span>
            </label>
          ))}
        </div>
      </section>

      <div className="mt-5 flex justify-end gap-2">
        <button type="button" className={btnLinha} onClick={fechar}>Cancelar</button>
        <button className={btnLaranja} disabled={gravando || enviando > 0}>{gravando ? 'Salvando…' : 'Salvar'}</button>
      </div>
    </form>
  )
}

function VariacaoLinha({ v, aoMudar, aoRemover }: { v: Variacao; aoMudar: (v: Variacao) => void; aoRemover: () => void }) {
  const [nova, setNova] = useState('')
  const add = () => {
    const t = nova.trim()
    if (t && !v.opcoes.includes(t)) aoMudar({ ...v, opcoes: [...v.opcoes, t] })
    setNova('')
  }
  return (
    <div className="rounded-md border border-black/15 p-3">
      <div className="flex gap-2">
        <input className={campo} aria-label="Nome da variação" placeholder="Nome (ex.: Cor)" value={v.nome} onChange={(e) => aoMudar({ ...v, nome: e.target.value })} />
        <button type="button" className={btnPerigo} onClick={aoRemover}>Remover</button>
      </div>
      <div className="mt-2 flex gap-2">
        <input className={campo} aria-label="Nova opção" placeholder="Opção (ex.: Rosa) e Enter" value={nova} onChange={(e) => setNova(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }} />
        <button type="button" className={btnLinha} onClick={add}>Adicionar</button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {v.opcoes.map((o) => (
          <span key={o} className="inline-flex items-center gap-2 rounded-full bg-black/5 py-1 pl-3 pr-1 text-sm">
            {o}
            <button type="button" aria-label={`Remover ${o}`} className="grid h-7 w-7 place-items-center rounded-full hover:bg-black/10" onClick={() => aoMudar({ ...v, opcoes: v.opcoes.filter((x) => x !== o) })}>✕</button>
          </span>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- peças do "montar kit"
const TIPOS_FIXOS = ['Xícara', 'Pires', 'Prato', 'Bandeja', 'Caneca', 'Bule']
const TIPOS_SUGERIDOS = [...TIPOS_FIXOS, 'Prato de sobremesa', 'Tigela', 'Copo']

function Pecas({ s, pecas, recarregar, avisar }: Comum & { pecas: Peca[] | null }) {
  /** qual seção está com o formulário de "modelo" aberto (e qual modelo, se for edição) */
  const [aberto, setAberto] = useState<{ tipo: string; peca: NovaPeca } | null>(null)
  const [novoTipo, setNovoTipo] = useState('')
  const [tiposExtras, setTiposExtras] = useState<string[]>([])

  const secoes = useMemo(() => {
    const m = new Map<string, Peca[]>(TIPOS_FIXOS.map((t) => [t, []]))
    for (const p of pecas ?? []) m.set(p.tipo, [...(m.get(p.tipo) ?? []), p])
    for (const t of tiposExtras) if (!m.has(t)) m.set(t, [])
    return [...m.entries()]
  }, [pecas, tiposExtras])

  const abrirNovo = (tipo: string) =>
    setAberto({ tipo, peca: { tipo, modelo: '', preco: null, foto: null, status: 'ativo', ordem: (pecas?.length ?? 0) + 1 } })

  const remover = async (p: Peca) => {
    if (!confirm(`Apagar o modelo “${p.modelo}”?`)) return
    try { await s.removerPeca(p.id); await recarregar(); avisar('Modelo apagado.') } catch (e) { avisar((e as Error).message, true) }
  }
  const mudarStatus = async (p: Peca, st: Status) => {
    try { await s.salvarPeca({ ...p, status: st }); await recarregar() } catch (e) { avisar((e as Error).message, true) }
  }
  const criarTipo = () => {
    const t = novoTipo.trim()
    if (!t) return
    if (!secoes.some(([x]) => x.toLowerCase() === t.toLowerCase())) setTiposExtras((x) => [...x, t])
    setNovoTipo('')
    abrirNovo(t)
  }

  return (
    <div>
      <h1 className="text-2xl font-medium">Peças para “Montar meu próprio kit”</h1>
      <p className="mt-2 max-w-2xl text-sm text-tinta-suave">
        Para cada item (xícara, pires, prato, bandeja…) cadastre <b>quantos modelos quiser</b>: nome do modelo + foto. O cliente escolhe a quantidade de cada modelo no site.
        O preço é o <b>preço base</b>: aparece como “a partir de”, porque o valor final depende da personalização.
      </p>

      <div className="mt-5 space-y-4">
        {pecas === null && <p className="text-tinta-suave">Carregando…</p>}
        {secoes.map(([tipo, itens]) => (
          <section key={tipo} className="rounded-lg bg-white shadow-suave" aria-label={`Modelos de ${tipo}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 px-4 py-3">
              <h2 className="text-lg font-medium">
                {tipo} <span className="text-sm font-normal text-tinta-suave">({itens.length} modelo{itens.length === 1 ? '' : 's'})</span>
              </h2>
              <button className={btnLaranja} onClick={() => abrirNovo(tipo)}>
                + {itens.length ? 'Adicionar outro modelo' : 'Adicionar modelo'}
              </button>
            </div>

            {aberto?.tipo === tipo && (
              <div className="p-4">
                <FormPeca
                  key={aberto.peca.id ?? 'novo'}
                  s={s}
                  inicial={aberto.peca}
                  tipoFixo={tipo}
                  tipos={TIPOS_SUGERIDOS}
                  fechar={() => setAberto(null)}
                  salvo={async () => { setAberto(null); await recarregar(); avisar('Modelo salvo!') }}
                  avisar={avisar}
                />
              </div>
            )}

            {itens.length === 0 && aberto?.tipo !== tipo ? (
              <p className="p-4 text-sm text-tinta-suave">Nenhum modelo de {tipo.toLowerCase()} ainda. Clique em “Adicionar modelo”.</p>
            ) : (
              <ul className="divide-y divide-black/10">
                {itens.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center gap-3 p-3 md:flex-nowrap">
                    <img src={foto(p.foto)} alt="" className="h-16 w-16 shrink-0 rounded-md bg-black/5 object-cover" />
                    <div className="min-w-0 flex-1 basis-36">
                      <p className="truncate font-medium">{p.modelo}</p>
                      <p className="text-sm text-tinta-suave">{p.preco != null ? aPartirDe(p.preco) : 'Sob consulta'}</p>
                    </div>
                    <select aria-label={`Situação de ${p.modelo}`} value={p.status} onChange={(e) => mudarStatus(p, e.target.value as Status)} className={`min-h-[40px] rounded-full border px-3 text-sm font-medium ${COR_STATUS[p.status]}`}>
                      {(Object.keys(STATUS_ROTULO) as Status[]).map((x) => <option key={x} value={x}>{STATUS_ROTULO[x]}</option>)}
                    </select>
                    <div className="flex gap-2">
                      <button className={btnLinha} onClick={() => setAberto({ tipo, peca: p })}>Editar</button>
                      <button className={btnPerigo} onClick={() => remover(p)}>Apagar</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section className="rounded-lg border-2 border-dashed border-black/20 bg-white p-4">
          <h2 className="font-medium">Outro tipo de peça</h2>
          <p className="text-sm text-tinta-suave">Precisa de algo além dos itens acima? Ex.: Copo, Tigela, Porta-guardanapo.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <input className={`${campo} max-w-xs`} aria-label="Nome do novo tipo de peça" list="tipos-novos" placeholder="Nome do tipo" value={novoTipo} onChange={(e) => setNovoTipo(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); criarTipo() } }} />
            <datalist id="tipos-novos">{TIPOS_SUGERIDOS.filter((t) => !TIPOS_FIXOS.includes(t)).map((t) => <option key={t} value={t} />)}</datalist>
            <button className={btnLinha} onClick={criarTipo}>Criar tipo e adicionar modelo</button>
          </div>
        </section>
      </div>
    </div>
  )
}

function FormPeca({ s, inicial, tipos, tipoFixo, fechar, salvo, avisar }: { s: Store; inicial: NovaPeca; tipos: string[]; tipoFixo?: string; fechar: () => void; salvo: () => Promise<void>; avisar: Comum['avisar'] }) {
  const [p, setP] = useState<NovaPeca>(inicial)
  const [preco, setPreco] = useState(inicial.preco != null ? String(inicial.preco).replace('.', ',') : '')
  const [gravando, setGravando] = useState(false)
  const { enviar, enviando } = useEnvioFotos(s, avisar)
  const input = useRef<HTMLInputElement>(null)

  const gravar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!p.tipo.trim() || !p.modelo.trim()) return avisar('Preencha o tipo e o nome do modelo.', true)
    const n = Number(preco.replace(/\./g, '').replace(',', '.'))
    if (preco.trim() && (!Number.isFinite(n) || n < 0)) return avisar('O preço base está inválido.', true)
    setGravando(true)
    try {
      await s.salvarPeca({ ...p, tipo: p.tipo.trim(), modelo: p.modelo.trim(), preco: preco.trim() ? n : null })
      await salvo()
    } catch (err) {
      avisar('Não foi possível salvar: ' + (err as Error).message, true)
      setGravando(false)
    }
  }

  return (
    <form onSubmit={gravar} className="rounded-lg border-2 border-indigo/30 bg-papel/60 p-5">
      <h3 className="font-medium">{inicial.id ? `Editar modelo de ${p.tipo.toLowerCase()}` : `Novo modelo de ${(tipoFixo ?? p.tipo).toLowerCase() || 'peça'}`}</h3>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div>
          <label className={rotuloCampo} htmlFor="tp">Tipo</label>
          <input id="tp" className={`${campo} ${tipoFixo ? 'bg-black/5' : ''}`} list="tipos" value={p.tipo} readOnly={Boolean(tipoFixo)} onChange={(e) => setP({ ...p, tipo: e.target.value })} placeholder="Xícara, Pires, Prato, Bandeja…" required />
          <datalist id="tipos">{tipos.map((t) => <option key={t} value={t} />)}</datalist>
        </div>
        <div>
          <label className={rotuloCampo} htmlFor="md"><span className="text-red-600">*</span> Nome do modelo</label>
          <input id="md" className={campo} value={p.modelo} onChange={(e) => setP({ ...p, modelo: e.target.value })} placeholder="Ex.: Rosas, Passarinhos, Lisa dourada" required />
        </div>
        <div>
          <label className={rotuloCampo} htmlFor="pp">Preço base (a partir de) — deixe vazio para “sob consulta”</label>
          <div className="flex items-center gap-2"><span className="text-tinta-suave">R$</span><input id="pp" className={campo} inputMode="decimal" value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="Ex.: 45,00" /></div>
        </div>
        <div>
          <span className={rotuloCampo}>Foto do modelo <span className="font-normal text-tinta-suave">(o cliente vê esta foto)</span></span>
          <div className="flex items-center gap-3">
            {p.foto && <img src={foto(p.foto)} alt="Foto do modelo" className="h-20 w-20 rounded-md object-cover" />}
            <button type="button" className={btnLinha} onClick={() => input.current?.click()}>{enviando ? 'Enviando…' : p.foto ? 'Trocar foto' : 'Escolher foto'}</button>
            {p.foto && <button type="button" className={btnPerigo} onClick={() => setP({ ...p, foto: null })}>Tirar</button>}
            <input ref={input} type="file" accept="image/*" hidden onChange={async (e) => { const u = await enviar(e.target.files ?? []); if (u[0]) setP((x) => ({ ...x, foto: u[0] })); e.target.value = '' }} />
          </div>
        </div>
        <div className="md:col-span-2">
          <span className={rotuloCampo}>Situação</span>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(STATUS_ROTULO) as Status[]).map((st) => (
              <label key={st} className={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md border px-4 ${p.status === st ? 'border-indigo bg-indigo/5' : 'border-black/20'}`}>
                <input type="radio" name="st" checked={p.status === st} onChange={() => setP({ ...p, status: st })} /> {STATUS_ROTULO[st]}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" className={btnLinha} onClick={fechar}>Cancelar</button>
        <button className={btnLaranja} disabled={gravando || enviando > 0}>{gravando ? 'Salvando…' : 'Salvar peça'}</button>
      </div>
    </form>
  )
}
