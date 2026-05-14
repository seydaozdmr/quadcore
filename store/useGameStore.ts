'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

  // Aksiyon state
  actions: SavedAction[]

  // Pre-game actions
  addRetroNote: (text: string, author: string) => void
  removeRetroNote: (id: string) => void
  clearRetroNotes: () => void
  setAgenda: (items: AgendaItem[]) => void
  resetAgenda: () => void

  // Action actions
  addAction: (payload: { action: string; agendaCardId: string; agendaTitle?: string }) => void
  setActionOwner: (id: string, owner: string) => void
  removeAction: (id: string) => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
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
              ? { ...p, position: (p.position + steps) % 20 }
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
        set({ players: DEFAULT_PLAYERS, currentPlayerIndex: 0, actions: [] }),

      // Aksiyon state
      actions: [],

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
