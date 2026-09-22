import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { STATUS_ROTULO, aPartirDe, foto, type Peca, type Produto, type Status, type Variacao } from '../data'
import { catalogoAtualComoLinhas, slugDe, store, type NovaPeca, type NovoProduto, type Store } from './store'

// ================================================================= estilos (feitos para toque: alvos de 44px+, texto de 16px)
const btn = 'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-5 text-[15px] font-medium transition-colors active:scale-[0.98] disabled:opacity-50'
const btnPrimario = `${btn} bg-indigo text-white hover:bg-[#1b3369] active:bg-[#1b3369]`
const btnLaranja = `${btn} bg-laranja text-white hover:bg-[#b4470a] active:bg-[#b4470a]`
const btnLinha = `${btn} border border-black/25 bg-white text-tinta hover:bg-black/5 active:bg-black/10`
const btnPerigo = `${btn} border border-red-300 bg-white text-red-700 hover:bg-red-50 active:bg-red-100`
const campo = 'min-h-[44px] w-full rounded-lg border border-black/25 bg-white px-3 py-2.5 text-base text-tinta outline-none focus:border-indigo focus:ring-2 focus:ring-indigo/20'
const rotuloCampo = 'mb-1.5 block text-[15px] font-medium text-tinta'
const ajuda = 'mt-1 text-sm text-tinta-suave'
const erroTxt = 'mt-1 text-sm font-medium text-red-700'

const COR_STATUS: Record<Status, string> = {
  ativo: 'border-green-600 bg-green-600 text-white',
  esgotado: 'border-amber-600 bg-amber-500 text-black',
  oculto: 'border-black/50 bg-black/60 text-white',
}
const DICA_STATUS: Record<Status, string> = {
  ativo: 'Aparece no site e o cliente pode pedir.',
  esgotado: 'Aparece no site, mas o cliente não consegue pedir.',
  oculto: 'Não aparece para nenhum cliente. Só você vê aqui.',
}
const ORDEM_STATUS: Status[] = ['ativo', 'esgotado', 'oculto']

type Aba = 'geral' | 'produtos' | 'pecas'
type Filtro = 'todos' | Status | 'pendencias'
const MAX_FOTOS = 9
const SUGESTOES_CATEGORIA = ['Xícaras', 'Canecas', 'Pratos', 'Bandejas', 'Boleiras', 'Bules', 'Kits', 'Decoração', 'Infantil']
const TIPOS_FIXOS = ['Xícara', 'Pires', 'Prato', 'Bandeja', 'Caneca', 'Bule']
const TIPOS_SUGERIDOS = [...TIPOS_FIXOS, 'Prato de sobremesa', 'Tigela', 'Copo']

// ================================================================= utilitários
const norm = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

/** "89,90" | "89.90" | "1.234,50" | "R$ 89" → número. Vazio ou 0 → null (sob consulta). Inválido → 'erro'. */
function lerPreco(txt: string): number | null | 'erro' {
  let t = txt.replace(/R\$/gi, '').replace(/\s/g, '')
  if (!t) return null
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.')
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '')
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return 'erro'
  const n = Number(t)
  return n > 0 ? n : null
}

const paraCampo = (n: number | null | undefined) => (n != null ? String(n).replace('.', ',') : '')

/** Mensagens gentis no lugar do texto técnico do servidor. */
function amigavel(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e)
  if (/failed to fetch|network|load failed/i.test(m)) return 'Sem internet no momento. Confira a conexão e tente de novo. O que você escreveu continua na tela.'
  if (/row-level security|permission|permiss/i.test(m)) return 'Sua conta não tem permissão para fazer isso. Saia e entre de novo; se continuar, avise quem cuida do site.'
  if (/duplicate|unique/i.test(m)) return 'Já existe um produto com esse nome. Mude um pouco o nome e salve de novo.'
  return `Não consegui concluir agora. Tente de novo em instantes. (${m})`
}

// ================================================================= avisos, confirmações
type Acao = { rotulo: string; fn: () => void }
type Aviso = { t: string; erro?: boolean; acao?: Acao }
type Avisar = (t: string, o?: boolean | { erro?: boolean; acao?: Acao }) => void
type Confirmar = (o: { titulo: string; texto: string; ok: string; perigo?: boolean; extra?: string }) => Promise<'ok' | 'extra' | null>

const ConfirmarCtx = createContext<Confirmar>(async () => null)
const useConfirmar = () => useContext(ConfirmarCtx)

type Comum = { s: Store; recarregar: () => Promise<void>; avisar: Avisar }

// ================================================================= modo escuro
const TEMA = 'pa_painel_tema'
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
type Tema = ReturnType<typeof useTema>

function BotaoTema({ tema, className = '' }: { tema: Tema; className?: string }) {
  return (
    <button
      type="button"
      onClick={tema.alternar}
      aria-pressed={tema.escuro}
      aria-label={tema.escuro ? 'Mudar para o modo claro' : 'Mudar para o modo escuro'}
      className={`grid h-11 w-11 place-items-center rounded-lg text-xl hover:bg-white/10 active:bg-white/20 ${className}`}
    >
      {tema.escuro ? '☀' : '☾'}
    </button>
  )
}

// ================================================================= peças pequenas de interface
function SeletorSituacao({ valor, aoMudar, nome, compacto = false }: { valor: Status; aoMudar: (s: Status) => void; nome: string; compacto?: boolean }) {
  return (
    <div role="radiogroup" aria-label={`Situação de ${nome}`} className="flex flex-wrap gap-1.5">
      {ORDEM_STATUS.map((st) => (
        <button
          key={st}
          type="button"
          role="radio"
          aria-checked={valor === st}
          onClick={() => valor !== st && aoMudar(st)}
          className={`min-h-[44px] rounded-full border px-4 text-[15px] font-medium transition-colors ${compacto ? 'px-3' : ''} ${valor === st ? COR_STATUS[st] : 'border-black/25 bg-white text-tinta hover:bg-black/5 active:bg-black/10'}`}
        >
          {STATUS_ROTULO[st]}
        </button>
      ))}
    </div>
  )
}

function Ficha({ t, children }: { t: string; children: React.ReactNode }) {
  return (
    <section className="mt-4 rounded-xl bg-white p-5 shadow-suave">
      <h2 className="text-lg font-medium">{t}</h2>
      {children}
    </section>
  )
}

/** "Assim o cliente vai ver" — prévia ao vivo do cartão do site. */
function Previa({ p, preco }: { p: NovoProduto; preco: number | null }) {
  return (
    <aside aria-label="Prévia do cartão no site" className="rounded-xl bg-white p-4 shadow-suave">
      <p className="mb-3 text-sm font-medium text-tinta-suave">Assim o cliente vai ver no site</p>
      <div className="overflow-hidden rounded-lg border border-black/10">
        <img src={foto(p.fotos[0])} alt="" className="aspect-[4/5] w-full bg-black/5 object-cover" />
        <div className="p-3">
          <p className="text-xs uppercase tracking-wider text-tinta-suave">{p.categoria || 'Categoria'}</p>
          <p className="mt-1 font-medium leading-tight">{p.nome || 'Nome do produto'}</p>
          {p.resumo && <p className="mt-1 text-sm text-tinta-suave">{p.resumo}</p>}
          {preco != null && <p className="mt-2 text-sm font-medium text-indigo">{aPartirDe(preco)}</p>}
          {p.status === 'esgotado' && <p className="mt-2 text-sm font-medium text-[#b4470a]">Sem estoque</p>}
        </div>
      </div>
    </aside>
  )
}

// ================================================================= entrada
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
        <p className="mt-4 text-tinta-suave">Falta conectar o banco de dados (Supabase). Veja o passo a passo em <code>supabase/LEIA-ME.md</code>.</p>
      </div>
    )
  if (sessao === undefined) return <p className="p-10 text-center text-tinta-suave">Carregando…</p>
  if (!sessao) return <Login s={store} aoEntrar={setSessao} tema={tema} />
  return <Central s={store} email={sessao} aoSair={() => setSessao(null)} tema={tema} />
}

