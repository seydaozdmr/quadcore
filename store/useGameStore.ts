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

// ─── Store ────────────────────────────────────────────────────────────────────

interface GameStore {
  // Pre-game
  retroNotes: RetroNote[]
  agenda: AgendaItem[]        // AI'dan gelen; boşsa dummy kullanılır
  agendaReady: boolean

  // Actions (SMART)
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
      retroNotes: [],
      agenda: [],
      agendaReady: false,
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
      partialize: (s) => ({
        retroNotes: s.retroNotes,
        agenda: s.agenda,
        agendaReady: s.agendaReady,
        actions: s.actions,
      }),
    }
  )
)
