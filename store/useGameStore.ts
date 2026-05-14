'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { pickRandomFreeCard, type FreeCardDef } from '@/lib/freeCards'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RetroNote {
  id: string
  text: string
  author: string
}

export interface AgendaItem {
  id: string
  text: string
  author: string
  category: 'went-well' | 'improve'
}

export interface SavedAction {
  id: string
  action: string
  agendaCardId: string
  agendaTitle: string
  owner: string | null
  createdAt: number
}

export interface Player {
  id: string
  name: string
  color: string      // tailwind bg class — bg-rose-500, bg-sky-500, vb.
  position: number   // 0-35 arası istasyon indeksi
  skippedTurn: boolean
}

// Çekilen kartın tipi — modal'a ne göstereceğimizi belirler
export type DrawnCardType = 'AGENDA' | 'ACTION_CLAIM' | 'FREE_CARD' | null

export interface DrawnCard {
  type: DrawnCardType
  // AGENDA: AgendaItem
  agendaItem?: AgendaItem
  // ACTION_CLAIM: SavedAction listesinden biri
  action?: SavedAction
  // FREE_CARD: sabit kart
  freeCard?: FreeCardDef
}

const DEFAULT_PLAYERS: Player[] = [
  { id: 'p1', name: 'Şeyda',  color: 'bg-rose-500',    position: 0, skippedTurn: false },
  { id: 'p2', name: 'Neşe',   color: 'bg-sky-500',     position: 0, skippedTurn: false },
  { id: 'p3', name: 'Soner',  color: 'bg-violet-500',  position: 0, skippedTurn: false },
  { id: 'p4', name: 'Haluk',  color: 'bg-amber-500',   position: 0, skippedTurn: false },
]

// ─── Store ────────────────────────────────────────────────────────────────────

interface GameStore {
  // Pre-game
  retroNotes: RetroNote[]
  agenda: AgendaItem[]
  agendaReady: boolean

  // Oyuncu state
  players: Player[]
  currentPlayerIndex: number
  movePlayer: (playerId: string, steps: number) => void
  setSkipTurn: (playerId: string, skip: boolean) => void
  nextTurn: () => void
  resetGame: () => void

  // Kart destesi state
  drawnCard: DrawnCard | null
  drawAgendaCard: () => void
  drawActionCard: () => void
  drawFreeCard: () => void
  closeCard: () => void

  // Aksiyon state
  actions: SavedAction[]
  addAction: (payload: { action: string; agendaCardId: string; agendaTitle?: string }) => void
  setActionOwner: (id: string, owner: string) => void
  removeAction: (id: string) => void

  // Pre-game actions
  addRetroNote: (text: string, author: string) => void
  removeRetroNote: (id: string) => void
  clearRetroNotes: () => void
  setAgenda: (items: AgendaItem[]) => void
  resetAgenda: () => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Pre-game
      retroNotes: [],
      agenda: [],
      agendaReady: false,

      // Oyuncu state
      players: DEFAULT_PLAYERS,
      currentPlayerIndex: 0,

      movePlayer: (playerId, steps) =>
        set((s) => ({
          players: s.players.map((p) =>
            p.id === playerId
              ? { ...p, position: (p.position + steps + 36) % 36 }
              : p
          ),
        })),

      setSkipTurn: (playerId, skip) =>
        set((s) => ({
          players: s.players.map((p) =>
            p.id === playerId ? { ...p, skippedTurn: skip } : p
          ),
        })),

      nextTurn: () =>
        set((s) => ({
          currentPlayerIndex: (s.currentPlayerIndex + 1) % s.players.length,
        })),

      resetGame: () =>
        set({ players: DEFAULT_PLAYERS, currentPlayerIndex: 0, actions: [], drawnCard: null }),

      // Kart destesi
      drawnCard: null,

      drawAgendaCard: () => {
        const { agenda, agendaReady } = get()
        const pool = agendaReady && agenda.length > 0 ? agenda : []
        if (pool.length === 0) {
          set({ drawnCard: { type: 'AGENDA', agendaItem: undefined } })
          return
        }
        const item = pool[Math.floor(Math.random() * pool.length)]
        set({ drawnCard: { type: 'AGENDA', agendaItem: item } })
      },

      drawActionCard: () => {
        const { actions } = get()
        const unowned = actions.filter((a) => !a.owner)
        if (unowned.length === 0) {
          set({ drawnCard: { type: 'ACTION_CLAIM', action: undefined } })
          return
        }
        const action = unowned[Math.floor(Math.random() * unowned.length)]
        set({ drawnCard: { type: 'ACTION_CLAIM', action } })
      },

      drawFreeCard: () => {
        set({ drawnCard: { type: 'FREE_CARD', freeCard: pickRandomFreeCard() } })
      },

      closeCard: () => set({ drawnCard: null }),

      // Aksiyon state
      actions: [],

      addAction: ({ action, agendaCardId, agendaTitle = '' }) =>
        set((s) => ({
          actions: [
            ...s.actions,
            {
              id: crypto.randomUUID(),
              action,
              agendaCardId,
              agendaTitle,
              owner: null,
              createdAt: Date.now(),
            },
          ],
        })),

      setActionOwner: (id, owner) =>
        set((s) => ({
          actions: s.actions.map((a) => (a.id === id ? { ...a, owner } : a)),
        })),

      removeAction: (id) =>
        set((s) => ({ actions: s.actions.filter((a) => a.id !== id) })),

      addRetroNote: (text, author) =>
        set((s) => ({
          retroNotes: [
            ...s.retroNotes,
            { id: crypto.randomUUID(), text, author },
          ],
        })),

      removeRetroNote: (id) =>
        set((s) => ({ retroNotes: s.retroNotes.filter((n) => n.id !== id) })),

      clearRetroNotes: () => set({ retroNotes: [] }),

      setAgenda: (items) => set({ agenda: items, agendaReady: true }),

      resetAgenda: () => set({ agenda: [], agendaReady: false }),
    }),
    {
      name: 'retro-opoly-store',
      skipHydration: true,
      partialize: (s) => ({
        retroNotes: s.retroNotes,
        agenda: s.agenda,
        agendaReady: s.agendaReady,
        actions: s.actions,
        players: s.players,
        currentPlayerIndex: s.currentPlayerIndex,
      }),
    }
  )
)
