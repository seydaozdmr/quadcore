'use client'

import { useState } from 'react'
import {
  CheckCircle2, TrendingUp, Sparkles,
  ChevronRight, UserCircle2, Trash2, ClipboardList,
} from 'lucide-react'
import SmartActionModal from '@/components/SmartActionModal'
import { useGameStore, type SavedAction } from '@/store/useGameStore'

// ─── Data ────────────────────────────────────────────────────────────────────

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

// ─── Agenda Card ─────────────────────────────────────────────────────────────

function AgendaCard({
  item, selected, onClick,
}: { item: AgendaItem; selected: boolean; onClick: () => void }) {
  const isWell = item.category === 'went-well'
  const base = 'group w-full text-left p-3.5 rounded-xl border transition-all duration-150 cursor-pointer'
  const idle = 'border-slate-700/60 bg-slate-800/40 hover:bg-slate-800 hover:border-slate-600'
  const active = isWell
    ? 'border-emerald-500/50 bg-emerald-500/8 ring-1 ring-emerald-500/20'
    : 'border-amber-500/50 bg-amber-500/8 ring-1 ring-amber-500/20'

  return (
    <button className={`${base} ${selected ? active : idle}`} onClick={onClick}>
      <p className="text-sm text-slate-200 leading-relaxed">{item.text}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-slate-500">{item.author}</span>
        {selected && (
          <span className={`text-xs font-medium flex items-center gap-0.5 ${isWell ? 'text-emerald-400' : 'text-amber-400'}`}>
            Seçildi <CheckCircle2 className="w-3 h-3" />
          </span>
        )}
      </div>
    </button>
  )
}

// ─── Action Card ─────────────────────────────────────────────────────────────

function ActionCard({ action }: { action: SavedAction }) {
  const setOwner  = useGameStore((s) => s.setActionOwner)
  const remove    = useGameStore((s) => s.removeAction)
  const owned     = !!action.owner

  return (
    <div className={`card p-4 space-y-3 transition-all ${owned ? 'border-indigo-500/30' : ''}`}>
      {action.agendaTitle && (
        <p className="text-[11px] text-slate-500 truncate leading-none">
          {action.agendaTitle}
        </p>
      )}
      <p className="text-sm text-slate-100 leading-relaxed">{action.action}</p>

      <div className="flex items-center gap-2 pt-1 border-t border-slate-700/60">
        <UserCircle2 className="w-4 h-4 text-slate-500 shrink-0" />
        <select
          value={action.owner ?? ''}
          onChange={(e) => setOwner(action.id, e.target.value)}
          className="flex-1 bg-slate-700/60 border border-slate-600/60 text-sm text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/60 cursor-pointer"
        >
          <option value="">Sahip ata...</option>
          {TEAM.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <button
          onClick={() => remove(action.id)}
          className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {owned && (
        <p className="text-xs text-emerald-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {action.owner} tarafından sahiplenildi
        </p>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [selected, setSelected] = useState<AgendaItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const actions = useGameStore((s) => s.actions)

  const wentWell = AGENDA.filter((a) => a.category === 'went-well')
  const improve  = AGENDA.filter((a) => a.category === 'improve')

  function toggle(item: AgendaItem) {
    setSelected((prev) => (prev?.id === item.id ? null : item))
  }

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0d0f1a]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-base">🎲</div>
          <span className="font-semibold text-white text-sm">Retro-Opoly</span>
        </div>
        <span className="text-xs text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">Sprint 16</span>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* ── 1. Retro Gündem ── */}
        <section>
          <p className="section-title">Retro Gündemi</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* İyi Gitti */}
            <div className="card p-4 space-y-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-700/60 mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">İyi Gitti</span>
                <span className="ml-auto text-xs text-slate-500">{wentWell.length} madde</span>
              </div>
              {wentWell.map((item) => (
                <AgendaCard key={item.id} item={item} selected={selected?.id === item.id} onClick={() => toggle(item)} />
              ))}
            </div>

            {/* İyileştir */}
            <div className="card p-4 space-y-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-700/60 mb-1">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-sm font-semibold text-amber-400">İyileştir</span>
                <span className="ml-auto text-xs text-slate-500">{improve.length} madde</span>
              </div>
              {improve.map((item) => (
                <AgendaCard key={item.id} item={item} selected={selected?.id === item.id} onClick={() => toggle(item)} />
              ))}
            </div>
          </div>
        </section>

        {/* ── 2. Aksiyon Oluştur ── */}
        <section>
          <p className="section-title">Aksiyon Oluştur</p>
          <div className={`card p-5 transition-all ${selected ? 'border-indigo-500/40 bg-indigo-500/5' : ''}`}>
            {selected ? (
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 space-y-1">
                  <p className="text-[11px] text-slate-500 uppercase tracking-wide font-medium">Seçili konu</p>
                  <p className="text-sm text-slate-200 leading-relaxed">{selected.text}</p>
                  <p className="text-xs text-slate-500">— {selected.author}</p>
                </div>
                <button
                  onClick={() => setModalOpen(true)}
                  className="btn-amber shrink-0 self-start sm:self-center"
                >
                  <Sparkles className="w-4 h-4" />
                  SMART Analiz Et
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 py-1">
                <div className="w-8 h-8 rounded-xl bg-slate-700/60 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-slate-500" />
                </div>
                <p className="text-sm text-slate-500">
                  Yukarıdan bir gündem maddesi seç, ardından SMART aksiyon oluştur.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── 3. Aksiyonlar ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <p className="section-title mb-0">Aksiyonlar</p>
            {actions.length > 0 && (
              <span className="text-[11px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                {actions.length}
              </span>
            )}
          </div>

          {actions.length === 0 ? (
            <div className="card border-dashed p-10 flex flex-col items-center gap-3 text-center">
              <ClipboardList className="w-8 h-8 text-slate-600" />
              <p className="text-sm text-slate-500">Henüz aksiyon yok.</p>
              <p className="text-xs text-slate-600">Bir gündem maddesi seçip SMART analiz yap.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {actions.map((a) => <ActionCard key={a.id} action={a} />)}
            </div>
          )}
        </section>
      </main>

      <SmartActionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        agendaCardId={selected?.id ?? ''}
        agendaTitle={selected?.text ?? ''}
      />
    </div>
  )
}
