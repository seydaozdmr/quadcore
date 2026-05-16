'use client'

import { AlertTriangle, Flame, Info, X } from 'lucide-react'
import type { DejaVuResult } from '@/app/api/check-dejavu/route'

interface DejaVuAlertProps {
  result: DejaVuResult
  onDismiss: () => void
}

const SEVERITY_META = {
  low: {
    icon: <Info className="w-4 h-4 shrink-0 mt-0.5" />,
    label: 'Benzer Konu',
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/8',
    text: 'text-yellow-300',
    badge: 'bg-yellow-500/20 text-yellow-300',
  },
  medium: {
    icon: <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />,
    label: 'Déjà Vu!',
    border: 'border-orange-500/40',
    bg: 'bg-orange-500/8',
    text: 'text-orange-300',
    badge: 'bg-orange-500/20 text-orange-300',
  },
  high: {
    icon: <Flame className="w-4 h-4 shrink-0 mt-0.5" />,
    label: 'Tekrarlayan Sorun',
    border: 'border-red-500/40',
    bg: 'bg-red-500/8',
    text: 'text-red-300',
    badge: 'bg-red-500/20 text-red-300',
  },
}

export default function DejaVuAlert({ result, onDismiss }: DejaVuAlertProps) {
  if (!result.isRepeat) return null

  const meta = SEVERITY_META[result.severity]

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${meta.border} ${meta.bg} animate-in fade-in slide-in-from-top-2 duration-300`}>
      {/* Başlık */}
      <div className="flex items-start justify-between gap-2">
        <div className={`flex items-center gap-2 font-semibold text-sm ${meta.text}`}>
          {meta.icon}
          <span>{meta.label} Algılandı</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${meta.badge}`}>
            {result.severity === 'high' ? 'Kritik' : result.severity === 'medium' ? 'Orta' : 'Düşük'}
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-500 hover:text-slate-300 transition-colors p-0.5 rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Benzer notlar */}
      {result.similarNotes.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-slate-500 font-medium">Geçmişte de gündeme geldi:</p>
          <ul className="space-y-1">
            {result.similarNotes.map((note, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
                <span>"{note}"</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* AI analizi */}
      {result.analysis && (
        <div className="flex items-start gap-2 pt-1 border-t border-white/5">
          <span className="text-base">🤖</span>
          <p className="text-xs text-slate-300 leading-relaxed italic">{result.analysis}</p>
        </div>
      )}
    </div>
  )
}
