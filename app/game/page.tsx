'use client'

import { useState } from 'react'
import Link from 'next/link'
import * as Dialog from '@radix-ui/react-dialog'
import { RotateCcw, X, CheckCircle2, Trophy } from 'lucide-react'
import GameBoard from '@/components/GameBoard'
import SmartActionModal from '@/components/SmartActionModal'
import { useGameStore, type AgendaItem } from '@/store/useGameStore'
import STATIONS from '@/lib/boardData'

// ─── Constants ────────────────────────────────────────────────────────────────

const DICE_FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
const TEAM = ['Şeyda', 'Neşe', 'Soner', 'Haluk']

const DUMMY_AGENDA: AgendaItem[] = [
  { id: 'w1', text: 'Daily standuplar çok verimli geçiyor, herkes hazırlıklı geliyor', author: 'Şeyda', category: 'went-well' },
  { id: 'w2', text: 'Yeni CI/CD pipeline son sprintte hiç sorun çıkarmadı', author: 'Neşe', category: 'went-well' },
  { id: 'w3', text: 'Pair programming seansları kod kalitesini belirgin şekilde artırdı', author: 'Soner', category: 'went-well' },
  { id: 'w4', text: 'Sprint hedefine %95 ulaştık, takım motivasyonu yüksek kaldı', author: 'Haluk', category: 'went-well' },
  { id: 'i1', text: 'Sprint planning toplantıları 4 saati aşıyor, çok uzun sürüyor', author: 'Şeyda', category: 'improve' },
  { id: 'i2', text: "Test coverage %58'de kaldı, hedef %80'di", author: 'Neşe', category: 'improve' },
  { id: 'i3', text: "PR'lar çok büyük oluyor, review yapmak zorlaşıyor", author: 'Soner', category: 'improve' },
  { id: 'i4', text: 'Teknik borç birikmeye devam ediyor, refactoring için zaman bulamıyoruz', author: 'Haluk', category: 'improve' },
]

const FREE_CARDS = [
  { emoji: '🎁', title: 'Joker Kart', text: 'Harika! Bir sonraki turda 2 zar at ve yükseği seç.' },
  { emoji: '☕', title: 'Mola Zamanı', text: 'Tüm ekip için 5 dakika zorunlu mola! Herkes kalkıp gerinsın.' },
  { emoji: '🤝', title: 'Ekip Ruhu', text: 'Bir takım arkadaşının aksiyonunu sahiplenebilir ya da sahibini değiştirebilirsin.' },
  { emoji: '🎯', title: 'Odak Kartı', text: 'Bu turda ekstra bir aksiyon kartı çekip sahiplenme şansı kazandın!' },
  { emoji: '🔄', title: 'Yer Değiştir', text: 'İstersen sıranı bir sonraki oyuncuya devredebilirsin.' },
  { emoji: '⭐', title: 'Yıldız Oyuncu', text: "Bu sprint'in MVP'si sensin! Tebrikler." },
]

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

type StationModal = 'agenda' | 'action' | 'freecard' | 'move_back' | 'move_forward' | null

// ─── Agenda Card Modal ────────────────────────────────────────────────────────

