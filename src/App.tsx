import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { Link, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { Blob, Margarida, Onda, Sprig, Xicara } from './Decor'
import {
  INSTAGRAM,
  foto,
  fotoP,
  linkZap,
  msgProduto,
  aPartirDe,
  norm,
  type Produto,
} from './data'
import { useCatalogo } from './catalogo'

const Painel = lazy(() => import('./painel/Painel'))
const Montar = lazy(() => import('./Montar'))

const ease = [0.22, 1, 0.36, 1] as const
const MSG_GERAL = 'Olá! Vim pelo site da PorcelanArt e quero personalizar a minha peça.'

function Reveal({
  children,
  delay = 0,
  className = '',
  from = 'up',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  /** up = sobe (títulos), left/right = entra pela lateral (passos), scale = abre (cartões) */
  from?: 'up' | 'left' | 'right' | 'scale'
}) {
  const start =
    from === 'left' ? { opacity: 0, x: -36 } : from === 'right' ? { opacity: 0, x: 36 } : from === 'scale' ? { opacity: 0, scale: 0.95 } : { opacity: 0, y: 18 }
  return (
    <motion.div
      className={className}
      initial={start}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease, delay }}
    >
      {children}
    </motion.div>
  )
}

/** Elemento que se desloca/gira conforme a rolagem (parallax). Respeita prefers-reduced-motion. */
function Drift({
  children,
  from = -30,
  to = 30,
  rot = [0, 0],
  hero = false,
  className = '',
}: {
  children: React.ReactNode
  from?: number
  to?: number
  rot?: [number, number]
  /** true = parte em 0 no topo da página (usar no hero) */
  hero?: boolean
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: hero ? ['start start', 'end start'] : ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [from, to])
  const rotate = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : rot)
  return (
    <motion.div ref={ref} style={{ y, rotate }} className={className}>
      {children}
    </motion.div>
  )
}

/** Barra fina no topo que mostra o progresso da rolagem da página. */
function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 })
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-40 h-[3px] origin-left bg-laranja"
      aria-hidden="true"
    />
  )
}

/** Título, descrição e canonical por rota (SPA). noindex para páginas que não existem. */
function usePagina(title: string, desc: string, path: string, noindex = false) {
  useEffect(() => {
    document.title = title
    const base = 'https://porcelanart-catalogo.vercel.app'
    const q = (sel: string) => document.head.querySelector<HTMLElement>(sel)
    q('meta[name="description"]')?.setAttribute('content', desc)
    q('meta[property="og:title"]')?.setAttribute('content', title)
    q('meta[property="og:description"]')?.setAttribute('content', desc)
    q('meta[property="og:url"]')?.setAttribute('content', base + path)
    q('link[rel="canonical"]')?.setAttribute('href', base + path)
    const robots = q('meta[name="robots"]') ?? document.head.appendChild(Object.assign(document.createElement('meta'), { name: 'robots' }))
    robots.setAttribute('content', noindex ? 'noindex' : 'index,follow')
  }, [title, desc, path, noindex])
}

function ZapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

function InstaIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function Header() {
  const [aberto, setAberto] = useState(false)
  const loc = useLocation()
  const botaoMenu = useRef<HTMLButtonElement>(null)
  useEffect(() => setAberto(false), [loc.pathname, loc.hash])
  useEffect(() => {
    if (!aberto) return
    const fecha = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setAberto(false)
      botaoMenu.current?.focus()
    }
    window.addEventListener('keydown', fecha)
    return () => window.removeEventListener('keydown', fecha)
  }, [aberto])
  const links = [
    { to: '/#colecao', t: 'A coleção' },
    { to: '/montar-kit', t: 'Montar meu kit' },
    { to: '/#encomenda', t: 'Como encomendar' },
    { to: '/#sobre', t: 'O ateliê' },
  ]
  return (
    <header className="sticky top-0 z-30 bg-papel/95 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between px-5">
        <Link to="/" className="titulo text-[28px] tracking-[0.06em]" aria-label="PorcelanArt — início">
          PorcelanArt
        </Link>
        <nav className="hidden items-center gap-10 md:flex" aria-label="Principal">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="rotulo text-indigo transition-opacity hover:opacity-60">
              {l.t}
            </Link>
          ))}
          <a href={`https://instagram.com/${INSTAGRAM}`} target="_blank" title="Abre em nova aba" rel="noreferrer" className="rotulo inline-flex items-center gap-2 text-indigo transition-opacity hover:opacity-60">
            <InstaIcon size={18} /> Instagram
          </a>
          <a href={linkZap(MSG_GERAL)} target="_blank" title="Abre em nova aba" rel="noreferrer" className="btn btn-cheio !py-3">
            Fale conosco
          </a>
        </nav>
        <a
          href={`https://instagram.com/${INSTAGRAM}`}
          target="_blank" title="Abre em nova aba"
          rel="noreferrer"
          aria-label="Instagram da PorcelanArt"
          className="ml-auto mr-1 grid h-12 w-12 place-items-center text-indigo md:hidden"
        >
          <InstaIcon size={24} />
        </a>
        <button
          className="grid h-12 w-12 place-items-center md:hidden"
          aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={aberto}
          ref={botaoMenu}
          aria-controls="menu-movel"
          onClick={() => setAberto((v) => !v)}
        >
          <span className="relative block h-3.5 w-6">
            <span className={`absolute left-0 h-[1.5px] w-6 bg-indigo transition-all ${aberto ? 'top-1.5 rotate-45' : 'top-0'}`} />
            <span className={`absolute left-0 top-1.5 h-[1.5px] w-6 bg-indigo transition-opacity ${aberto ? 'opacity-0' : ''}`} />
            <span className={`absolute left-0 h-[1.5px] w-6 bg-indigo transition-all ${aberto ? 'top-1.5 -rotate-45' : 'top-3'}`} />
          </span>
        </button>
      </div>
      {aberto && (
        <nav id="menu-movel" className="border-t border-black/10 bg-papel px-5 pb-6 md:hidden" aria-label="Menu móvel">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="titulo block border-b border-black/10 py-4 text-3xl">
              {l.t}
            </Link>
          ))}
          <a href={linkZap(MSG_GERAL)} target="_blank" title="Abre em nova aba" rel="noreferrer" className="btn btn-cheio mt-6 w-full">
            <ZapIcon /> Chamar no WhatsApp
          </a>
        </nav>
      )}
    </header>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-papel">
      <Drift hero className="pointer-events-none absolute -left-8 top-24 hidden lg:block" from={-40} to={70} rot={[-8, 1]}><Sprig className="h-72 opacity-80" /></Drift>
      <Drift hero className="pointer-events-none absolute -right-4 bottom-24 hidden lg:block" from={50} to={-60} rot={[-2, 7]}><Margarida className="h-64 opacity-70" color="#6aa8dc" /></Drift>
      <div className="relative mx-auto grid max-w-[1200px] items-center gap-10 px-5 pb-10 pt-8 md:grid-cols-[1fr_1fr] md:pb-16 md:pt-14">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }}>
          <h1 className="titulo text-[clamp(3.5rem,11vw,6rem)]">
            Porcelana
            <br />
            pintada
            <br />à mão
          </h1>
          <p className="script mt-4 text-4xl sm:text-5xl">com a sua inicial em ouro</p>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-tinta-suave">
            Canecas, xícaras, pratos e kits com flores, passarinhos e o seu toque em dourado. Tudo feito sob encomenda — chame no WhatsApp e monte a sua.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a href="#colecao" className="btn btn-cheio">
              Ver a coleção
            </a>
            <a href={linkZap(MSG_GERAL)} target="_blank" title="Abre em nova aba" rel="noreferrer" className="btn btn-vazado">
              Quero personalizar a minha
            </a>
          </div>
          <a
            href={`https://instagram.com/${INSTAGRAM}`}
            target="_blank" title="Abre em nova aba"
            rel="noreferrer"
            className="rotulo mt-6 inline-flex min-h-[44px] items-center gap-2.5 text-indigo underline decoration-indigo/40 underline-offset-8 transition-opacity hover:opacity-70"
          >
            <InstaIcon /> Veja mais peças no Instagram @{INSTAGRAM}
          </a>
        </motion.div>

        <motion.div
          className="relative order-first mx-auto w-full max-w-[280px] py-6 md:order-none md:max-w-none"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease, delay: 0.1 }}
        >
          <Drift hero className="absolute -right-6 -top-4 w-[86%]" from={-10} to={50} rot={[-1, 2]}><Blob fill="#ffc400" variante={0} className="block w-full" /></Drift>
          <Drift hero className="absolute -bottom-6 -left-6 w-[60%]" from={20} to={-40} rot={[2, -2]}><Blob fill="#a2d3a6" variante={1} className="block w-full" /></Drift>
          <Drift hero className="relative mx-auto w-[78%] md:ml-auto md:mr-6" from={0} to={-40}>
            <div className="overflow-hidden rounded-lg bg-white shadow-cartao">
              <img src={foto(28)} alt="Três canecas pintadas à mão: bonequinha, flores rosa e flor roxa" className="aspect-[3/4] w-full object-cover" fetchPriority="high" />
            </div>
          </Drift>
          <Drift hero className="absolute -bottom-2 left-0 w-[40%]" from={20} to={-90}>
            <div className="overflow-hidden rounded-lg border-[6px] border-white bg-white shadow-cartao">
              <img src={foto(1)} alt="Xícara com gatinho floral em relevo" className="aspect-square w-full object-cover" />
            </div>
          </Drift>
        </motion.div>
      </div>
      <Onda fill="#ed7328" />
    </section>
  )
}

