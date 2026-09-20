// Número do WhatsApp da PorcelanArt (formato internacional, só dígitos). Trocar aqui se mudar.
export const WHATSAPP = '5511992299621'
export const INSTAGRAM = 'porcelanart.atelie'

export const categorias = ['Todas', 'Canecas e xícaras', 'Pratos e bandejas', 'Kits de chá', 'Esculturas'] as const
export type Categoria = (typeof categorias)[number]

export type Produto = {
  slug: string
  nome: string
  categoria: Exclude<Categoria, 'Todas'>
  resumo: string
  descricao: string
  detalhes: string[]
  fotos: number[]
}

export const produtos: Produto[] = [
  {
    slug: 'canecas-passarinhos',
    nome: 'Kit Canecas Passarinhos com Bandeja',
    categoria: 'Canecas e xícaras',
    resumo: 'Duas canecas, uma bandeja e um jardim de passarinhos.',
    descricao:
      'Um par de canecas nos tons rosa e azul-céu, pintadas com passarinhos entre galhos floridos e finalizadas com a inicial em ouro. A bandeja combina, com a casinha de passarinho e flores de cerejeira no centro.',
    detalhes: ['Inicial dourada personalizada', 'Tons rosa e azul', 'Acompanha bandeja pintada'],
    fotos: [4, 10, 11],
  },
  {
    slug: 'conjunto-beija-flor-tulipas',
    nome: 'Conjunto Canecas e Pratos Coloridos',
    categoria: 'Canecas e xícaras',
    resumo: 'Canecas com inicial e pires em degradê com beija-flores e tulipas.',
    descricao:
      'Canecas nos tons verde e pink (S e O) com a inicial em dourado, acompanhadas de pratos em degradê pintados com beija-flores, orquídeas, tulipas e renda ao fundo. Um conjunto cheio de cor para presentear.',
    detalhes: ['Inicial dourada personalizada', 'Pratos em degradê', 'Suporte de acrílico para expor'],
    fotos: [21, 24, 22, 26, 27, 23, 25],
  },
  {
    slug: 'gatinho-floral',
    nome: 'Xícara Gatinho Floral',
    categoria: 'Canecas e xícaras',
    resumo: 'Gatinho em relevo coberto de rosas, com pires em formato de gatinho.',
    descricao:
      'Xícara com brilho madrepérola e um gatinho em relevo pintado com rosas e folhagens. A alça é o rabinho do gato e o pires tem o formato de uma carinha com orelhinhas. Borda em ouro.',
    detalhes: ['Relevo pintado à mão', 'Acabamento madrepérola', 'Pires em formato de gatinho', 'Borda dourada'],
    fotos: [1, 14],
  },
  {
    slug: 'cha-margarida',
    nome: 'Kit Chá Margarida',
    categoria: 'Kits de chá',
    resumo: 'Bule, xícara e pires em lilás com margaridas pintadas.',
    descricao:
      'Um conjunto para o chá da tarde: bule pequeno que encaixa sobre a xícara, mais um pires generoso. Fundo lilás suave, margaridas delicadas e folhas finas pintadas uma a uma.',
    detalhes: ['Bule que encaixa sobre a xícara', 'Pires grande', 'Lilás com margaridas'],
    fotos: [12, 13, 2],
  },
  {
    slug: 'canecas-letra-jardim',
    nome: 'Canecas com Inicial · Jardim',
    categoria: 'Canecas e xícaras',
    resumo: 'Canecas rosa e verde-água com a sua letra em ouro.',
    descricao:
      'Canecas em degradê rosa e verde-água, com rosas pintadas na lateral e a inicial escolhida em dourado. Ótimas para presentear casais, mães, madrinhas. Acompanham prato ondulado a combinar.',
    detalhes: ['Escolha a inicial', 'Rosas pintadas à mão', 'Prato ondulado a combinar'],
    fotos: [3],
  },
  {
    slug: 'prato-beija-flor',
    nome: 'Prato Beija-flor',
    categoria: 'Pratos e bandejas',
    resumo: 'Beija-flor de asas abertas entre flores rosadas.',
    descricao:
      'Prato decorativo pintado em aquarela sobre porcelana: um beija-flor de plumagem colorida ao lado de flores rosa. Cada pena é pintada com paciência — nenhuma peça sai igual à outra.',
    detalhes: ['Pintura em aquarela', 'Peça decorativa', 'Suporte de acrílico para expor'],
    fotos: [7, 6],
  },
  {
    slug: 'prato-coruja',
    nome: 'Prato Coruja',
    categoria: 'Pratos e bandejas',
    resumo: 'Corujinha de olhos verdes sobre um céu em degradê.',
    descricao:
      'Uma corujinha ruiva de olhos verdes, empoleirada num galho, com folhas e florzinhas contornadas em pontilhado. Fundo em degradê do azul ao rosa.',
    detalhes: ['Pintura e pontilhado à mão', 'Peça decorativa', 'Suporte de acrílico para expor'],
    fotos: [8, 6],
  },
  {
    slug: 'bandeja-narcisos',
    nome: 'Bandeja Narcisos',
    categoria: 'Pratos e bandejas',
    resumo: 'Xícara azul cheia de narcisos, com moldura listrada.',
    descricao:
      'Bandeja retangular com cabo, moldura listrada em azul e amarelo e uma xícara transbordando narcisos. Serve para decorar ou para receber uma tábua de queijos.',
    detalhes: ['Formato retangular com cabo', 'Assinada pela artista', 'Moldura listrada'],
    fotos: [9, 6],
  },
  {
    slug: 'pratos-laranja-floral',
    nome: 'Pratos Laranja Floral',
    categoria: 'Pratos e bandejas',
    resumo: 'Par de pratos pêssego com flores, folhas e borboletas.',
    descricao:
      'Pratos em tom pêssego com margaridas, frutinhas de roseira, folhas outonais e uma renda suave com borboletas ao fundo. Em par ou avulsos.',
    detalhes: ['Em par ou avulsos', 'Renda e borboletas ao fundo', 'Cores quentes'],
    fotos: [17, 18],
  },
  {
    slug: 'canecas-marmorizadas',
    nome: 'Canecas Marmorizadas',
    categoria: 'Canecas e xícaras',
    resumo: 'Efeito marmorizado terroso com inicial preta.',
    descricao:
      'Canecas com efeito marmorizado em tons de terracota e caramelo, cada uma com um desenho único, e a inicial em preto. Um visual mais sóbrio para quem gosta de peça com personalidade.',
    detalhes: ['Cada peça tem um desenho único', 'Inicial personalizada', 'Interior branco'],
    fotos: [15, 16],
  },
  {
    slug: 'canecas-gatinhos',
    nome: 'Canecas Gatinhos com Inicial',
    categoria: 'Canecas e xícaras',
    resumo: 'Listras alegres, gatinhos e uma letra grande em dourado.',
    descricao:
      'Canecas listradas em amarelo e laranja com gatinhos e a inicial em ouro. A imagem é uma arte de referência — cores, gatinhos e letra podem ser combinados no seu pedido.',
    detalhes: ['Arte de referência', 'Cores e desenho sob medida', 'Inicial dourada'],
    fotos: [5],
  },
  {
    slug: 'sao-francisco',
    nome: 'São Francisco de Assis',
    categoria: 'Esculturas',
    resumo: 'Imagem em porcelana com passarinhos e cervo.',
    descricao:
      'Escultura de São Francisco em hábito marrom com brilho de pátina, passarinhos dourados nas mãos, um cervo ao lado e base decorada com filete dourado.',
    detalhes: ['Detalhes em ouro', 'Base decorada', 'Peça de presente ou altar'],
    fotos: [19, 20],
  },
]

export const foto = (n: number) => `/img/foto-${n}.webp`
export const achar = (slug?: string) => produtos.find((p) => p.slug === slug)

export const linkZap = (msg: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`
export const msgProduto = (nome: string) =>
  `Olá! Me interessei por "${nome}" e gostaria de solicitar um orçamento.`
