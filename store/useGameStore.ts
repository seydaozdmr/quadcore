'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SavedAction {
  id: string
  action: string
  agendaCardId: string
  createdAt: number
}

interface GameStore {
  actions: SavedAction[]
  addAction: (payload: { action: string; agendaCardId: string }) => void
  clearActions: () => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      actions: [],
      addAction: ({ action, agendaCardId }) =>
        set((s) => ({
          actions: [
            ...s.actions,
            { id: crypto.randomUUID(), action, agendaCardId, createdAt: Date.now() },
          ],
        })),
      clearActions: () => set({ actions: [] }),
    }),
    { name: 'retro-opoly-actions' }
  )
)
