'use client'

import STATIONS, { STATION_META, type Station } from '@/lib/boardData'
import { useGameStore, type Player } from '@/store/useGameStore'

// ─── Player token ─────────────────────────────────────────────────────────────

function Token({ player, isMoving }: { player: Player; isMoving: boolean }) {
  return (
    <span
      title={player.name}
      className={`
        inline-flex items-center justify-center rounded-full text-[9px] font-bold text-white
        transition-all duration-200
        ${isMoving
          ? 'w-6 h-6 ring-2 ring-white/90 animate-bounce shadow-xl scale-110'
          : 'w-5 h-5 ring-1 ring-white/30 shadow'
        }
        ${player.color}
      `}
    >
      {player.name[0]}
    </span>
  )
}

// ─── Single cell ──────────────────────────────────────────────────────────────

function Cell({
  station, players, active, movingPlayerId,
}: {
  station: Station
  players: Player[]
  active: boolean
  movingPlayerId: string | null
}) {
  const meta  = STATION_META[station.type]
  const here  = players.filter((p) => p.position === station.id)
  const hasMovingPlayer = here.some((p) => p.id === movingPlayerId)

  return (
    <div
      style={{ gridColumn: station.gridCol, gridRow: station.gridRow }}
      className={`
        flex flex-col items-center justify-between gap-0.5
        rounded-xl border p-1.5 select-none transition-all duration-300 min-h-0
        ${meta.bg} ${meta.border}
        ${hasMovingPlayer
          ? 'ring-2 ring-white/90 scale-[1.08] z-20 brightness-125 shadow-xl'
          : active
            ? 'ring-2 ring-white/70 scale-[1.06] z-10 shadow-lg'
            : 'hover:brightness-110'
        }
      `}
    >
      <span className="self-start text-[8px] font-bold text-white/25 leading-none">{station.id}</span>
      <span className="text-base leading-none">{meta.emoji}</span>
      <p className={`text-center text-[8px] font-medium leading-tight ${meta.text} line-clamp-2 w-full`}>
        {station.label}
      </p>
      {here.length > 0 && (
        <div className="flex flex-wrap justify-center gap-0.5">
          {here.map((p) => (
            <Token key={p.id} player={p} isMoving={p.id === movingPlayerId} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Center panel ─────────────────────────────────────────────────────────────

function CenterPanel({ movingPlayerId }: { movingPlayerId: string | null }) {
  const players            = useGameStore((s) => s.players)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)
  const currentPlayer      = players[currentPlayerIndex]
  const movingPlayer       = movingPlayerId ? players.find((p) => p.id === movingPlayerId) : null

  return (
    <div
      style={{ gridColumn: '2 / 6', gridRow: '2 / 6' }}
      className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-slate-900/60 border border-slate-700/40"
    >
      <div className="text-center">
        <p className="text-lg">🎲</p>
        <p className="text-xs font-bold text-slate-300 tracking-widest uppercase">Retro-Opoly</p>
      </div>

      <div className="text-center space-y-1">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider">
          {movingPlayer ? 'Hareket Ediyor' : 'Sıra'}
        </p>
        <div className="flex items-center gap-2 justify-center">
          <span className={`w-3 h-3 rounded-full transition-all ${(movingPlayer ?? currentPlayer).color} ${movingPlayer ? 'animate-pulse' : ''}`} />
          <span className="text-sm font-semibold text-white">
            {(movingPlayer ?? currentPlayer).name}
          </span>
        </div>
        <p className="text-[10px] text-slate-500">
          İstasyon {(movingPlayer ?? currentPlayer).position}
        </p>
      </div>

      <div className="flex gap-1.5 flex-wrap justify-center px-2">
        {players.map((p, i) => (
          <div
            key={p.id}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] transition-all
              ${p.id === movingPlayerId
                ? 'bg-white/20 text-white ring-1 ring-white/40'
                : i === currentPlayerIndex
                  ? 'bg-white/10 text-white'
                  : 'text-slate-500'
              }`}
          >
            <span className={`w-2 h-2 rounded-full ${p.color}`} />
            {p.name}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Board ────────────────────────────────────────────────────────────────────

export default function GameBoard({ movingPlayerId }: { movingPlayerId?: string | null }) {
  const players            = useGameStore((s) => s.players)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)
  const currentPlayer      = players[currentPlayerIndex]
  const resolvedMoving     = movingPlayerId ?? null

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
        {STATIONS.map((station) => (
          <Cell
            key={station.id}
            station={station}
            players={players}
            active={currentPlayer?.position === station.id}
            movingPlayerId={resolvedMoving}
          />
        ))}

        <CenterPanel movingPlayerId={resolvedMoving} />
      </div>

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
