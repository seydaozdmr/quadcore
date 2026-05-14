'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import {
  Trophy, ChevronLeft, Clock, Users, ListChecks,
  CheckCircle2, Sparkles, UserCircle2,
} from 'lucide-react'
import { useGameStore, type SavedAction } from '@/store/useGameStore'

// ─── Fallback dummy actions (oyun oynanmamışsa) ────────────────────────────────

const DUMMY_ACTIONS: SavedAction[] = [
  {
    id: 'd1',
    action: 'Sprint planning toplantısını 2 saate düşüreceğiz, gündem önceden paylaşılacak',
    agendaCardId: 'i1',
    agendaTitle: 'Sprint planning toplantıları 4 saati aşıyor',
    owner: 'Şeyda',
    createdAt: Date.now() - 1000 * 60 * 32,
  },
  {
    id: 'd2',
    action: 'Test coverage hedefi olarak yeni eklenen dosyalarda %80, mevcut kodda %65 belirlenecek',
    agendaCardId: 'i2',
    agendaTitle: "Test coverage %58'de kaldı",
    owner: 'Neşe',
    createdAt: Date.now() - 1000 * 60 * 25,
  },
  {
    id: 'd3',
    action: "PR'ların max 400 satır olması için lint kuralı eklenecek",
    agendaCardId: 'i3',
    agendaTitle: "PR'lar çok büyük oluyor",
    owner: 'Soner',
    createdAt: Date.now() - 1000 * 60 * 18,
  },
  {
    id: 'd4',
    action: 'Sprint başına 1 gün refactoring slot ayrılacak, retro çıktıları önceliklendirilecek',
    agendaCardId: 'i4',
    agendaTitle: 'Teknik borç birikmeye devam ediyor',
    owner: 'Haluk',
    createdAt: Date.now() - 1000 * 60 * 9,
  },
  {
    id: 'd5',
    action: 'Deployment script otomasyonu için GitHub Actions workflow yazılacak',
    agendaCardId: 'i5',
    agendaTitle: 'Deployment süreci manuel adımlar içeriyor',
    owner: 'Neşe',
    createdAt: Date.now() - 1000 * 60 * 4,
  },
]

const DEMO_DURATION_MINUTES = 27

// ─── Helpers ───────────────────────────────────────────────────────────────────

function groupByOwner(actions: SavedAction[]): { owner: string; actions: SavedAction[] }[] {
  const map = new Map<string, SavedAction[]>()
  for (const a of actions) {
    const key = a.owner ?? 'Sahipsiz'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(a)
  }
  return Array.from(map.entries())
    .map(([owner, list]) => ({
      owner,
      actions: [...list].sort((x, y) => x.createdAt - y.createdAt),
    }))
    .sort((a, b) => b.actions.length - a.actions.length)
}

function computeDurationMinutes(actions: SavedAction[]): number {
  if (actions.length === 0) return DEMO_DURATION_MINUTES
  const first = Math.min(...actions.map((a) => a.createdAt))
  const last = Math.max(...actions.map((a) => a.createdAt))
  const minutes = Math.round((last - first) / 60_000)
  return minutes > 0 ? minutes : DEMO_DURATION_MINUTES
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function initial(name: string): string {
  return (name?.trim()?.charAt(0) ?? '?').toUpperCase()
}

// ─── Components ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, value, label }: {
  icon: typeof Trophy
  value: string | number
  label: string
}) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-indigo-400" />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold text-slate-100 leading-none">{value}</div>
        <div className="text-xs text-slate-500 mt-1">{label}</div>
      </div>
    </div>
  )
}