function AgendaCardModal({ open, card, onClose }: {
  open: boolean; card: AgendaItem | null; onClose: () => void
}) {
  if (!card) return null
  const well = card.category === 'went-well'
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Dialog.Title className="flex items-center gap-2 text-base font-semibold text-white">
                📋 Retro Gündemi Çekildi
              </Dialog.Title>
              <Dialog.Close className="text-slate-500 hover:text-white transition-colors rounded-lg p-1 hover:bg-slate-800">
                <X className="w-4 h-4" />
              </Dialog.Close>
            </div>
            <div className={`border rounded-2xl p-5 space-y-3 ${well
              ? 'border-emerald-500/40 bg-emerald-500/5'
              : 'border-amber-500/40 bg-amber-500/5'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${well ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span className={`text-xs font-semibold ${well ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {well ? '✨ İyi Gitti' : '🔧 İyileştir'}
                </span>
              </div>
              <p className="text-base text-slate-100 leading-relaxed font-medium">{card.text}</p>
              <p className="text-xs text-slate-500">— {card.author}</p>
            </div>
            <p className="text-xs text-slate-500 text-center">Bu konu üzerinde ekiple tartışın.</p>
            <button
              onClick={onClose}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              Anlaşıldı →
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ─── Free Card Modal ──────────────────────────────────────────────────────────

function FreeCardModal({ open, card, onClose }: {
  open: boolean; card: typeof FREE_CARDS[0] | null; onClose: () => void
}) {
  if (!card) return null
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm px-4">
          <div className="bg-slate-900 border border-yellow-500/40 rounded-2xl shadow-2xl p-6 space-y-4 text-center">
            <Dialog.Title className="sr-only">Oyun Kartı</Dialog.Title>
            <div className="text-5xl">{card.emoji}</div>
            <div>
              <p className="text-lg font-bold text-yellow-300">{card.title}</p>
              <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">{card.text}</p>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              Harika! →
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ─── Move Notification Modal ──────────────────────────────────────────────────

function MoveModal({ open, type, steps, onClose }: {
  open: boolean; type: 'back' | 'forward'; steps: number; onClose: () => void
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-xs px-4">
          <div className={`bg-slate-900 border rounded-2xl shadow-2xl p-6 space-y-4 text-center ${
            type === 'back' ? 'border-red-500/40' : 'border-cyan-500/40'
          }`}>
            <Dialog.Title className="sr-only">{type === 'back' ? 'Geri' : 'İleri'}</Dialog.Title>
            <div className="text-4xl">{type === 'back' ? '⏪' : '⏩'}</div>
            <div>
              <p className={`text-lg font-bold ${type === 'back' ? 'text-red-300' : 'text-cyan-300'}`}>
                {steps} Adım {type === 'back' ? 'Geri!' : 'İleri!'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {type === 'back' ? 'Geriye doğru hareket ediyorsun!' : 'Hızla ileriye!'}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`w-full text-white text-sm font-semibold py-2.5 rounded-xl transition-colors ${
                type === 'back' ? 'bg-red-600 hover:bg-red-500' : 'bg-cyan-600 hover:bg-cyan-500'
              }`}
            >
              {type === 'back' ? `${steps} Geri Git →` : `${steps} İleri Git →`}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ─── Actions Panel ────────────────────────────────────────────────────────────

function ActionsPanel() {
  const actions        = useGameStore((s) => s.actions)
  const setActionOwner = useGameStore((s) => s.setActionOwner)
  const removeAction   = useGameStore((s) => s.removeAction)

  const unowned = actions.filter((a) => !a.owner)
  const owned   = actions.filter((a) =>  a.owner)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-semibold text-slate-200">Aksiyonlar</span>
        <span className="text-xs text-slate-500 ml-auto">{actions.length} toplam</span>
      </div>

      {unowned.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Sahipsiz ({unowned.length})</p>
          {unowned.map((a) => (
            <div key={a.id} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 space-y-2">
              <p className="text-xs text-slate-300 leading-relaxed">{a.action}</p>
              {a.agendaTitle && (
                <p className="text-[10px] text-slate-600 truncate">{a.agendaTitle}</p>
              )}
              <div className="flex gap-1.5">
                <select
                  defaultValue=""
                  onChange={(e) => { if (e.target.value) setActionOwner(a.id, e.target.value) }}
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="" disabled>Kim sahiplensin?</option>
                  {TEAM.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <button
                  onClick={() => removeAction(a.id)}
                  className="text-slate-600 hover:text-red-400 px-1.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {owned.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Sahiplenildi ({owned.length})</p>
          {owned.map((a) => (
            <div key={a.id} className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 space-y-1">
              <p className="text-xs text-slate-300 leading-relaxed">{a.action}</p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {a.owner}
              </p>
            </div>
          ))}
        </div>
      )}

      {actions.length === 0 && (
        <p className="text-xs text-slate-600 text-center py-6">
          ⚡ istasyonuna indiğinizde<br />aksiyonlar burada görünür
        </p>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GamePage() {
  const players            = useGameStore((s) => s.players)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)
  const currentPlayer      = players[currentPlayerIndex]
  const movePlayerOneStep  = useGameStore((s) => s.movePlayerOneStep)
  const movePlayer         = useGameStore((s) => s.movePlayer)
  const nextTurn           = useGameStore((s) => s.nextTurn)
  const resetGame          = useGameStore((s) => s.resetGame)
  const agenda             = useGameStore((s) => s.agenda)
  const agendaReady        = useGameStore((s) => s.agendaReady)

  const [displayRoll, setDisplayRoll]         = useState<number | null>(null)
  const [isAnimating, setIsAnimating]         = useState(false)
  const [movingPlayerId, setMovingPlayerId]   = useState<string | null>(null)

  const [stationModal, setStationModal]           = useState<StationModal>(null)
  const [pendingPlayerId, setPendingPlayerId]     = useState<string | null>(null)
  const [drawnAgendaCard, setDrawnAgendaCard]     = useState<AgendaItem | null>(null)
  const [freeCard, setFreeCard]                   = useState<typeof FREE_CARDS[0] | null>(null)

  const activeAgenda = agendaReady ? agenda : DUMMY_AGENDA

  function handleLanding(playerId: string, position: number) {
    const station = STATIONS.find((s) => s.id === position)
    setPendingPlayerId(playerId)

    switch (station?.type) {
      case 'AGENDA':
        setDrawnAgendaCard(pickRandom(activeAgenda))
        setStationModal('agenda')
        break
      case 'ACTION_CLAIM':
        setDrawnAgendaCard(pickRandom(activeAgenda))
        setStationModal('action')
        break
      case 'FREE_CARD':
        setFreeCard(pickRandom(FREE_CARDS))
        setStationModal('freecard')
        break
      case 'BACK_1':
        setStationModal('move_back')
        break
      case 'FORWARD_2':
        setStationModal('move_forward')
        break
      default:
        setPendingPlayerId(null)
        nextTurn()
    }
  }

  function closeModal() {
    const modal = stationModal
    const pid   = pendingPlayerId

    setStationModal(null)
    setDrawnAgendaCard(null)
    setFreeCard(null)
    setPendingPlayerId(null)

    if (modal === 'move_back'    && pid) movePlayer(pid, -1)
    if (modal === 'move_forward' && pid) movePlayer(pid,  2)

    nextTurn()
  }

  function rollDice() {
    if (isAnimating || stationModal !== null) return

    const roll          = Math.floor(Math.random() * 6) + 1
    const playerId      = currentPlayer.id
    const finalPosition = (currentPlayer.position + roll) % 20

    setIsAnimating(true)

    const cycleInterval = setInterval(() => {
      setDisplayRoll(Math.floor(Math.random() * 6) + 1)
    }, 80)

    setTimeout(() => {
      clearInterval(cycleInterval)
      setDisplayRoll(roll)
      setMovingPlayerId(playerId)

      let step = 0
      const moveInterval = setInterval(() => {
        step++
        movePlayerOneStep(playerId)
        if (step >= roll) {
          clearInterval(moveInterval)
          setMovingPlayerId(null)
          setIsAnimating(false)
          handleLanding(playerId, finalPosition)
        }
      }, 380)
    }, 500)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 bg-[#0d0f1a]/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">🎲</div>
          <span className="font-semibold text-white text-sm">Retro-Opoly</span>
          <span className="text-xs text-slate-600 bg-slate-800 px-2 py-0.5 rounded-full">Sprint 16</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xs text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-full transition-colors">
            ← Kurulum
          </Link>
          <button
            onClick={resetGame}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-full transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Sıfırla
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 max-w-7xl mx-auto w-full">

        {/* Left: Board + Controls */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Player cards */}
          <div className="flex flex-wrap gap-2 justify-center">
            {players.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all
                  ${i === currentPlayerIndex
                    ? 'border-white/30 bg-white/10 shadow-lg scale-105'
                    : 'border-slate-700/60 bg-slate-800/40 opacity-50'
                  }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${p.color}`} />
                <span className="text-slate-200 font-medium">{p.name}</span>
                <span className="text-slate-500">#{p.position}</span>
              </div>
            ))}
          </div>

          {/* Board */}
          <GameBoard movingPlayerId={movingPlayerId} />

          {/* Dice area */}
          <div className="flex items-center justify-center gap-6 py-2">
            <div className="text-center">
              <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Sıra</p>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${currentPlayer.color}`} />
                <span className="text-sm font-semibold text-white">{currentPlayer.name}</span>
              </div>
            </div>

            <button
              onClick={rollDice}
              disabled={isAnimating || stationModal !== null}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors shadow-lg"
            >
              🎲 Zar At
            </button>

            {displayRoll !== null && (
              <span className={`text-4xl leading-none select-none ${isAnimating ? 'animate-pulse' : ''}`}>
                {DICE_FACES[displayRoll]}
              </span>
            )}
          </div>

          {isAnimating && movingPlayerId && (
            <p className="text-xs text-slate-400 animate-pulse text-center">
              {players.find((p) => p.id === movingPlayerId)?.name} ilerliyor…
            </p>
          )}
        </div>

        {/* Right: Actions Panel */}
        <div className="lg:w-72 shrink-0 bg-slate-900/50 border border-slate-700/40 rounded-2xl p-4 overflow-y-auto lg:max-h-[calc(100vh-5rem)]">
          <ActionsPanel />
        </div>
      </main>

      {/* ── Station Modals ── */}
      <AgendaCardModal
        open={stationModal === 'agenda'}
        card={drawnAgendaCard}
        onClose={closeModal}
      />

      <SmartActionModal
        open={stationModal === 'action'}
        onClose={closeModal}
        agendaCardId={drawnAgendaCard?.id ?? ''}
        agendaTitle={drawnAgendaCard?.text ?? ''}
        initialText=""
      />

      <FreeCardModal
        open={stationModal === 'freecard'}
        card={freeCard}
        onClose={closeModal}
      />

      <MoveModal
        open={stationModal === 'move_back'}
        type="back"
        steps={1}
        onClose={closeModal}
      />

      <MoveModal
        open={stationModal === 'move_forward'}
        type="forward"
        steps={2}
        onClose={closeModal}
      />
    </div>
  )
}
