export type StationType =
  | 'START'
  | 'AGENDA'
  | 'ACTION_CLAIM'
  | 'FREE_CARD'
  | 'WAIT'
  | 'FORWARD_2'
  | 'BACK_1'

export interface Station {
  id: number
  type: StationType
  label: string
}

// 36 istasyon: 1 START + 13 AGENDA + 8 ACTION_CLAIM + 8 FREE_CARD + 2 WAIT + 2 FORWARD_2 + 2 BACK_1
const STATIONS: Station[] = [
  { id: 0,  type: 'START',        label: 'Başlangıç' },
  { id: 1,  type: 'AGENDA',       label: 'Retro Gündemi Çek' },
  { id: 2,  type: 'ACTION_CLAIM', label: 'Aksiyon Üstlen' },
  { id: 3,  type: 'AGENDA',       label: 'Retro Gündemi Çek' },
  { id: 4,  type: 'FREE_CARD',    label: 'Oyun Kartı Çek' },
  { id: 5,  type: 'AGENDA',       label: 'Retro Gündemi Çek' },
  { id: 6,  type: 'WAIT',         label: 'Bekle' },
  { id: 7,  type: 'FREE_CARD',    label: 'Oyun Kartı Çek' },
  { id: 8,  type: 'AGENDA',       label: 'Retro Gündemi Çek' },
  { id: 9,  type: 'ACTION_CLAIM', label: 'Aksiyon Üstlen' },
  { id: 10, type: 'AGENDA',       label: 'Retro Gündemi Çek' },
  { id: 11, type: 'FORWARD_2',    label: '2 Adım İleri' },
  { id: 12, type: 'FREE_CARD',    label: 'Oyun Kartı Çek' },
  { id: 13, type: 'AGENDA',       label: 'Retro Gündemi Çek' },
  { id: 14, type: 'ACTION_CLAIM', label: 'Aksiyon Üstlen' },
  { id: 15, type: 'AGENDA',       label: 'Retro Gündemi Çek' },
  { id: 16, type: 'BACK_1',       label: '1 Adım Geri' },
  { id: 17, type: 'FREE_CARD',    label: 'Oyun Kartı Çek' },
  { id: 18, type: 'ACTION_CLAIM', label: 'Aksiyon Üstlen' },
  { id: 19, type: 'BACK_1',       label: '1 Adım Geri' },
  { id: 20, type: 'AGENDA',       label: 'Retro Gündemi Çek' },
  { id: 21, type: 'ACTION_CLAIM', label: 'Aksiyon Üstlen' },
  { id: 22, type: 'AGENDA',       label: 'Retro Gündemi Çek' },
  { id: 23, type: 'FREE_CARD',    label: 'Oyun Kartı Çek' },
  { id: 24, type: 'WAIT',         label: 'Bekle' },
  { id: 25, type: 'AGENDA',       label: 'Retro Gündemi Çek' },
  { id: 26, type: 'ACTION_CLAIM', label: 'Aksiyon Üstlen' },
  { id: 27, type: 'FREE_CARD',    label: 'Oyun Kartı Çek' },
  { id: 28, type: 'AGENDA',       label: 'Retro Gündemi Çek' },
  { id: 29, type: 'FORWARD_2',    label: '2 Adım İleri' },
  { id: 30, type: 'ACTION_CLAIM', label: 'Aksiyon Üstlen' },
  { id: 31, type: 'FREE_CARD',    label: 'Oyun Kartı Çek' },
  { id: 32, type: 'AGENDA',       label: 'Retro Gündemi Çek' },
  { id: 33, type: 'ACTION_CLAIM', label: 'Aksiyon Üstlen' },
  { id: 34, type: 'FREE_CARD',    label: 'Oyun Kartı Çek' },
  { id: 35, type: 'AGENDA',       label: 'Retro Gündemi Çek' },
]

export default STATIONS

// Snake pattern: row çift ise soldan sağa, tek ise sağdan sola
export function positionToGrid(pos: number): { row: number; col: number } {
  const row = Math.floor(pos / 6)
  const col = row % 2 === 0 ? pos % 6 : 5 - (pos % 6)
  return { row, col }
}

export const STATION_META: Record<StationType, { emoji: string; color: string; bg: string; border: string; text: string }> = {
  START:        { emoji: '⭐', color: 'text-amber-300',  bg: 'bg-amber-500/20',   border: 'border-amber-500/50',   text: 'text-amber-200' },
  AGENDA:       { emoji: '📋', color: 'text-emerald-300', bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', text: 'text-emerald-200' },
  ACTION_CLAIM: { emoji: '⚡', color: 'text-indigo-300',  bg: 'bg-indigo-500/15',  border: 'border-indigo-500/40',  text: 'text-indigo-200' },
  FREE_CARD:    { emoji: '🎴', color: 'text-yellow-300',  bg: 'bg-yellow-500/15',  border: 'border-yellow-500/40',  text: 'text-yellow-200' },
  WAIT:         { emoji: '⏸️', color: 'text-slate-400',   bg: 'bg-slate-700/40',   border: 'border-slate-600/40',   text: 'text-slate-400' },
  FORWARD_2:    { emoji: '⏩', color: 'text-cyan-300',    bg: 'bg-cyan-500/15',    border: 'border-cyan-500/40',    text: 'text-cyan-200' },
  BACK_1:       { emoji: '⏪', color: 'text-red-300',     bg: 'bg-red-500/15',     border: 'border-red-500/40',     text: 'text-red-200' },
}