function Login({ s, aoEntrar, tema }: { s: Store; aoEntrar: (email: string) => void; tema: Tema }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [ver, setVer] = useState(false)
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
    <div className="grid min-h-[100dvh] place-items-center bg-[#f5f5f5] px-5">
      <form onSubmit={enviar} className="relative w-full max-w-sm rounded-xl bg-white p-8 shadow-suave">
        <BotaoTema tema={tema} className="absolute right-3 top-3 !text-tinta hover:!bg-black/5" />
        <p className="titulo text-4xl">PorcelanArt</p>
        <h1 className="mt-1 text-lg font-medium text-tinta">Central do Vendedor</h1>
        {s.demo && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Modo demonstração: os dados ficam só neste navegador. Qualquer e-mail entra.</p>}
        <label className={`${rotuloCampo} mt-6`} htmlFor="em">E-mail</label>
        <input id="em" type="email" required autoComplete="username" className={campo} value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className={`${rotuloCampo} mt-4`} htmlFor="se">Senha</label>
        <div className="flex gap-2">
          <input id="se" type={ver ? 'text' : 'password'} required={!s.demo} autoComplete="current-password" className={campo} value={senha} onChange={(e) => setSenha(e.target.value)} />
          <button type="button" className={btnLinha} onClick={() => setVer((v) => !v)} aria-pressed={ver}>{ver ? 'Esconder' : 'Ver'}</button>
        </div>
        {erro && <p role="alert" className="mt-3 text-sm font-medium text-red-700">{erro}</p>}
        <button className={`${btnPrimario} mt-6 min-h-[48px] w-full`} disabled={carregando}>{carregando ? 'Entrando…' : 'Entrar'}</button>
        <Link to="/" className="mt-5 flex min-h-[44px] items-center justify-center text-sm text-tinta-suave underline">Voltar ao site</Link>
      </form>
    </div>
  )
}

