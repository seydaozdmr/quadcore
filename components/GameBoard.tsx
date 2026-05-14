'use client'

import STATIONS, { positionToGrid, STATION_META, type Station } from '@/lib/boardData'
import { useGameStore, type Player } from '@/store/useGameStore'

// ─── Oyuncu tokeni ────────────────────────────────────────────────────────────

function PlayerToken({ player }: { player: Player }) {
  return (
    <span
      title={player.name}
      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold text-white shadow-lg ring-1 ring-white/30 ${player.color}`}
    >
      {player.name[0]}
    </span>
  )
}

// ─── Tek istasyon hücresi ─────────────────────────────────────────────────────

function StationCell({
  station,
  players,
  isActive,
}: {
  station: Station
  players: Player[]
  isActive: boolean
}) {
  const meta = STATION_META[station.type]
  const here = players.filter((p) => p.position === station.id)

  return (
    <div
      className={`
        relative flex flex-col items-center justify-between
        rounded-lg border p-1.5 gap-1 select-none
        transition-all duration-200
        ${meta.bg} ${meta.border}
        ${isActive ? 'ring-2 ring-white/60 scale-[1.04] z-10' : 'hover:brightness-110'}
      `}
    >
      {/* İstasyon numarası */}
      <span className="absolute top-0.5 left-1 text-[9px] font-bold text-white/30 leading-none">
        {station.id}
      </span>

      {/* Emoji */}
      <span className="text-lg leading-none mt-2">{meta.emoji}</span>

      {/* Etiket */}
      <p className={`text-center text-[9px] font-medium leading-tight ${meta.text} line-clamp-2`}>
        {station.label}
      </p>

      {/* Oyuncu tokenleri */}
      {here.length > 0 && (
        <div className="flex flex-wrap justify-center gap-0.5 mt-0.5">
          {here.map((p) => (
            <PlayerToken key={p.id} player={p} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Lejant ───────────────────────────────────────────────────────────────────

function Legend() {
  const entries = Object.entries(STATION_META) as [keyof typeof STATION_META, typeof STATION_META[keyof typeof STATION_META]][]
  const labels: Record<string, string> = {
    START:        'Başlangıç',
    AGENDA:       'Retro Gündemi Çek (13)',
    ACTION_CLAIM: 'Aksiyon Üstlen (8)',
    FREE_CARD:    'Oyun Kartı Çek (8)',
    WAIT:         'Bekle (2)',
    FORWARD_2:    '2 Adım İleri (2)',
    BACK_1:       '1 Adım Geri (2)',
  }

  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center mt-4">
      {entries.map(([type, meta]) => (
        <div key={type} className="flex items-center gap-1.5">
          <span className="text-sm">{meta.emoji}</span>
          <span className="text-xs text-slate-400">{labels[type]}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Ana bileşen ──────────────────────────────────────────────────────────────

export default function GameBoard() {
  const players = useGameStore((s) => s.players)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)
  const currentPlayer = players[currentPlayerIndex]

  // 6×6 grid: grid[row][col] = Station
  const grid: (Station | null)[][] = Array.from({ length: 6 }, () => Array(6).fill(null))
  STATIONS.forEach((station) => {
    const { row, col } = positionToGrid(station.id)
    grid[row][col] = station
  })

  return (
    <div className="space-y-3">
      {/* Tahta */}
      <div
        className="grid gap-1.5 p-3 rounded-2xl bg-slate-900/80 border border-slate-700/60 shadow-2xl"
        style={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}
      >
        {grid.map((row, rowIdx) =>
          row.map((station, colIdx) =>
            station ? (
              <StationCell
                key={station.id}
                station={station}
                players={players}
                isActive={currentPlayer?.position === station.id}
              />
            ) : (
              <div key={`${rowIdx}-${colIdx}`} className="rounded-lg bg-slate-800/20 border border-slate-700/20" />
            )
          )
        )}
      </div>

      {/* Lejant */}
      <Legend />
    </div>
  )
}
