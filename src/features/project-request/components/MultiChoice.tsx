import type { ReactNode } from 'react'

type MultiChoiceProps = {
  legend: string
  children: ReactNode
}

export function MultiChoice({ legend, children }: MultiChoiceProps) {
  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
      <div className="border-b border-line">{children}</div>
    </fieldset>
  )
}
