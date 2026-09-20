// Ilustrações em linha (sem preenchimento), blobs orgânicos e divisores ondulados.

type P = { className?: string; color?: string }

const leaf = (y: number, dir: 1 | -1, s: number) => {
  const x = 60
  const dx = (n: number) => x + dir * n * s
  return `M${x} ${y} C${dx(-22)} ${y - 4}, ${dx(-38)} ${y - 20 * s}, ${dx(-42)} ${y - 36 * s} C${dx(-18)} ${y - 34 * s}, ${dx(-2)} ${y - 18 * s}, ${x} ${y}Z M${x} ${y} Q${dx(-20)} ${y - 18 * s}, ${dx(-40)} ${y - 34 * s}`
}

export function Sprig({ className, color = '#234386' }: P) {
  const ys = [214, 178, 142, 106, 72, 42]
  return (
    <svg viewBox="0 0 120 240" className={className} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M60 238 C56 180 68 120 60 14" />
      {ys.map((y, i) => (
        <path key={y} d={leaf(y, i % 2 ? 1 : -1, 1 - i * 0.06)} />
      ))}
      <path d="M60 14 C52 6 52 0 60 -2 C68 0 68 6 60 14Z" />
    </svg>
  )
}

export function Margarida({ className, color = '#234386' }: P) {
  return (
    <svg viewBox="0 0 120 200" className={className} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M60 198 C52 160 66 130 60 84" />
      <path d="M60 160 C36 156 26 140 28 126 C50 128 60 142 60 160Z" />
      <path d="M60 140 C84 134 94 118 92 104 C70 106 60 120 60 140Z" />
      <g transform="translate(60 52)">
        {Array.from({ length: 14 }).map((_, i) => (
          <ellipse key={i} cx="0" cy="-26" rx="5" ry="18" transform={`rotate(${(360 / 14) * i})`} />
        ))}
        <circle r="9" />
        <circle r="4" />
      </g>
    </svg>
  )
}

export function Xicara({ className, color = '#234386' }: P) {
  return (
    <svg viewBox="0 0 120 110" className={className} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 34 H84 C84 66 70 82 51 82 C32 82 18 66 18 34Z" />
      <path d="M84 40 C104 38 104 64 79 68" />
      <path d="M8 92 C30 100 72 100 94 92" />
      <path d="M24 88 C40 94 62 94 78 88" />
      <path d="M30 46 C38 52 46 44 54 50 C62 56 70 48 76 52" />
      <path d="M40 22 C36 14 44 10 40 2" />
      <path d="M56 22 C52 14 60 10 56 2" />
    </svg>
  )
}

export function Blob({ className, fill, variante = 0 }: { className?: string; fill: string; variante?: 0 | 1 | 2 }) {
  const d = [
    'M421 78C470 130 520 210 470 290C420 370 300 400 200 380C100 360 20 290 40 190C60 90 160 10 260 20C330 27 380 30 421 78Z',
    'M400 60C470 100 510 190 460 270C410 350 330 410 220 390C110 370 30 300 30 200C30 100 120 40 220 30C290 24 350 30 400 60Z',
    'M380 40C450 60 520 150 490 250C460 350 350 400 240 390C130 380 40 320 40 220C40 120 90 50 200 30C270 18 330 28 380 40Z',
  ][variante]
  return (
    <svg viewBox="0 0 520 420" className={className} aria-hidden="true">
      <path d={d} fill={fill} />
    </svg>
  )
}

/** Divisor ondulado: `fill` é a cor da seção de baixo. */
export function Onda({ fill, flip = false }: { fill: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      className={`block h-[48px] w-full md:h-[100px] ${flip ? 'scale-x-[-1]' : ''}`}
      aria-hidden="true"
    >
      <path d="M0 64C200 8 400 8 620 60S1040 120 1240 70C1340 46 1400 40 1440 48V121H0Z" fill={fill} />
    </svg>
  )
}
