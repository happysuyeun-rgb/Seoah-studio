import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const controlClass =
  'w-full border border-line bg-paper px-3 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink'

function Label({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  )
}

export function TextField({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Label label={label}>
      <input className={controlClass} {...props} />
    </Label>
  )
}

export function TextAreaField({ label, ...props }: { label: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Label label={label}>
      <textarea className={`${controlClass} min-h-32 resize-y`} {...props} />
    </Label>
  )
}

export function SelectField({
  label,
  children,
  ...props
}: { label: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Label label={label}>
      <select className={controlClass} {...props}>
        {children}
      </select>
    </Label>
  )
}

export function FileField({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Label label={label}>
      <input
        type="file"
        className="block w-full text-sm text-ink-soft file:mr-4 file:border file:border-line file:bg-canvas file:px-3 file:py-2 file:text-sm file:text-ink"
        {...props}
      />
    </Label>
  )
}
