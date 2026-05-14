'use client'

import { useState } from 'react'
import SmartActionModal from '@/components/SmartActionModal'

export default function Home() {
  const [open, setOpen] = useState(false)

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">Retro-Opoly</h1>
        <p className="text-slate-400">SMART Aksiyon Doğrulayıcı — Demo</p>
      </div>
      <button
        onClick={() => setOpen(true)}
        className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-6 py-3 rounded-xl transition-colors"
      >
        SMART Modal Aç
      </button>
      <SmartActionModal open={open} onClose={() => setOpen(false)} agendaCardId="demo" />
    </main>
  )
}
