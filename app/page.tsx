'use client'

import { useState } from 'react'
import { CheckCircle2, TrendingUp, Sparkles, UserCircle2, Trash2 } from 'lucide-react'
import SmartActionModal from '@/components/SmartActionModal'
import { useGameStore, type SavedAction } from '@/store/useGameStore'

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const TEAM = ['Şeyda', 'Neşe', 'Soner', 'Haluk']

interface AgendaItem {
  id: string
  text: string
  author: string
  category: 'went-well' | 'improve'
}

const AGENDA: AgendaItem[] = [
  // İyi Gitti
  { id: 'w1', text: 'Daily standuplar çok verimli geçiyor, herkes hazırlıklı geliyor', author: 'Şeyda', category: 'went-well' },
  { id: 'w2', text: 'Yeni CI/CD pipeline son sprintte hiç sorun çıkarmadı', author: 'Neşe', category: 'went-well' },
  { id: 'w3', text: 'Pair programming seansları kod kalitesini belirgin şekilde artırdı', author: 'Soner', category: 'went-well' },
  { id: 'w4', text: 'Sprint hedefine %95 ulaştık, takım motivasyonu yüksek kaldı', author: 'Haluk', category: 'went-well' },
  // İyileştir
  { id: 'i1', text: 'Sprint planning toplantıları 4 saati aşıyor, çok uzun sürüyor', author: 'Şeyda', category: 'improve' },
  { id: 'i2', text: 'Test coverage %58\'de kaldı, hedef %80\'di', author: 'Neşe', category: 'improve' },
  { id: 'i3', text: 'PR\'lar çok büyük oluyor, review yapmak zorlaşıyor', author: 'Soner', category: 'improve' },
  { id: 'i4', text: 'Teknik borç birikmeye devam ediyor, refactoring için zaman bulamıyoruz', author: 'Haluk', category: 'improve' },
  { id: 'i5', text: 'Deployment süreci hâlâ manuel adımlar içeriyor, otomasyon gerekli', author: 'Neşe', category: 'improve' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function AgendaCard({ item, selected, onClick }: { item: AgendaItem; selected: boolean; onClick: () => void }) {
  const isWell = item.category === 'went-well'
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border transition-all ${
        selected
          ? isWell
            ? 'border-emerald-400 bg-emerald-400/10 ring-1 ring-emerald-400/30'
            : 'border-amber-400 bg-amber-400/10 ring-1 ring-amber-400/30'
          : 'border-slate-700 bg-slate-800/60 hover:border-slate-600 hover:bg-slate-800'
      }`}
    >
      <p className="text-sm text-slate-100 leading-relaxed">{item.text}</p>
      <p className="text-xs text-slate-500 mt-1.5">— {item.author}</p>
    </button>
  )
}

function ActionCard({ action }: { action: SavedAction }) {
  const setOwner = useGameStore((s) => s.setActionOwner)
  const remove = useGameStore((s) => s.removeAction)

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
      {action.agendaTitle && (
        <p className="text-xs text-slate-500 truncate">
          Konu: {action.agendaTitle}
        </p>
      )}
      <p className="text-sm text-slate-100 leading-relaxed">{action.action}</p>
      <div className="flex items-center gap-2">
        <UserCircle2 className="w-4 h-4 text-slate-500 shrink-0" />
        <select
          value={action.owner ?? ''}
          onChange={(e) => setOwner(action.id, e.target.value)}
          className="flex-1 bg-slate-700 border border-slate-600 text-sm text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Sahip ata...</option>
          {TEAM.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <button
          onClick={() => remove(action.id)}
          className="text-slate-600 hover:text-red-400 transition-colors p-1"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      {action.owner && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {action.owner} tarafından sahiplenildi
        </div>
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

  function handleSelect(item: AgendaItem) {
    setSelected((prev) => (prev?.id === item.id ? null : item))
  }

  return (
    <main className="min-h-screen px-4 py-8 max-w-5xl mx-auto space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Sprint 16 Retro</h1>
        <p className="text-slate-400 text-sm mt-1">Bir konu seç → aksiyon oluştur → sahiplendir</p>
      </div>

      {/* ── Bölüm 1: Retro Gündem ── */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Retro Gündemi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* İyi Gitti */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-3">
              <CheckCircle2 className="w-4 h-4" />İyi Gitti
            </div>
            {wentWell.map((item) => (
              <AgendaCard
                key={item.id}
                item={item}
                selected={selected?.id === item.id}
                onClick={() => handleSelect(item)}
              />
            ))}
          </div>

          {/* İyileştir */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold mb-3">
              <TrendingUp className="w-4 h-4" />İyileştir
            </div>
            {improve.map((item) => (
              <AgendaCard
                key={item.id}
                item={item}
                selected={selected?.id === item.id}
                onClick={() => handleSelect(item)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Bölüm 2: Aksiyon Oluştur ── */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Aksiyon Oluştur</h2>
        <div className={`rounded-2xl border p-5 space-y-4 transition-colors ${
          selected ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-slate-700 bg-slate-800/40'
        }`}>
          {selected ? (
            <>
              <div className="space-y-1">
                <p className="text-xs text-slate-500">Seçili konu</p>
                <p className="text-sm text-slate-200 leading-relaxed">{selected.text}</p>
                <p className="text-xs text-slate-500">— {selected.author}</p>
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                SMART Aksiyon Oluştur
              </button>
            </>
          ) : (
            <p className="text-sm text-slate-500 py-2">
              Yukarıdan bir konu seçerek aksiyon oluşturabilirsin.
            </p>
          )}
        </div>
      </section>

      {/* ── Bölüm 3: Aksiyonlar ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Aksiyonlar
            {actions.length > 0 && (
              <span className="ml-2 bg-indigo-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {actions.length}
              </span>
            )}
          </h2>
        </div>

        {actions.length === 0 ? (
          <div className="border border-slate-700 border-dashed rounded-2xl p-8 text-center">
            <p className="text-slate-500 text-sm">Henüz aksiyon yok. Bir konu seçip SMART aksiyon oluştur.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {actions.map((a) => <ActionCard key={a.id} action={a} />)}
          </div>
        )}
      </section>

      {/* Modal */}
      <SmartActionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        agendaCardId={selected?.id ?? ''}
        agendaTitle={selected?.text ?? ''}
      />
    </main>
  )
}
