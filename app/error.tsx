'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-red-400 text-sm">{error.message || 'Bir hata oluştu.'}</p>
      <button
        onClick={reset}
        className="text-xs text-slate-400 hover:text-white border border-slate-700 px-4 py-2 rounded-lg transition-colors"
      >
        Tekrar dene
      </button>
    </div>
  )
}
