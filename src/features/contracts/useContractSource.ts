import { useEffect, useState } from 'react'
import type { Contract } from './types'

export function useContractSource() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [ready, setReady] = useState(!import.meta.env.DEV)

  useEffect(() => {
    if (!import.meta.env.DEV) return
    let cancelled = false
    void import('./mockData').then((mod) => {
      if (!cancelled) {
        setContracts(mod.mockContracts)
        setReady(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  return { contracts, ready }
}
