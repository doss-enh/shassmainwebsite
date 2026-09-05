// Colour name → swatch, mapped once centrally. Per the build spec: a name we
// have no mapping for renders as text, never as a grey dot standing in for a
// colour it might not be. Pale colours get a visible edge so they don't read
// as missing.
const COLOR_HEX: Record<string, string> = {
  beige: '#e8dcc4',
  black: '#1a1a1a',
  blue: '#1e46b8',
  brown: '#6b4423',
  copper: '#b87333',
  cork: '#c69c6d',
  'dark brown': '#4a2c17',
  'dark green': '#14532d',
  'dark grey': '#4b5563',
  gold: '#d4af37',
  green: '#16a34a',
  grey: '#9ca3af',
  gray: '#9ca3af',
  indigo: '#4b0082',
  'light brown': '#a0785a',
  'light green': '#86efac',
  'light grey': '#d1d5db',
  maroon: '#7f1d1d',
  'navy blue': '#1e3a8a',
  navy: '#1e3a8a',
  orange: '#f97316',
  pink: '#ec4899',
  purple: '#7e22ce',
  red: '#dc2626',
  'rose gold': '#b76e79',
  'royal blue': '#2b4cbf',
  silver: '#c0c0c0',
  'sky blue': '#7dd3fc',
  turquoise: '#40e0d0',
  white: '#ffffff',
  wooden: '#a97142',
  yellow: '#eab308',
}

// Colours that aren't a single flat fill.
const COLOR_GRADIENT: Record<string, string> = {
  'black/white': 'linear-gradient(135deg, #1a1a1a 50%, #ffffff 50%)',
  'multi color': 'conic-gradient(#dc2626, #eab308, #16a34a, #2b4cbf, #7e22ce, #dc2626)',
  multicolor: 'conic-gradient(#dc2626, #eab308, #16a34a, #2b4cbf, #7e22ce, #dc2626)',
  transparent:
    'repeating-conic-gradient(#e5e7eb 0% 25%, #ffffff 0% 50%) 50% / 8px 8px',
}

// Pale enough that a plain swatch would read as missing without a border.
const PALE = new Set(['white', 'beige', 'light grey', 'light green', 'silver', 'sky blue', 'transparent'])

export type Swatch = {label: string; background?: string; needsEdge: boolean}

export function resolveSwatch(name: string): Swatch {
  const key = name.trim().toLowerCase()
  const background = COLOR_GRADIENT[key] || COLOR_HEX[key]
  return {label: name, background, needsEdge: PALE.has(key)}
}
