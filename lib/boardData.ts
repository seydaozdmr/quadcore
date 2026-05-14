export type StationType =
  | 'START'
  | 'AGENDA'
  | 'ACTION_CLAIM'
  | 'FREE_CARD'
  | 'CORNER'
  | 'BACK_1'
  | 'FORWARD_2'

export interface Station {
  id: number       // 0-19, clockwise
  type: StationType
  label: string
  gridCol: number  // CSS grid col, 1-based
  gridRow: number  // CSS grid row, 1-based
}

/**
 * 20 cells around the perimeter of a 6×6 grid — clockwise from top-left.
 *
 *  [0][1][2][3][4][5]   ← top row →
 *  [19]            [6]
 *  [18]  CENTER   [7]
 *  [17]  (4×4)   [8]
 *  [16]           [9]
 *  [15][14][13][12][11][10]  ← bottom row ←
 */
const STATIONS: Station[] = [
  // ── Top row (left → right) ──────────────────────────────────────
  { id:  0, type: 'START',        label: 'Başlangıç 🚀', gridCol: 1, gridRow: 1 },
  { id:  1, type: 'AGENDA',       label: 'Retro Gündemi Çek', gridCol: 2, gridRow: 1 },
  { id:  2, type: 'ACTION_CLAIM', label: 'Aksiyon Üstlen', gridCol: 3, gridRow: 1 },
  { id:  3, type: 'AGENDA',       label: 'Retro Gündemi Çek', gridCol: 4, gridRow: 1 },
  { id:  4, type: 'FREE_CARD',    label: 'Oyun Kartı Çek', gridCol: 5, gridRow: 1 },
  { id:  5, type: 'CORNER',       label: 'Mola ☕',          gridCol: 6, gridRow: 1 },
  // ── Right col (top → bottom) ────────────────────────────────────
  { id:  6, type: 'AGENDA',       label: 'Retro Gündemi Çek', gridCol: 6, gridRow: 2 },
  { id:  7, type: 'BACK_1',       label: '1 Adım Geri',        gridCol: 6, gridRow: 3 },
  { id:  8, type: 'ACTION_CLAIM', label: 'Aksiyon Üstlen',     gridCol: 6, gridRow: 4 },
  { id:  9, type: 'AGENDA',       label: 'Retro Gündemi Çek', gridCol: 6, gridRow: 5 },
  // ── Bottom row (right → left) ───────────────────────────────────
  { id: 10, type: 'CORNER',       label: 'Kudos 🌟',           gridCol: 6, gridRow: 6 },
  { id: 11, type: 'ACTION_CLAIM', label: 'Aksiyon Üstlen',     gridCol: 5, gridRow: 6 },
  { id: 12, type: 'AGENDA',       label: 'Retro Gündemi Çek', gridCol: 4, gridRow: 6 },
  { id: 13, type: 'FREE_CARD',    label: 'Oyun Kartı Çek',     gridCol: 3, gridRow: 6 },
  { id: 14, type: 'AGENDA',       label: 'Retro Gündemi Çek', gridCol: 2, gridRow: 6 },
  { id: 15, type: 'CORNER',       label: 'Joker 🃏',           gridCol: 1, gridRow: 6 },
  // ── Left col (bottom → top) ─────────────────────────────────────
  { id: 16, type: 'FORWARD_2',    label: '2 Adım İleri',       gridCol: 1, gridRow: 5 },
  { id: 17, type: 'AGENDA',       label: 'Retro Gündemi Çek', gridCol: 1, gridRow: 4 },
  { id: 18, type: 'ACTION_CLAIM', label: 'Aksiyon Üstlen',     gridCol: 1, gridRow: 3 },
  { id: 19, type: 'FREE_CARD',    label: 'Oyun Kartı Çek',     gridCol: 1, gridRow: 2 },
]

export default STATIONS

export const TOTAL_STATIONS = 20

export const STATION_META: Record<StationType, {
  emoji: string; bg: string; border: string; text: string
}> = {
  START:        { emoji: '⭐', bg: 'bg-amber-500/25',   border: 'border-amber-400/60',   text: 'text-amber-200'  },
  AGENDA:       { emoji: '📋', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-200' },
  ACTION_CLAIM: { emoji: '⚡', bg: 'bg-indigo-500/20',  border: 'border-indigo-500/40',  text: 'text-indigo-200'  },
  FREE_CARD:    { emoji: '🎴', bg: 'bg-yellow-500/20',  border: 'border-yellow-500/40',  text: 'text-yellow-200'  },
  CORNER:       { emoji: '🔷', bg: 'bg-violet-500/25',  border: 'border-violet-400/60',  text: 'text-violet-200'  },
  BACK_1:       { emoji: '⏪', bg: 'bg-red-500/20',     border: 'border-red-500/40',     text: 'text-red-200'     },
  FORWARD_2:    { emoji: '⏩', bg: 'bg-cyan-500/20',    border: 'border-cyan-500/40',    text: 'text-cyan-200'    },
}
