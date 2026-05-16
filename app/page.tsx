'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Shuffle, Sparkles, UserCircle2, CheckCircle2,
  ChevronRight, RefreshCw, Layers, Trophy,
  Plus, X, Loader2, FileText, RotateCcw,
} from 'lucide-react'
import SmartActionModal from '@/components/SmartActionModal'
import DejaVuAlert from '@/components/DejaVuAlert'
import { useGameStore, type AgendaItem, type SavedAction } from '@/store/useGameStore'
import type { DejaVuResult } from '@/app/api/check-dejavu/route'

// ─── Fallback dummy data (API key yokken veya notlar girilmemişse) ────────────

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
  { id: 'i5', text: 'Deployment süreci hâlâ manuel adımlar içeriyor, otomasyon gerekli', author: 'Neşe', category: 'improve' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ─── Step label ───────────────────────────────────────────────────────────────

function StepBadge({ n, color }: { n: string; color: 'indigo' | 'violet' | 'amber' | 'emerald' }) {
  const cls = {
    indigo:  'bg-indigo-600/20  border-indigo-500/30  text-indigo-400',
    violet:  'bg-violet-600/20  border-violet-500/30  text-violet-400',
    amber:   'bg-amber-500/20   border-amber-500/30   text-amber-400',
    emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
  }[color]
  return (
    <div className={`w-7 h-7 border rounded-lg flex items-center justify-center text-xs font-bold ${cls}`}>
      {n}
    </div>
  )
}

// ─── Card Deck ────────────────────────────────────────────────────────────────

function CardDeck({ label, count, onClick, color = 'indigo', disabled = false }: {
  label: string; count?: number; onClick: () => void
  color?: 'indigo' | 'amber'; disabled?: boolean
}) {
  const c = color === 'amber'
    ? { text: 'text-amber-400', bg: 'bg-amber-500/20', hover: 'group-hover:border-amber-500/50 group-hover:bg-amber-500/8' }
    : { text: 'text-indigo-400', bg: 'bg-indigo-500/20', hover: 'group-hover:border-indigo-500/50 group-hover:bg-indigo-500/8' }

  return (
    <button onClick={onClick} disabled={disabled}
      className="relative w-full group transition-all disabled:opacity-40 disabled:cursor-not-allowed">
      <div className="absolute inset-0 translate-x-2 translate-y-2 bg-slate-700/30 rounded-2xl" />
      <div className="absolute inset-0 translate-x-1 translate-y-1 bg-slate-700/50 rounded-2xl" />
      <div className={`relative bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col items-center gap-3
        transition-all group-hover:-translate-y-0.5 group-hover:shadow-xl ${!disabled ? c.hover : ''}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${disabled ? 'bg-slate-700' : c.bg}`}>
          <Shuffle className={`w-6 h-6 ${disabled ? 'text-slate-600' : c.text}`} />
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

// ─── Drawn Agenda Card ────────────────────────────────────────────────────────

function DrawnAgendaCard({ item, onRedraw }: { item: AgendaItem; onRedraw: () => void }) {
  const well = item.category === 'went-well'
  return (
    <div className={`border rounded-2xl p-5 space-y-3 ${well
      ? 'border-emerald-500/40 bg-emerald-500/8'
      : 'border-amber-500/40 bg-amber-500/8'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${well ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <span className={`text-xs font-semibold ${well ? 'text-emerald-400' : 'text-amber-400'}`}>
            {well ? 'İyi Gitti' : 'İyileştir'}
          </span>
        </div>
        <button onClick={onRedraw}
          className="text-slate-500 hover:text-slate-300 text-xs flex items-center gap-1 transition-colors">
          <RefreshCw className="w-3 h-3" /> Tekrar çek
        </button>
      </div>
      <p className="text-base text-slate-100 leading-relaxed font-medium">{item.text}</p>
      <p className="text-xs text-slate-500">— {item.author}</p>
    </div>
  )
}

// ─── Owned Action Card ────────────────────────────────────────────────────────

function OwnedActionCard({ action }: { action: SavedAction }) {
  return (
    <div className="card p-4 space-y-2 border-emerald-500/20">
      <p className="text-sm text-slate-200 leading-relaxed">{action.action}</p>
      <p className="text-xs text-emerald-400 flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span className="font-medium">{action.owner}</span>
        <span className="text-slate-600">tarafından sahiplenildi</span>
      </p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  // Step 0
  const [noteText, setNoteText]       = useState('')
  const [noteAuthor, setNoteAuthor]   = useState('')
  const [generating, setGenerating]   = useState(false)
  const [genError, setGenError]       = useState<string | null>(null)

  // Déjà Vu state
  const [dejaVu, setDejaVu]           = useState<DejaVuResult | null>(null)
  const [dejaVuChecking, setDejaVuChecking] = useState(false)
  const dejaVuTimer                   = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Step 1
  const [drawnItem, setDrawnItem]     = useState<AgendaItem | null>(null)

  // Step 2
  const [actionText, setActionText]   = useState('')
  const [modalOpen, setModalOpen]     = useState(false)

  // Step 3
  const [drawnAction, setDrawnAction] = useState<SavedAction | null>(null)
  const [ownerPick, setOwnerPick]     = useState('')

  const {
    retroNotes, addRetroNote, removeRetroNote,
    agenda, agendaReady, setAgenda, resetAgenda,
    actions, setActionOwner,
  } = useGameStore()

  const activeAgenda = agendaReady ? agenda : DUMMY_AGENDA
  const unowned = actions.filter((a) => !a.owner)
  const owned   = actions.filter((a) =>  a.owner)

  // ── Déjà Vu: debounce kontrolü ──
  useEffect(() => {
    const text = noteText.trim()
    if (!text || text.length < 10 || retroNotes.length === 0) {
      setDejaVu(null)
      return
    }
    if (dejaVuTimer.current) clearTimeout(dejaVuTimer.current)
    dejaVuTimer.current = setTimeout(async () => {
      setDejaVuChecking(true)
      try {
        const res = await fetch('/api/check-dejavu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            newNote: text,
            pastNotes: retroNotes.map((n) => ({ text: n.text, author: n.author })),
          }),
        })
        if (res.ok) setDejaVu(await res.json())
      } catch { /* sessiz hata */ }
      finally { setDejaVuChecking(false) }
    }, 700)
    return () => { if (dejaVuTimer.current) clearTimeout(dejaVuTimer.current) }
  }, [noteText, retroNotes])

  // ── Step 0: add note ──
  function handleAddNote() {
    const t = noteText.trim()
    const a = noteAuthor.trim() || 'Anonim'
    if (!t) return
    addRetroNote(t, a)
    setNoteText('')
  }

  // ── Step 0: generate agenda ──
  async function handleGenerateAgenda() {
    if (!retroNotes.length) return
    setGenerating(true)
    setGenError(null)
    try {
      const res = await fetch('/api/create-agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: retroNotes.map((n) => ({ text: n.text, author: n.author })) }),
      })
      if (!res.ok) throw new Error(await res.text())
      const { cards } = await res.json()
      setAgenda(cards)
      setDrawnItem(null)
    } catch {
      setGenError('Gündem oluşturulamadı. Tekrar dene.')
    } finally {
      setGenerating(false)
    }
  }

  // ── Step 1 ──
  function drawAgenda() {
    setDrawnItem(pickRandom(activeAgenda))
    setActionText('')
  }

  // ── Step 3 ──
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
          <Link
            href="/summary"
            className="flex items-center gap-1 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 px-2.5 py-1 rounded-full transition-colors"
          >
            <Trophy className="w-3 h-3" />
            Özet
          </Link>
          <Link
            href="/game"
            className="flex items-center gap-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-full transition-colors"
          >
            🎲 Oyuna Geç
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* ── ADIM 0: Gündem Kartı Oluştur ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <StepBadge n="0" color="violet" />
            <p className="text-sm font-semibold text-slate-200">Gündem Kartlarını Oluştur</p>
            {agendaReady && (
              <button onClick={() => { resetAgenda(); setDrawnItem(null) }}
                className="ml-auto text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors">
                <RotateCcw className="w-3 h-3" /> Sıfırla
              </button>
            )}
          </div>

          {agendaReady ? (
            /* Gündem hazır */
            <div className="card border-violet-500/30 bg-violet-500/5 p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-violet-300">Gündem hazır!</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {agenda.length} kart oluşturuldu · {agenda.filter(a => a.category === 'went-well').length} iyi gitti,{' '}
                  {agenda.filter(a => a.category === 'improve').length} iyileştir
                </p>
              </div>
            </div>
          ) : (
            <div className="card p-5 space-y-4">
              {/* Note input */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    value={noteAuthor}
                    onChange={(e) => setNoteAuthor(e.target.value)}
                    placeholder="Adın (opsiyonel)"
                    className="w-32 shrink-0 bg-slate-700/50 border border-slate-600/60 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/60 transition-all"
                  />
                  <div className="relative flex-1">
                    <input
                      value={noteText}
                      onChange={(e) => { setNoteText(e.target.value); setDejaVu(null) }}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                      placeholder='Retro notunu yaz... (Enter ile ekle)'
                      className="w-full bg-slate-700/50 border border-slate-600/60 rounded-xl px-3 py-2.5 pr-8 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/60 transition-all"
                    />
                    {dejaVuChecking && (
                      <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 animate-spin" />
                    )}
                  </div>
                  <button
                    onClick={handleAddNote}
                    disabled={!noteText.trim()}
                    className="shrink-0 w-10 h-10 flex items-center justify-center bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Déjà Vu uyarısı */}
                {dejaVu?.isRepeat && (
                  <DejaVuAlert result={dejaVu} onDismiss={() => setDejaVu(null)} />
                )}
              </div>

              {/* Notes list */}
              {retroNotes.length > 0 && (
                <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {retroNotes.map((n) => (
                    <li key={n.id} className="flex items-start gap-2 bg-slate-700/40 rounded-xl px-3 py-2.5">
                      <FileText className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-slate-500 font-medium">{n.author} · </span>
                        <span className="text-sm text-slate-300">{n.text}</span>
                      </div>
                      <button onClick={() => removeRetroNote(n.id)}
                        className="text-slate-600 hover:text-red-400 transition-colors shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Generate button */}
              <button
                onClick={handleGenerateAgenda}
                disabled={retroNotes.length === 0 || generating}
                className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500
                  disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed
                  text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
              >
                {generating
                  ? <><Loader2 className="w-4 h-4 animate-spin" />AI Gündem Oluşturuyor...</>
                  : <><Sparkles className="w-4 h-4" />AI ile Gündem Kartları Oluştur ({retroNotes.length} not)</>
                }
              </button>

              {genError && (
                <p className="text-xs text-red-400 text-center">{genError}</p>
              )}

              {retroNotes.length === 0 && (
                <p className="text-xs text-slate-600 text-center">
                  Not ekle veya aşağıdan demo gündemle devam et →
                  <button onClick={() => setAgenda(DUMMY_AGENDA)}
                    className="ml-1 text-slate-500 hover:text-slate-300 underline transition-colors">
                    Demo gündem kullan
                  </button>
                </p>
              )}
            </div>
          )}
        </section>

        {/* ── ADIM 1: Gündem Kartı Çek ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <StepBadge n="1" color="indigo" />
            <p className="text-sm font-semibold text-slate-200">Gündem Kartı Çek</p>
            <span className="text-xs text-slate-600">{activeAgenda.length} kart</span>
          </div>
          {!drawnItem
            ? <CardDeck label="Gündem Kartı Çek" count={activeAgenda.length} onClick={drawAgenda} color="indigo" />
            : <DrawnAgendaCard item={drawnItem} onRedraw={drawAgenda} />
          }
        </section>

        {/* ── ADIM 2: Aksiyon Yaz ── */}
        <section className={`space-y-4 transition-opacity duration-300 ${drawnItem ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
          <div className="flex items-center gap-3">
            <StepBadge n="2" color="amber" />
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

        {/* ── ADIM 3: Aksiyon Kartı Çek & Sahiplen ── */}
        <section className={`space-y-4 transition-opacity duration-300 ${unowned.length > 0 || owned.length > 0 ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
          <div className="flex items-center gap-3">
            <StepBadge n="3" color="emerald" />
            <p className="text-sm font-semibold text-slate-200">Aksiyon Kartı Çek & Sahiplen</p>
            {unowned.length > 0 && <span className="text-xs text-slate-500 ml-auto">{unowned.length} bekliyor</span>}
          </div>

          {!drawnAction ? (
            <CardDeck label="Aksiyon Kartı Çek" count={unowned.length} onClick={drawActionCard} color="amber" disabled={unowned.length === 0} />
          ) : (
            <div className="card border-amber-500/30 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400">Aksiyon Kartı</span>
                </div>
                {unowned.length > 1 && (
                  <button onClick={drawActionCard}
                    className="text-slate-500 hover:text-slate-300 text-xs flex items-center gap-1 transition-colors">
                    <RefreshCw className="w-3 h-3" /> Başkasını çek
                  </button>
                )}
              </div>
              {drawnAction.agendaTitle && (
                <p className="text-xs text-slate-500 truncate">{drawnAction.agendaTitle}</p>
              )}
              <p className="text-sm text-slate-100 leading-relaxed font-medium">{drawnAction.action}</p>
              <div className="flex gap-2 pt-2 border-t border-slate-700/60">
                <div className="flex items-center gap-2 flex-1 bg-slate-700/50 border border-slate-600/60 rounded-xl px-3 py-2">
                  <UserCircle2 className="w-4 h-4 text-slate-500 shrink-0" />
                  <select value={ownerPick} onChange={(e) => setOwnerPick(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-slate-200 focus:outline-none cursor-pointer">
                    <option value="">Kim sahiplensin?</option>
                    {TEAM.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <button onClick={assignOwner} disabled={!ownerPick}
                  className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
                  <CheckCircle2 className="w-4 h-4" /> Sahiplen
                </button>
              </div>
            </div>
          )}

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

          {owned.length > 0 && unowned.length === 0 && (
            <Link
              href="/summary"
              className="btn-primary w-full justify-center mt-4"
            >
              <Trophy className="w-4 h-4" />
              Retro Özetini Gör
              <ChevronRight className="w-4 h-4" />
            </Link>
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
