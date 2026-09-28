import { useState } from 'react'

export function useEditable<T>(key: string | undefined, source: T | null) {
  const [edited, setEdited] = useState<{ key: string; value: T } | null>(null)
  const value = edited && edited.key === key ? edited.value : source

  const setValue = (next: T | ((current: T) => T)) => {
    if (!key) return
    setEdited((current) => {
      const base = current && current.key === key ? current.value : source
      if (!base) return current
      const resolved = typeof next === 'function' ? (next as (current: T) => T)(base) : next
      return { key, value: resolved }
    })
  }

  return [value, setValue] as const
}
