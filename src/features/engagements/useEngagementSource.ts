import { useEffect, useState } from 'react'
import type { Intake } from '../intake/types'
import type { Engagement } from './types'

export function useEngagementSource() {
  const [engagements, setEngagements] = useState<Engagement[]>([])
  const [intakes, setIntakes] = useState<Intake[]>([])
  const [ready, setReady] = useState(!import.meta.env.DEV)

  useEffect(() => {
    if (!import.meta.env.DEV) return
    let cancelled = false
    void Promise.all([import('./mockData'), import('../intake/mockData')]).then(([engagementsMod, intakeMod]) => {
      if (cancelled) return
      setEngagements(engagementsMod.mockEngagements)
      setIntakes(intakeMod.mockIntakes)
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return { engagements, intakes, ready }
}
