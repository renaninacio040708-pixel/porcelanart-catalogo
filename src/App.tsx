import { useEffect, useState } from 'react'
import { Link, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { Blob, Margarida, Onda, Sprig, Xicara } from './Decor'
import {
  INSTAGRAM,
  achar,
  categorias,
  foto,
  linkZap,
  msgProduto,
  produtos,
  type Categoria,
  type Produto,
} from './data'

const ease = [0.22, 1, 0.36, 1] as const
const MSG_GERAL = 'Olá! Vim pelo site da PorcelanArt e gostaria de solicitar um orçamento.'

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease, delay }}
    >
      {children}
    </motion.div>
  )
}

function ZapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

function Header() {
  const [aberto, setAberto] = useState(false)
  const loc = useLocation()
  useEffect(() => setAberto(false), [loc.pathname, loc.hash])
  const links = [
    { to: '/#colecao', t: 'A coleção' },
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
          <a href={linkZap(MSG_GERAL)} target="_blank" rel="noreferrer" className="btn btn-cheio !py-3">
            Fale conosco
          </a>
        </nav>
        <button
          className="grid h-12 w-12 place-items-center md:hidden"
          aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={aberto}
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
        <nav className="border-t border-black/10 bg-papel px-5 pb-6 md:hidden" aria-label="Menu móvel">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="titulo block border-b border-black/10 py-4 text-3xl">
              {l.t}
            </Link>
          ))}
          <a href={linkZap(MSG_GERAL)} target="_blank" rel="noreferrer" className="btn btn-cheio mt-6 w-full">
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
      <Sprig className="pointer-events-none absolute -left-8 top-24 hidden h-72 rotate-[-12deg] opacity-80 lg:block" />
      <Margarida className="pointer-events-none absolute -right-4 bottom-24 hidden h-64 rotate-[8deg] opacity-70 lg:block" color="#6aa8dc" />
      <div className="relative mx-auto grid max-w-[1200px] items-center gap-10 px-5 pb-10 pt-8 md:grid-cols-[1fr_1fr] md:pb-16 md:pt-14">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }}>
          <p className="rotulo mb-5 text-indigo">Ateliê de porcelana pintada à mão</p>
          <h1 className="titulo text-[64px] sm:text-[88px] lg:text-[104px]">
            Porcelana
            <br />
            pintada
            <br />à mão
          </h1>
          <p className="script mt-4 text-4xl sm:text-5xl">cada peça, uma pequena história</p>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-tinta-suave">
            Canecas, xícaras, pratos e kits com flores, passarinhos e o seu toque em dourado. Tudo feito sob encomenda — peça seu orçamento pelo WhatsApp.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a href="#colecao" className="btn btn-cheio">
              Ver a coleção
            </a>
            <a href={linkZap(MSG_GERAL)} target="_blank" rel="noreferrer" className="btn btn-vazado">
              Pedir orçamento <span aria-hidden="true">→</span>
            </a>
          </div>
        </motion.div>

        <motion.div
          className="relative mx-auto w-full max-w-[460px] py-6 md:max-w-none"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease, delay: 0.1 }}
        >
          <Blob fill="#ffc400" variante={0} className="absolute -right-6 -top-4 w-[86%]" />
          <Blob fill="#a2d3a6" variante={1} className="absolute -bottom-6 -left-6 w-[60%]" />
          <div className="relative mx-auto w-[78%] overflow-hidden rounded-lg bg-white shadow-cartao md:ml-auto md:mr-6">
            <img src={foto(4)} alt="Canecas pintadas com passarinhos e inicial dourada" className="aspect-[3/4] w-full object-cover" fetchPriority="high" />
          </div>
          <div className="absolute -bottom-2 left-0 w-[40%] overflow-hidden rounded-lg border-[6px] border-white bg-white shadow-cartao">
            <img src={foto(1)} alt="Xícara com gatinho floral em relevo" className="aspect-square w-full object-cover" />
          </div>
        </motion.div>
      </div>
      <Onda fill="#ed7328" />
    </section>
  )
}

