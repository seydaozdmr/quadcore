'use client'

import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import {
  X, Loader2, CheckCircle2, AlertTriangle, XCircle, Sparkles, AlertCircle,
} from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'

interface SmartResult {
  score: number
  isSmart: boolean
  missingFields: string[]
  suggestedAction: string
}

interface SmartActionModalProps {
  open: boolean
  onClose: () => void
  agendaCardId?: string
  agendaTitle?: string
  initialText?: string
}

function scoreConfig(score: number) {
  if (score > 80) return {
    color: 'text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500/40',
    icon: <CheckCircle2 className="w-4 h-4" />, label: 'SMART',
  }
  if (score >= 50) return {
    color: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500/40',
    icon: <AlertTriangle className="w-4 h-4" />, label: 'Geliştirilmeli',
  }
  return {
    color: 'text-red-400', bg: 'bg-red-500', border: 'border-red-500/40',
    icon: <XCircle className="w-4 h-4" />, label: 'SMART Değil',
  }
}

function ScoreBar({ score }: { score: number }) {
  const cfg = scoreConfig(score)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className={`flex items-center gap-1.5 text-sm font-semibold ${cfg.color}`}>
          {cfg.icon}{cfg.label}
        </span>
        <span className={`text-2xl font-bold tabular-nums ${cfg.color}`}>
          {score}<span className="text-sm font-normal text-slate-500">/100</span>
        </span>
      </div>
      <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${cfg.bg}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

export default function SmartActionModal({
  open, onClose, agendaCardId = '', agendaTitle = '', initialText = '',
}: SmartActionModalProps) {
  const [rawAction, setRawAction] = useState(initialText)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SmartResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { if (open) setRawAction(initialText) }, [open, initialText])

  const addAction = useGameStore((s) => s.addAction)

  async function handleAnalyze() {
    if (!rawAction.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await fetch('/api/validate-smart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawAction }),
      })
      if (!res.ok) throw new Error(await res.text())
      setResult(await res.json())
    } catch (err) {
      setError('AI analizi başarısız oldu. Lütfen tekrar deneyin.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleSave(actionText: string) {
    addAction({ action: actionText, agendaCardId, agendaTitle })
    handleClose()
  }

  function handleClose() {
    setRawAction('')
    setResult(null)
    setError(null)
    onClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between">
              <Dialog.Title className="flex items-center gap-2 text-base font-semibold text-white">
                <Sparkles className="w-4 h-4 text-amber-400" />
                SMART Aksiyon Doğrulayıcı
              </Dialog.Title>
              <Dialog.Close onClick={handleClose} className="text-slate-500 hover:text-white transition-colors rounded-lg p-1 hover:bg-slate-800">
                <X className="w-4 h-4" />
              </Dialog.Close>
            </div>

            {/* Agenda context */}
            {agendaTitle && (
              <div className="text-xs text-slate-400 bg-slate-800 rounded-lg px-3 py-2 border border-slate-700">
                <span className="text-slate-500">Konu: </span>{agendaTitle}
              </div>
            )}

            {/* Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Ham Aksiyon Kararı</label>
              <textarea
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all"
                rows={3}
                placeholder='Örn: "Deployment sürecini iyileştireceğiz"'
                value={rawAction}
                onChange={(e) => setRawAction(e.target.value)}
              />
            </div>

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={loading || !rawAction.trim()}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-900 font-semibold text-sm py-2.5 rounded-xl transition-colors"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />AI Analiz Ediyor...</> : <><Sparkles className="w-4 h-4" />AI ile Analiz Et</>}
            </button>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            {/* Result */}
            {result && (
              <div className={`border rounded-xl p-4 space-y-4 ${scoreConfig(result.score).border}`}>
                <ScoreBar score={result.score} />
                {result.missingFields.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-slate-400">Eksik Kriterler</p>
                    <ul className="space-y-1">
                      {result.missingFields.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-red-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />{f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-slate-400">AI Önerisi</p>
                  <p className="text-sm text-slate-100 bg-slate-800 rounded-lg px-3 py-2.5 leading-relaxed">{result.suggestedAction}</p>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleSave(result.suggestedAction)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                  >
                    Öneriyi Kabul Et ve Kaydet
                  </button>
                  {!result.isSmart && (
                    <button
                      onClick={() => handleSave(rawAction)}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium py-2.5 rounded-xl transition-colors"
                    >
                      Ham Haliyle Kaydet
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
