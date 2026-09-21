import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalogo } from './catalogo'
import { aPartirDe, brl, fotoP, linkZap, type Peca } from './data'

/** "Montar meu próprio kit": o cliente escolhe modelos e quantidades; o valor é uma estimativa "a partir de". */

const ZapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
)

function Passo({ peca, qtd, mudar }: { peca: Peca; qtd: number; mudar: (delta: number) => void }) {
  const esgotado = peca.status === 'esgotado'
  return (
    <li className={`flex items-center gap-3 rounded-lg bg-white p-3 shadow-suave ${esgotado ? 'opacity-60' : ''}`}>
      <img src={fotoP(peca.foto)} alt="" loading="lazy" className="h-20 w-20 shrink-0 rounded-md bg-papel object-cover sm:h-24 sm:w-24" />
      <div className="min-w-0 flex-1">
        <p className="titulo text-[24px] leading-none">{peca.modelo}</p>
        <p className="mt-1 text-sm text-tinta-suave">{peca.preco != null ? aPartirDe(peca.preco) : 'Valor sob consulta'}</p>
        {esgotado && <p className="mt-1 text-sm font-medium text-[#b4470a]">Esgotado no momento</p>}
      </div>
      <div className="flex shrink-0 items-center gap-1" role="group" aria-label={`Quantidade de ${peca.modelo}`}>
        <button
          className="grid h-11 w-11 place-items-center rounded-full border border-indigo/40 text-xl text-indigo disabled:opacity-30"
          aria-label={`Menos ${peca.modelo}`}
          disabled={esgotado || qtd === 0}
          onClick={() => mudar(-1)}
        >
          −
        </button>
        <span className="w-8 text-center text-lg font-medium tabular-nums" aria-live="polite">{qtd}</span>
        <button
          className="grid h-11 w-11 place-items-center rounded-full bg-indigo text-xl text-white disabled:opacity-30"
          aria-label={`Mais ${peca.modelo}`}
          disabled={esgotado || qtd >= 99}
          onClick={() => mudar(1)}
        >
          +
        </button>
      </div>
    </li>
  )
}

export default function Montar() {
  const { pecas } = useCatalogo()
  const [qtd, setQtd] = useState<Record<string, number>>({})
  const [obs, setObs] = useState('')

  useEffect(() => {
    document.title = 'Montar meu próprio kit — PorcelanArt'
    document.head.querySelector('meta[name="description"]')?.setAttribute('content', 'Escolha as xícaras, pires, pratos e bandejas que quer no seu kit e veja uma estimativa. Personalize pelo WhatsApp.')
    window.scrollTo(0, 0)
  }, [])

  const grupos = useMemo(() => {
    const m = new Map<string, Peca[]>()
    for (const p of pecas) m.set(p.tipo, [...(m.get(p.tipo) ?? []), p])
    return [...m.entries()]
  }, [pecas])

  const escolhidas = pecas.filter((p) => (qtd[p.id] ?? 0) > 0)
  const totalPecas = escolhidas.reduce((n, p) => n + qtd[p.id], 0)
  const comPreco = escolhidas.filter((p) => p.preco != null)
  const estimativa = comPreco.reduce((n, p) => n + (p.preco ?? 0) * qtd[p.id], 0)
  const semPreco = escolhidas.length - comPreco.length

  const mensagem = () => {
    const linhas = escolhidas.map((p) => `• ${qtd[p.id]}x ${p.tipo} — ${p.modelo}`)
    const est = comPreco.length ? `\nEstimativa: ${aPartirDe(estimativa)}${semPreco ? ` (+ ${semPreco} item(ns) sob consulta)` : ''} — sei que o valor final depende da personalização.` : ''
    const extra = obs.trim() ? `\nPersonalização: ${obs.trim()}` : ''
    return `Olá! Quero montar o meu próprio kit:\n${linhas.join('\n')}${est}${extra}`
  }

  return (
    <div className="mx-auto max-w-[1000px] px-5 pb-40 pt-10">
      <Link to="/#colecao" className="rotulo inline-flex min-h-[44px] items-center text-indigo hover:opacity-60">← A coleção</Link>
      <h1 className="titulo mt-2 text-[clamp(3rem,8vw,5.5rem)]">Montar meu próprio kit</h1>
      <p className="script mt-1 text-3xl">escolha as peças e quantas quiser</p>
      <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-tinta-suave">
        Marque a quantidade de cada modelo. Os valores são o <b>preço base</b> (“a partir de”): o valor final depende da personalização — inicial em ouro, tema, cores — e é combinado no WhatsApp.
      </p>

      {grupos.length === 0 && (
        <div className="mt-10 rounded-lg bg-white p-6 shadow-suave">
          <p className="text-[17px] text-tinta-suave">Estamos preparando as peças para você montar o seu kit. Enquanto isso, conte pelo WhatsApp o que você imagina e a gente monta junto.</p>
          <a className="btn btn-cheio mt-5" href={linkZap('Olá! Quero montar o meu próprio kit de porcelana.')} target="_blank" rel="noreferrer" title="Abre em nova aba">Chamar no WhatsApp</a>
        </div>
      )}

      <div className="mt-10 space-y-10">
        {grupos.map(([tipo, itens]) => (
          <section key={tipo} aria-labelledby={`g-${tipo.replace(/\W+/g, '-')}`}>
            <h2 id={`g-${tipo.replace(/\W+/g, '-')}`} className="titulo text-[36px]">{tipo}</h2>
            <ul className="mt-3 grid gap-3 md:grid-cols-2">
              {itens.map((p) => (
                <Passo key={p.id} peca={p} qtd={qtd[p.id] ?? 0} mudar={(d) => setQtd((q) => ({ ...q, [p.id]: Math.min(99, Math.max(0, (q[p.id] ?? 0) + d)) }))} />
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-12">
        <label htmlFor="obs" className="titulo text-[28px]">Como você quer personalizar? (opcional)</label>
        <textarea
          id="obs"
          rows={3}
          maxLength={400}
          value={obs}
          onChange={(e) => setObs(e.target.value)}
          placeholder="Ex.: inicial M em ouro, tema passarinhos, tons rosa e azul…"
          className="mt-2 w-full rounded-lg border border-indigo/30 bg-white p-4 text-[16px] outline-none focus:border-indigo focus:ring-2 focus:ring-indigo/20"
        />
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-indigo/20 bg-papel/95 backdrop-blur" role="region" aria-label="Resumo do kit">
        <div className="mx-auto flex max-w-[1000px] flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div>
            <p className="text-sm text-tinta-suave">{totalPecas === 0 ? 'Nenhuma peça escolhida ainda' : `${totalPecas} peça${totalPecas > 1 ? 's' : ''} no kit`}</p>
            <p className="titulo text-[28px] leading-none">
              {totalPecas === 0 ? '—' : comPreco.length ? `a partir de ${brl(estimativa)}` : 'valor sob consulta'}
              {semPreco > 0 && comPreco.length > 0 && <span className="ml-2 font-sans text-sm normal-case tracking-normal text-tinta-suave">+ {semPreco} sob consulta</span>}
            </p>
          </div>
          <a
            href={totalPecas ? linkZap(mensagem()) : undefined}
            aria-disabled={!totalPecas}
            target="_blank"
            rel="noreferrer"
            title="Abre em nova aba"
            onClick={(e) => !totalPecas && e.preventDefault()}
            className={`btn btn-cheio ${totalPecas ? '' : 'pointer-events-none opacity-40'}`}
          >
            <ZapIcon /> Enviar meu kit pelo WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
