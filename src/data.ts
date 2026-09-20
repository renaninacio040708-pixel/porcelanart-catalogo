// Número do WhatsApp da PorcelanArt (formato internacional, só dígitos). Trocar aqui se mudar.
export const WHATSAPP = '5511992299621'
export const INSTAGRAM = 'porcelanart.atelie'

export const categorias = [
  'Todas',
  'Xícaras e canecas',
  'Kits e conjuntos',
  'Pratos e bandejas',
  'Bules e chá',
  'Boleiras e mesa',
  'Bebê e infantil',
  'Decoração e sacras',
] as const
export type Categoria = (typeof categorias)[number]

/** número = foto-N.webp enviada pelo usuário; string = foto do Instagram (ig/CODIGO_N) */
export type Foto = number | string

export type Produto = {
  slug: string
  nome: string
  categoria: Exclude<Categoria, 'Todas'>
  resumo: string
  descricao: string
  detalhes: string[]
  /** fotos de exemplos de peças já feitas */
  fotos: Foto[]
}

const ig = (code: string, ...n: number[]): string[] => n.map((i) => `ig/${code}_${i}`)

// Cada item é um TIPO de peça sob encomenda; as fotos são exemplos de trabalhos já entregues.
export const produtos: Produto[] = [
  {
    slug: 'xicara-pires-personalizada',
    nome: 'Xícara com Pires Personalizada',
    categoria: 'Xícaras e canecas',
    resumo: 'Xícara e pires pintados à mão, com a sua inicial em ouro.',
    descricao:
      'Xícara com pires (prato) pintada à mão do jeito que você imaginar, em dupla ou avulsa: escolha a inicial em ouro, as cores e o tema — flores, passarinhos, beija-flores, abelhinhas douradas e muito mais. As fotos são exemplos de peças já feitas.',
    detalhes: ['Inicial em ouro', 'Você escolhe cores e tema', 'Pires (prato) combinando', 'Borda dourada'],
    fotos: [24, 22, 26, 27, 23, 25, 21, ...ig('DcqpfVToJP8', 3, 4), ...ig('C-qWT_ERoqF', 1, 2, 3, 4), ...ig('C745DgZpsUy', 1, 2, 3)],
  },
  {
    slug: 'caneca-personalizada',
    nome: 'Caneca Personalizada',
    categoria: 'Xícaras e canecas',
    resumo: 'Caneca com a sua inicial e a arte que você escolher.',
    descricao:
      'Canecas pintadas à mão com inicial em ouro ou preto, em acabamentos como floral, bonequinhas, passarinhos, gatinhos, marmorizado ou o tema que combinar com você. Ótimas para presente de aniversário, Dia dos Pais e datas especiais. As fotos são exemplos de peças já feitas.',
    detalhes: ['Inicial personalizada', 'Vários acabamentos e temas', 'Lustre e detalhes em ouro', 'Sob encomenda'],
    fotos: [28, ...ig('DEyGjIwxo_e', 2, 4, 6, 8), ...ig('C-5rwuMRyjE', 1, 3), ...ig('C46dGPNJVbp', 1, 2, 4), ...ig('C-S-kBFxiOL', 1, 2), ...ig('DKP_vHcxWRS', 1, 2), 15, 16, ...ig('C9DXfF6x9JA', 1, 4), 3, 5],
  },
  {
    slug: 'xicara-relevo-formato-especial',
    nome: 'Xícara com Relevo e Pires em Formato Especial',
    categoria: 'Xícaras e canecas',
    resumo: 'Xícaras com desenho em relevo e pires em formatos divertidos.',
    descricao:
      'Peças com relevo pintado à mão e pires em formatos diferentes, como o gatinho das fotos, com brilho madrepérola e borda dourada. Converse sobre o bichinho ou desenho que você quer.',
    detalhes: ['Relevo pintado à mão', 'Pires em formato especial', 'Acabamento madrepérola'],
    fotos: [...ig('DcqpfVToJP8', 1, 2), 1, 14],
  },
  {
    slug: 'kit-caneca-prato',
    nome: 'Kit Caneca + Prato de Sobremesa',
    categoria: 'Kits e conjuntos',
    resumo: 'Caneca e prato na mesma arte, personalizados para quem vai ganhar.',
    descricao:
      'Um kit pensado para presentear: caneca com inicial em ouro e prato de sobremesa pintados com o mesmo tema — gatinhos, capivara, casinha de passarinho, profissões e muito mais. Feito sob encomenda para cada pessoa.',
    detalhes: ['Caneca + prato na mesma arte', 'Tema e nome à sua escolha', 'Inicial em ouro'],
    fotos: [...ig('C_ypVBBxmDY', 1, 2, 3, 5), ...ig('C-MAN6ix_FE', 1, 2, 4), ...ig('C4YwX8zJErS', 1, 2), ...ig('C7wvzCixdXL', 1, 2, 3)],
  },
  {
    slug: 'kit-canecas-bandeja',
    nome: 'Kit Canecas + Bandeja',
    categoria: 'Kits e conjuntos',
    resumo: 'Duas canecas e uma bandeja para casais, noivos e madrinhas.',
    descricao:
      'Kit com duas canecas personalizadas com a inicial de cada um em ouro e uma bandeja combinando, para decorar o cantinho do café. Presente de casamento, lembrança para noivas e madrinhas ou mimo para o casal.',
    detalhes: ['Uma caneca para cada um', 'Inicial em ouro', 'Bandeja pintada combinando', 'Ótimo presente de casamento'],
    fotos: [...ig('DXuuaAulOuY', 1, 2, 3, 4), ...ig('DT3KxXxDx__', 1, 2, 3, 4), ...ig('C3tLM4IJ2kZ', 1), 10, 11],
  },
  {
    slug: 'prato-personalizado',
    nome: 'Prato Decorativo Personalizado',
    categoria: 'Pratos e bandejas',
    resumo: 'Pratos pintados à mão com o tema que você escolher.',
    descricao:
      'Pratos decorativos ou de mesa pintados à mão: aves, animais, flores, borboletas, frutas, o que fizer sentido para você ou para quem vai ganhar. Feitos avulsos ou em par, para pendurar, expor ou servir. As fotos são exemplos de peças já feitas.',
    detalhes: ['Tema e cores à sua escolha', 'Avulso ou em par', 'Suporte de acrílico para expor'],
    fotos: [7, 8, ...ig('DCUy9msx2BJ', 1, 3, 5), 17, 18, ...ig('DVkfjVWDXYo', 1), 6],
  },
  {
    slug: 'jogo-de-pratos',
    nome: 'Jogo de Pratos Personalizado',
    categoria: 'Pratos e bandejas',
    resumo: 'Jogos de pratos pintados à mão com beija-flores, flores e degradês.',
    descricao:
      'Jogos de pratos completos pintados à mão na cor e no tema que você quiser — como este, com beija-flores, passarinhos e bordas em degradê. Uma mesa posta que vira assunto.',
    detalhes: ['Jogo completo sob encomenda', 'Tema e cores à escolha', 'Pintura à mão'],
    fotos: [...ig('C_bpaYDx-4o', 1, 2, 3, 4, 5, 6)],
  },
  {
    slug: 'bandeja-personalizada',
    nome: 'Bandeja Personalizada',
    categoria: 'Pratos e bandejas',
    resumo: 'Bandejas pintadas à mão para decorar ou servir.',
    descricao:
      'Bandejas em vários formatos pintadas à mão, para servir um café, apoiar canecas ou enfeitar a mesa. Combinam com xícaras e canecas do mesmo conjunto.',
    detalhes: ['Formatos variados', 'Combina com xícaras e canecas', 'Arte sob medida'],
    fotos: [9, ...ig('DT3KxXxDx__', 4), ...ig('DXuuaAulOuY', 2), 11],
  },
  {
    slug: 'kit-cha',
    nome: 'Kit de Chá: Bule, Xícara e Pires',
    categoria: 'Bules e chá',
    resumo: 'Bule, xícara e pires pintados à mão, para o chá da tarde.',
    descricao:
      'Kits para os dias frios, para receber visitas e para presentear: bule com xícara e pires na mesma arte. Nas fotos, um bule individual que encaixa sobre a xícara, em lilás com margaridas, e um kit com passarinhos — mas a pintura pode ser feita no tema e nas cores que você preferir.',
    detalhes: ['Bule, xícara e pires combinando', 'Tema e cores à escolha', 'Ótimo para presente'],
    fotos: [...ig('DY8N5C3lDzj', 2, 3, 4, 5, 1), ...ig('C6M1x3oR_9h', 1, 5, 7)],
  },
  {
    slug: 'bule-porcelana',
    nome: 'Bule de Porcelana',
    categoria: 'Bules e chá',
    resumo: 'Bules pintados à mão com detalhes em ouro e abelhinha dourada.',
    descricao:
      'Bules de porcelana pintados à mão para decorar e servir a mesa de café, com tampa, alça e detalhes em ouro. Encomenda pronta para presentear ou para embelezar o seu cantinho.',
    detalhes: ['Detalhes em ouro', 'Tampa e alça combinando', 'Cores sob encomenda'],
    fotos: [...ig('DAjm6vcxoXu', 1, 2, 3, 4)],
  },
  {
    slug: 'caneca-tampa-infusor',
    nome: 'Caneca com Tampa e Infusor',
    categoria: 'Bules e chá',
    resumo: 'Caneca para chá com tampa pintada e infusor.',
    descricao:
      'Caneca com tampa em porcelana e infusor de chá, pintada à mão com o tema que você escolher — flores, passarinhos, moldura para colocar o nome. Praticidade e delicadeza na hora do chá.',
    detalhes: ['Tampa pintada à mão', 'Acompanha infusor', 'Espaço para nome ou inicial'],
    fotos: [...ig('C6M1x3oR_9h', 2, 3, 4, 6)],
  },
  {
    slug: 'boleira-personalizada',
    nome: 'Boleira Personalizada',
    categoria: 'Boleiras e mesa',
    resumo: 'Boleiras pintadas à mão com flores, frutas e detalhes em ouro.',
    descricao:
      'Boleiras feitas sob encomenda para decorar e servir a mesa: pintadas à mão com tulipas, limões, cerejas ou o que você imaginar, com detalhes em ouro. Muito pedidas como presente de casamento e para mesas de café.',
    detalhes: ['Pintura à mão sob encomenda', 'Detalhes em ouro', 'Presente de casamento e mesa de café'],
    fotos: [...ig('DBe4PC3xBUV', 1, 2, 3, 4), ...ig('DCnKi0UR1hh', 1, 2, 3, 4, 5)],
  },
  {
    slug: 'queijeira-porta-queijo',
    nome: 'Queijeira (Porta-queijo)',
    categoria: 'Boleiras e mesa',
    resumo: 'Queijeira com tampa pintada com figos e flores.',
    descricao:
      'Uma porcelana para servir e decorar a mesa: porta-queijo com tampa decorada e pintada à mão com figos e flores em cores alegres, com um botão de flor no topo.',
    detalhes: ['Tampa com botão de flor', 'Pintada à mão', 'Cores e frutas à escolha'],
    fotos: [...ig('DDdDIzex3rO', 1, 2, 3, 4, 5)],
  },
  {
    slug: 'manteigueira-acucareiro',
    nome: 'Manteigueira Francesa e Açucareiro',
    categoria: 'Boleiras e mesa',
    resumo: 'Conjunto pintado com limões e peras, com tampa e detalhes em ouro.',
    descricao:
      'Manteigueira francesa e açucareiro pintados à mão, com frutas, tampa com borboleta dourada e colher ou faquinha combinando. Peças que enfeitam e são úteis na mesa de café.',
    detalhes: ['Frutas pintadas à mão', 'Detalhes em ouro', 'Combina com colher e faca de manteiga'],
    fotos: [...ig('C9iC3wSRmja', 1, 2, 3, 4), ...ig('C72hMXhpJ34', 1, 2, 3, 4)],
  },
  {
    slug: 'moringa',
    nome: 'Moringa com Copo',
    categoria: 'Boleiras e mesa',
    resumo: 'Moringa e copo em porcelana, com Nossa Senhora em ouro, rosas ou gatinhos.',
    descricao:
      'Moringa de 800 ml com copo que encaixa em cima, decorada à mão: Nossa Senhora em ouro e rosas, passarinho, gatinhos… ideal para o criado-mudo e para presentear.',
    detalhes: ['Moringa 800 ml com copo', 'Tema à sua escolha', 'Detalhes em ouro'],
    fotos: [...ig('C744Zq7pyfm', 1, 2, 3, 4, 5), ...ig('C8nnGlCRHhk', 1, 2, 3, 4)],
  },
  {
    slug: 'kit-infantil',
    nome: 'Kit Infantil: Caneca, Tigela e Prato',
    categoria: 'Bebê e infantil',
    resumo: 'Kit com o nome da criança e o bichinho preferido.',
    descricao:
      'Caneca, tigela e prato pintados à mão com o nome e o personagem que a criança ama — nas fotos, uma porquinha com docinhos. Uma lembrança que a criança guarda com carinho.',
    detalhes: ['Nome e personagem à escolha', 'Caneca, tigela e prato combinando', 'Ótimo para aniversário'],
    fotos: [...ig('C_tzO2QRYqT', 1, 2, 3, 4, 5, 6, 7, 8, 9)],
  },
  {
    slug: 'kit-higiene-bebe',
    nome: 'Kit Higiene de Bebê',
    categoria: 'Bebê e infantil',
    resumo: 'Kit de higiene em porcelana para a chegada do bebê, e lembrancinhas de maternidade.',
    descricao:
      'Kit de higiene em porcelana com potes, porta-sabonete líquido e bandeja pintados com a identidade do bebê, feito para a chegada do herdeiro ou herdeira. Também fazemos lembrancinhas de maternidade e batizado com a inicial do nome.',
    detalhes: ['Personalizado com nome ou inicial', 'Potes, porta-sabonete e bandeja', 'Lembrancinhas de maternidade e batizado'],
    fotos: [...ig('DCXHRXrxUWF', 1, 2, 3, 4, 5), ...ig('DQ4njRfj3dq', 1)],
  },
  {
    slug: 'cogumelo-decorativo',
    nome: 'Cogumelo Decorativo',
    categoria: 'Decoração e sacras',
    resumo: 'Cogumelo de porcelana vermelho pintado à mão, para alegrar a cozinha.',
    descricao:
      'A moda dos cogumelos chegou: uma porcelana diferente e cheia de personalidade para decorar e deixar a sua cozinha mais alegre. Há também versões em vaso.',
    detalhes: ['Pintura à mão', 'Peça decorativa', 'Cores sob encomenda'],
    fotos: [...ig('DFGWRPIR00p', 1, 2, 5, 6, 7, 3, 4)],
  },
  {
    slug: 'vasinho-difusor-pires-coracao',
    nome: 'Vasinho e Pires em Coração',
    categoria: 'Decoração e sacras',
    resumo: 'Vasinho com borboleta e pires em formato de coração.',
    descricao:
      'Vasinho de porcelana pintado à mão com borboleta dourada, para usar com varetas aromatizantes, sobre um pires em formato de coração com bordinha em relevo.',
    detalhes: ['Borboleta dourada', 'Pires em formato de coração', 'Pintura à mão'],
    fotos: [...ig('C9VZjgrxPQ9', 1, 2, 3, 4)],
  },
  {
    slug: 'anjinha-descansa-joias',
    nome: 'Anjinha e Descansa-joias',
    categoria: 'Decoração e sacras',
    resumo: 'Anjinha de cerâmica rosa com detalhes pintados e descansa-joias em coração.',
    descricao:
      'Anjinha de cerâmica rosa com detalhes pintados à mão, acompanhada de um descansa-joias em formato de coração, para guardar anéis e pulseiras com delicadeza.',
    detalhes: ['Detalhes pintados à mão', 'Descansa-joias combinando', 'Ótima para presente'],
    fotos: [...ig('C5mKP33RQaq', 1, 2, 3, 4)],
  },
  {
    slug: 'porcelana-pascoa',
    nome: 'Porcelana de Páscoa',
    categoria: 'Decoração e sacras',
    resumo: 'Coelhinho e prato pintados para eternizar a Páscoa.',
    descricao:
      'Peças de porcelana pintadas à mão para eternizar as lembranças doces da Páscoa: coelhinho e prato com bordas em bolinhas, um presente que dura muito mais que o chocolate.',
    detalhes: ['Coelhinho e prato', 'Pintura à mão', 'Edição sazonal sob encomenda'],
    fotos: [...ig('C3lRct8Re00', 1, 2)],
  },
  {
    slug: 'imagem-santo-porcelana',
    nome: 'Imagens em Porcelana',
    categoria: 'Decoração e sacras',
    resumo: 'Esculturas de santos pintadas à mão com detalhes em ouro.',
    descricao:
      'Imagens em porcelana com pintura à mão e detalhes em ouro. As fotos mostram São Francisco de Assis; consulte a imagem que você procura.',
    detalhes: ['Detalhes em ouro', 'Base decorada', 'Peça para presente ou altar'],
    fotos: [19, 20],
  },
]

export const foto = (f: Foto) => (typeof f === 'number' ? `/img/foto-${f}.webp` : `/img/${f}.webp`)
export const achar = (slug?: string) => produtos.find((p) => p.slug === slug)

export const linkZap = (msg: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`
export const msgProduto = (nome: string) =>
  `Olá! Me interessei por "${nome}" e quero personalizar a minha.`
