'use client'

import STATIONS, { STATION_META, TOTAL_STATIONS, type Station } from '@/lib/boardData'
import { useGameStore, type Player } from '@/store/useGameStore'

// ─── Player token ─────────────────────────────────────────────────────────────

function Token({ player }: { player: Player }) {
  return (
    <span
      title={player.name}
      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold text-white shadow ring-1 ring-white/30 ${player.color}`}
    >
      {player.name[0]}
    </span>
  )
}

// ─── Single cell ──────────────────────────────────────────────────────────────

function Cell({
  station, players, active,
}: {
  station: Station; players: Player[]; active: boolean
}) {
  const meta  = STATION_META[station.type]
  const here  = players.filter((p) => p.position === station.id)

  return (
    <div
      style={{ gridColumn: station.gridCol, gridRow: station.gridRow }}
      className={`
        flex flex-col items-center justify-between gap-0.5
        rounded-xl border p-1.5 select-none transition-all duration-200 min-h-0
        ${meta.bg} ${meta.border}
        ${active ? 'ring-2 ring-white/70 scale-[1.06] z-10 shadow-lg' : 'hover:brightness-110'}
      `}
    >
      {/* Position number */}
      <span className="self-start text-[8px] font-bold text-white/25 leading-none">{station.id}</span>

      {/* Emoji */}
      <span className="text-base leading-none">{meta.emoji}</span>

      {/* Label */}
      <p className={`text-center text-[8px] font-medium leading-tight ${meta.text} line-clamp-2 w-full`}>
        {station.label}
      </p>

      {/* Tokens */}
      {here.length > 0 && (
        <div className="flex flex-wrap justify-center gap-0.5">
          {here.map((p) => <Token key={p.id} player={p} />)}
        </div>
      )}
    </div>
  )
}

// ─── Center panel ─────────────────────────────────────────────────────────────

function CenterPanel() {
  const players            = useGameStore((s) => s.players)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)
  const currentPlayer      = players[currentPlayerIndex]
  const movePlayer         = useGameStore((s) => s.movePlayer)
  const nextTurn           = useGameStore((s) => s.nextTurn)

  function roll() {
    const steps = Math.floor(Math.random() * 6) + 1
    movePlayer(currentPlayer.id, steps)
    nextTurn()
  }

  return (
    <div
      style={{ gridColumn: '2 / 6', gridRow: '2 / 6' }}
      className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-slate-900/60 border border-slate-700/40"
    >
      {/* Logo */}
      <div className="text-center">
        <p className="text-lg">🎲</p>
        <p className="text-xs font-bold text-slate-300 tracking-widest uppercase">Retro-Opoly</p>
      </div>

      {/* Current player */}
      <div className="text-center space-y-1">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Sıra</p>
        <div className="flex items-center gap-2 justify-center">
          <span className={`w-3 h-3 rounded-full ${currentPlayer.color}`} />
          <span className="text-sm font-semibold text-white">{currentPlayer.name}</span>
        </div>
        <p className="text-[10px] text-slate-500">İstasyon {currentPlayer.position}</p>
      </div>

      {/* Roll button */}
      <button
        onClick={roll}
        className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg"
      >
        🎲 Zar At
      </button>

      {/* All players mini */}
      <div className="flex gap-1.5 flex-wrap justify-center px-2">
        {players.map((p, i) => (
          <div key={p.id} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] transition-all
            ${i === currentPlayerIndex ? 'bg-white/10 text-white' : 'text-slate-500'}`}>
            <span className={`w-2 h-2 rounded-full ${p.color}`} />
            {p.name}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Board ────────────────────────────────────────────────────────────────────

export default function GameBoard() {
  const players            = useGameStore((s) => s.players)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)
  const currentPlayer      = players[currentPlayerIndex]

  return (
    <div className="space-y-4">
      <div
        className="w-full rounded-2xl bg-slate-900/80 border border-slate-700/60 p-2 shadow-2xl"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gridTemplateRows:    'repeat(6, 1fr)',
          gap: '5px',
          aspectRatio: '1 / 1',
        }}
      >
        {/* Perimeter cells */}
        {STATIONS.map((station) => (
          <Cell
            key={station.id}
            station={station}
            players={players}
            active={currentPlayer?.position === station.id}
          />
        ))}

        {/* Center 4×4 */}
        <CenterPanel />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center">
        {(Object.entries(STATION_META) as [keyof typeof STATION_META, typeof STATION_META[keyof typeof STATION_META]][])
          .map(([type, meta]) => (
            <div key={type} className="flex items-center gap-1.5">
              <span className="text-sm">{meta.emoji}</span>
              <span className="text-[11px] text-slate-400">
                {{
                  START:        'Başlangıç',
                  AGENDA:       'Retro Gündemi',
                  ACTION_CLAIM: 'Aksiyon Üstlen',
                  FREE_CARD:    'Oyun Kartı',
                  CORNER:       'Köşe',
                  BACK_1:       '1 Geri',
                  FORWARD_2:    '2 İleri',
                }[type]}
              </span>
            </div>
          ))}
      </div>
    </div>
  )
}
