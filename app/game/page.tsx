'use client'

import Link from 'next/link'
import GameBoard from '@/components/GameBoard'
import { useGameStore } from '@/store/useGameStore'
import { RotateCcw, Trophy } from 'lucide-react'
import { useState } from 'react'

const DICE_FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

export default function GamePage() {
  const players             = useGameStore((s) => s.players)
  const currentPlayerIndex  = useGameStore((s) => s.currentPlayerIndex)
  const currentPlayer       = players[currentPlayerIndex]
  const movePlayerOneStep   = useGameStore((s) => s.movePlayerOneStep)
  const nextTurn            = useGameStore((s) => s.nextTurn)
  const resetGame           = useGameStore((s) => s.resetGame)

  const [lastRoll, setLastRoll]         = useState<number | null>(null)
  const [displayRoll, setDisplayRoll]   = useState<number | null>(null)
  const [isAnimating, setIsAnimating]   = useState(false)
  const [movingPlayerId, setMovingPlayerId] = useState<string | null>(null)

  function rollDice() {
    if (isAnimating) return

    const roll = Math.floor(Math.random() * 6) + 1
    setLastRoll(roll)
    setIsAnimating(true)

    // 500ms zarı döndür efekti
    let frame = 0
    const cycleInterval = setInterval(() => {
      setDisplayRoll(Math.floor(Math.random() * 6) + 1)
      frame++
    }, 80)

    setTimeout(() => {
      clearInterval(cycleInterval)
      setDisplayRoll(roll)

      // Adım adım piyon hareketi
      const playerId = currentPlayer.id
      setMovingPlayerId(playerId)
      let step = 0
      const moveInterval = setInterval(() => {
        step++
        movePlayerOneStep(playerId)
        if (step >= roll) {
          clearInterval(moveInterval)
          setMovingPlayerId(null)
          setIsAnimating(false)
          nextTurn()
        }
      }, 380)
    }, 500)
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
          <Link
            href="/summary"
            className="flex items-center gap-1 text-xs bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 px-2.5 py-1 rounded-full transition-colors"
          >
            <Trophy className="w-3 h-3" />
            Özet
          </Link>
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
        <div className="flex flex-col items-center gap-4">
          <p className="text-slate-400 text-sm">
            Sıra: <span className="text-white font-semibold">{currentPlayer.name}</span>
          </p>

          <div className="flex items-center gap-5">
            <button
              onClick={rollDice}
              disabled={isAnimating}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors shadow-lg"
            >
              🎲 Zar At
            </button>

            {displayRoll !== null && (
              <span
                className={`text-5xl leading-none select-none ${isAnimating ? 'animate-pulse' : 'animate-bounce'}`}
              >
                {DICE_FACES[displayRoll]}
              </span>
            )}
          </div>

          {isAnimating && movingPlayerId && (
            <p className="text-xs text-slate-400 animate-pulse">
              {players.find((p) => p.id === movingPlayerId)?.name} ilerliyor…
            </p>
          )}
        </div>

        {/* Tahta */}
        <GameBoard movingPlayerId={movingPlayerId} />
      </main>
    </div>
  )
}
