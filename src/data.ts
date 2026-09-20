// Número do WhatsApp da PorcelanArt (formato internacional, só dígitos). Trocar aqui se mudar.
export const WHATSAPP = '5511992299621'
export const INSTAGRAM = 'porcelanart.atelie'

export const categorias = ['Todas', 'Xícaras e canecas', 'Pratos e bandejas', 'Bules e chá', 'Esculturas'] as const
export type Categoria = (typeof categorias)[number]

export type Produto = {
  slug: string
  nome: string
  categoria: Exclude<Categoria, 'Todas'>
  resumo: string
  descricao: string
  detalhes: string[]
  /** fotos de exemplos de peças já feitas (public/img/foto-N.webp) */
  fotos: number[]
}

// Cada item é um TIPO de peça sob encomenda; as fotos são exemplos de trabalhos já entregues.
export const produtos: Produto[] = [
  {
    slug: 'xicara-pires-personalizada',
    nome: 'Xícara com Pires Personalizada',
    categoria: 'Xícaras e canecas',
    resumo: 'Xícara e pires pintados à mão, com a sua inicial em ouro.',
    descricao:
      'Xícara com pires (prato) pintada à mão do jeito que você imaginar, em dupla ou avulsa: escolha a inicial em ouro, as cores e o tema — flores, passarinhos, beija-flores e muito mais. As fotos são exemplos de peças já feitas.',
    detalhes: ['Inicial em ouro', 'Você escolhe cores e tema', 'Pires (prato) combinando', 'Borda dourada'],
    fotos: [21, 24, 22, 26, 27, 23, 25],
  },
  {
    slug: 'caneca-personalizada',
    nome: 'Caneca Personalizada',
    categoria: 'Xícaras e canecas',
    resumo: 'Caneca com a sua inicial e a arte que você escolher.',
    descricao:
      'Canecas pintadas à mão com inicial em ouro ou preto, em acabamentos como floral, passarinhos, marmorizado ou o tema que combinar com você. As fotos são exemplos de peças já feitas.',
    detalhes: ['Inicial personalizada', 'Vários acabamentos e cores', 'Sob encomenda'],
    fotos: [15, 16, 3, 4, 5],
  },
  {
    slug: 'xicara-relevo-formato-especial',
    nome: 'Xícara com Relevo e Pires em Formato Especial',
    categoria: 'Xícaras e canecas',
    resumo: 'Xícaras com desenho em relevo e pires em formatos divertidos.',
    descricao:
      'Peças com relevo pintado à mão e pires em formatos diferentes, como o gatinho das fotos, com brilho madrepérola e borda dourada. Converse sobre o bichinho ou desenho que você quer.',
    detalhes: ['Relevo pintado à mão', 'Pires em formato especial', 'Acabamento madrepérola'],
    fotos: [1, 14],
  },
  {
    slug: 'prato-personalizado',
    nome: 'Prato Decorativo Personalizado',
    categoria: 'Pratos e bandejas',
    resumo: 'Pratos pintados à mão com o tema que você escolher.',
    descricao:
      'Pratos decorativos ou de mesa pintados à mão: aves, flores, borboletas, o que fizer sentido para você ou para quem vai ganhar. Podem ser feitos avulsos ou em par. As fotos são exemplos de peças já feitas.',
    detalhes: ['Tema e cores à sua escolha', 'Avulso ou em par', 'Suporte de acrílico para expor'],
    fotos: [7, 8, 17, 18, 6],
  },
  {
    slug: 'bandeja-personalizada',
    nome: 'Bandeja Personalizada',
    categoria: 'Pratos e bandejas',
    resumo: 'Bandejas pintadas à mão para decorar ou servir.',
    descricao:
      'Bandejas em vários formatos pintadas à mão, para servir um café, apoiar canecas ou enfeitar a mesa. Combinam com xícaras e canecas do mesmo conjunto.',
    detalhes: ['Formatos variados', 'Combina com xícaras e canecas', 'Arte sob medida'],
    fotos: [9, 11],
  },
  {
    slug: 'bule-kit-cha',
    nome: 'Bule e Kit de Chá Personalizado',
    categoria: 'Bules e chá',
    resumo: 'Bule, xícara e pires pintados à mão, para o chá da tarde.',
    descricao:
      'Bules e kits de chá com bule, xícara e pires na mesma arte. Nas fotos, um bule individual que encaixa sobre a xícara, em lilás com margaridas — mas a pintura pode ser feita no tema e nas cores que você preferir.',
    detalhes: ['Bule, xícara e pires combinando', 'Tema e cores à escolha', 'Ótimo para presente'],
    fotos: [12, 13, 2],
  },
  {
    slug: 'imagem-santo-porcelana',
    nome: 'Imagens em Porcelana',
    categoria: 'Esculturas',
    resumo: 'Esculturas de santos pintadas à mão com detalhes em ouro.',
    descricao:
      'Imagens em porcelana com pintura à mão e detalhes em ouro. As fotos mostram São Francisco de Assis; consulte a imagem que você procura.',
    detalhes: ['Detalhes em ouro', 'Base decorada', 'Peça para presente ou altar'],
    fotos: [19, 20],
  },
]

export const foto = (n: number) => `/img/foto-${n}.webp`
export const achar = (slug?: string) => produtos.find((p) => p.slug === slug)

export const linkZap = (msg: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`
export const msgProduto = (nome: string) =>
  `Olá! Me interessei por "${nome}" e quero personalizar a minha.`
