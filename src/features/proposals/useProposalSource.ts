import { useEffect, useState } from 'react'
import type { Proposal } from './types'

export function useProposalSource() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [ready, setReady] = useState(!import.meta.env.DEV)

  useEffect(() => {
    if (!import.meta.env.DEV) return
    let cancelled = false
    void import('./mockData').then((mod) => {
      if (!cancelled) {
        setProposals(mod.mockProposals)
        setReady(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  return { proposals, ready }
}
