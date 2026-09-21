import type { SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigurado } from '../config'
import { produtos as estaticos, type Peca, type Produto, type Status } from '../data'

export type NovoProduto = Omit<Produto, 'id'> & { id?: string }
export type NovaPeca = Omit<Peca, 'id'> & { id?: string }

export interface Store {
  /** true = modo demonstração (dados só neste navegador) */
  demo: boolean
  sessao(): Promise<string | null>
  entrar(email: string, senha: string): Promise<void>
  sair(): Promise<void>
  listarKits(): Promise<Produto[]>
  salvarKit(k: NovoProduto): Promise<Produto>
  removerKit(id: string): Promise<void>
  statusKit(id: string, s: Status): Promise<void>
  listarPecas(): Promise<Peca[]>
  salvarPeca(p: NovaPeca): Promise<Peca>
  removerPeca(id: string): Promise<void>
  enviarFoto(arquivo: File): Promise<string>
}

/** Reduz a foto antes de enviar (máx. 1400px, WebP) para o site ficar leve. */
export async function reduzirFoto(arquivo: File, max = 1400): Promise<Blob> {
  const bmp = await createImageBitmap(arquivo)
  const esc = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas')
  c.width = Math.round(bmp.width * esc)
  c.height = Math.round(bmp.height * esc)
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
  return new Promise((ok, erro) => c.toBlob((b) => (b ? ok(b) : erro(new Error('Não foi possível processar a foto'))), 'image/webp', 0.82))
}

export const slugDe = (t: string) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'produto'

/** Catálogo que já estava no código → linhas do banco (fotos viram caminhos /img/...). */
export function catalogoAtualComoLinhas(): NovoProduto[] {
  return estaticos.map((p, i) => ({
    slug: p.slug,
    nome: p.nome,
    categoria: p.categoria,
    resumo: p.resumo,
    descricao: p.descricao,
    detalhes: p.detalhes,
    fotos: p.fotos.map((f) => (typeof f === 'number' ? `/img/foto-${f}.webp` : `/img/${f}.webp`)),
    variacoes: [],
    preco: null,
    status: 'ativo' as Status,
    ordem: i + 1,
  }))
}

// ---------------------------------------------------------------- Supabase
let clientePromessa: Promise<SupabaseClient> | null = null
const cliente = () =>
  (clientePromessa ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true } }),
  ))

const checa = <T,>(r: { data: T | null; error: { message: string } | null }): T => {
  if (r.error) throw new Error(r.error.message)
  return r.data as T
}

const supabaseStore: Store = {
  demo: false,
  async sessao() {
    const { data } = await (await cliente()).auth.getSession()
    return data.session?.user.email ?? null
  },
  async entrar(email, senha) {
    const { error } = await (await cliente()).auth.signInWithPassword({ email, password: senha })
    if (error) throw new Error('E-mail ou senha incorretos.')
  },
  async sair() {
    await (await cliente()).auth.signOut()
  },
  async listarKits() {
    const db = await cliente()
    return checa(await db.from('kits').select('*').order('ordem').order('criado_em')) as Produto[]
  },
  async salvarKit(k) {
    const db = await cliente()
    const { id, ...resto } = k
    const q = id ? db.from('kits').update(resto).eq('id', id) : db.from('kits').insert(resto)
    const linhas = checa(await q.select())
    return linhas[0] as Produto
  },
  async removerKit(id) {
    checa(await (await cliente()).from('kits').delete().eq('id', id).select())
  },
  async statusKit(id, s) {
    checa(await (await cliente()).from('kits').update({ status: s }).eq('id', id).select())
  },
  async listarPecas() {
    const db = await cliente()
    return checa(await db.from('pecas').select('*').order('tipo').order('ordem')) as Peca[]
  },
  async salvarPeca(p) {
    const db = await cliente()
    const { id, ...resto } = p
    const q = id ? db.from('pecas').update(resto).eq('id', id) : db.from('pecas').insert(resto)
    return checa(await q.select())[0] as Peca
  },
  async removerPeca(id) {
    checa(await (await cliente()).from('pecas').delete().eq('id', id).select())
  },
  async enviarFoto(arquivo) {
    const db = await cliente()
    const blob = await reduzirFoto(arquivo)
    const caminho = `${crypto.randomUUID()}.webp`
    const { error } = await db.storage.from('fotos').upload(caminho, blob, { contentType: 'image/webp', cacheControl: '31536000' })
    if (error) throw new Error('Falha ao enviar a foto: ' + error.message)
    return db.storage.from('fotos').getPublicUrl(caminho).data.publicUrl
  },
}

// ---------------------------------------------------------------- Demonstração (só neste navegador)
const K_KITS = 'pa_demo_kits'
const K_PECAS = 'pa_demo_pecas'
const K_SESSAO = 'pa_demo_sessao'
const ler = <T,>(k: string, padrao: T): T => {
  try {
    return JSON.parse(localStorage.getItem(k) ?? '') as T
  } catch {
    return padrao
  }
}
const gravar = (k: string, v: unknown) => localStorage.setItem(k, JSON.stringify(v))
const novoId = () => crypto.randomUUID()

const demoStore: Store = {
  demo: true,
  async sessao() {
    return localStorage.getItem(K_SESSAO)
  },
  async entrar(email) {
    localStorage.setItem(K_SESSAO, email || 'demo@local')
  },
  async sair() {
    localStorage.removeItem(K_SESSAO)
  },
  async listarKits() {
    return ler<Produto[]>(K_KITS, [])
  },
  async salvarKit(k) {
    const todos = ler<Produto[]>(K_KITS, [])
    const salvo = { ...k, id: k.id ?? novoId() } as Produto
    const i = todos.findIndex((x) => x.id === salvo.id)
    if (i >= 0) todos[i] = salvo
    else todos.push({ ...salvo, ordem: salvo.ordem || todos.length + 1 })
    gravar(K_KITS, todos)
    return salvo
  },
  async removerKit(id) {
    gravar(K_KITS, ler<Produto[]>(K_KITS, []).filter((x) => x.id !== id))
  },
  async statusKit(id, s) {
    gravar(K_KITS, ler<Produto[]>(K_KITS, []).map((x) => (x.id === id ? { ...x, status: s } : x)))
  },
  async listarPecas() {
    return ler<Peca[]>(K_PECAS, [])
  },
  async salvarPeca(p) {
    const todas = ler<Peca[]>(K_PECAS, [])
    const salva = { ...p, id: p.id ?? novoId() } as Peca
    const i = todas.findIndex((x) => x.id === salva.id)
    if (i >= 0) todas[i] = salva
    else todas.push(salva)
    gravar(K_PECAS, todas)
    return salva
  },
  async removerPeca(id) {
    gravar(K_PECAS, ler<Peca[]>(K_PECAS, []).filter((x) => x.id !== id))
  },
  async enviarFoto(arquivo) {
    const blob = await reduzirFoto(arquivo, 900)
    return new Promise((ok) => {
      const r = new FileReader()
      r.onload = () => ok(r.result as string)
      r.readAsDataURL(blob)
    })
  },
}

/** Supabase se estiver configurado; demonstração local só no desenvolvimento (ou com ?demo). */
export const store: Store | null = supabaseConfigurado ? supabaseStore : import.meta.env.DEV ? demoStore : null
