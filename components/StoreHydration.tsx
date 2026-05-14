'use client'

import { useEffect } from 'react'
import { useGameStore } from '@/store/useGameStore'

export default function StoreHydration() {
  useEffect(() => {
    useGameStore.persist.rehydrate()
  }, [])

  return null
}
