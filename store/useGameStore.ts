'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SavedAction {
  id: string
  action: string
  agendaCardId: string
  agendaTitle: string
  owner: string | null
  createdAt: number
}

interface GameStore {
  actions: SavedAction[]
  addAction: (payload: { action: string; agendaCardId: string; agendaTitle?: string }) => void
  setActionOwner: (id: string, owner: string) => void
  removeAction: (id: string) => void
  clearActions: () => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
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

      clearActions: () => set({ actions: [] }),
    }),
    { name: 'retro-opoly-actions' }
  )
)