// ================================================================= estrutura geral
function Central({ s, email, aoSair, tema }: { s: Store; email: string; aoSair: () => void; tema: Tema }) {
  const [aba, setAba] = useState<Aba>('geral')
  const [filtroProdutos, setFiltroProdutos] = useState<Filtro>('todos')
  const [kits, setKits] = useState<Produto[] | null>(null)
  const [pecas, setPecas] = useState<Peca[] | null>(null)
  const [aviso, setAviso] = useState<Aviso | null>(null)
  const [menuAberto, setMenuAberto] = useState(false)
  const [dialogo, setDialogo] = useState<{ titulo: string; texto: string; ok: string; perigo?: boolean; extra?: string; resolver: (r: 'ok' | 'extra' | null) => void } | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const avisar = useCallback<Avisar>((t, o) => {
    const opc = typeof o === 'boolean' ? { erro: o } : (o ?? {})
    window.clearTimeout(timer.current)
    setAviso({ t, erro: opc.erro, acao: opc.acao })
    if (!opc.erro) timer.current = window.setTimeout(() => setAviso(null), opc.acao ? 9000 : 5000)
  }, [])

  const confirmar = useCallback<Confirmar>((o) => new Promise((resolver) => setDialogo({ ...o, resolver })), [])
  const fecharDialogo = (r: 'ok' | 'extra' | null) => {
    dialogo?.resolver(r)
    setDialogo(null)
  }

  const carregar = useCallback(async () => {
    try {
      const [k, p] = await Promise.all([s.listarKits(), s.listarPecas()])
      setKits(k)
      setPecas(p)
    } catch (e) {
      avisar(amigavel(e), true)
    }
  }, [s, avisar])

  useEffect(() => {
    void carregar()
  }, [carregar])

  useEffect(() => {
    if (!menuAberto && !dialogo) return
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (dialogo) fecharDialogo(null)
      else setMenuAberto(false)
    }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  })

  const itens: [Aba, string, number | null][] = [
    ['geral', 'Início', null],
    ['produtos', 'Meus produtos', kits?.length ?? null],
    ['pecas', 'Peças do “Monte seu kit”', pecas?.length ?? null],
  ]
  const ir = (a: Aba, f: Filtro = 'todos') => {
    setFiltroProdutos(f)
    setAba(a)
    setMenuAberto(false)
    window.scrollTo(0, 0)
  }

  return (
    <ConfirmarCtx.Provider value={confirmar}>
      <div className="min-h-[100dvh] bg-[#f5f5f5] text-tinta">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-indigo/95 px-3 text-white backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              className="grid h-11 w-11 place-items-center rounded-lg text-2xl hover:bg-white/10 active:bg-white/20 lg:hidden"
              aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuAberto}
              aria-controls="menu-painel"
              onClick={() => setMenuAberto((v) => !v)}
            >
              ☰
            </button>
            <span className="titulo !text-white text-2xl tracking-[0.06em]">PorcelanArt</span>
            <span className="hidden text-sm text-white/80 sm:inline">| Central do Vendedor</span>
          </div>
          <div className="flex items-center gap-1 text-[15px]">
            <span className="mr-2 hidden max-w-[220px] truncate text-white/80 xl:inline">{email}</span>
            <BotaoTema tema={tema} />
            <Link to="/" target="_blank" className="flex min-h-[44px] items-center rounded-lg px-3 hover:bg-white/10 active:bg-white/20">Abrir meu site</Link>
            <button className="min-h-[44px] min-w-[44px] rounded-lg bg-white/15 px-3 hover:bg-white/25 active:bg-white/30" onClick={async () => { await s.sair(); aoSair() }}>Sair</button>
          </div>
        </header>

        <div className="mx-auto flex max-w-[1300px]">
          {menuAberto && <button aria-label="Fechar menu" className="painel-fade fixed inset-0 top-14 z-10 bg-black/40 lg:hidden" onClick={() => setMenuAberto(false)} />}
          <nav
            id="menu-painel"
            aria-label="Menu do painel"
            className={`${menuAberto ? 'painel-gaveta block' : 'hidden'} fixed left-0 top-14 z-20 h-[calc(100dvh-56px)] w-72 overflow-y-auto border-r border-black/10 bg-white p-3 shadow-cartao lg:sticky lg:block lg:w-64 lg:shrink-0 lg:shadow-none`}
          >
            {itens.map(([id, nome, n]) => (
              <button
                key={id}
                onClick={() => ir(id)}
                aria-current={aba === id ? 'page' : undefined}
                className={`mb-1 flex min-h-[52px] w-full items-center justify-between rounded-lg px-4 text-left text-[16px] ${aba === id ? 'bg-laranja/15 font-medium text-[#8a3606]' : 'hover:bg-black/5 active:bg-black/10'}`}
              >
                {nome}
                {n !== null && <span className="rounded-full bg-black/10 px-2.5 py-0.5 text-sm">{n}</span>}
              </button>
            ))}
            {s.demo && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Modo demonstração: dados só neste navegador.</p>}
          </nav>

          <main className="min-w-0 flex-1 p-4 pb-28 md:p-6 md:pb-28">
            {aba === 'geral' && <Inicio s={s} kits={kits} pecas={pecas} ir={ir} recarregar={carregar} avisar={avisar} />}
            {aba === 'produtos' && <Produtos key={filtroProdutos} s={s} kits={kits} recarregar={carregar} avisar={avisar} filtroInicial={filtroProdutos} />}
            {aba === 'pecas' && <Pecas s={s} pecas={pecas} recarregar={carregar} avisar={avisar} />}
          </main>
        </div>

        {aviso && (
          <div
            role={aviso.erro ? 'alert' : 'status'}
            className={`painel-aviso fixed left-1/2 z-50 flex w-[min(92vw,560px)] -translate-x-1/2 items-center gap-3 rounded-xl px-4 py-3 text-[15px] text-white shadow-cartao ${aviso.erro ? 'bg-red-700' : 'bg-tinta'}`}
            style={{ bottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
          >
            <span className="flex-1">{aviso.t}</span>
            {aviso.acao && <button className="min-h-[44px] rounded-lg bg-white/20 px-4 font-medium hover:bg-white/30" onClick={() => { aviso.acao!.fn(); setAviso(null) }}>{aviso.acao.rotulo}</button>}
            {aviso.erro && <button className="min-h-[44px] min-w-[44px] rounded-lg bg-white/20 px-3 hover:bg-white/30" aria-label="Fechar aviso" onClick={() => setAviso(null)}>✕</button>}
          </div>
        )}

        {dialogo && (
          <div className="painel-fade fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="dlg-t">
            <div className="painel-janela w-full max-w-md rounded-2xl bg-white p-6 shadow-cartao">
              <h2 id="dlg-t" className="text-xl font-medium">{dialogo.titulo}</h2>
              <p className="mt-2 whitespace-pre-line text-[16px] leading-relaxed text-tinta-suave">{dialogo.texto}</p>
              <div className="mt-6 flex flex-col gap-2">
                {dialogo.extra && <button className={`${btnLaranja} min-h-[52px]`} onClick={() => fecharDialogo('extra')}>{dialogo.extra}</button>}
                <button className={`${dialogo.perigo ? btnPerigo : btnPrimario} min-h-[52px]`} onClick={() => fecharDialogo('ok')}>{dialogo.ok}</button>
                <button autoFocus className={`${btnLinha} min-h-[52px]`} onClick={() => fecharDialogo(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ConfirmarCtx.Provider>
  )
}

// ================================================================= início (primeiros passos + resumo)
const PASSOS_OK = 'pa_passos_ok'

/** "Precisam de ajuda": o que falta para o produto vender melhor. */
export function qualidade(k: Pick<Produto, 'fotos' | 'descricao' | 'resumo' | 'detalhes'>) {
  const faltas: string[] = []
  if (k.fotos.length < 3) faltas.push(`mais ${3 - k.fotos.length} foto${3 - k.fotos.length > 1 ? 's' : ''}`)
  if (k.descricao.trim().length < 60) faltas.push('uma descrição maior')
  if (!k.resumo.trim()) faltas.push('a frase curta da vitrine')
  if (!k.detalhes.length) faltas.push('o que a peça tem de especial')
  return { faltas, ok: faltas.length === 0 }
}

function Inicio({ s, kits, pecas, ir, recarregar, avisar }: Comum & { kits: Produto[] | null; pecas: Peca[] | null; ir: (a: Aba, f?: Filtro) => void }) {
  const confirmar = useConfirmar()
  const [importando, setImportando] = useState(false)
  const [passosOcultos, setPassosOcultos] = useState(() => {
    try {
      return localStorage.getItem(PASSOS_OK) === '1'
    } catch {
      return false
    }
  })
  const conta = (st: Status) => (kits ? kits.filter((k) => (k.status ?? 'ativo') === st).length : null)
  const n = (v: number | null) => (v === null ? '–' : v)
  const total = catalogoAtualComoLinhas().length

  const importar = async () => {
    const r = await confirmar({
      titulo: 'Trazer as peças do site para o painel?',
      texto: `Vou copiar para cá os ${total} produtos que já aparecem no seu site. Nada muda para os clientes. Depois você poderá mudar fotos, preços e textos de cada um.`,
      ok: 'Sim, trazer agora',
    })
    if (r !== 'ok') return
    setImportando(true)
    try {
      for (const k of catalogoAtualComoLinhas()) await s.salvarKit(k)
      await recarregar()
      avisar('Pronto! As peças do site já estão no painel.')
    } catch (e) {
      avisar(amigavel(e), true)
    } finally {
      setImportando(false)
    }
  }

  const passo1 = (kits?.length ?? 0) > 0
  const passo2 = (pecas?.length ?? 0) > 0
  const [passo3, setPasso3] = useState(() => {
    try {
      return localStorage.getItem('pa_passo3') === '1'
    } catch {
      return false
    }
  })
  const escondePassos = () => {
    setPassosOcultos(true)
    try {
      localStorage.setItem(PASSOS_OK, '1')
    } catch {
      /* sem armazenamento */
    }
  }

  const pendencias = (kits ?? []).filter((k) => !qualidade(k).ok).length
  const semPreco = (pecas ?? []).filter((p) => p.preco == null).length
  const semFoto = (kits ?? []).filter((k) => k.fotos.length === 0).length

  const cartoes: [string, number | null, string, Filtro | 'pecas'][] = [
    ['Vendendo', conta('ativo'), 'text-green-700', 'ativo'],
    ['Sem estoque', conta('esgotado'), 'text-amber-700', 'esgotado'],
    ['Escondidos', conta('oculto'), 'text-tinta-suave', 'oculto'],
    ['Peças do “Monte seu kit”', pecas ? pecas.length : null, 'text-indigo', 'pecas'],
  ]
  const afazer: [string, number, string, Aba, Filtro?][] = [
    ['Anúncios para caprichar', pendencias, 'Falta foto, descrição ou frase curta', 'produtos', 'pendencias'],
    ['Produtos sem estoque', conta('esgotado') ?? 0, 'Quando repuser, toque em “Vendendo”', 'produtos', 'esgotado'],
    ['Produtos sem foto', semFoto, 'Sem foto quase ninguém abre o anúncio', 'produtos', 'pendencias'],
    ['Peças sem preço inicial', semPreco, 'O cliente vê “valor sob consulta”', 'pecas'],
  ]

  const Passo = ({ ok, num, children, acao }: { ok: boolean; num: number; children: React.ReactNode; acao?: React.ReactNode }) => (
    <li className="flex flex-wrap items-center gap-3">
      <span aria-hidden="true" className={`grid h-9 w-9 place-items-center rounded-full text-[15px] font-medium ${ok ? 'bg-green-600 text-white' : 'bg-black/10'}`}>{ok ? '✓' : num}</span>
      <span className="flex-1 basis-56 text-[16px]">{children}</span>
      {!ok && acao}
    </li>
  )

  return (
    <div>
      <h1 className="text-[28px] font-medium leading-tight tracking-[-0.01em]">Início</h1>

      {!passosOcultos && kits && pecas && (
        <section className="mt-5 rounded-xl border-2 border-laranja/50 bg-white p-5" aria-label="Primeiros passos">
          <h2 className="text-lg font-medium">Bem-vinda! Vamos deixar a sua loja pronta em 3 passos</h2>
          <ol className="mt-4 space-y-3">
            <Passo ok={passo1} num={1} acao={<button className={btnLaranja} onClick={importar} disabled={importando}>{importando ? 'Trazendo…' : 'Trazer agora'}</button>}>Traga as peças que já estão no seu site</Passo>
            <Passo ok={passo2} num={2} acao={<button className={btnLaranja} onClick={() => ir('pecas')}>Cadastrar peças</button>}>Cadastre as peças do “Monte seu kit”: xícaras, pires, pratos… com foto e preço inicial</Passo>
            <Passo ok={passo3} num={3} acao={<a className={btnLaranja} href="/" target="_blank" rel="noreferrer" onClick={() => { setPasso3(true); try { localStorage.setItem('pa_passo3', '1') } catch { /* ok */ } }}>Abrir meu site</a>}>Confira como o cliente vê o seu site</Passo>
          </ol>
          <p className={ajuda}>Toda mudança que você salvar aparece no site na hora.</p>
          <button className="mt-2 min-h-[44px] text-sm text-tinta-suave underline" onClick={escondePassos}>Já sei usar, esconder este quadro</button>
        </section>
      )}

      <section className="mt-5 rounded-xl bg-white p-5 shadow-suave">
        <h2 className="text-lg font-medium">Para fazer hoje</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
          {afazer.map(([t, v, dica, aba, f]) => (
            <button key={t} onClick={() => ir(aba, f)} className="min-h-[44px] rounded-lg border border-black/15 p-4 text-left hover:border-laranja hover:bg-laranja/5 active:bg-laranja/10">
              <span className={`block text-4xl font-medium tabular-nums tracking-tight ${v > 0 ? 'text-[#b4470a]' : 'text-green-700'}`}>{v}</span>
              <span className="mt-1 block text-[15px] font-medium">{t}</span>
              <span className="mt-0.5 block text-sm text-tinta-suave">{dica}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {cartoes.map(([t, v, cor, f]) => (
          <button key={t} onClick={() => (f === 'pecas' ? ir('pecas') : ir('produtos', f))} className="min-h-[44px] rounded-xl bg-white p-5 text-left shadow-suave hover:shadow-cartao active:bg-black/5">
            <span className="text-[15px] text-tinta-suave">{t}</span>
            <span className={`mt-1 block text-4xl font-medium tabular-nums tracking-tight ${cor}`}>{n(v)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ================================================================= lista de produtos
type Ordem = 'ordem' | 'nome' | 'status' | 'qualidade'

function Produtos({ s, kits, recarregar, avisar, filtroInicial = 'todos' }: Comum & { kits: Produto[] | null; filtroInicial?: Filtro }) {
  const confirmar = useConfirmar()
  const [filtro, setFiltro] = useState<Filtro>(filtroInicial)
  const [busca, setBusca] = useState('')
  const [cat, setCat] = useState('')
  const [ordem, setOrdem] = useState<Ordem>('ordem')
  const [marcados, setMarcados] = useState<Set<string>>(new Set())
  const [maisAberto, setMaisAberto] = useState<string | null>(null)
  const [editando, setEditando] = useState<NovoProduto | null>(null)
  const [ocupado, setOcupado] = useState(false)

  const st = (k: Produto) => (k.status ?? 'ativo') as Status
  // agrupa grafias diferentes da mesma categoria (Kits / kits) numa só entrada
  const cats = useMemo(() => {
    const m = new Map<string, string>()
    for (const k of kits ?? []) if (!m.has(norm(k.categoria))) m.set(norm(k.categoria), k.categoria)
    return [...m.values()]
  }, [kits])

  const lista = useMemo(() => {
    const b = norm(busca)
    const l = (kits ?? []).filter(
      (k) =>
        (filtro === 'todos' || (filtro === 'pendencias' ? !qualidade(k).ok : st(k) === filtro)) &&
        (!cat || norm(k.categoria) === norm(cat)) &&
        (!b || norm(k.nome).includes(b) || norm(k.categoria).includes(b)),
    )
    const peso: Record<Status, number> = { ativo: 0, esgotado: 1, oculto: 2 }
    return [...l].sort((x, y) =>
      ordem === 'nome' ? x.nome.localeCompare(y.nome, 'pt-BR') : ordem === 'status' ? peso[st(x)] - peso[st(y)] : ordem === 'qualidade' ? qualidade(x).faltas.length - qualidade(y).faltas.length : (x.ordem ?? 0) - (y.ordem ?? 0),
    )
  }, [kits, filtro, busca, cat, ordem])

  // a seleção em lote só vale para o que está na tela
  const sel = lista.filter((k) => marcados.has(k.id!)).map((k) => k.id!)
  const contar = (f: Filtro) => (kits ?? []).filter((k) => f === 'todos' || (f === 'pendencias' ? !qualidade(k).ok : st(k) === f)).length

  const rascunho = (): NovoProduto | null => {
    try {
      const v = sessionStorage.getItem('pa_rascunho_produto')
      return v ? (JSON.parse(v) as NovoProduto) : null
    } catch {
      return null
    }
  }
  const novo = (): NovoProduto => {
    const r = rascunho()
    if (r) return r
    const maior = Math.max(0, ...(kits ?? []).map((k) => k.ordem ?? 0))
    return { slug: '', nome: '', categoria: '', resumo: '', descricao: '', detalhes: [], fotos: [], variacoes: [], preco: null, status: 'ativo', ordem: maior + 1 }
  }

  if (editando)
    return (
      <FormProduto
        s={s}
        inicial={editando}
        existentes={kits ?? []}
        fechar={() => setEditando(null)}
        salvo={async (k) => {
          setEditando(null)
          await recarregar()
          avisar('Salvo! Já está no site.', { acao: { rotulo: 'Ver no site', fn: () => window.open(`/peca/${k.slug}`, '_blank') } })
        }}
        avisar={avisar}
      />
    )

  const mudarStatus = async (ids: string[], novoSt: Status) => {
    const antes = new Map((kits ?? []).filter((k) => ids.includes(k.id!)).map((k) => [k.id!, st(k)]))
    setOcupado(true)
    try {
      for (const id of ids) await s.statusKit(id, novoSt)
      await recarregar()
      setMarcados(new Set())
      const nome = ids.length === 1 ? `“${kits?.find((k) => k.id === ids[0])?.nome}”` : `${ids.length} produtos`
      avisar(`${nome} agora ${ids.length === 1 ? 'está' : 'estão'}: ${STATUS_ROTULO[novoSt]}.`, {
        acao: {
          rotulo: 'Desfazer',
          fn: async () => {
            try {
              for (const [id, a] of antes) await s.statusKit(id, a)
              await recarregar()
            } catch (e) {
              avisar(amigavel(e), true)
            }
          },
        },
      })
    } catch (e) {
      avisar(amigavel(e), true)
    } finally {
      setOcupado(false)
    }
  }

  const apagar = async (ids: string[]) => {
    const alvos = (kits ?? []).filter((k) => ids.includes(k.id!))
    const um = alvos.length === 1
    const r = await confirmar({
      titulo: um ? `Apagar “${alvos[0].nome}”?` : `Apagar ${alvos.length} produtos?`,
      texto: `${um ? 'Ele some' : 'Eles somem'} do painel e do site. Se só quer parar de vender por um tempo, prefira esconder.\n\nDepois de apagar você terá alguns segundos para desfazer.`,
      ok: 'Sim, apagar',
      perigo: true,
      extra: 'Esconder em vez de apagar',
    })
    if (r === 'extra') return mudarStatus(ids, 'oculto')
    if (r !== 'ok') return
    setOcupado(true)
    try {
      for (const id of ids) await s.removerKit(id)
      await recarregar()
      setMarcados(new Set())
      avisar(um ? `“${alvos[0].nome}” foi apagado.` : `${alvos.length} produtos foram apagados.`, {
        acao: {
          rotulo: 'Desfazer',
          fn: async () => {
            try {
              for (const k of alvos) await s.salvarKit({ ...k, id: undefined })
              await recarregar()
              avisar('Tudo de volta!')
            } catch (e) {
              avisar(amigavel(e), true)
            }
          },
        },
      })
    } catch (e) {
      avisar(amigavel(e), true)
    } finally {
      setOcupado(false)
    }
  }

  const duplicar = (k: Produto) => setEditando({ ...k, id: undefined, slug: '', nome: `${k.nome} (cópia)`, status: 'oculto', ordem: Math.max(0, ...(kits ?? []).map((x) => x.ordem ?? 0)) + 1 })
  const alterna = (id: string) => setMarcados((m) => { const n = new Set(m); if (n.has(id)) n.delete(id); else n.add(id); return n })
  const abas: [Filtro, string][] = [['todos', 'Todos'], ['ativo', 'Vendendo'], ['esgotado', 'Sem estoque'], ['oculto', 'Escondidos'], ['pendencias', 'Para caprichar']]
  const idsLista = lista.map((k) => k.id!)
  const todos = idsLista.length > 0 && idsLista.every((id) => marcados.has(id))

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[28px] font-medium leading-tight tracking-[-0.01em]">Meus produtos</h1>
        <button className={btnLaranja} onClick={() => setEditando(novo())}>+ Adicionar novo produto</button>
      </div>

      <div className="mt-5 rounded-xl bg-white shadow-suave">
        <div className="sem-barra flex items-center gap-1 overflow-x-auto border-b border-black/10 px-3 pt-2" role="tablist" aria-label="Filtrar por situação">
          {abas.map(([f, nome]) => (
            <button key={f} role="tab" aria-selected={filtro === f} onClick={() => { setFiltro(f); setMarcados(new Set()) }} className={`-mb-px min-h-[48px] shrink-0 whitespace-nowrap border-b-2 px-4 text-[15px] ${filtro === f ? 'border-laranja font-medium text-[#8a3606]' : 'border-transparent text-tinta-suave hover:text-tinta'}`}>
              {nome} ({contar(f)})
            </button>
          ))}
        </div>

        <div className="grid gap-2 p-3 md:grid-cols-[1fr_200px_220px]">
          <input className={campo} placeholder="Buscar produto pelo nome" aria-label="Buscar produtos" value={busca} onChange={(e) => { setBusca(e.target.value); setMarcados(new Set()) }} />
          <select className={campo} aria-label="Filtrar por categoria" value={cat} onChange={(e) => { setCat(e.target.value); setMarcados(new Set()) }}>
            <option value="">Todas as categorias</option>
            {cats.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className={campo} aria-label="Mostrar primeiro" value={ordem} onChange={(e) => setOrdem(e.target.value as Ordem)}>
            <option value="ordem">Como está no site</option>
            <option value="nome">Nome (A a Z)</option>
            <option value="status">Vendendo primeiro</option>
            <option value="qualidade">Mais completos primeiro</option>
          </select>
        </div>

        {lista.length > 0 && (
          <label className="flex min-h-[48px] cursor-pointer items-center gap-3 border-y border-black/10 bg-black/[0.03] px-2 text-[15px] text-tinta-suave">
            <span className="grid h-11 w-11 place-items-center"><input type="checkbox" className="h-6 w-6" checked={todos} onChange={() => setMarcados(todos ? new Set() : new Set(idsLista))} /></span>
            Selecionar todos os {lista.length} da tela
          </label>
        )}

        {kits === null ? (
          <p className="p-6 text-tinta-suave">Carregando…</p>
        ) : lista.length === 0 ? (
          <div className="p-6 text-tinta-suave">
            <p>{kits.length === 0 ? 'Nenhum produto por aqui ainda. Volte ao Início para trazer as peças do site, ou adicione um novo.' : 'Nada por aqui com esses filtros.'}</p>
            {kits.length > 0 && <button className={`${btnLinha} mt-3`} onClick={() => { setFiltro('todos'); setBusca(''); setCat('') }}>Limpar filtros</button>}
          </div>
        ) : (
          <ul className="divide-y divide-black/10">
            {lista.map((k) => {
              const q = qualidade(k)
              const marcado = marcados.has(k.id!)
              return (
                <li key={k.id} className={`p-3 ${marcado ? 'bg-indigo/5' : ''}`}>
                  <div className="flex flex-wrap items-center gap-3 md:flex-nowrap">
                    <label className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center"><input type="checkbox" className="h-6 w-6" aria-label={`Selecionar ${k.nome}`} checked={marcado} onChange={() => alterna(k.id!)} /></label>
                    <img src={foto(k.fotos[0])} alt="" className="h-16 w-16 shrink-0 rounded-lg bg-black/5 object-cover" />
                    <div className="min-w-0 flex-1 basis-44">
                      <p className="font-medium leading-snug">{k.nome}</p>
                      <p className="text-sm text-tinta-suave">{k.categoria}{k.preco ? ` · ${aPartirDe(k.preco)}` : ''}{k.variacoes?.length ? ` · ${k.variacoes.length} opção(ões) para escolher` : ''}</p>
                      <p className={`mt-0.5 text-sm ${q.ok ? 'text-green-700' : 'text-amber-800'}`}>{q.ok ? '✓ Anúncio completo' : `Falta: ${q.faltas.join(', ')}`}</p>
                    </div>
                    <SeletorSituacao valor={st(k)} nome={k.nome} compacto aoMudar={(v) => mudarStatus([k.id!], v)} />
                    <div className="flex gap-2">
                      <button className={btnLinha} onClick={() => setEditando(k)}>Editar</button>
                      <button className={btnLinha} aria-expanded={maisAberto === k.id} onClick={() => setMaisAberto(maisAberto === k.id ? null : k.id!)}>Mais ▾</button>
                    </div>
                  </div>
                  {maisAberto === k.id && (
                    <div className="mt-3 flex flex-wrap gap-3 rounded-lg bg-black/[0.04] p-3">
                      {st(k) !== 'oculto' ? <a className={btnLinha} href={`/peca/${k.slug}`} target="_blank" rel="noreferrer">Ver no site</a> : <span className="flex min-h-[44px] items-center text-sm text-tinta-suave">Escondido: só você vê. Mude para “Vendendo” para aparecer.</span>}
                      <button className={btnLinha} onClick={() => duplicar(k)}>Fazer cópia</button>
                      <button className={`${btnPerigo} ml-auto`} onClick={() => apagar([k.id!])}>Apagar…</button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {sel.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-indigo/30 bg-white/95 shadow-cartao backdrop-blur" role="region" aria-label="Ações para os selecionados" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="mx-auto flex max-w-[1300px] flex-wrap items-center gap-2 px-4 py-3">
            <span className="mr-2 font-medium">{sel.length} selecionado{sel.length > 1 ? 's' : ''}</span>
            <button className={btnLinha} disabled={ocupado} onClick={() => mudarStatus(sel, 'ativo')}>Vendendo</button>
            <button className={btnLinha} disabled={ocupado} onClick={() => mudarStatus(sel, 'esgotado')}>Sem estoque</button>
            <button className={btnLinha} disabled={ocupado} onClick={() => mudarStatus(sel, 'oculto')}>Esconder</button>
            <button className={`${btnPerigo} ml-4`} disabled={ocupado} onClick={() => apagar(sel)}>Apagar…</button>
            <button className="ml-auto min-h-[44px] px-3 text-sm underline" onClick={() => setMarcados(new Set())}>Limpar seleção</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ================================================================= envio de fotos
function useEnvioFotos(s: Store, avisar: Avisar) {
  const [enviando, setEnviando] = useState(0)
  const enviar = async (arquivos: FileList | File[]): Promise<string[]> => {
    const ok: string[] = []
    for (const a of Array.from(arquivos)) {
      if (!a.type.startsWith('image/') && !/\.(heic|heif)$/i.test(a.name)) { avisar(`“${a.name}” não é uma foto.`, true); continue }
      setEnviando((n) => n + 1)
      try {
        ok.push(await s.enviarFoto(a))
      } catch (e) {
        avisar(amigavel(e), true)
      } finally {
        setEnviando((n) => n - 1)
      }
    }
    return ok
  }
  return { enviar, enviando }
}

/** Aviso do navegador se tentar recarregar/fechar com alterações não salvas. */
function useAvisoAoSair(ativo: boolean) {
  useEffect(() => {
    if (!ativo) return
    const f = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', f)
    return () => window.removeEventListener('beforeunload', f)
  }, [ativo])
}

const Chip = ({ t, aoRemover, cor = 'bg-indigo/10 text-indigo' }: { t: string; aoRemover: () => void; cor?: string }) => (
  <span className={`inline-flex items-center gap-1 rounded-full pl-4 text-[15px] ${cor}`}>
    {t}
    <button type="button" aria-label={`Remover ${t}`} className="grid h-11 w-11 place-items-center rounded-full hover:bg-black/10 active:bg-black/15" onClick={aoRemover}>✕</button>
  </span>
)

// ================================================================= formulário de produto
function FormProduto({ s, inicial, existentes, fechar, salvo, avisar }: { s: Store; inicial: NovoProduto; existentes: Produto[]; fechar: () => void; salvo: (k: Produto) => Promise<void>; avisar: Avisar }) {
  const confirmar = useConfirmar()
  const clonar = (x: NovoProduto): NovoProduto => ({ ...x, fotos: [...x.fotos], detalhes: [...x.detalhes], variacoes: (x.variacoes ?? []).map((v) => ({ ...v, opcoes: [...v.opcoes] })) })
  const [p, setP] = useState<NovoProduto>(() => clonar(inicial))
  const [preco, setPreco] = useState(paraCampo(inicial.preco))
  const [detalheNovo, setDetalheNovo] = useState('')
  const [gravando, setGravando] = useState(false)
  const [erros, setErros] = useState<{ nome?: string; categoria?: string; preco?: string }>({})
  const guarda = useRef(false)
  const { enviar, enviando } = useEnvioFotos(s, avisar)
  const inputFoto = useRef<HTMLInputElement>(null)
  const restaurado = useRef(!inicial.id && Boolean(inicial.nome || inicial.fotos.length))
  const cats = useMemo(() => {
    const vistas = new Map<string, string>()
    for (const c of [...existentes.map((k) => k.categoria), ...SUGESTOES_CATEGORIA]) if (c && !vistas.has(norm(c))) vistas.set(norm(c), c)
    return [...vistas.values()]
  }, [existentes])

  const inicialTxt = useRef(JSON.stringify([clonar(inicial), paraCampo(inicial.preco)]))
  const sujo = JSON.stringify([p, preco]) !== inicialTxt.current
  useAvisoAoSair(sujo && !gravando)

  // rascunho de produto novo: guardado neste aparelho até salvar
  useEffect(() => {
    if (inicial.id || !sujo) return
    const n = lerPreco(preco)
    try { sessionStorage.setItem('pa_rascunho_produto', JSON.stringify({ ...p, preco: n === 'erro' ? null : n })) } catch { /* ok */ }
  }, [p, preco, sujo, inicial.id])

  const set = <K extends keyof NovoProduto>(k: K, v: NovoProduto[K]) => setP((x) => ({ ...x, [k]: v }))
  const mover = (i: number, d: number) => setP((x) => {
    const f = [...x.fotos]; const j = i + d
    if (j < 0 || j >= f.length) return x
    ;[f[i], f[j]] = [f[j], f[i]]
    return { ...x, fotos: f }
  })

  // arrastar para reordenar: toca e segura numa foto, arrasta por cima das outras
  const [arrastando, setArrastando] = useState<number | null>(null)
  const aoPointerDown = (i: number) => (e: React.PointerEvent) => {
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    setArrastando(i)
  }
  const aoPointerMove = (e: React.PointerEvent) => {
    if (arrastando === null) return
    const alvo = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)?.closest<HTMLElement>('[data-foto-i]')
    if (!alvo) return
    const j = Number(alvo.dataset.fotoI)
    if (Number.isNaN(j) || j === arrastando) return
    setP((x) => {
      const f = [...x.fotos]
      const [item] = f.splice(arrastando, 1)
      f.splice(j, 0, item)
      return { ...x, fotos: f }
    })
    setArrastando(j)
  }
  const aoPointerUp = () => setArrastando(null)

  const addFotos = async (l: FileList | null) => {
    if (!l?.length) return
    const vagas = MAX_FOTOS - p.fotos.length
    if (l.length > vagas) avisar(`Cabem no máximo ${MAX_FOTOS} fotos por produto. Vou usar só as primeiras ${Math.max(vagas, 0)}.`, true)
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

  const limparRascunho = () => { try { sessionStorage.removeItem('pa_rascunho_produto') } catch { /* ok */ } }
  const cancelar = async () => {
    if (sujo) {
      const r = await confirmar({ titulo: 'Sair sem salvar?', texto: 'O que você escreveu neste produto será perdido.', ok: 'Sair sem salvar', perigo: true })
      if (r !== 'ok') return
    }
    limparRascunho()
    fechar()
  }

  const gravar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (guarda.current) return
    const novoErros: typeof erros = {}
    if (!p.nome.trim()) novoErros.nome = 'Falta o nome. Ex.: Kit Chá com Bule e Xícara.'
    if (!p.categoria.trim()) novoErros.categoria = 'Escolha ou escreva a categoria. Ex.: Boleira, Xícaras, Pratos.'
    const n = lerPreco(preco)
    if (n === 'erro') novoErros.preco = 'Escreva o preço só com números. Ex.: 89,90.'
    setErros(novoErros)
    const primeiro = (['nome', 'categoria', 'preco'] as const).find((k) => novoErros[k])
    if (primeiro) {
      const el = document.getElementById(primeiro === 'preco' ? 'preco' : primeiro === 'nome' ? 'nome' : 'cat')
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      ;(el as HTMLElement | null)?.focus()
      return
    }
    if (!p.fotos.length) {
      const r = await confirmar({ titulo: 'Salvar sem foto?', texto: 'Sem foto quase ninguém abre o anúncio. Você pode adicionar depois.', ok: 'Salvar mesmo assim' })
      if (r !== 'ok') return
    }
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
      preco: n as number | null,
      variacoes: (p.variacoes ?? []).filter((v) => v.nome.trim() && v.opcoes.length).map((v) => ({ nome: v.nome.trim(), opcoes: v.opcoes })),
    }
    guarda.current = true
    setGravando(true)
    try {
      const gravado = await s.salvarKit(limpo)
      limparRascunho()
      await salvo(gravado)
    } catch (err) {
      avisar(amigavel(err), true)
      guarda.current = false
      setGravando(false)
    }
  }

  const precoNum = lerPreco(preco)
  const temDetalhes = Boolean(inicial.id || p.resumo || p.descricao || p.detalhes.length || (p.variacoes ?? []).length)

  return (
    <form onSubmit={gravar} noValidate>
      <h1 className="text-[28px] font-medium leading-tight tracking-[-0.01em]">{inicial.id ? 'Editar produto' : 'Adicionar novo produto'}</h1>
      {restaurado.current && (
        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-[15px] text-amber-900">
          Continuando de onde você parou.{' '}
          <button type="button" className="min-h-[44px] underline" onClick={() => { limparRascunho(); fechar() }}>Começar do zero</button>
        </p>
      )}

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_300px]">
        <div>
          <section className="rounded-xl bg-white p-5 shadow-suave">
            <h2 className="text-lg font-medium">Fotos</h2>
            <p className={ajuda}>Até {MAX_FOTOS} fotos quadradas. A primeira é a capa que aparece na vitrine.</p>
            <p className={ajuda}>Toque e segure uma foto para arrastá-la para outra posição, ou use as setas.</p>
            <div className="mt-3 flex flex-wrap gap-4" onPointerMove={aoPointerMove} onPointerUp={aoPointerUp} onPointerCancel={aoPointerUp}>
              {p.fotos.map((f, i) => (
                <div key={String(f) + i} data-foto-i={i} className={`w-32 transition-transform ${arrastando === i ? 'scale-95 opacity-70' : ''}`}>
                  <div
                    className="relative touch-none overflow-hidden rounded-lg border border-black/15 active:cursor-grabbing"
                    onPointerDown={aoPointerDown(i)}
                  >
                    <img src={foto(f)} alt={`Foto ${i + 1}`} draggable={false} className="aspect-square w-32 bg-black/5 object-cover" />
                    {i === 0 && <span className="absolute inset-x-0 bottom-0 bg-black/65 py-1 text-center text-sm text-white">Capa</span>}
                    <button type="button" aria-label={`Tirar a foto ${i + 1}`} className="absolute right-1 top-1 grid h-11 w-11 place-items-center rounded-full bg-black/65 text-white active:bg-black" onPointerDown={(e) => e.stopPropagation()} onClick={() => set('fotos', p.fotos.filter((_, k) => k !== i))}>✕</button>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button type="button" className="min-h-[44px] flex-1 rounded-lg border border-black/25 text-lg disabled:opacity-30 active:bg-black/10" aria-label="Mover para trás" disabled={i === 0} onClick={() => mover(i, -1)}>←</button>
                    <button type="button" className="min-h-[44px] flex-1 rounded-lg border border-black/25 text-lg disabled:opacity-30 active:bg-black/10" aria-label="Mover para frente" disabled={i === p.fotos.length - 1} onClick={() => mover(i, 1)}>→</button>
                  </div>
                </div>
              ))}
              {p.fotos.length < MAX_FOTOS && (
                <button type="button" onClick={() => inputFoto.current?.click()} className="grid h-32 w-32 place-items-center rounded-lg border-2 border-dashed border-black/30 p-2 text-center text-[15px] text-[#b4470a] hover:border-laranja hover:bg-laranja/5 active:bg-laranja/10">
                  {enviando ? 'Enviando…' : <span>＋<br />Adicionar foto<br />({p.fotos.length}/{MAX_FOTOS})</span>}
                </button>
              )}
              <input ref={inputFoto} type="file" accept="image/*" multiple hidden onChange={(e) => addFotos(e.target.files)} />
            </div>
          </section>

          <Ficha t="O básico">
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={rotuloCampo} htmlFor="nome"><span className="text-red-600">*</span> Nome do produto</label>
                <div className="relative">
                  <input id="nome" className={`${campo} pr-20`} value={p.nome} maxLength={120} aria-invalid={Boolean(erros.nome)} onChange={(e) => { set('nome', e.target.value); setErros((x) => ({ ...x, nome: undefined })) }} placeholder="Ex.: Kit Chá com Bule e Xícara" />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-tinta-suave">{p.nome.length}/120</span>
                </div>
                {erros.nome && <p role="alert" className={erroTxt}>{erros.nome}</p>}
              </div>
              <div>
                <label className={rotuloCampo} htmlFor="cat"><span className="text-red-600">*</span> Categoria</label>
                <input id="cat" className={campo} list="cats" value={p.categoria} aria-invalid={Boolean(erros.categoria)} onChange={(e) => { set('categoria', e.target.value); setErros((x) => ({ ...x, categoria: undefined })) }} placeholder="Ex.: Boleira, Xícaras, Pratos" maxLength={40} />
                <datalist id="cats">{cats.map((c) => <option key={c} value={c} />)}</datalist>
                {erros.categoria ? <p role="alert" className={erroTxt}>{erros.categoria}</p> : <p className={ajuda}>Escreva o nome. Ele vira um filtro no site.</p>}
              </div>
              <div>
                <label className={rotuloCampo} htmlFor="preco">Preço inicial (opcional)</label>
                <div className="flex items-center gap-2">
                  <span className="text-tinta-suave">R$</span>
                  <input id="preco" className={campo} inputMode="decimal" value={preco} aria-invalid={Boolean(erros.preco)} onChange={(e) => { setPreco(e.target.value); setErros((x) => ({ ...x, preco: undefined })) }} placeholder="Ex.: 89,90" />
                </div>
                {erros.preco ? <p role="alert" className={erroTxt}>{erros.preco}</p> : <p className={ajuda}>{typeof precoNum === 'number' ? `O cliente vai ver: ${aPartirDe(precoNum)}` : 'O cliente vê “a partir de R$ …”. O valor final vocês combinam no WhatsApp.'}</p>}
              </div>
            </div>
          </Ficha>

          <Ficha t="Este produto está…">
            <div className="mt-3"><SeletorSituacao valor={(p.status ?? 'ativo') as Status} nome={p.nome || 'produto'} aoMudar={(v) => set('status', v)} /></div>
            <p className={ajuda}>{DICA_STATUS[(p.status ?? 'ativo') as Status]}</p>
          </Ficha>

          <details className="mt-4 rounded-xl bg-white p-5 shadow-suave" open={temDetalhes}>
            <summary className="min-h-[44px] cursor-pointer text-lg font-medium">Mais detalhes (opcional)</summary>
            <div className="mt-3 grid gap-5">
              <div>
                <label className={rotuloCampo} htmlFor="resumo">Frase curta da vitrine</label>
                <input id="resumo" className={campo} value={p.resumo} maxLength={140} onChange={(e) => set('resumo', e.target.value)} placeholder="Ex.: Xícara e pires pintados à mão, com o seu nome" />
                <p className={ajuda}>Aparece embaixo da foto, no cartão do produto.</p>
              </div>
              <div>
                <label className={rotuloCampo} htmlFor="desc">Descrição</label>
                <textarea id="desc" rows={5} className={campo} value={p.descricao} onChange={(e) => set('descricao', e.target.value)} placeholder="Conte como a peça é feita, para quem é uma boa ideia de presente…" />
              </div>
              <div>
                <label className={rotuloCampo} htmlFor="det">O que tem de especial?</label>
                <div className="flex gap-2">
                  <input id="det" className={campo} value={detalheNovo} onChange={(e) => setDetalheNovo(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDetalhe() } }} placeholder="Ex.: Pintada à mão" />
                  <button type="button" className={btnLinha} onClick={addDetalhe}>Adicionar</button>
                </div>
                <p className={ajuda}>Escreva uma coisa e toque em Adicionar. Ex.: “Nome em ouro”, “Borda dourada”.</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {p.detalhes.map((d, i) => <Chip key={d + i} t={d} aoRemover={() => set('detalhes', p.detalhes.filter((_, k) => k !== i))} />)}
                </div>
              </div>
              <div>
                <h3 className="font-medium">Opções para o cliente escolher</h3>
                <p className={ajuda}>Ex.: <b>Cor da xícara</b> → Rosa, Azul · <b>Inicial</b> → A, B, C. O cliente escolhe antes de pedir.</p>
                <div className="mt-3 space-y-3">
                  {(p.variacoes ?? []).map((v, i) => (
                    <VariacaoLinha key={i} v={v} aoMudar={(nv) => setVar(i, nv)} aoRemover={() => set('variacoes', (p.variacoes ?? []).filter((_, k) => k !== i))} />
                  ))}
                </div>
                <button type="button" className={`${btnLinha} mt-3`} onClick={() => set('variacoes', [...(p.variacoes ?? []), { nome: '', opcoes: [] }])}>+ Adicionar uma opção</button>
              </div>
            </div>
          </details>
        </div>

        <div className="hidden xl:block"><div className="sticky top-20"><Previa p={p} preco={typeof precoNum === 'number' ? precoNum : null} /></div></div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/15 bg-white/95 shadow-cartao backdrop-blur" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="mx-auto flex max-w-[1300px] items-center justify-end gap-3 px-4 py-3">
          {sujo && <span className="mr-auto text-sm text-amber-800">Você tem alterações não salvas</span>}
          <button type="button" className={`${btnLinha} min-h-[48px]`} onClick={cancelar}>Cancelar</button>
          <button className={`${btnLaranja} min-h-[48px] min-w-[140px]`} disabled={gravando || enviando > 0}>{gravando ? 'Salvando…' : enviando ? 'Enviando foto…' : 'Salvar'}</button>
        </div>
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
    <div className="rounded-lg border border-black/20 p-3">
      <div className="flex gap-2">
        <input className={campo} aria-label="Nome da opção" placeholder="Nome (ex.: Cor da xícara)" value={v.nome} onChange={(e) => aoMudar({ ...v, nome: e.target.value })} />
        <button type="button" className={btnPerigo} onClick={aoRemover}>Tirar</button>
      </div>
      <div className="mt-2 flex gap-2">
        <input className={campo} aria-label="Nova escolha" placeholder="Escolha (ex.: Rosa) e toque em Adicionar" value={nova} onChange={(e) => setNova(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }} />
        <button type="button" className={btnLinha} onClick={add}>Adicionar</button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {v.opcoes.map((o) => <Chip key={o} t={o} cor="bg-black/5" aoRemover={() => aoMudar({ ...v, opcoes: v.opcoes.filter((x) => x !== o) })} />)}
      </div>
    </div>
  )
}

// ================================================================= peças do "Monte seu kit"
function Pecas({ s, pecas, recarregar, avisar }: Comum & { pecas: Peca[] | null }) {
  const confirmar = useConfirmar()
  const [aberto, setAberto] = useState<{ tipo: string; peca: NovaPeca } | null>(null)
  const [novoTipo, setNovoTipo] = useState('')
  const [tiposExtras, setTiposExtras] = useState<string[]>([])

  /** agrupa sem diferenciar maiúsculas/acentos (Xícara = xicara) */
  const secoes = useMemo(() => {
    const m = new Map<string, { nome: string; itens: Peca[] }>(TIPOS_FIXOS.map((t) => [norm(t), { nome: t, itens: [] }]))
    for (const p of pecas ?? []) {
      const k = norm(p.tipo)
      const g = m.get(k) ?? { nome: p.tipo, itens: [] }
      g.itens.push(p)
      m.set(k, g)
    }
    for (const t of tiposExtras) if (!m.has(norm(t))) m.set(norm(t), { nome: t, itens: [] })
    return [...m.values()]
  }, [pecas, tiposExtras])

  const abrirNovo = (tipo: string) => setAberto({ tipo, peca: { tipo, modelo: '', preco: null, foto: null, status: 'ativo', ordem: Math.max(0, ...(pecas ?? []).map((p) => p.ordem)) + 1 } })

  const remover = async (p: Peca) => {
    const r = await confirmar({ titulo: `Apagar o modelo “${p.modelo}”?`, texto: 'Ele some do painel e do “Monte seu kit”. Você terá alguns segundos para desfazer.', ok: 'Sim, apagar', perigo: true })
    if (r !== 'ok') return
    try {
      await s.removerPeca(p.id)
      await recarregar()
      avisar(`“${p.modelo}” foi apagado.`, { acao: { rotulo: 'Desfazer', fn: async () => { try { const { id: _id, ...resto } = p; void _id; await s.salvarPeca(resto); await recarregar() } catch (e) { avisar(amigavel(e), true) } } } })
    } catch (e) { avisar(amigavel(e), true) }
  }
  const mudarStatus = async (p: Peca, st: Status) => {
    try {
      await s.salvarPeca({ ...p, status: st })
      await recarregar()
      avisar(`“${p.modelo}” agora está: ${STATUS_ROTULO[st]}.`, { acao: { rotulo: 'Desfazer', fn: async () => { try { await s.salvarPeca(p); await recarregar() } catch (e) { avisar(amigavel(e), true) } } } })
    } catch (e) { avisar(amigavel(e), true) }
  }
  const criarTipo = () => {
    const t = novoTipo.trim()
    if (!t) return
    const existente = secoes.find((x) => norm(x.nome) === norm(t))
    if (!existente) setTiposExtras((x) => [...x, t])
    setNovoTipo('')
    abrirNovo(existente?.nome ?? t)
  }

  return (
    <div>
      <h1 className="text-[28px] font-medium leading-tight tracking-[-0.01em]">Peças do “Monte seu kit”</h1>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-tinta-suave">
        São as peças que o cliente combina sozinho no site (ex.: 2 xícaras Rosas + 2 pires lisos + 1 bandeja). Para cada item cadastre <b>quantos modelos quiser</b>, cada um com nome e foto.
        O <b>preço inicial</b> aparece como “a partir de”, porque o valor final depende da personalização.
      </p>

      <div className="mt-5 space-y-4">
        {pecas === null && <p className="text-tinta-suave">Carregando…</p>}
        {secoes.map(({ nome: tipo, itens }) => (
          <section key={tipo} className="rounded-xl bg-white shadow-suave" aria-label={`Modelos de ${tipo}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 px-4 py-3">
              <h2 className="text-lg font-medium">{tipo} <span className="text-[15px] font-normal text-tinta-suave">({itens.length} modelo{itens.length === 1 ? '' : 's'})</span></h2>
              <button className={btnLaranja} onClick={() => abrirNovo(tipo)}>+ {itens.length ? 'Adicionar outro modelo' : 'Adicionar modelo'}</button>
            </div>

            {aberto && norm(aberto.tipo) === norm(tipo) && (
              <div className="p-4">
                <FormPeca
                  key={aberto.peca.id ?? 'novo'}
                  s={s}
                  inicial={aberto.peca}
                  tipoFixo={tipo}
                  tipos={TIPOS_SUGERIDOS}
                  fechar={() => setAberto(null)}
                  salvo={async () => { setAberto(null); await recarregar(); avisar('Modelo salvo! Já está no “Monte seu kit”.') }}
                  avisar={avisar}
                />
              </div>
            )}

            {itens.length === 0 && !(aberto && norm(aberto.tipo) === norm(tipo)) ? (
              <p className="p-4 text-[15px] text-tinta-suave">Nenhum modelo de {tipo.toLowerCase()} ainda. Toque em “Adicionar modelo”.</p>
            ) : (
              <ul className="divide-y divide-black/10">
                {itens.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center gap-3 p-3 md:flex-nowrap">
                    <img src={foto(p.foto)} alt="" className="h-16 w-16 shrink-0 rounded-lg bg-black/5 object-cover" />
                    <div className="min-w-0 flex-1 basis-40">
                      <p className="font-medium">{p.modelo}</p>
                      <p className="text-sm text-tinta-suave">{p.preco != null ? aPartirDe(p.preco) : 'Valor sob consulta'}</p>
                    </div>
                    <SeletorSituacao valor={p.status} nome={p.modelo} compacto aoMudar={(v) => mudarStatus(p, v)} />
                    <div className="flex gap-2">
                      <button className={btnLinha} onClick={() => setAberto({ tipo, peca: p })}>Editar</button>
                      <button className={btnPerigo} onClick={() => remover(p)}>Apagar…</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section className="rounded-xl border-2 border-dashed border-black/20 bg-white p-4">
          <h2 className="text-lg font-medium">Outro tipo de peça</h2>
          <p className={ajuda}>Precisa de algo além dos itens acima? Ex.: Copo, Tigela, Porta-guardanapo.</p>
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

function FormPeca({ s, inicial, tipos, tipoFixo, fechar, salvo, avisar }: { s: Store; inicial: NovaPeca; tipos: string[]; tipoFixo?: string; fechar: () => void; salvo: () => Promise<void>; avisar: Avisar }) {
  const [p, setP] = useState<NovaPeca>(inicial)
  const [preco, setPreco] = useState(paraCampo(inicial.preco))
  const [gravando, setGravando] = useState(false)
  const [erros, setErros] = useState<{ modelo?: string; tipo?: string; preco?: string }>({})
  const guarda = useRef(false)
  const { enviar, enviando } = useEnvioFotos(s, avisar)
  const input = useRef<HTMLInputElement>(null)
  const sujo = JSON.stringify([p, preco]) !== JSON.stringify([inicial, paraCampo(inicial.preco)])
  useAvisoAoSair(sujo && !gravando)

  const gravar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (guarda.current) return
    const novo: typeof erros = {}
    if (!p.tipo.trim()) novo.tipo = 'Escreva o tipo. Ex.: Xícara.'
    if (!p.modelo.trim()) novo.modelo = 'Falta o nome do modelo. Ex.: Rosas, Passarinhos, Lisa dourada.'
    const n = lerPreco(preco)
    if (n === 'erro') novo.preco = 'Escreva o preço só com números. Ex.: 45,00.'
    setErros(novo)
    if (novo.tipo || novo.modelo || novo.preco) return
    guarda.current = true
    setGravando(true)
    try {
      await s.salvarPeca({ ...p, tipo: p.tipo.trim(), modelo: p.modelo.trim(), preco: n as number | null })
      await salvo()
    } catch (err) {
      avisar(amigavel(err), true)
      guarda.current = false
      setGravando(false)
    }
  }

  const n = lerPreco(preco)
  return (
    <form onSubmit={gravar} noValidate className="rounded-xl border-2 border-indigo/30 bg-papel/60 p-5">
      <h3 className="text-lg font-medium">{inicial.id ? `Editar modelo de ${p.tipo.toLowerCase()}` : `Novo modelo de ${(tipoFixo ?? p.tipo).toLowerCase() || 'peça'}`}</h3>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div>
          <label className={rotuloCampo} htmlFor="tp">Tipo</label>
          <input id="tp" className={`${campo} ${tipoFixo ? 'bg-black/5' : ''}`} list="tipos" value={p.tipo} readOnly={Boolean(tipoFixo)} onChange={(e) => setP({ ...p, tipo: e.target.value })} placeholder="Xícara, Pires, Prato, Bandeja…" />
          <datalist id="tipos">{tipos.map((t) => <option key={t} value={t} />)}</datalist>
          {erros.tipo && <p role="alert" className={erroTxt}>{erros.tipo}</p>}
        </div>
        <div>
          <label className={rotuloCampo} htmlFor="md"><span className="text-red-600">*</span> Nome do modelo</label>
          <input id="md" className={campo} value={p.modelo} aria-invalid={Boolean(erros.modelo)} onChange={(e) => { setP({ ...p, modelo: e.target.value }); setErros((x) => ({ ...x, modelo: undefined })) }} placeholder="Ex.: Rosas, Passarinhos, Lisa dourada" />
          {erros.modelo && <p role="alert" className={erroTxt}>{erros.modelo}</p>}
        </div>
        <div>
          <label className={rotuloCampo} htmlFor="pp">Preço inicial (opcional)</label>
          <div className="flex items-center gap-2"><span className="text-tinta-suave">R$</span><input id="pp" className={campo} inputMode="decimal" value={preco} aria-invalid={Boolean(erros.preco)} onChange={(e) => { setPreco(e.target.value); setErros((x) => ({ ...x, preco: undefined })) }} placeholder="Ex.: 45,00" /></div>
          {erros.preco ? <p role="alert" className={erroTxt}>{erros.preco}</p> : <p className={ajuda}>{typeof n === 'number' ? `O cliente vai ver: ${aPartirDe(n)}` : 'Deixe vazio para aparecer “valor sob consulta”.'}</p>}
        </div>
        <div>
          <span className={rotuloCampo}>Foto do modelo <span className="font-normal text-tinta-suave">(o cliente vê esta foto)</span></span>
          <div className="flex flex-wrap items-center gap-3">
            {p.foto && <img src={foto(p.foto)} alt="Foto do modelo" className="h-24 w-24 rounded-lg object-cover" />}
            <button type="button" className={btnLinha} onClick={() => input.current?.click()}>{enviando ? 'Enviando…' : p.foto ? 'Trocar foto' : 'Escolher foto'}</button>
            {p.foto && <button type="button" className={btnPerigo} onClick={() => setP({ ...p, foto: null })}>Tirar</button>}
            <input ref={input} type="file" accept="image/*" hidden onChange={async (e) => { const u = await enviar(e.target.files ?? []); if (u[0]) setP((x) => ({ ...x, foto: u[0] })); e.target.value = '' }} />
          </div>
        </div>
        <div className="md:col-span-2">
          <span className={rotuloCampo}>Este modelo está…</span>
          <SeletorSituacao valor={p.status} nome={p.modelo || 'modelo'} aoMudar={(v) => setP({ ...p, status: v })} />
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-3">
        <button type="button" className={`${btnLinha} min-h-[48px]`} onClick={fechar}>Cancelar</button>
        <button className={`${btnLaranja} min-h-[48px] min-w-[140px]`} disabled={gravando || enviando > 0}>{gravando ? 'Salvando…' : 'Salvar modelo'}</button>
      </div>
    </form>
  )
}
