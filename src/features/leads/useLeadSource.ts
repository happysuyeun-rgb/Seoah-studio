import { useEffect, useState } from 'react'
import type { Lead } from './types'

export function useLeadSource() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [ready, setReady] = useState(!import.meta.env.DEV)

  useEffect(() => {
    if (!import.meta.env.DEV) return
    let cancelled = false
    void import('./mockData').then((mod) => {
      if (!cancelled) {
        setLeads(mod.mockLeads)
        setReady(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  return { leads, ready }
}