function Card({ p, i, sobreLaranja = false }: { p: Produto; i: number; sobreLaranja?: boolean }) {
  return (
    <Reveal from="scale" delay={(i % 3) * 0.08} className="h-full">
      <Link to={`/peca/${p.slug}`} className={`group flex h-full flex-col overflow-hidden rounded-lg bg-white ${sobreLaranja ? 'shadow-cartao' : 'shadow-suave'}`}>
        <div className="relative overflow-hidden bg-papel">
          {p.status === 'esgotado' && <span className="rotulo absolute left-2 top-2 z-10 rounded-full bg-tinta px-3 py-1 text-[11px] text-white">Esgotado</span>}
          <img
            src={foto(p.fotos[0])}
            srcSet={`${fotoP(p.fotos[0])} 480w, ${foto(p.fotos[0])} 1200w`}
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 50vw"
            alt={p.nome}
            loading="lazy"
            className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        </div>
        <div className="flex flex-1 flex-col p-3 sm:p-5">
          <p className="rotulo hidden text-[11px] text-tinta-suave sm:block sm:tracking-[0.22em]">{p.categoria}</p>
          <h3 className="titulo text-[22px] leading-none sm:mt-2 sm:text-[30px]">{p.nome}</h3>
          <p className="mt-2 hidden text-[15px] leading-relaxed text-tinta-suave sm:block">{p.resumo}</p>
          {p.preco != null && <p className="mt-2 text-sm font-medium text-indigo">{aPartirDe(p.preco)}</p>}
          <span className="rotulo mt-auto inline-block self-start border-b border-indigo pb-0.5 pt-3 text-[11px] text-indigo sm:pt-4 sm:pb-1 sm:text-[12px]">Ver detalhes</span>
        </div>
      </Link>
    </Reveal>
  )
}