function Card({ p, i, sobreLaranja = false }: { p: Produto; i: number; sobreLaranja?: boolean }) {
  return (
    <Reveal delay={(i % 3) * 0.08}>
      <Link to={`/peca/${p.slug}`} className={`group block overflow-hidden rounded-lg bg-white ${sobreLaranja ? 'shadow-cartao' : 'shadow-suave'}`}>
        <div className="overflow-hidden bg-papel">
          <img
            src={foto(p.fotos[0])}
            alt={p.nome}
            loading="lazy"
            className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        </div>
        <div className="p-5">
          <p className="rotulo text-[11px] text-tinta-suave">{p.categoria}</p>
          <h3 className="titulo mt-2 text-[30px]">{p.nome}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-tinta-suave">{p.resumo}</p>
          <span className="rotulo mt-4 inline-block border-b border-indigo pb-1 text-indigo">Ver peça →</span>
        </div>
      </Link>
    </Reveal>
  )
}

function Colecao() {
  const [cat, setCat] = useState<Categoria>('Todas')
  const lista = cat === 'Todas' ? produtos : produtos.filter((p) => p.categoria === cat)
  return (
    <section id="colecao" className="relative overflow-hidden bg-laranja">
      <Xicara className="pointer-events-none absolute -right-6 top-6 hidden h-40 rotate-[10deg] lg:block" color="#fff" />
      <Sprig className="pointer-events-none absolute -left-10 top-40 hidden h-64 rotate-[14deg] lg:block" color="#fff" />
      <div className="relative mx-auto max-w-[1200px] px-5 pb-16 pt-6 md:pb-24">
        <Reveal className="text-center">
          <h2 className="titulo !text-white text-[56px] md:text-[88px]">A coleção</h2>
          <p className="script !text-white mt-2 text-4xl">toque em uma peça para conhecer de perto</p>
        </Reveal>
        <div className="mt-10 flex flex-wrap justify-center gap-3" role="group" aria-label="Filtrar por tipo">
          {categorias.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
              className={`rotulo min-h-[44px] rounded-full px-6 py-2.5 transition-colors ${
                cat === c ? 'bg-indigo text-white' : 'bg-white text-indigo hover:bg-papel'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((p, i) => (
            <Card key={p.slug} p={p} i={i} sobreLaranja />
          ))}
        </div>
      </div>
      <Onda fill="#fbf9f6" />
    </section>
  )
}

function Passos() {
  const passos = [
    ['Escolha a peça', 'Navegue pela coleção e toque na que combina com você — ou com quem vai ganhar o presente.'],
    ['Peça o orçamento', 'O botão “Encomendar” abre o WhatsApp com a mensagem pronta. Conte cores, inicial e prazo.'],
    ['Pintada só para você', 'Combinado o pedido, a peça é pintada à mão e finalizada com o acabamento escolhido.'],
  ]
  return (
    <section id="encomenda" className="mx-auto max-w-[1200px] px-5 py-16 md:py-24">
      <Reveal className="text-center">
        <h2 className="titulo text-[52px] md:text-[72px]">Como encomendar</h2>
        <p className="script mt-1 text-4xl">simples como uma conversa</p>
      </Reveal>
      <ol className="mt-14 grid gap-6 md:grid-cols-3">
        {passos.map(([t, d], i) => (
          <Reveal key={t} delay={i * 0.1}>
            <li className="h-full list-none rounded-lg bg-white p-8 shadow-suave">
              <span className="titulo text-[64px] !text-mel" style={{ WebkitTextStroke: '1px #234386' }}>
                0{i + 1}
              </span>
              <h3 className="titulo mt-2 text-[32px]">{t}</h3>
              <p className="mt-3 leading-relaxed text-tinta-suave">{d}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  )
}

function Sobre() {
  return (
    <section id="sobre" className="relative overflow-hidden bg-papel">
      <Margarida className="pointer-events-none absolute -left-6 bottom-10 hidden h-60 rotate-[-10deg] lg:block" />
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 pb-12 pt-6 md:grid-cols-2 md:pb-16">
        <Reveal>
          <div className="relative mx-auto max-w-[440px] py-6">
            <Blob fill="#a2d3a6" variante={2} className="absolute -left-8 -top-2 w-[90%]" />
            <div className="relative overflow-hidden rounded-lg bg-white shadow-cartao">
              <img src={foto(13)} alt="Kit de chá margarida pintado à mão" loading="lazy" className="aspect-[4/5] w-full object-cover" />
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="titulo text-[52px] md:text-[72px]">Feito com calma, detalhe por detalhe</h2>
          <p className="script mt-3 text-4xl">nenhuma peça sai igual à outra</p>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-tinta-suave">
            No ateliê PorcelanArt cada flor, pena e filete dourado é pintado à mão. Presentes de aniversário, casamento, chá de bebê, lembrancinhas ou um mimo para si: conte a ideia e a gente pinta.
          </p>
          <a href={`https://instagram.com/${INSTAGRAM}`} target="_blank" rel="noreferrer" className="btn btn-vazado mt-8">
            Ver no Instagram <span aria-hidden="true">→</span>
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
          target="_blank"
          rel="noreferrer"
          className="btn mt-2 bg-white !text-indigo transition-opacity hover:opacity-85"
        >
          <ZapIcon /> Chamar no WhatsApp
        </a>
        <a href={`https://instagram.com/${INSTAGRAM}`} target="_blank" rel="noreferrer" className="rotulo text-white/85 underline underline-offset-8 hover:text-white">
          @{INSTAGRAM}
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
  }, [loc.hash, loc.pathname])
  return (
    <>
      <Hero />
      <Colecao />
      <Passos />
      <Sobre />
    </>
  )
}

function Peca() {
  const { slug } = useParams()
  const p = achar(slug)
  const [atual, setAtual] = useState(0)
  useEffect(() => {
    window.scrollTo(0, 0)
    setAtual(0)
  }, [slug])

  if (!p)
    return (
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <h1 className="titulo text-6xl">Peça não encontrada</h1>
        <Link to="/#colecao" className="btn btn-cheio mt-8">
          Voltar à coleção
        </Link>
      </div>
    )

  const relacionados = produtos.filter((x) => x.slug !== p.slug && x.categoria === p.categoria).concat(produtos.filter((x) => x.slug !== p.slug && x.categoria !== p.categoria)).slice(0, 3)
  return (
    <>
      <div className="mx-auto max-w-[1200px] px-5 pt-4">
        <Link to="/#colecao" className="rotulo inline-flex min-h-[44px] items-center text-indigo hover:opacity-60">
          ← A coleção
        </Link>
      </div>
      <section className="relative mx-auto grid max-w-[1200px] gap-10 px-5 pb-20 pt-4 md:grid-cols-[1.1fr_1fr] md:pt-8">
        <div className="relative">
          <Blob fill="#ffc400" variante={1} className="absolute -left-8 -top-6 w-[70%]" />
          <div className="relative overflow-hidden rounded-lg bg-white shadow-cartao">
            <motion.img
              key={atual}
              src={foto(p.fotos[atual])}
              alt={`${p.nome} — foto ${atual + 1}`}
              className="aspect-[4/5] w-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            />
          </div>
          {p.fotos.length > 1 && (
            <div className="relative mt-4 flex gap-3">
              {p.fotos.map((f, i) => (
                <button
                  key={f}
                  onClick={() => setAtual(i)}
                  aria-label={`Ver foto ${i + 1}`}
                  aria-current={atual === i}
                  className={`h-20 w-20 overflow-hidden rounded-lg border-2 bg-white transition-all ${atual === i ? 'border-indigo' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={foto(f)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="md:pt-6">
          <p className="rotulo text-tinta-suave">{p.categoria}</p>
          <h1 className="titulo mt-3 text-[52px] md:text-[72px]">{p.nome}</h1>
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
          <a href={linkZap(msgProduto(p.nome))} target="_blank" rel="noreferrer" className="btn btn-cheio mt-10 w-full sm:w-auto">
            <ZapIcon /> Encomendar pelo WhatsApp
          </a>
          <p className="mt-4 text-sm text-tinta-suave">Valores sob orçamento — cada peça é feita sob medida para você.</p>
        </div>
      </section>
      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1200px] px-5">
          <h2 className="titulo text-[44px]">Você também pode gostar</h2>
          <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
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
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/peca/:slug" element={<Peca />} />
          <Route path="*" element={<Peca />} />
        </Routes>
      </main>
      <Rodape />
    </>
  )
}
