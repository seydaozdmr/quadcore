'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X, BookOpen, Zap, Dices, AlertCircle, UserCircle2 } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'

// ─── İçerik bileşenleri ───────────────────────────────────────────────────────

function AgendaContent() {
  const drawnCard = useGameStore((s) => s.drawnCard)
  const item = drawnCard?.agendaItem

  if (!item) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <AlertCircle className="w-8 h-8 text-slate-500" />
        <p className="text-slate-400 text-sm">Gündem kartı yok.</p>
        <p className="text-slate-600 text-xs">Ana sayfadan retro notları girerek gündem oluştur.</p>
      </div>
    )
  }

  const isWell = item.category === 'went-well'
  return (
    <div className={`rounded-xl border p-5 space-y-3 ${
      isWell ? 'border-emerald-500/40 bg-emerald-500/8' : 'border-amber-500/40 bg-amber-500/8'
    }`}>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isWell ? 'bg-emerald-400' : 'bg-amber-400'}`} />
        <span className={`text-xs font-semibold ${isWell ? 'text-emerald-400' : 'text-amber-400'}`}>
          {isWell ? 'İyi Gitti' : 'İyileştir'}
        </span>
        <span className="ml-auto text-xs text-slate-500">— {item.author}</span>
      </div>
      <p className="text-slate-100 text-base leading-relaxed font-medium">{item.text}</p>
      <p className="text-xs text-slate-500 italic">
        Bu konu hakkında ekiple konuş. Önemli nokta varsa aksiyon oluşturmayı unutma.
      </p>
    </div>
  )
}

function ActionClaimContent() {
  const drawnCard   = useGameStore((s) => s.drawnCard)
  const players     = useGameStore((s) => s.players)
  const currentIdx  = useGameStore((s) => s.currentPlayerIndex)
  const setOwner    = useGameStore((s) => s.setActionOwner)
  const closeCard   = useGameStore((s) => s.closeCard)
  const action      = drawnCard?.action
  const currentPlayer = players[currentIdx]

  if (!action) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <AlertCircle className="w-8 h-8 text-slate-500" />
        <p className="text-slate-400 text-sm">Sahiplenilecek aksiyon yok.</p>
        <p className="text-slate-600 text-xs">Önce SMART aksiyon oluşturulmalı.</p>
      </div>
    )
  }

  function handleClaim() {
    if (!action) return
    setOwner(action.id, currentPlayer.name)
    closeCard()
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-indigo-500/40 bg-indigo-500/8 p-5 space-y-2">
        {action.agendaTitle && (
          <p className="text-[11px] text-slate-500 truncate">{action.agendaTitle}</p>
        )}
        <p className="text-slate-100 text-base leading-relaxed font-medium">{action.action}</p>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
        <div className={`w-3 h-3 rounded-full ${currentPlayer.color}`} />
        <p className="text-sm text-slate-300">
          <span className="font-semibold text-white">{currentPlayer.name}</span>
          {' '}bu aksiyonu üstlenmek istiyor musun?
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleClaim}
          className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          <UserCircle2 className="w-4 h-4" />
          Evet, Üstleniyorum
        </button>
        <button
          onClick={closeCard}
          className="px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-xl transition-colors"
        >
          Pas
        </button>
      </div>
    </div>
  )
}

function FreeCardContent() {
  const drawnCard = useGameStore((s) => s.drawnCard)
  const card = drawnCard?.freeCard

  if (!card) return null

  return (
    <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/8 p-6 flex flex-col items-center gap-4 text-center">
      <span className="text-5xl">{card.emoji}</span>
      <p className="text-slate-100 text-lg leading-relaxed font-medium">{card.text}</p>
    </div>
  )
}

// ─── Ana modal ────────────────────────────────────────────────────────────────

const DECK_META = {
  AGENDA: {
    icon: <BookOpen className="w-4 h-4" />,
    label: 'Retro Gündemi Çek',
    color: 'text-emerald-400',
  },
  ACTION_CLAIM: {
    icon: <Zap className="w-4 h-4" />,
    label: 'Aksiyon Üstlen',
    color: 'text-indigo-400',
  },
  FREE_CARD: {
    icon: <Dices className="w-4 h-4" />,
    label: 'Oyun Kartı',
    color: 'text-yellow-400',
  },
}

export default function DeckModal() {
  const drawnCard = useGameStore((s) => s.drawnCard)
  const closeCard = useGameStore((s) => s.closeCard)

  const isOpen = !!drawnCard?.type
  const meta   = drawnCard?.type ? DECK_META[drawnCard.type] : null

  return (
    <Dialog.Root open={isOpen} onOpenChange={(v) => !v && closeCard()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between">
              <Dialog.Title className={`flex items-center gap-2 text-base font-semibold ${meta?.color ?? 'text-white'}`}>
                {meta?.icon}
                {meta?.label}
              </Dialog.Title>
              <Dialog.Close
                onClick={closeCard}
                className="text-slate-500 hover:text-white transition-colors rounded-lg p-1 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </Dialog.Close>
            </div>

            {/* İçerik */}
            {drawnCard?.type === 'AGENDA'       && <AgendaContent />}
            {drawnCard?.type === 'ACTION_CLAIM' && <ActionClaimContent />}
            {drawnCard?.type === 'FREE_CARD'    && <FreeCardContent />}

            {/* Kapat */}
            {drawnCard?.type !== 'ACTION_CLAIM' && (
              <button
                onClick={closeCard}
                className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium py-2.5 rounded-xl transition-colors"
              >
                Tamam, Devam Et
              </button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