function Colecao() {
  const { produtos, categorias: cats, carregando } = useCatalogo()
  const [cat, setCat] = useState('Todas')
  const [busca, setBusca] = useState('')
  const [todas, setTodas] = useState(false)
  const categorias = ['Todas', ...cats]
  const catAtiva = categorias.includes(cat) ? cat : 'Todas'
  const porCategoria = catAtiva === 'Todas' ? produtos : produtos.filter((p) => p.categoria === catAtiva)
  const b = norm(busca)
  const filtrada = !b ? porCategoria : porCategoria.filter((p) => norm(p.nome).includes(b) || norm(p.categoria).includes(b) || norm(p.resumo).includes(b))
  const lista = catAtiva === 'Todas' && !todas && !b ? filtrada.slice(0, 9) : filtrada
  return (
    <section id="colecao" className="relative overflow-hidden bg-laranja">
      <Drift className="pointer-events-none absolute -right-6 top-6 hidden lg:block" from={-30} to={90} rot={[-4, 8]}><Xicara className="h-40" color="#fff" /></Drift>
      <Drift className="pointer-events-none absolute -left-10 top-40 hidden lg:block" from={-60} to={120} rot={[2, 9]}><Sprig className="h-64" color="#fff" /></Drift>
      <div className="relative mx-auto max-w-[1200px] px-5 pb-16 pt-6 md:pb-24">
        <Reveal className="text-center">
          <h2 className="titulo !text-indigo text-[clamp(3.25rem,9vw,5.5rem)]">A coleção</h2>
          <p className="script mt-2 !text-tinta text-4xl">tudo é feito sob encomenda, do seu jeito</p>
        </Reveal>
        <div className="mx-auto mt-8 max-w-md">
          <label htmlFor="busca-coleção" className="sr-only">Buscar peça pelo nome</label>
          <div className="relative">
            <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 opacity-60" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
            <input
              id="busca-coleção"
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, ex.: boleira, xícara…"
              className="min-h-[48px] w-full rounded-full border-0 bg-white py-2.5 pl-11 pr-4 text-[16px] text-tinta shadow-suave outline-none focus:ring-2 focus:ring-indigo"
            />
          </div>
        </div>
        <div className="sem-barra -mx-5 mt-6 flex snap-x gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:flex-wrap md:justify-center md:overflow-visible md:px-0" role="group" aria-label="Filtrar por tipo">
          {categorias.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              aria-pressed={catAtiva === c}
              className={`rotulo min-h-[44px] shrink-0 snap-start whitespace-nowrap rounded-full px-6 py-2.5 transition-colors ${
                catAtiva === c ? 'bg-indigo text-white' : 'bg-white text-indigo hover:bg-papel'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        {carregando && !produtos.length && <p className="mt-10 text-center text-indigo" role="status">Carregando as peças…</p>}
        {!carregando && lista.length === 0 && (
          <p className="mt-10 text-center text-tinta">Nenhuma peça encontrada para “{busca}”. Tente outra palavra ou <button onClick={() => setBusca('')} className="underline">limpe a busca</button>.</p>
        )}
        <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-3">
          {lista.map((p, i) => (
            <Card key={p.slug} p={p} i={i} sobreLaranja />
          ))}
        </div>
        {catAtiva === 'Todas' && !todas && filtrada.length > 9 && (
          <div className="mt-12 text-center">
            <button onClick={() => setTodas(true)} className="btn btn-cheio">
              Ver todas as {filtrada.length} peças
            </button>
          </div>
        )}
      </div>
      <Onda fill="#fbf9f6" />
    </section>
  )
}

function MontarChamada() {
  return (
    <section className="mx-auto max-w-[1000px] px-5 pb-6 pt-14 text-center md:pt-20">
      <h2 className="titulo text-[clamp(2.75rem,7vw,4.5rem)]">Monte o seu próprio kit</h2>
      <p className="script mt-1 text-4xl">quantas xícaras, pires, pratos e bandejas você quiser</p>
      <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-tinta-suave">Escolha os modelos, veja a estimativa “a partir de” e envie a lista pronta pelo WhatsApp.</p>
      <Link to="/montar-kit" className="btn btn-cheio mt-8">Montar meu kit</Link>
    </section>
  )
}

function Passos() {
  const passos = [
    ['Escolha a peça', 'Veja os tipos de peça e toque no que combina com você — ou com quem vai ganhar o presente.'],
    ['Converse com a gente', 'O botão “Quero personalizar a minha” abre o WhatsApp com a mensagem pronta. Conte cores, tema, inicial e prazo.'],
    ['Pintada só para você', 'Combinado o pedido, a peça é pintada à mão e finalizada com o acabamento escolhido.'],
  ]
  return (
    <section id="encomenda" className="mx-auto max-w-[1200px] px-5 py-16 md:py-24">
      <Reveal className="text-center">
        <h2 className="titulo text-[clamp(3rem,7vw,4.5rem)]">Como encomendar</h2>
        <p className="script mt-1 text-4xl">simples como uma conversa</p>
      </Reveal>
      <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-12">
        {passos.map(([t, d], i) => (
          <motion.li
            key={t}
            className="list-none border-t-2 border-indigo pt-5"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease, delay: i * 0.08 }}
          >
            <span className="titulo text-[64px] !text-mel" style={{ WebkitTextStroke: '1px #234386' }}>
              0{i + 1}
            </span>
            <h3 className="titulo mt-1 text-[32px]">{t}</h3>
            <p className="mt-2 max-w-[34ch] leading-relaxed text-tinta-suave">{d}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  )
}

function Sobre() {
  return (
    <section id="sobre" className="relative overflow-hidden bg-papel">
      <Drift className="pointer-events-none absolute -left-6 bottom-10 hidden lg:block" from={60} to={-60} rot={[-8, 2]}><Margarida className="h-60" /></Drift>
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 pb-12 pt-6 md:grid-cols-2 md:pb-16">
        <Reveal>
          <div className="relative mx-auto max-w-[440px] py-6">
            <Drift className="absolute -left-8 -top-2 w-[90%]" from={-25} to={35} rot={[-2, 2]}><Blob fill="#a2d3a6" variante={2} className="block w-full" /></Drift>
            <Drift className="relative" from={25} to={-25}>
            <div className="overflow-hidden rounded-lg bg-white shadow-cartao">
              <img src={foto(13)} alt="Kit de chá margarida pintado à mão" loading="lazy" className="aspect-[4/5] w-full object-cover" />
            </div>
            </Drift>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="titulo text-[clamp(3rem,7vw,4.5rem)]">Nenhuma peça igual à outra</h2>
          <p className="script mt-3 text-4xl">uma flor, uma pena, um filete de ouro: tudo pintado à mão</p>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-tinta-suave">
            No ateliê PorcelanArt, nenhuma peça é feita em série. Presentes de aniversário, casamento, chá de bebê, lembrancinhas ou um mimo para si: conte a ideia e a gente pinta.
          </p>
          <a href={`https://instagram.com/${INSTAGRAM}`} target="_blank" title="Abre em nova aba" rel="noreferrer" className="btn btn-vazado mt-8">
            Ver mais no Instagram
          </a>
        </Reveal>
      </div>
      <Onda fill="#234386" />
    </section>
  )
}

function Rodape() {
  return (
    <footer className="bg-indigo text-white">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 px-5 pb-12 pt-4 text-center">
        <p className="titulo !text-white text-[44px] tracking-[0.06em]">PorcelanArt</p>
        <p className="script !text-mel text-3xl">porcelana pintada à mão, sob encomenda</p>
        <a
          href={linkZap(MSG_GERAL)}
          target="_blank" title="Abre em nova aba"
          rel="noreferrer"
          className="btn mt-2 bg-white !text-indigo transition-opacity hover:opacity-85"
        >
          <ZapIcon /> Chamar no WhatsApp
        </a>
        <a href={`https://instagram.com/${INSTAGRAM}`} target="_blank" title="Abre em nova aba" rel="noreferrer" className="rotulo inline-flex min-h-[44px] items-center gap-2.5 text-white underline decoration-white/40 underline-offset-8 hover:decoration-white">
          <InstaIcon /> @{INSTAGRAM}
        </a>
        <p className="mt-6 text-xs text-white/70">© {new Date().getFullYear()} PorcelanArt · Todas as peças são pintadas à mão.</p>
      </div>
    </footer>
  )
}

function Home() {
  const loc = useLocation()
  useEffect(() => {
    if (loc.hash) document.querySelector(loc.hash)?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [loc.key])
  usePagina('PorcelanArt — Porcelana pintada à mão', 'Canecas, xícaras, pratos, boleiras, kits e mais, pintados à mão com acabamento dourado. Personalize a sua pelo WhatsApp.', '/')
  return (
    <>
      <Hero />
      <Colecao />
      <MontarChamada />
      <Passos />
      <Sobre />
    </>
  )
}

function Peca() {
  const { slug } = useParams()
  const { achar, produtos, carregando } = useCatalogo()
  const p = achar(slug)
  const [escolhas, setEscolhas] = useState<Record<string, string>>({})
  useEffect(() => setEscolhas({}), [slug])
  const [atual, setAtual] = useState(0)
  const faixa = useRef<HTMLDivElement>(null)
  const total = p?.fotos.length ?? 0
  const ir = (d: number) => setAtual((a) => (a + d + total) % total)
  const [pronta, setPronta] = useState(false)
  useEffect(() => setPronta(false), [atual, slug])
  useEffect(() => {
    if (!p || total < 2) return
    const prox = new Image()
    prox.src = foto(p.fotos[(atual + 1) % total])
  }, [p, atual, total])
  usePagina(
    p ? `${p.nome} — PorcelanArt` : 'Peça não encontrada — PorcelanArt',
    p ? `${p.resumo} Personalize a sua pelo WhatsApp.` : 'Essa página não existe. Veja a coleção da PorcelanArt.',
    p ? `/peca/${p.slug}` : '/',
    !p,
  )
  useEffect(() => {
    faixa.current?.querySelector<HTMLElement>('[data-ativa="true"]')?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [atual])
  useEffect(() => {
    window.scrollTo(0, 0)
    setAtual(0)
  }, [slug])

  if (!p && carregando) return <p className="py-32 text-center text-indigo" role="status">Carregando…</p>
  if (!p)
    return (
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <h1 className="titulo text-6xl">Peça não encontrada</h1>
        <Link to="/#colecao" className="btn btn-cheio mt-8">
          Voltar à coleção
        </Link>
      </div>
    )

  const variacoes = p.variacoes ?? []
  const faltam = variacoes.filter((v) => !escolhas[v.nome])
  const esgotado = p.status === 'esgotado'
  const relacionados = produtos.filter((x) => x.slug !== p.slug && x.categoria === p.categoria).concat(produtos.filter((x) => x.slug !== p.slug && x.categoria !== p.categoria)).slice(0, 3)
  return (
    <>
      <div className="mx-auto max-w-[1200px] px-5 pt-4">
        <Link to="/#colecao" className="rotulo inline-flex min-h-[44px] items-center text-indigo hover:opacity-60">
          ← A coleção
        </Link>
      </div>
      <section className="relative mx-auto grid max-w-[1200px] gap-10 px-5 pb-20 pt-4 md:grid-cols-[1.1fr_1fr] md:pt-8">
        <div className="relative min-w-0">
          <Blob fill="#ffc400" variante={1} className="absolute -left-8 -top-6 w-[70%]" />
          <div
            className="relative overflow-hidden rounded-lg bg-white shadow-cartao"
            role="group"
            aria-roledescription="carrossel"
            aria-label={`Fotos de ${p.nome}`}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') ir(1)
              if (e.key === 'ArrowLeft') ir(-1)
            }}
          >
            <motion.img
              key={`${slug}-${atual}`}
              ref={(el) => {
                if (el?.complete && el.naturalWidth) setPronta(true)
              }}
              onLoad={() => setPronta(true)}
              src={foto(p.fotos[atual])}
              alt={`${p.nome} — foto ${atual + 1}`}
              className="aspect-[4/5] w-full cursor-grab object-cover active:cursor-grabbing"
              initial={{ opacity: 0 }}
              animate={{ opacity: pronta ? 1 : 0 }}
              transition={{ duration: 0.35 }}
              drag={total > 1 ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) ir(1)
                else if (info.offset.x > 60) ir(-1)
              }}
            />
            {total > 1 && (
              <>
                <button onClick={() => ir(-1)} aria-label="Foto anterior" className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-indigo shadow-suave transition-colors hover:bg-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>
                </button>
                <button onClick={() => ir(1)} aria-label="Próxima foto" className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-indigo shadow-suave transition-colors hover:bg-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
                </button>
                <span className="rotulo absolute bottom-3 right-3 rounded-full bg-indigo px-3 py-1 text-[11px] text-white" aria-live="polite">
                  {atual + 1} / {total}
                </span>
              </>
            )}
          </div>
          {p.fotos.length > 1 && (
            <div ref={faixa} role="group" aria-label="Miniaturas das fotos" className="sem-barra relative mt-4 flex gap-3 overflow-x-auto pb-1">
              {p.fotos.map((f, i) => (
                <button
                  key={f}
                  onClick={() => setAtual(i)}
                  aria-label={`Ver foto ${i + 1}`}
                  aria-current={atual === i ? 'true' : undefined}
                  data-ativa={atual === i}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-all ${atual === i ? 'border-indigo' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={fotoP(f)} alt="" decoding="async" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="md:pt-6">
          <p className="rotulo text-tinta-suave">{p.categoria}</p>
          <h1 className="titulo mt-3 text-[clamp(2.5rem,6vw,4.5rem)]">{p.nome}</h1>
          <p className="script mt-3 text-3xl">{p.resumo}</p>
          <p className="mt-6 text-[17px] leading-relaxed text-tinta-suave">{p.descricao}</p>
          <ul className="mt-6 space-y-2.5">
            {p.detalhes.map((d) => (
              <li key={d} className="flex gap-3">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-laranja" aria-hidden="true" />
                {d}
              </li>
            ))}
          </ul>
          {p.preco != null && <p className="mt-6 text-2xl font-medium text-indigo">{aPartirDe(p.preco)}</p>}
          {variacoes.map((v) => (
            <fieldset key={v.nome} className="mt-6">
              <legend className="rotulo mb-2 text-tinta-suave">{v.nome}</legend>
              <div className="flex flex-wrap gap-2">
                {v.opcoes.map((o) => (
                  <button
                    key={o}
                    type="button"
                    aria-pressed={escolhas[v.nome] === o}
                    onClick={() => setEscolhas((e) => ({ ...e, [v.nome]: o }))}
                    className={`min-h-[44px] rounded-full border px-5 text-[15px] transition-colors ${escolhas[v.nome] === o ? 'border-indigo bg-indigo text-white' : 'border-indigo/40 text-indigo hover:bg-indigo/5'}`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
          {esgotado ? (
            <div className="mt-8 rounded-lg border border-[#b4470a]/40 bg-[#b4470a]/5 p-4">
              <p className="font-medium text-[#8a3606]">Esgotado no momento</p>
              <a href={linkZap(`Olá! Vi que "${p.nome}" está esgotado. Podem me avisar quando voltar ou sugerir algo parecido?`)} target="_blank" title="Abre em nova aba" rel="noreferrer" className="btn btn-vazado mt-3 w-full sm:w-auto">
                <ZapIcon /> Perguntar quando volta
              </a>
            </div>
          ) : (
            <>
              <a
                href={faltam.length ? undefined : linkZap(msgProduto(p.nome, escolhas))}
                aria-disabled={faltam.length > 0}
                onClick={(e) => faltam.length && e.preventDefault()}
                target="_blank"
                title="Abre em nova aba"
                rel="noreferrer"
                className={`btn btn-cheio mt-10 w-full sm:w-auto ${faltam.length ? 'pointer-events-none opacity-40' : ''}`}
              >
                <ZapIcon /> Quero personalizar a minha
              </a>
              {faltam.length > 0 && <p className="mt-3 text-sm text-[#8a3606]">Escolha: {faltam.map((v) => v.nome).join(', ')}</p>}
            </>
          )}
          <p className="mt-4 text-sm text-tinta-suave">O valor final é combinado na conversa — depende da personalização.</p>
          <p className="mt-2 text-sm text-tinta-suave">As fotos são exemplos de peças já feitas; a sua pode ter outras cores, temas e inicial.</p>
        </div>
      </section>
      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1200px] px-5">
          <h2 className="titulo text-[44px]">Outras peças para personalizar</h2>
          <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-8 sm:gap-y-10 lg:grid-cols-3">
            {relacionados.map((r, i) => (
              <Card key={r.slug} p={r} i={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default function App() {
  const emPainel = useLocation().pathname.startsWith('/painel')
  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-indigo focus:px-5 focus:py-3 focus:text-white">
        Pular para o conteúdo
      </a>
      {!emPainel && <ScrollProgress />}
      {!emPainel && <Header />}
      <main id="conteudo">
        <Suspense fallback={<p className="py-32 text-center text-indigo" role="status">Carregando…</p>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/montar-kit" element={<Montar />} />
          <Route path="/painel" element={<Painel />} />
          <Route path="/peca/:slug" element={<Peca />} />
          <Route path="*" element={<Peca />} />
        </Routes>
        </Suspense>
      </main>
      {!emPainel && <Rodape />}
    </>
  )
}
