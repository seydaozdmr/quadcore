'use client'

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html>
      <body className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0d0f1a] text-slate-100">
        <p className="text-red-400 text-sm">Kritik bir hata oluştu.</p>
        <button
          onClick={reset}
          className="text-xs text-slate-400 hover:text-white border border-slate-700 px-4 py-2 rounded-lg"
        >
          Yenile
        </button>
      </body>
    </html>
  )
}
