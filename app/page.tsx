'use client'

import { useState } from 'react'
import {
  Shuffle, Sparkles, UserCircle2, CheckCircle2,
  ChevronRight, RefreshCw, Layers, Trophy,
} from 'lucide-react'
import SmartActionModal from '@/components/SmartActionModal'
import { useGameStore, type SavedAction } from '@/store/useGameStore'

// ─── Dummy Gündem ─────────────────────────────────────────────────────────────

const TEAM = ['Şeyda', 'Neşe', 'Soner', 'Haluk']

interface AgendaItem { id: string; text: string; author: string; category: 'went-well' | 'improve' }

const AGENDA: AgendaItem[] = [
  { id: 'w1', text: 'Daily standuplar çok verimli geçiyor, herkes hazırlıklı geliyor', author: 'Şeyda', category: 'went-well' },
  { id: 'w2', text: 'Yeni CI/CD pipeline son sprintte hiç sorun çıkarmadı', author: 'Neşe', category: 'went-well' },
  { id: 'w3', text: 'Pair programming seansları kod kalitesini belirgin şekilde artırdı', author: 'Soner', category: 'went-well' },
  { id: 'w4', text: 'Sprint hedefine %95 ulaştık, takım motivasyonu yüksek kaldı', author: 'Haluk', category: 'went-well' },
  { id: 'i1', text: 'Sprint planning toplantıları 4 saati aşıyor, çok uzun sürüyor', author: 'Şeyda', category: 'improve' },
  { id: 'i2', text: "Test coverage %58'de kaldı, hedef %80'di", author: 'Neşe', category: 'improve' },
  { id: 'i3', text: "PR'lar çok büyük oluyor, review yapmak zorlaşıyor", author: 'Soner', category: 'improve' },
  { id: 'i4', text: 'Teknik borç birikmeye devam ediyor, refactoring için zaman bulamıyoruz', author: 'Haluk', category: 'improve' },
  { id: 'i5', text: 'Deployment süreci hâlâ manuel adımlar içeriyor, otomasyon gerekli', author: 'Neşe', category: 'improve' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ─── Card Deck visual ────────────────────────────────────────────────────────

function CardDeck({ label, count, onClick, color = 'indigo', disabled = false }: {
  label: string; count?: number; onClick: () => void;
  color?: 'indigo' | 'amber'; disabled?: boolean
}) {
  const accent = color === 'amber'
    ? { ring: 'ring-amber-500/30', bg: 'bg-amber-500', text: 'text-amber-400', hover: 'hover:border-amber-500/60 hover:bg-amber-500/10' }
    : { ring: 'ring-indigo-500/30', bg: 'bg-indigo-500', text: 'text-indigo-400', hover: 'hover:border-indigo-500/60 hover:bg-indigo-500/10' }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative w-full group transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {/* Stack shadow cards */}
      <div className="absolute inset-0 translate-x-2 translate-y-2 bg-slate-700/40 rounded-2xl" />
      <div className="absolute inset-0 translate-x-1 translate-y-1 bg-slate-700/60 rounded-2xl" />
      {/* Main card */}
      <div className={`relative bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col items-center gap-3
        transition-all group-hover:border-slate-600 group-hover:-translate-y-0.5 group-hover:shadow-xl
        ${!disabled ? accent.hover : ''}`}
      >
        <div className={`w-12 h-12 rounded-xl ${disabled ? 'bg-slate-700' : accent.bg + '/20'} flex items-center justify-center`}>
          <Shuffle className={`w-6 h-6 ${disabled ? 'text-slate-600' : accent.text}`} />
        </div>
        <div className="text-center">
          <p className={`text-sm font-semibold ${disabled ? 'text-slate-600' : 'text-slate-200'}`}>{label}</p>
          {count !== undefined && (
            <p className="text-xs text-slate-500 mt-0.5">{count} kart mevcut</p>
          )}
        </div>
      </div>
    </button>
  )
}

// ─── Drawn Card ───────────────────────────────────────────────────────────────

function DrawnCard({ item, onRedraw }: { item: AgendaItem; onRedraw: () => void }) {
  const isWell = item.category === 'went-well'
  const color = isWell ? 'border-emerald-500/40 bg-emerald-500/8' : 'border-amber-500/40 bg-amber-500/8'
  const dot   = isWell ? 'bg-emerald-400' : 'bg-amber-400'
  const label = isWell ? 'İyi Gitti' : 'İyileştir'
  const labelColor = isWell ? 'text-emerald-400' : 'text-amber-400'

  return (
    <div className={`relative border rounded-2xl p-5 space-y-3 ${color}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${dot}`} />
          <span className={`text-xs font-semibold ${labelColor}`}>{label}</span>
        </div>
        <button
          onClick={onRedraw}
          className="text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 text-xs"
        >
          <RefreshCw className="w-3 h-3" /> Tekrar çek
        </button>
      </div>
      <p className="text-base text-slate-100 leading-relaxed font-medium">{item.text}</p>
      <p className="text-xs text-slate-500">— {item.author}</p>
    </div>
  )
}

// ─── Owned Actions list ───────────────────────────────────────────────────────

function OwnedActionCard({ action }: { action: SavedAction }) {
  return (
    <div className="card p-4 space-y-2 border-emerald-500/20">
      <p className="text-sm text-slate-200 leading-relaxed">{action.action}</p>
      <div className="flex items-center gap-1.5 text-xs text-emerald-400">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span className="font-medium">{action.owner}</span>
        <span className="text-slate-600">tarafından sahiplenildi</span>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  // Step 1 — Gündem
  const [drawnItem, setDrawnItem]     = useState<AgendaItem | null>(null)
  // Step 2 — Aksiyon
  const [actionText, setActionText]   = useState('')
  const [modalOpen, setModalOpen]     = useState(false)
  // Step 3 — Sahiplenme
  const [drawnAction, setDrawnAction] = useState<SavedAction | null>(null)
  const [ownerPick, setOwnerPick]     = useState('')

  const actions        = useGameStore((s) => s.actions)
  const setActionOwner = useGameStore((s) => s.setActionOwner)

  const unowned = actions.filter((a) => !a.owner)
  const owned   = actions.filter((a) =>  a.owner)

  function drawAgenda() {
    setDrawnItem(pickRandom(AGENDA))
    setActionText('')
  }

  function drawActionCard() {
    if (!unowned.length) return
    setDrawnAction(pickRandom(unowned))
    setOwnerPick('')
  }

  function assignOwner() {
    if (!drawnAction || !ownerPick) return
    setActionOwner(drawnAction.id, ownerPick)
    setDrawnAction(null)
    setOwnerPick('')
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0d0f1a]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">🎲</div>
          <span className="font-semibold text-white text-sm">Retro-Opoly</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="bg-slate-800 px-2.5 py-1 rounded-full">Sprint 16</span>
          <span>{actions.length} aksiyon · {owned.length} sahiplenildi</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* ── ADIM 1 ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-indigo-600/20 border border-indigo-500/30 rounded-lg flex items-center justify-center text-xs font-bold text-indigo-400">1</div>
            <p className="text-sm font-semibold text-slate-200">Gündem Kartı Çek</p>
          </div>

          {!drawnItem ? (
            <CardDeck label="Gündem Kartı Çek" count={AGENDA.length} onClick={drawAgenda} color="indigo" />
          ) : (
            <DrawnCard item={drawnItem} onRedraw={drawAgenda} />
          )}
        </section>

        {/* ── ADIM 2 ── */}
        <section className={`space-y-4 transition-opacity duration-300 ${drawnItem ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center justify-center text-xs font-bold text-amber-400">2</div>
            <p className="text-sm font-semibold text-slate-200">Aksiyon Yaz & Değerlendir</p>
          </div>

          <div className="card p-5 space-y-4">
            <textarea
              rows={3}
              value={actionText}
              onChange={(e) => setActionText(e.target.value)}
              placeholder='Bu konu için ne yapmalıyız? Örn: "Deployment otomasyonu sağlayacağız"'
              className="w-full bg-slate-700/50 border border-slate-600/60 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all"
            />
            <button
              onClick={() => setModalOpen(true)}
              disabled={!actionText.trim()}
              className="btn-amber w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              LLM ile SMART Değerlendir
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ── ADIM 3 ── */}
        <section className={`space-y-4 transition-opacity duration-300 ${unowned.length > 0 || owned.length > 0 ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center justify-center text-xs font-bold text-emerald-400">3</div>
            <p className="text-sm font-semibold text-slate-200">Aksiyon Kartı Çek & Sahiplen</p>
            {unowned.length > 0 && (
              <span className="ml-auto text-xs text-slate-500">{unowned.length} bekliyor</span>
            )}
          </div>

          {/* Draw action card */}
          {!drawnAction ? (
            <CardDeck
              label="Aksiyon Kartı Çek"
              count={unowned.length}
              onClick={drawActionCard}
              color="amber"
              disabled={unowned.length === 0}
            />
          ) : (
            <div className="card border-amber-500/30 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400">Aksiyon Kartı</span>
                </div>
                {unowned.length > 1 && (
                  <button
                    onClick={drawActionCard}
                    className="text-slate-500 hover:text-slate-300 text-xs flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> Başkasını çek
                  </button>
                )}
              </div>

              {drawnAction.agendaTitle && (
                <p className="text-xs text-slate-500">{drawnAction.agendaTitle}</p>
              )}
              <p className="text-sm text-slate-100 leading-relaxed font-medium">{drawnAction.action}</p>

              {/* Owner assignment */}
              <div className="flex gap-2 pt-2 border-t border-slate-700/60">
                <div className="flex items-center gap-2 flex-1 bg-slate-700/50 border border-slate-600/60 rounded-xl px-3 py-2">
                  <UserCircle2 className="w-4 h-4 text-slate-500 shrink-0" />
                  <select
                    value={ownerPick}
                    onChange={(e) => setOwnerPick(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="">Kim sahiplensin?</option>
                    {TEAM.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <button
                  onClick={assignOwner}
                  disabled={!ownerPick}
                  className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Sahiplen
                </button>
              </div>
            </div>
          )}

          {/* Owned actions */}
          {owned.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                <p className="text-xs text-emerald-400 font-semibold">{owned.length} Sahiplenildi</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {owned.map((a) => <OwnedActionCard key={a.id} action={a} />)}
              </div>
            </div>
          )}
        </section>
      </main>

      <SmartActionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        agendaCardId={drawnItem?.id ?? ''}
        agendaTitle={drawnItem?.text ?? ''}
        initialText={actionText}
      />
    </div>
  )
}
