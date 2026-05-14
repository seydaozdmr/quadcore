'use client'

import GameBoard from '@/components/GameBoard'
import { useGameStore } from '@/store/useGameStore'
import { RotateCcw } from 'lucide-react'

export default function GamePage() {
  const players            = useGameStore((s) => s.players)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)
  const currentPlayer      = players[currentPlayerIndex]
  const movePlayer         = useGameStore((s) => s.movePlayer)
  const nextTurn           = useGameStore((s) => s.nextTurn)
  const resetGame          = useGameStore((s) => s.resetGame)

  function rollDice() {
    const roll = Math.floor(Math.random() * 6) + 1
    movePlayer(currentPlayer.id, roll)
    nextTurn()
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0d0f1a]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-base">🎲</div>
          <span className="font-semibold text-white text-sm">Retro-Opoly</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">Sprint 16</span>
          <button
            onClick={resetGame}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-full transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Sıfırla
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Oyuncu durumu */}
        <div className="flex flex-wrap gap-3 justify-center">
          {players.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all
                ${i === currentPlayerIndex
                  ? 'border-white/30 bg-white/10 shadow-lg scale-105'
                  : 'border-slate-700/60 bg-slate-800/40 opacity-60'
                }`}
            >
              <span className={`w-3 h-3 rounded-full ${p.color}`} />
              <span className="text-slate-200 font-medium">{p.name}</span>
              <span className="text-slate-500 text-xs">İstasyon {p.position}</span>
            </div>
          ))}
        </div>

        {/* Zar at */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-slate-400 text-sm">
            Sıra: <span className="text-white font-semibold">{currentPlayer.name}</span>
          </p>
          <button
            onClick={rollDice}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors shadow-lg"
          >
            🎲 Zar At
          </button>
        </div>

        {/* Tahta */}
        <GameBoard />
      </main>
    </div>
  )
}