function OwnerCard({ owner, actions }: { owner: string; actions: SavedAction[] }) {
  const isOwned = owner !== 'Sahipsiz'
  return (
    <article className="card p-5 space-y-4">
      <header className="flex items-center gap-3 pb-3 border-b border-slate-700/60">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-base font-bold
          ${isOwned
            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
            : 'bg-slate-700/60 border border-slate-600/50 text-slate-400'}`}>
          {isOwned ? initial(owner) : '?'}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-slate-100 truncate">{owner}</h3>
          <p className="text-xs text-slate-500">
            {actions.length} aksiyon{isOwned ? ' üstlendi' : ' bekliyor'}
          </p>
        </div>
        {isOwned && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
      </header>

      <ul className="space-y-3">
        {actions.map((a) => (
          <li
            key={a.id}
            className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-3 space-y-2"
          >
            {a.agendaTitle && (
              <p className="text-[11px] text-slate-500 truncate">
                {a.agendaTitle}
              </p>
            )}
            <p className="text-sm text-slate-200 leading-relaxed">{a.action}</p>
            <p className="text-[10px] text-slate-600 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formatTime(a.createdAt)}
            </p>
          </li>
        ))}
      </ul>
    </article>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SummaryPage() {
  const storeActions = useGameStore((s) => s.actions)
  const storeNotes = useGameStore((s) => s.retroNotes)

  const isUsingDummy = storeActions.length === 0
  const actions = isUsingDummy ? DUMMY_ACTIONS : storeActions

  const grouped = useMemo(() => groupByOwner(actions), [actions])
  const durationMinutes = useMemo(() => computeDurationMinutes(actions), [actions])

  const ownedCount = actions.filter((a) => a.owner).length
  const ownerSet = new Set(actions.filter((a) => a.owner).map((a) => a.owner!))

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0d0f1a]/80 backdrop-blur-md z-10">
        <Link
          href="/"
          className="text-slate-400 hover:text-slate-200 text-sm flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Oyuna dön
        </Link>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Retro Özeti</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Title */}
        <section className="space-y-2">
          <p className="text-[11px] font-bold text-violet-400 uppercase tracking-[0.14em]">
            Sprint 16 · Retrospective
          </p>
          <h1 className="text-3xl font-bold text-slate-100">Oyun Özeti</h1>
          <p className="text-sm text-slate-500">
            Retro tamamlandı. İşte takımın aldığı aksiyon kararları ve oyun istatistikleri.
          </p>
          {isUsingDummy && (
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs px-3 py-1.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              Demo veri gösteriliyor (henüz aksiyon kaydedilmedi)
            </div>
          )}
        </section>

        {/* Duration hero */}
        <section className="card p-7 flex items-center justify-between flex-wrap gap-6 border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-transparent">
          <div className="flex items-baseline gap-3">
            <Clock className="w-6 h-6 text-indigo-400 self-center" />
            <span className="text-6xl font-extrabold text-indigo-300 leading-none tabular-nums">
              {durationMinutes}
            </span>
            <span className="text-lg font-medium text-slate-400">dakika</span>
          </div>
          <div className="space-y-1 text-xs text-slate-500">
            <p className="font-semibold text-slate-300">Oyun süresi</p>
            <p>{storeNotes.length} retro notu işlendi</p>
            <p>{actions.length} aksiyon kararı alındı</p>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard icon={ListChecks} value={actions.length} label="Toplam Aksiyon" />
          <StatCard icon={CheckCircle2} value={ownedCount} label="Sahiplenildi" />
          <StatCard icon={Users} value={ownerSet.size || (isUsingDummy ? 4 : 0)} label="Katılımcı" />
        </section>

        {/* Owners */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-title mb-0">Aksiyon Sahipleri</h2>
            <span className="text-xs text-slate-600">
              {grouped.length} kişi
            </span>
          </div>

          {grouped.length === 0 ? (
            <div className="card p-8 text-center text-slate-500 text-sm">
              <UserCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-700" />
              Henüz kimse bir aksiyon sahiplenmedi.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {grouped.map((g) => (
                <OwnerCard key={g.owner} owner={g.owner} actions={g.actions} />
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="pt-4">
          <Link href="/" className="btn-primary w-full justify-center">
            <ChevronLeft className="w-4 h-4" />
            Yeni Retroya Başla
          </Link>
        </section>
      </main>
    </div>
  )
}
